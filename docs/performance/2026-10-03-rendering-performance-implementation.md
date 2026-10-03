# Rendering performance implementation

Implemented the work packages in `docs/specs/2026-10-02-rendering-performance.md` against baseline commit `96bdd7eb5ded31a56964fd144e337172f18d3624`. The original audit contains the problem snippets; the implementation commit supplies the concrete diffs. This report records the changes, regression coverage, measurements, and cache contract.

## Changes by bottleneck

| Finding | Severity | Implemented fix and primary location |
| --- | --- | --- |
| F01 | High | Tournament layout streams a small capacity count; full registration analytics no longer precedes the header. `features/tournaments/components/tournament-capacity.tsx` |
| F02 | High | Membership and director assignment resolve together in one parameterized repository query. Existing verified identity and tournament reads remain parallel. `features/tournaments/repositories/access.ts` |
| F03 | High | Portal permissions resolve institution, claim, and tournament together. Editor actions use that trusted context and check the current deadline. `features/portal/permissions/index.ts`, roster permission modules |
| F04 | Medium | Portal overview uses counts, including distinct flagged teams, instead of loading three complete rosters. `features/portal/queries/summary.ts` |
| F05 | High | Server paging defaults to 50 and caps at 100, with narrow projections, independent totals, deterministic tie breakers, preserved filters, explicit continued institution groups, and separate institution roster page keys. `lib/pagination.ts`, feature `queries/page.ts` modules, `components/ui/page-navigation.tsx` |
| F06 | High | Read-only portal lists render on the server. An authorized edit route mounts only the selected form, with actor/record-scoped session drafts and save/error feedback. `app/(portal)/portal/[institutionId]/*/[recordId]/edit/page.tsx`, `hooks/use-roster-draft.ts` |
| F07 | High | Preview loads 500-record batches and builds lookup maps before comparing rows. Review cards are paged; decisions retain original row indices. Email matching remains institution scoped. `features/imports/services/build-preview.ts`, `read-batches.ts`, `review-decisions.ts` |
| F08 | High | Finalization claims the import inside its transaction, snapshots registrations in batches, plans ordered writes, and bulk inserts/updates at most 500 records per command. Summary, records, and statuses commit together; repeated/concurrent finalization cannot commit twice. `features/imports/services/finalize.ts`, `features/imports/repositories/review.ts` |
| F09 | Low | History markup stays on the server and uses explicit UTC formatting; no non-interactive history client boundary. `features/imports/components/import-history-list.tsx`, `lib/dates.ts` |
| F10 | Medium | Tiptap loads dynamically on the actual announcement route, retains its SSR-safe options, isolates typing, reads the latest HTML at submission, and preserves readiness/pending/error states. Draft creation uses application navigation. `features/announcements/components/announcement-form.tsx`, `rich-text-editor.tsx` |
| F11 | Medium | Summaries and numeric cards render on the server. A small viewport observer mounts dynamic Recharts plots near the viewport; chart heights are reserved. `features/dashboards/components/chart-host.tsx`, `chart-plots.tsx` |
| F12 | Medium | Chart/editor placeholders retain their dimensions. Roster placeholders share row/header dimensions; fresh counts reserve partial/empty pages correctly. Authorized portal headings stay outside row-loading boundaries. Warnings remain a compact, bounded disclosure. `components/ui/roster-skeleton.tsx`, `roster-geometry.ts`, portal roster pages, analytics skeletons |
| F13 | Medium | PostgreSQL computes registration day buckets, cumulative totals, resolved-request averages, approved receipt sums, declared payments, and invoice classifications. Bigint conversions are checked. `features/analytics/repositories/*`, `features/finance/repositories/balances.ts`, `lib/database-number.ts` |
| F14 | Medium | Stable module-level React request memoization coalesces shared aggregate reads. Registration and financial analytics retain the existing 60-second Next data-cache policy. Cold/warm route checks verify one shared registration aggregate and subsequent reuse. `features/analytics/services/*` |
| F15 | Medium | Middleware bypasses session refresh only for the identified public GET/HEAD paths; protected and auth routes retain session handling. `middleware.ts` |
| F16 | Medium | Public visibility resolves live before explicit cached public projections. Institutions stream separately and are paged; metadata and ingestion writers invalidate the public tag. `features/public/queries/tournament.ts`, `app/t/[slug]/page.tsx` |
| F17 | Medium | Callback identity comes from the verified exchange. Welcome-email lookup/delivery runs in `after` with logged failure, after the redirect response. `app/auth/callback/route.ts` |

The callback lifecycle is supported by the installed Next.js 15 API. The repository's `vercel.json` indicates a Vercel deployment configuration, where `after` uses `waitUntil`; this is a hosting inference from repository configuration, not a deployed-runtime inspection. Delivery remains best effort within the platform duration limit. [Next.js 15 after reference](https://nextjs.org/docs/15/app/api-reference/functions/after).

## Verification

- Unit suite: **69 files, 238 tests passed**.
- Real PostgreSQL integration suite: **2 files, 14 tests passed**. Covers repeated/scoped emails, selected fields, aliases, phases, withdrawal semantics, rollback, concurrent finalization, currencies, zero invoices, payment rules, and UTC boundaries.
- Production-mode browser route suite: **31 tests passed**. Covers role/access matrix, fresh deadlines, direct loads, streaming, paging/back navigation, focused drafts, transport failures, mutation feedback, public disabling/slug edits, persisted review decisions, reprocessing, chart arrival, and latest announcement text. All three portal headings appear before a two-second row delay; these three tests failed before narrowing the loading boundary.
- Delayed finance replacement: height difference **at most 2 px**. Before the geometry correction, this regression check failed with a **562 px** difference.
- Delayed partial and empty institution roster replacement: the following section's position differs **at most 2 px**. A partial page renders 28 placeholders for its 28 final records.
- `npm run type-check` passed. The production application build passed compilation, type validation, and page generation. The final build disabled Webpack's disk build cache with a temporary preload because local disk space was limited. Its existing ESLint/Rushstack configuration warning remains; lint is not reported as passed.
- Standards and Spec reviews: **0 outstanding findings on each axis**. Review corrections included scoped participant matching, shared loading geometry, the process-action invalidation call, repository/service separation, and a typed review-decision codec.

## Measurement method and limits

These are **local lab measurements**, with 20 repetitions for each route/cache or import/workload cell. Median uses the central sorted values; p95 uses nearest rank `ceil(0.95*n)`. No samples are discarded. [Machine-readable summary](summary.json) and the raw JSON files retain every sample.

Both revisions use the same local PostgreSQL 14 fixture database, Chromium, production Next.js route harness, roles, and datasets. Stress data has 150 institutions, 1,000 teams, 3,000 participants, and 170 adjudicators; one institution has 126 teams/378 participants. Small data has four teams/12 participants; the empty case has no roster records. Owner/director/member access is measured on stress team routes and representative access on portal routes. CSV scenarios use 50/500/1,000 rows with repeated or distinct institution names.

Cold means a restarted Next server and removed Next data-cache files. PostgreSQL buffers and operating-system caches are **not** cold. Warm requests share a Next process/cache but use a fresh browser context; their first sample is retained. Browser prefetch is disabled, query-delay injection is off, and observation ends 500 ms after page load.

The harness reuses actual tournament layouts, feature pages, permission functions, Prisma queries, and Server Actions. Its root HTML is minimal and its verified Auth SDK/Storage adapters are local fixtures; it excludes the application's full root dashboard shell, middleware network calls, font download, and real authentication latency. TTFB includes local transport and server work, not deployed auth or region costs. Prisma query events record SQL counts/durations; connection-pool wait and server-render CPU are not independently instrumented. The JSON includes these SQL-duration samples, but they are not a full request-time attribution.

An initial after-browser run overlapped other local checks. Subsequent repetitions with checks stopped exposed a warm portal heading observation near 824 ms, recorded in the [portal shell checkpoint](portal-shell-checkpoint.json). Whole-page loading was then narrowed to roster rows; the final after-browser matrix was repeated again. Header/useful times use Playwright visibility waits and include its polling overhead as well as React's streamed-content reveal scheduling; they are observation times, not exact first-paint timestamps. Timing variation, regressions, and unchanged/increased JS remain visible. Payload/DOM bounds and transaction/query-count changes are stronger evidence than absolute localhost timing. These results do not establish field p75 INP/CLS, a production TTFB improvement, or a delivery guarantee.

## Browser results

<!-- browser-results:start -->
Times are median / p95 in milliseconds. SQL counts are medians. Each route/cache cell has 20 repetitions. Heading/useful values are Playwright observation times with the polling limitation described above.

| Route / actor | Server cache | TTFB before → after | Heading before → after | Useful content before → after | SQL before → after |
| --- | --- | --- | --- | --- | --- |
| Stress teams / owner | cold | 132.8 / 166.6 → 42.9 / 60.8 | 206.9 / 268.5 → 100.2 / 141.5 | 248.3 / 303.1 → 434.5 / 885.6 | 11 → 10 |
| Stress teams / owner | warm | 73.0 / 82.4 → 6.9 / 10.6 | 154.1 / 171.3 → 63.8 / 70.4 | 190.7 / 198.9 → 360.7 / 853.8 | 6 → 10 |
| Stress teams / director | cold | 140.1 / 152.7 → 39.6 / 44.6 | 219.1 / 244.1 → 80.8 / 107.8 | 262.8 / 280.4 → 414.6 / 887.5 | 12 → 10 |
| Stress teams / director | warm | 74.2 / 85.5 → 7.3 / 19.6 | 174.1 / 191.2 → 63.2 / 72.6 | 197.3 / 215.8 → 363.5 / 415.5 | 7 → 10 |
| Stress teams / member | cold | 136.0 / 142.2 → 37.7 / 46.1 | 211.3 / 224.9 → 74.5 / 108.3 | 254.2 / 261.4 → 878.2 / 895.2 | 12 → 10 |
| Stress teams / member | warm | 75.9 / 116.8 → 6.5 / 12.9 | 173.3 / 201.8 → 63.2 / 78.6 | 198.0 / 248.9 → 359.3 / 863.7 | 7 → 10 |
| Stress participants / rep | cold | 101.2 / 102.6 → 28.6 / 38.1 | 199.2 / 202.4 → 54.0 / 94.8 | 210.6 / 219.4 → 95.0 / 395.3 | 6 → 7 |
| Stress participants / rep | warm | 55.0 / 73.9 → 6.1 / 8.0 | 152.4 / 171.5 → 54.3 / 58.2 | 167.3 / 188.2 → 351.9 / 356.5 | 6 → 7 |
| Stress analytics / owner | cold | 64.8 / 94.0 → 38.9 / 45.3 | 102.4 / 134.2 → 67.2 / 79.5 | 433.9 / 468.2 → 109.5 / 880.6 | 22 → 15 |
| Stress analytics / owner | warm | 7.1 / 14.1 → 7.5 / 12.1 | 60.0 / 77.0 → 61.4 / 63.8 | 377.5 / 441.4 → 353.6 / 365.0 | 10 → 11 |
| Small teams / owner | cold | 49.5 / 54.0 → 36.9 / 40.6 | 86.1 / 118.2 → 81.0 / 95.8 | 106.1 / 132.2 → 385.0 / 394.7 | 11 → 10 |
| Small teams / owner | warm | 5.8 / 11.5 → 7.2 / 13.4 | 58.0 / 67.3 → 63.1 / 65.5 | 65.7 / 76.6 → 354.6 / 359.4 | 6 → 10 |
| Small participants / rep | cold | 34.6 / 35.1 → 26.1 / 27.7 | 66.9 / 69.4 → 54.6 / 81.9 | 90.1 / 95.6 → 365.7 / 376.6 | 6 → 7 |
| Small participants / rep | warm | 7.6 / 11.9 → 5.3 / 8.5 | 58.9 / 63.6 → 51.4 / 55.5 | 69.0 / 77.8 → 345.1 / 354.1 | 6 → 7 |
| Empty teams / owner | cold | 48.1 / 55.1 → 36.4 / 36.9 | 82.9 / 91.3 → 71.9 / 91.0 | 104.8 / 126.4 → 384.6 / 393.8 | 10 → 8 |
| Empty teams / owner | warm | 6.1 / 14.5 → 7.1 / 11.4 | 58.1 / 74.4 → 62.8 / 66.1 | 66.9 / 84.1 → 352.8 / 356.4 | 5 → 8 |
| Empty participants / rep | cold | 25.0 / 25.5 → 25.7 / 27.9 | 67.1 / 68.8 → 53.8 / 72.1 | 72.2 / 73.9 → 71.5 / 78.2 | 5 → 6 |
| Empty participants / rep | warm | 5.5 / 7.1 → 4.4 / 7.7 | 47.6 / 49.3 → 48.2 / 51.1 | 52.6 / 54.4 → 53.6 / 56.2 | 5 → 6 |

Cold-request size medians follow. HTML is the encoded response body, including inline RSC; JavaScript includes all assets transferred during the observation window, including charts already needed in the viewport.

| Route / actor | HTML bytes before → after | JS bytes before → after | DOM elements before → after | Forms before → after |
| --- | --- | --- | --- | --- |
| Stress teams / owner | 294,898 → 36,783 | 122,283 → 122,237 | 7,604 → 537 | 0 → 0 |
| Stress teams / director | 294,898 → 36,783 | 122,283 → 122,237 | 7,604 → 537 | 0 → 0 |
| Stress teams / member | 294,234 → 36,037 | 122,283 → 122,237 | 7,599 → 531 | 0 → 0 |
| Stress participants / rep | 104,961 → 11,204 | 138,551 → 106,796 | 7,425 → 348 | 378 → 0 |
| Stress analytics / owner | 10,206 → 12,548 | 239,192 → 241,715 | 558 → 374 | 0 → 0 |
| Small teams / owner | 9,257 → 12,400 | 122,283 → 122,237 | 194 → 206 | 0 → 0 |
| Small participants / rep | 5,829 → 5,130 | 138,551 → 106,796 | 260 → 104 | 12 → 0 |
| Empty teams / owner | 8,555 → 11,778 | 122,283 → 122,237 | 175 → 187 | 0 → 0 |
| Empty participants / rep | 2,284 → 3,340 | 103,314 → 103,172 | 23 → 29 | 0 → 0 |

The stress owner team page reduces its HTML body by approximately 87.5%. A representative participant list replaces 378 mounted forms with zero; only a selected editor hydrates.

Team roster content and most small-roster content remain slower to be observed than the baseline despite earlier headings and smaller stress pages. Warm representative rows are observed around 352 ms versus 167 ms before. Streamed reveal scheduling and visibility polling are inferred contributors; their exact shares were not isolated. Warm analytics timings vary by metric, and analytics JavaScript does not shrink overall when the visible charts have loaded. Small and empty director pages can have larger HTML responses because of the streamed shell/loading markup. Fresh authoritative counts can increase warm SQL counts relative to old cached full summaries; this is intentional freshness, not an N+1 pattern.

CLS median and p95 are zero in this short local observation window for the measured scenarios. This does not establish field CLS, cover every later interaction, or prove an INP target. Long-task and SQL-duration statistics remain in the machine-readable summary.
<!-- browser-results:end -->

## CSV results

<!-- import-results:start -->
Times are median / p95 in milliseconds; SQL counts are medians. Each cell has 20 repetitions.

| Rows / names | Preview before → after (ms) | Preview SQL before → after | Finalize before → after (ms) | Finalize SQL before → after |
| --- | --- | --- | --- | --- |
| 50 / repeated | 16.0 / 19.7 → 2.3 / 5.6 | 54 → 5 | 94.4 / 104.6 → 42.1 / 91.2 | 312 → 29 |
| 50 / distinct | 48.0 / 55.4 → 4.8 / 16.3 | 152 → 5 | 110.8 / 130.2 → 62.0 / 393.9 | 410 → 29 |
| 500 / repeated | 111.2 / 125.0 → 8.1 / 9.4 | 504 → 6 | 723.1 / 741.0 → 50.5 / 72.6 | 3012 → 30 |
| 500 / distinct | 410.9 / 470.5 → 37.2 / 101.3 | 1502 → 6 | 899.9 / 946.3 → 136.5 / 253.1 | 4010 → 30 |
| 1,000 / repeated | 240.2 / 254.4 → 13.7 / 14.5 | 1004 → 7 | 1547.5 / 1560.3 → 50.5 / 52.7 | 6012 → 32 |
| 1,000 / distinct | 1031.8 / 1280.6 → 57.3 / 58.8 | 3002 → 7 | 1864.3 / 2321.8 → 179.5 / 192.2 | 8010 → 36 |

For 1,000 repeated-name rows, median finalization SQL falls from 6,012 to 32 commands; distinct names fall from 8,010 to 36. Counts include transaction/permission/logging work, not only registration writes. Preview counts now grow with 500-row batches rather than one or more lookups per row. Some p95 values still have local timing spikes; no outliers were removed. The correctness suite separately verifies committed records and rollback.
<!-- import-results:end -->

## Client and database observations

Twenty production editor runs with 150 visible institution choices recorded **zero AnnouncementForm parent renders during typing**. The browser test also verifies that the saved draft includes the latest text. This counts the observed parent boundary; it is not an INP measurement. The chart arrival test verifies a below-viewport plot is absent until approached while its numeric summary is already present.

The [local query plans](query-plans.txt), captured with `EXPLAIN (ANALYZE, BUFFERS)`, choose sequential scans with small sorts on this dataset. Bounded participant/team/institution/withdrawn-adjudicator queries take approximately 0.520/0.654/0.055/0.040 ms respectively. Existing indexes and migrations were inspected; no new index or schema migration was added. Deployed plans and deeper offset pages remain unmeasured; local plans do not prove index use or production scaling.

## Cache and mutation contract

`features/tournaments/services/invalidate-views.ts` owns the shared invalidation operations. Authorization, membership, claims, deadlines, invoice detail, approved receipts, and declared-payment detail remain fresh server reads. React memoization is scoped to a render, not shared between users.

| Cached view | Policy | Writers and invalidation |
| --- | --- | --- |
| Registration summary/series | Next data cache, `revalidate: 60`, `registration-analytics:<id>`; React request memoization | Team/participant/adjudicator edits, eligibility, claims, requests, institution metadata, tournament metadata, import process/review/normalization/finalize/rollback, and manual/scheduled ingestion call tournament invalidation. |
| Financial analytics | Next data cache, `revalidate: 60`, `financial-analytics:<id>`; React request memoization | Invoice regenerate/discount/override, receipt approve/reject, declared-payment update/void call financial invalidation; roster, imports, requests, and ingestion also invalidate tournament financial analytics. Invalidation precedes post-commit notification work. |
| Public tournament projection and paged institutions | Next data cache, `revalidate: 60`, `public-tournament:<id>`; live visibility/slug gate every request | Tournament basic/schedule/archive/logo/rules actions, institution profile/logo/claim changes, roster/import changes, and ingestion invalidate the public tag. Organization metadata/logo/delete retain existing `org:<slug>` invalidation, including both slugs on rename. No active contact/public-asset writer was found; a future writer must invalidate this tag. |
| Director routes | Route/layout invalidation | Tournament invalidation revalidates `/tournaments/<id>` as a layout. Financial invalidation revalidates finance layout and overview page. |
| Representative routes | Fresh DB reads and affected route invalidation | Roster/claim/institution/finance/request actions pass affected institution IDs to revalidate `/portal/<id>` as a layout. Finalization returns affected IDs internally for post-commit invalidation. Scheduled ingestion invalidates shared tags/director layout; subsequent portal requests read fresh DB data. |

The 60-second policy permits stale-while-revalidation behavior; it is not a hard freshness ceiling. Request and import aggregate reads are request memoized without an additional shared data cache.

## Reproduction

Install dependencies and Chromium (`npx playwright install chromium`), and make PostgreSQL's `initdb`, `pg_ctl`, `createdb`, and `psql` available on PATH. These fixture commands never read the application's `.env` database URL and reject a nonlocal/nonfixture database. They seed only `debately_performance_test` on port 55432.

```sh
npm run perf:db
npm test
npm run type-check
npm run test:integration
npm run test:routes
npm run build

# Run benchmarks sequentially: they share and reseed the fixture database.
npm run perf:browser
npm run perf:imports
node --import tsx scripts/performance-summary.ts

# Reproduce the fixed baseline in an isolated temporary archive.
task_baseline="$(bash scripts/performance-baseline.sh 96bdd7eb5ded31a56964fd144e337172f18d3624)"
PERFORMANCE_LABEL=before PERFORMANCE_SCENARIOS=stress PERFORMANCE_SOURCE_ROOT="$task_baseline" npm run perf:browser
PERFORMANCE_LABEL=before PERFORMANCE_SCENARIOS=small PERFORMANCE_SOURCE_ROOT="$task_baseline" npm run perf:browser
PERFORMANCE_LABEL=before PERFORMANCE_SOURCE_ROOT="$task_baseline" npm run perf:imports
node --import tsx scripts/performance-summary.ts

psql -h 127.0.0.1 -p 55432 -d debately_performance_test -f scripts/performance-explain.sql
npm run perf:db -- stop
```

Raw artifacts: [before stress routes](before-browser.json), [before small/empty routes](before-small-browser.json), [after routes](after-browser.json), [before imports](before-imports.json), [after imports](after-imports.json), [editor](after-editor.json). The specification/audit remain local under the repository's existing Markdown ignore rule; this implementation report is explicitly tracked with its measurement artifacts.
