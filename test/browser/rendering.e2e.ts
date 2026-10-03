import { test, expect } from '@playwright/test'

async function signIn(page: import('@playwright/test').Page, role: string) {
  await page
    .context()
    .addCookies([{ name: 'fixture-role', value: role, url: 'http://127.0.0.1:3100' }])
}

for (const roster of ['Teams', 'Participants', 'Adjudicators'])
  test(`the portal ${roster.toLowerCase()} heading arrives before delayed rows`, async ({
    page,
    request,
  }) => {
    await signIn(page, 'rep')
    await request.post('/fixture-state', { data: { rosterDelayMs: 2000 } })
    try {
      const began = Date.now()
      await page.goto(`/portal/institution-0/${roster.toLowerCase()}`, { waitUntil: 'commit' })
      await expect(page.getByRole('heading', { name: roster, exact: true })).toBeVisible({
        timeout: 1500,
      })
      expect(Date.now() - began).toBeLessThan(1500)
      await expect(page.getByLabel('Loading roster')).toBeAttached()
      await expect(page.getByRole('link', { name: 'Edit', exact: true })).toHaveCount(50)
    } finally {
      await request.post('/fixture-state', { data: { rosterDelayMs: 0 } })
    }
  })

test('the authorized header arrives while capacity is still loading', async ({ page }) => {
  await signIn(page, 'owner')
  const began = Date.now()
  await page.goto('/tournaments/fixture-tournament/teams', { waitUntil: 'commit' })
  await expect(
    page.getByRole('heading', { name: 'Performance Tournament', exact: true }),
  ).toBeVisible({ timeout: 1500 })
  expect(Date.now() - began).toBeLessThan(1500)
  await expect(page.locator('dt').filter({ hasText: 'Capacity' }).locator('..')).toContainText(
    '1200 team slots',
    { timeout: 1000 },
  )
  await expect(page.locator('dt').filter({ hasText: 'Capacity' }).locator('..')).toContainText(
    '1000/1200 teams',
  )
})

test('a large portal roster mounts no editors until a record is opened', async ({ page }) => {
  await signIn(page, 'rep')
  await page.goto('/portal/institution-0/participants')
  await expect(page.getByRole('link', { name: 'Edit', exact: true })).toHaveCount(50)
  await expect(page.locator('form')).toHaveCount(0)
})

test('paging caps rows and browser back restores the previous roster', async ({ page }) => {
  await signIn(page, 'rep')
  await page.goto('/portal/institution-0/participants?pageSize=9999')
  await expect(page.getByRole('link', { name: 'Edit', exact: true })).toHaveCount(100)
  await expect(page.getByRole('navigation', { name: 'Pagination' })).toContainText('1–100 of 378')
  const firstNames = await page.locator('li p.font-medium').allTextContents()
  await page.getByRole('link', { name: 'Next', exact: true }).click()
  await expect(page.getByRole('navigation', { name: 'Pagination' })).toContainText('101–200 of 378')
  const secondNames = await page.locator('li p.font-medium').allTextContents()
  expect(secondNames[0]).not.toBe(firstNames[0])
  await page.goBack()
  await expect(page.locator('li p.font-medium').first()).toHaveText(firstNames[0])
})

test('a focused team editor retains a draft and reports save feedback', async ({ page }) => {
  await signIn(page, 'rep')
  await page.goto('/portal/institution-0/teams')
  await page.getByRole('link', { name: 'Edit', exact: true }).first().click()
  await expect(page.locator('form')).toHaveCount(1)
  await page.getByLabel('Team name', { exact: true }).fill('Draft team name')
  await page.goBack()
  await page.getByRole('link', { name: 'Edit', exact: true }).first().click()
  await expect(page.getByLabel('Team name', { exact: true })).toHaveValue('Draft team name')
  await page.getByRole('button', { name: 'Save', exact: true }).click()
  await expect(page.getByRole('status')).toHaveText('Saved.')
})

for (const role of ['owner', 'director', 'member'])
  test(`${role} can read tournament teams`, async ({ page }) => {
    await signIn(page, role)
    await page.goto('/tournaments/fixture-tournament/teams')
    await expect(page.getByRole('heading', { name: 'Teams', exact: true })).toBeVisible()
  })
for (const role of ['wrong-rep', 'unrelated', 'unverified'])
  test(`${role} cannot open a representative editor`, async ({ page }) => {
    await signIn(page, role)
    await page.goto('/portal/institution-0/participants/participant-0/edit')
    await expect(page.getByRole('heading', { name: 'Edit participant', exact: true })).toHaveCount(
      0,
    )
    await expect(page.locator('form')).toHaveCount(0)
  })
test('signed-out and mismatched-institution routes expose no editor', async ({ page }) => {
  await page.goto('/portal/institution-0/participants/participant-0/edit')
  await expect(page.locator('form')).toHaveCount(0)
  await signIn(page, 'rep')
  await page.goto('/portal/institution-1/participants/participant-0/edit')
  await expect(page.locator('form')).toHaveCount(0)
})
test('an expired deadline prevents representative editing', async ({ page, request }) => {
  expect((await request.post('/fixture-state', { data: { deadline: '2020-01-01' } })).ok()).toBe(
    true,
  )
  try {
    await signIn(page, 'rep')
    await page.goto('/portal/institution-0/participants/participant-0/edit')
    await expect(page.locator('form')).toHaveCount(0)
  } finally {
    await request.post('/fixture-state', { data: { deadline: '2027-01-01' } })
  }
})
test('public visibility is checked even after its sections are cached', async ({
  page,
  request,
}) => {
  await page.goto('/t/performance')
  await expect(
    page.getByRole('heading', { name: 'Performance Tournament', exact: true }),
  ).toBeVisible()
  expect((await request.post('/fixture-state', { data: { publicPageEnabled: false } })).ok()).toBe(
    true,
  )
  try {
    const response = await page.goto('/t/performance')
    expect(response?.status()).toBe(404)
    await expect(
      page.getByRole('heading', { name: 'Performance Tournament', exact: true }),
    ).toHaveCount(0)
  } finally {
    await request.post('/fixture-state', { data: { publicPageEnabled: true } })
  }
})
test('analytics retain approved-receipt totals separately for each currency', async ({ page }) => {
  await signIn(page, 'owner')
  await page.goto('/tournaments/fixture-tournament/analytics')
  await expect(page.getByText('Invoiced: PHP 300.00', { exact: true })).toBeVisible()
  await expect(page.getByText('Paid: PHP 246.00', { exact: true })).toBeVisible()
  await expect(page.getByText('Outstanding: PHP 54.00', { exact: true })).toBeVisible()
  await expect(page.getByText('Invoiced: USD 50.00', { exact: true })).toBeVisible()
  await expect(page.getByText('3.0h', { exact: true })).toBeVisible()
  await expect(page.getByText('50%', { exact: true })).toBeVisible()
})
test('review decisions persist while navigating between pages', async ({ page }) => {
  await signIn(page, 'owner')
  await page.goto('/tournaments/fixture-tournament/imports/fixture-import/review?page=2')
  await expect(page.getByRole('navigation', { name: 'Pagination' })).toContainText('51–100 of 110')
  await page.getByRole('button', { name: 'Keep existing', exact: true }).first().click()
  await expect(page.getByText('Team “Team 0060” — Kept existing record.')).toBeVisible()
  await page.getByRole('link', { name: 'Previous', exact: true }).click()
  await page.getByRole('link', { name: 'Next', exact: true }).click()
  await expect(page.getByText('Team “Team 0060” — Kept existing record.')).toBeVisible()
})
test('rapid announcement submission includes the last typed text and navigates in the app', async ({
  page,
}) => {
  await signIn(page, 'owner')
  await page.goto('/tournaments/fixture-tournament/announcements/new')
  await page.getByLabel('Title', { exact: true }).fill('Fixture announcement')
  const editor = page.locator('[contenteditable="true"]')
  await editor.fill('Latest keystroke content')
  await page.getByRole('button', { name: 'Save draft', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'Fixture announcement', exact: true }),
  ).toBeVisible()
  await expect(page.getByText('Latest keystroke content', { exact: true })).toBeVisible()
})

test('invalid paging defaults safely and withdrawn filtering preserves whole totals', async ({
  page,
}) => {
  await signIn(page, 'owner')
  await page.goto(
    '/tournaments/fixture-tournament/adjudicators?status=WITHDRAWN&page=-4&pageSize=invalid',
  )
  await expect(page.getByRole('navigation', { name: 'Pagination' })).toContainText('1–20 of 20')
  await expect(page.getByText('20 withdrawn')).toBeVisible()
  await page.goto('/tournaments/fixture-tournament/adjudicators?page=100000')
  await page.getByRole('link', { name: 'First', exact: true }).click()
  await expect(page.getByRole('navigation', { name: 'Pagination' })).toContainText('1–50 of 170')
})
test('a save transport error retains the draft and restores the save button', async ({ page }) => {
  await signIn(page, 'rep')
  await page.goto('/portal/institution-0/participants/participant-0/edit')
  await page.getByLabel('Name', { exact: true }).fill('Retained after failure')
  await page.route('**/portal/institution-0/participants/participant-0/edit', (route) =>
    route.request().method() === 'POST' ? route.abort() : route.continue(),
  )
  await page.getByRole('button', { name: 'Save', exact: true }).click()
  await expect(page.getByRole('alert').filter({ hasText: 'Could not save' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeEnabled()
  await page.reload()
  await expect(page.getByLabel('Name', { exact: true })).toHaveValue('Retained after failure')
})
test('an editor cannot save using a deadline granted on an earlier request', async ({
  page,
  request,
}) => {
  await signIn(page, 'rep')
  await page.goto('/portal/institution-0/participants/participant-0/edit')
  expect((await request.post('/fixture-state', { data: { deadline: '2020-01-01' } })).ok()).toBe(
    true,
  )
  try {
    await page.getByRole('button', { name: 'Save', exact: true }).click()
    await expect(
      page.getByRole('alert').filter({ hasText: 'Registration deadline has passed' }),
    ).toBeVisible()
  } finally {
    await request.post('/fixture-state', { data: { deadline: '2027-01-01' } })
  }
})
test('a chart below the viewport mounts on arrival while its totals are server rendered', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 500 })
  await signIn(page, 'owner')
  await page.goto('/tournaments/fixture-tournament/analytics')
  const totals = page.getByText('Invoiced: PHP 300.00', { exact: true })
  await expect(totals).toBeAttached()
  const card = page.getByText('Payment status', { exact: true }).first().locator('..')
  await expect(card.getByRole('application')).toHaveCount(0)
  await card.scrollIntoViewIfNeeded()
  await expect(card.getByRole('application')).toHaveCount(1)
})
test('small and empty rosters keep totals and mount no editors', async ({ page }) => {
  await signIn(page, 'rep')
  await page.goto('/portal/small-institution/participants')
  await expect(page.getByRole('link', { name: 'Edit', exact: true })).toHaveCount(12)
  await expect(page.getByRole('navigation', { name: 'Pagination' })).toContainText('1–12 of 12')
  await page.goto('/portal/empty-institution/participants')
  await expect(page.getByRole('navigation', { name: 'Pagination' })).toContainText('0–0 of 0')
  await expect(page.locator('form')).toHaveCount(0)
})

test('a slow or failed analytics section leaves other sections usable', async ({
  page,
  request,
}) => {
  await signIn(page, 'owner')
  expect(
    (
      await request.post('/fixture-state', {
        data: { failAnalytics: false, analyticsDelayMs: 2000 },
      })
    ).ok(),
  ).toBe(true)
  try {
    const began = Date.now()
    await page.goto('/tournaments/fixture-tournament/analytics', { waitUntil: 'commit' })
    await expect(page.getByText('Invoiced: PHP 300.00', { exact: true })).toBeAttached({
      timeout: 1500,
    })
    expect(Date.now() - began).toBeLessThan(1500)
    await page.waitForLoadState('load')
    expect((await request.post('/fixture-state', { data: { failAnalytics: true } })).ok()).toBe(
      true,
    )
    await page.reload()
    await expect(
      page.getByRole('alert').filter({ hasText: 'Registration analytics is unavailable' }),
    ).toBeVisible()
    await expect(page.getByText('Invoiced: PHP 300.00', { exact: true })).toBeAttached()
  } finally {
    await request.post('/fixture-state', { data: { failAnalytics: false } })
  }
})

test('metadata edits invalidate public projections and a changed slug rejects the old URL', async ({
  page,
}) => {
  await signIn(page, 'owner')
  await page.goto('/t/performance')
  await expect(
    page.getByRole('heading', { name: 'Performance Tournament', exact: true }),
  ).toBeVisible()
  const result = await page.request.post('/fixture-state', {
    data: { metadata: { name: 'Renamed event', slug: 'performance-edited' } },
  })
  expect(await result.json()).toMatchObject({ ok: true })
  try {
    await page.goto('/t/performance-edited')
    await expect(page.getByRole('heading', { name: 'Renamed event', exact: true })).toBeVisible()
    await page.goto('/t/performance')
    await expect(
      page.getByRole('heading', { name: 'Performance Tournament', exact: true }),
    ).toHaveCount(0)
  } finally {
    await page.request.post('/fixture-state', {
      data: { metadata: { name: 'Performance Tournament', slug: 'performance' } },
    })
  }
})

test('cold dashboard panels share one registration aggregate and a warm request reuses it', async ({
  page,
  request,
}) => {
  await signIn(page, 'owner')
  await request.post('/fixture-state', { data: { failAnalytics: false } })
  await request.get('/fixture-metrics')
  await page.goto('/tournaments/fixture-tournament')
  await expect(page.getByText('Team slots filled', { exact: true })).toBeVisible()
  const first = (await (await request.get('/fixture-metrics')).json()) as Array<{ sql: string }>
  expect(first.filter((sample) => sample.sql.includes('max_team_slots AS slots'))).toHaveLength(1)
  await page.reload()
  await expect(page.getByText('Team slots filled', { exact: true })).toBeVisible()
  const warm = (await (await request.get('/fixture-metrics')).json()) as Array<{ sql: string }>
  expect(warm.filter((sample) => sample.sql.includes('max_team_slots AS slots'))).toHaveLength(0)
})

test('reprocessing clears old review decisions and refreshes previously visited review content', async ({
  page,
}) => {
  await signIn(page, 'owner')
  await page.goto('/tournaments/fixture-tournament/imports/fixture-import/review')
  await page.getByRole('button', { name: 'Keep existing', exact: true }).first().click()
  await expect(page.getByText('Team “Team 0010” — Kept existing record.')).toBeVisible()
  await page.goto('/tournaments/fixture-tournament/imports/fixture-import/mapping')
  await page.getByRole('button', { name: 'Save + process rows', exact: true }).click()
  await expect(page.getByText('Reprocessed name', { exact: true })).toBeVisible()
  await expect(page.getByText('Team “Team 0010” — Kept existing record.')).toHaveCount(0)
  await expect(page.getByRole('navigation', { name: 'Pagination' })).toContainText('1–1 of 1')
})

test('a delayed finance table keeps its loading row geometry', async ({ page, request }) => {
  await signIn(page, 'owner')
  await request.post('/fixture-state', { data: { balanceDelayMs: 2000 } })
  try {
    await page.goto('/tournaments/fixture-tournament/finance', { waitUntil: 'commit' })
    const loading = page.getByLabel('Loading roster').locator('table')
    await expect(loading).toBeAttached()
    const pending = await loading.boundingBox()
    await expect(page.getByLabel('Loading roster')).toHaveCount(0)
    const complete = await page.locator('table').boundingBox()
    expect(pending).not.toBeNull()
    expect(complete).not.toBeNull()
    expect(Math.abs(complete!.height - pending!.height)).toBeLessThanOrEqual(2)
  } finally {
    await request.post('/fixture-state', { data: { balanceDelayMs: 0 } })
  }
})

for (const scenario of [
  { name: 'partial', page: 8, rows: 28, range: '351–378 of 378' },
  { name: 'empty', page: 9, rows: 0, range: '0–0 of 378' },
])
  test(`a delayed ${scenario.name} institution roster does not move the following section`, async ({
    page,
    request,
  }) => {
    await signIn(page, 'director')
    await request.post('/fixture-state', { data: { rosterDelayMs: 2000 } })
    try {
      await page.goto(
        `/tournaments/fixture-tournament/institutions/institution-0?participantsPage=${scenario.page}`,
        { waitUntil: 'commit' },
      )
      const participants = page
        .getByRole('heading', { name: 'participants', exact: true })
        .locator('..')
      const following = page.getByRole('heading', { name: 'adjudicators', exact: true })
      await expect(participants.getByLabel('Loading roster')).toBeAttached()
      await expect(participants.locator('li')).toHaveCount(scenario.rows)
      const pending = await following.boundingBox()
      await expect(participants.getByLabel('Loading roster')).toHaveCount(0)
      await expect(participants.getByRole('navigation', { name: 'Pagination' })).toContainText(
        scenario.range,
      )
      const complete = await following.boundingBox()
      expect(pending).not.toBeNull()
      expect(complete).not.toBeNull()
      expect(Math.abs(complete!.y - pending!.y)).toBeLessThanOrEqual(2)
    } finally {
      await request.post('/fixture-state', { data: { rosterDelayMs: 0 } })
    }
  })
