import { spawn, execFileSync } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { chromium } from '@playwright/test'
import { browserEnvironment } from '../test/browser/environment'
import { seedBrowserDatabase } from '../test/browser/seed'

async function main() {
  const source = path.resolve(process.env.PERFORMANCE_SOURCE_ROOT ?? '.')
  const site = path.join(source, 'test/browser/site')
  const next = path.resolve('node_modules/next/dist/bin/next')
  const output = path.resolve('docs/performance')
  const label = process.env.PERFORMANCE_LABEL ?? 'after'
  const repetitions = 20
  mkdirSync(output, { recursive: true })
  const environment = { ...process.env, ...browserEnvironment, PERFORMANCE_DELAY_MS: '0' }
  if (process.argv.includes('--build'))
    execFileSync(process.execPath, [next, 'build', site], { env: environment, stdio: 'inherit' })
  await seedBrowserDatabase()
  const browser = await chromium.launch()
  const samples: Record<string, unknown>[] = []
  const scenarios = [
    {
      name: 'teams-owner',
      role: 'owner',
      route: '/tournaments/fixture-tournament/teams',
      ready: 'text=School 000',
    },
    {
      name: 'teams-director',
      role: 'director',
      route: '/tournaments/fixture-tournament/teams',
      ready: 'text=School 000',
    },
    {
      name: 'teams-member',
      role: 'member',
      route: '/tournaments/fixture-tournament/teams',
      ready: 'text=School 000',
    },
    {
      name: 'participants-representative',
      role: 'rep',
      route: '/portal/institution-0/participants',
      ready: label === 'before' ? 'form' : 'li p.font-medium',
    },
    {
      name: 'analytics-owner',
      role: 'owner',
      route: '/tournaments/fixture-tournament/analytics',
      ready: 'text=Avg resolution time',
    },
    {
      name: 'teams-small-owner',
      role: 'owner',
      route: '/tournaments/fixture-small/teams',
      ready: 'text=School 000',
    },
    {
      name: 'participants-small-representative',
      role: 'rep',
      route: '/portal/small-institution/participants',
      ready: label === 'before' ? 'form' : 'li p.font-medium',
    },
    {
      name: 'teams-empty-owner',
      role: 'owner',
      route: '/tournaments/fixture-empty/teams',
      ready: 'text=No teams yet',
    },
    {
      name: 'participants-empty-representative',
      role: 'rep',
      route: '/portal/empty-institution/participants',
      ready: 'text=Participants',
    },
  ].filter((scenario) =>
    process.env.PERFORMANCE_SCENARIOS === 'small'
      ? /small|empty/.test(scenario.name)
      : process.env.PERFORMANCE_SCENARIOS === 'stress'
        ? !/small|empty/.test(scenario.name)
        : true,
  )
  let server: ReturnType<typeof spawn> | undefined
  async function start() {
    server = spawn(process.execPath, [next, 'start', site, '-p', '3100'], {
      env: environment,
      stdio: 'ignore',
    })
    for (let attempt = 0; attempt < 100; attempt++) {
      if (server.exitCode !== null) throw new Error('Fixture server exited')
      try {
        if ((await fetch('http://127.0.0.1:3100')).ok) return
      } catch {}
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
    throw new Error('Fixture server did not become ready')
  }
  async function stop() {
    if (server && server.exitCode === null) {
      const closed = new Promise<void>((resolve) => server!.once('exit', () => resolve()))
      server.kill('SIGTERM')
      await closed
    }
    server = undefined
  }
  try {
    for (const scenario of scenarios)
      for (const state of ['cold', 'warm']) {
        if (state === 'warm') await start()
        for (let index = 0; index < repetitions; index++) {
          if (state === 'cold') {
            rmSync(path.join(site, '.next/cache/fetch-cache'), { recursive: true, force: true })
            await start()
          }
          const context = await browser.newContext()
          await context.addCookies([
            { name: 'fixture-role', value: scenario.role, url: 'http://127.0.0.1:3100' },
          ])
          const page = await context.newPage()
          await page.route('**/*', (route) => {
            const headers = route.request().headers()
            if (headers['next-router-prefetch'] === '1' || headers.purpose === 'prefetch')
              return route.abort()
            return route.continue()
          })
          await page.addInitScript(() => {
            const metrics = window as typeof window & { lab?: { cls: number; longTasks: number } }
            metrics.lab = { cls: 0, longTasks: 0 }
            new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) {
                const shift = entry as PerformanceEntry & { hadRecentInput: boolean; value: number }
                if (!shift.hadRecentInput) metrics.lab!.cls += shift.value
              }
            }).observe({ type: 'layout-shift', buffered: true })
            new PerformanceObserver((list) => {
              metrics.lab!.longTasks += list.getEntries().length
            }).observe({ type: 'longtask', buffered: true })
          })
          await fetch('http://127.0.0.1:3100/fixture-metrics')
          const began = performance.now()
          const response = await page.goto(`http://127.0.0.1:3100${scenario.route}`, {
            waitUntil: 'commit',
          })
          await page.locator('h1').first().waitFor()
          const headerMs = performance.now() - began
          await page.locator(scenario.ready).first().waitFor()
          const usefulMs = performance.now() - began
          await page.waitForLoadState('load')
          await page.waitForTimeout(500)
          const metrics = await page.evaluate(() => {
            const navigation = performance.getEntriesByType(
              'navigation',
            )[0] as PerformanceNavigationTiming
            const resources = performance.getEntriesByType(
              'resource',
            ) as PerformanceResourceTiming[]
            return {
              ttfbMs: navigation.responseStart - navigation.requestStart,
              htmlBytes: navigation.encodedBodySize,
              javascriptBytes: resources
                .filter((resource) => /\.js(?:\?|$)/.test(resource.name))
                .reduce((sum, resource) => sum + resource.encodedBodySize, 0),
              domElements: document.querySelectorAll('*').length,
              forms: document.querySelectorAll('form').length,
              ...(window as typeof window & { lab?: { cls: number; longTasks: number } }).lab,
            }
          })
          const queries = (await (
            await fetch('http://127.0.0.1:3100/fixture-metrics')
          ).json()) as Array<{ durationMs: number }>
          samples.push({
            scenario: scenario.name,
            cache: state,
            index,
            status: response?.status(),
            headerMs,
            usefulMs,
            ...metrics,
            sqlCount: queries.length,
            sqlDurationMs: queries.reduce((sum, query) => sum + query.durationMs, 0),
          })
          await context.close()
          if (state === 'cold') await stop()
        }
        await stop()
        writeFileSync(
          path.join(
            output,
            `${label}${process.env.PERFORMANCE_SCENARIOS === 'small' ? '-small' : ''}-browser.json`,
          ),
          JSON.stringify(
            {
              label,
              repetitions,
              dataset: { institutions: 150, teams: 1000, participants: 3000, adjudicators: 170 },
              environment:
                'local PostgreSQL; production Next fixture; verified Auth SDK adapter; fresh browser context per request; prefetch disabled; load plus 500ms observation; no network or query delay',
              samples,
            },
            null,
            2,
          ),
        )
        console.log(`${label}: ${scenario.name} ${state}: ${repetitions} samples`)
      }
    if (label === 'after' && !process.env.PERFORMANCE_SCENARIOS) {
      await start()
      const editorSamples = []
      for (let index = 0; index < repetitions; index++) {
        const context = await browser.newContext()
        await context.addCookies([
          { name: 'fixture-role', value: 'owner', url: 'http://127.0.0.1:3100' },
        ])
        const page = await context.newPage()
        await page.goto('http://127.0.0.1:3100/tournaments/fixture-tournament/announcements/new')
        await page.getByLabel('All institutions', { exact: true }).uncheck()
        const editor = page.locator('[contenteditable="true"]')
        await editor.waitFor()
        await page.waitForFunction(
          () =>
            document.querySelector<HTMLButtonElement>('button[type="submit"]')?.disabled === false,
        )
        const before = await page.evaluate(
          () =>
            (window as typeof window & { __performanceAnnouncementRenders?: number })
              .__performanceAnnouncementRenders,
        )
        const began = performance.now()
        await editor.pressSequentially('Twenty fast keystrokes', { delay: 1 })
        const after = await page.evaluate(
          () =>
            (window as typeof window & { __performanceAnnouncementRenders?: number })
              .__performanceAnnouncementRenders,
        )
        editorSamples.push({
          index,
          typingMs: performance.now() - began,
          parentRendersDuringTyping: (after ?? 0) - (before ?? 0),
          institutionCheckboxes: await page.locator('input[type="checkbox"]').count(),
        })
        await context.close()
      }
      writeFileSync(
        path.join(output, 'after-editor.json'),
        JSON.stringify(
          {
            repetitions,
            method:
              'Fixture webpack pre-loader counts AnnouncementForm function renders; real Tiptap editor and 150 visible institution options; production build',
            samples: editorSamples,
          },
          null,
          2,
        ),
      )
      await stop()
    }
  } finally {
    await stop()
    await browser.close()
  }
}
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
