import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

type Sample = Record<string, string | number>
const directory = path.resolve('docs/performance')

function summarize(files: string[], groupKeys: string[], metrics: string[]) {
  const groups = new Map<string, Sample[]>()
  for (const file of files) {
    const { samples } = JSON.parse(readFileSync(path.join(directory, file), 'utf8')) as {
      samples: Sample[]
    }
    for (const sample of samples) {
      const key = groupKeys.map((name) => sample[name]).join('/')
      const group = groups.get(key) ?? []
      group.push(sample)
      groups.set(key, group)
    }
  }
  return Object.fromEntries(
    [...groups].map(([key, samples]) => [
      key,
      {
        samples: samples.length,
        metrics: Object.fromEntries(
          metrics.map((metric) => {
            const values = samples.map((sample) => sample[metric])
            if (values.some((value) => typeof value !== 'number' || !Number.isFinite(value)))
              throw new Error(`Invalid ${metric} measurement in ${key}`)
            const sorted = (values as number[]).sort((a, b) => a - b)
            const middle = Math.floor(sorted.length / 2)
            return [
              metric,
              {
                median:
                  sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2,
                p95: sorted[Math.ceil(sorted.length * 0.95) - 1],
              },
            ]
          }),
        ),
      },
    ]),
  )
}

const browserMetrics = [
  'ttfbMs',
  'headerMs',
  'usefulMs',
  'htmlBytes',
  'javascriptBytes',
  'domElements',
  'forms',
  'cls',
  'longTasks',
  'sqlCount',
  'sqlDurationMs',
]
const importMetrics = ['previewMs', 'previewSqlCount', 'finalizeMs', 'finalizeSqlCount']
const summary = {
  method: 'Median of sorted samples; p95 uses nearest rank ceil(0.95*n). No samples discarded.',
  browser: {
    before: summarize(
      ['before-browser.json', 'before-small-browser.json'],
      ['scenario', 'cache'],
      browserMetrics,
    ),
    after: summarize(['after-browser.json'], ['scenario', 'cache'], browserMetrics),
  },
  imports: {
    before: summarize(['before-imports.json'], ['size', 'names'], importMetrics),
    after: summarize(['after-imports.json'], ['size', 'names'], importMetrics),
  },
  editor: summarize(
    ['after-editor.json'],
    [],
    ['typingMs', 'parentRendersDuringTyping', 'institutionCheckboxes'],
  ),
}
writeFileSync(path.join(directory, 'summary.json'), JSON.stringify(summary, null, 2) + '\n')
console.log('Saved docs/performance/summary.json')
