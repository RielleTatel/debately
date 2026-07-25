# Debately — Implementation Checkpoint

_Sessions 1–3 · as of 2026-07-26_

---

## What Is Built

### 1. Google Sheets Sync Infrastructure

**Files:** `features/google-form-integration/services/`

- **`sheets-client.ts`** — authenticates to Google Sheets API via service-account credentials
- **`mapper.ts`** — converts raw sheet rows into `GoogleFormSubmission` payloads (`{ responses: [{ question, answer }] }`)
- **`sync.ts`** — `syncAndIngestOneSource(sourceId)` and `syncAllActiveSources()`:
  - Fetches headers from row 1 (`A1:Z1`)
  - Fetches only new rows since `lastSyncedRow`
  - Upserts `GoogleFormSubmission` records keyed on `(sourceId, rowIndex)`
  - Resets `processedAt = null` on ALL submissions before every ingest run (ensures every "Sync now" is a full re-ingest against current mapping)
  - Returns actual ingested count, not rows fetched
- **`ingest.ts`** — phase dispatcher:
  ```
  INSTITUTIONS → ingestInstitutions()
  TEAMS        → ingestTeams()
  ADJUDICATORS → ingestAdjudicators()
  ```

### 2. Three-Phase Ingest Handlers

**Files:** `features/google-form-integration/services/handlers/`

#### `_utils.ts`
Shared utilities: `pick(payload, mapping, field)` for exact-match header lookup, `toInt()`, `toBool()`.

#### `ingest-institutions.ts` (Phase 1 — INSTITUTIONS)
Per submission:
1. Pick `institutionName` → skip row if missing
2. `resolveInstitutionByName(tournamentId, name)` — case-insensitive + alias lookup
3. Upsert `TournamentInstitution` with contact, intended teams/adj counts
4. Mark `processedAt`

#### `ingest-teams.ts` (Phase 2 — TEAMS)
Per submission:
1. Pick `institutionName` → `resolveInstitutionByName()` → auto-create if not found
2. Pick `teamName` → upsert `Team` on `[tournamentInstitutionId, name]`
3. Collect up to 3 speakers (`speaker1Name/Email/Contact`, etc.)
4. **Roster reconciliation** — delete any `importPhase='sheet-sync'` participants for this team that are no longer in the current row (by email if available, else by name)
5. Upsert each speaker as `Participant` with `teamId` set; email-deduplicated within the institution
6. Pick `adjudicatorName` (optional, same row) → upsert `Adjudicator`; resolves `adjudicatorInstitution` separately

#### `ingest-adjudicators.ts` (Phase 3 — ADJUDICATORS)
Per submission:
1. Pick `adjudicatorName` → skip row if missing
2. Pick `institutionName` (optional) → `resolveInstitutionByName()` → auto-create if not found; `null` for independents
3. Email-deduplicate tournament-wide → create or update `Adjudicator`
4. Mark `processedAt`

**Idempotency:**

| Entity | Dedup key |
|---|---|
| TournamentInstitution | `[tournamentId, name]` unique constraint + alias lookup |
| Team | `[tournamentInstitutionId, name]` unique constraint |
| Participant | email within institution (if email present) |
| Adjudicator | email within tournament (if email present) |

### 3. Registration Sources Settings Page

**Files:** `features/tournament-sheet-sources/`

- **Add source dialog** — choose phase (INSTITUTIONS / TEAMS / ADJUDICATORS), enter spreadsheet ID + optional tab name, test connection (shows detected headers + row count), create source
- **Sources table** — lists all sources with phase badge, spreadsheet ID, status, last sync time, last error, row actions
- **Row actions:** Activate/Deactivate, Mapping, Sync now, Delete
- **Column mapping editor** — phase-aware field list (8 fields for INSTITUTIONS, 25 for TEAMS, 6 for ADJUDICATORS); dropdowns populated from live sheet headers; scrollable modal; saved mapping resets all `processedAt` so next sync re-ingests with new mapping
- **"Sync now"** — syncs one source, returns "Synced N row(s)" feedback

**Route:** `/tournaments/[id]/settings/registration-sources`

### 4. Settings Sub-Navigation

**File:** `features/tournaments/components/settings-sub-nav.tsx`

Two-tab nav under `/settings`: **General** and **Registration Sources**.

### 5. Judge Rule Settings

**File:** `features/tournaments/components/tournament-judge-settings-form.tsx`
**Route:** `/tournaments/[id]/settings` (General tab)

New panel with two fields:
- **Judge rule** (`judgeRule Int?`) — required judges per team (e.g., 1 means 1 judge per team)
- **Ghost judge fee** (`ghostJudgeFee Float?`) — fee charged per judge deficit

Backed by server action `updateJudgeRuleAction`.

**Schema migration:** `prisma/migrations/20260726000000_judge_rule/migration.sql`
```sql
ALTER TABLE "tournaments" ADD COLUMN "judge_rule" INTEGER;
ALTER TABLE "tournaments" ADD COLUMN "ghost_judge_fee" DOUBLE PRECISION;
```

### 6. Registration Validation Layer

**File:** `features/tournaments/services/validate-registrations.ts`

`validateRegistrations(tournamentId)` returns `RegistrationFlag[]`. Checks:

| Flag | Severity | Condition |
|---|---|---|
| `OVER_TOURNAMENT_CAP` | error | Total teams > `maxTeamSlots` |
| `OVER_INSTITUTION_CAP` | warning | Institution teams > `maxTeamsPerInstitution` |
| `JUDGE_DEFICIT` | warning | Institution has fewer judges than `teams × judgeRule`; shows ghost fee if configured |
| `DUPLICATE_EMAIL` | warning | Same email in 2+ participant records tournament-wide |
| `MULTI_TEAM_SPEAKER` | error | Same speaker (by email or ID) assigned to 2+ teams |

Surfaced on `/tournaments/[id]/institutions` as red/amber banners above the institutions list.

### 7. Institution & Team Display Fixes

- **Institutions list** — correct team and judge counts per institution row
- **Institution detail page** — Teams section shows real speaker count per team (derived from participants loaded on the same page)
- **Participants query** — `getParticipantsForInstitution` includes `team` relation; participants show their team name instead of "Unassigned"
- **Column mapping editor** — fixed duplicate React key error for forms where the same question text repeats (e.g., novice-status questions for each debater)

---

## Architecture Notes

### Why three phases?
- **Phase 1 (INSTITUTIONS):** Schools declare intent (# teams, # judges)
- **Phase 2 (TEAMS):** Institutions submit actual rosters (teams + speakers + optional judge on the same row)
- **Phase 3 (ADJUDICATORS):** Independent judges register

A single TEAMS-phase source handles both team rows and adjudicator rows from the same form, distinguished by the `registrationType` column (or simply by whether `adjudicatorName` is filled).

### Column mapping design
All canonical field keys (`teamName`, `speaker1Name`, etc.) are mapped by the user at setup time via the editor. Any form structure is supported — the user maps once, the system syncs forever.

### Auto-create institution
Phases 2 and 3 ingest auto-create a `TournamentInstitution` if the name is provided but doesn't resolve. Handles the case where Phase 1 was skipped or the institution name was entered differently.

---

## Not Yet Working / Gaps

### 1. `paymentAmount` — not mapped or stored
**Context:** A new "Payment amount" column was added to Phase 2 (TEAMS) and Phase 3 (ADJUDICATORS) forms.

**What's missing:**
- No `paymentAmount` key in `FIELDS_BY_PHASE['TEAMS']` or `FIELDS_BY_PHASE['ADJUDICATORS']` in the column mapping editor
- No field on `TournamentInstitution` or any other model to store the declared amount
- No display of payment amount on the institution detail, finance, or any other page

**What's needed to implement:**
1. Add `paymentAmountDeclared Float?` to `TournamentInstitution` in `schema.prisma` + migration SQL
2. Add `{ key: 'paymentAmount', label: 'Payment Amount' }` to TEAMS and ADJUDICATORS field lists in `column-mapping-editor.tsx`
3. Pick the value in `ingest-teams.ts` and `ingest-adjudicators.ts` and write it to the institution record
4. Surface it on the institution detail page and/or the Finance tab

### 2. Name/alias mismatch — no UI guardrail
Explicitly deferred. If a respondent types "Ateneo Debate Union" but Phase 1 registered "ADU", the system auto-creates a second institution instead of merging them. A future alias editor would allow directors to map variant names to canonical institutions.

### 3. No automated sync
"Sync now" is manual only. Nothing calls `syncAllActiveSources()` on a schedule. New form responses are not picked up automatically.

### 4. No team-level detail page
Clicking a team on `/tournaments/[id]/teams` navigates to the institution detail page. There is no dedicated team page showing that team's speakers in isolation.

### 5. Speaker novice status not stored
`speaker${i}IsNovice` is in the column mapping field list but the `Participant` model has no `isNovice` field. The value is mapped but silently dropped during ingest. Needs a schema migration + ingest update.

### 6. Loading/error boundaries incomplete
Individual sections (teams, participants, adjudicators, registration sources) are not wrapped in Suspense with per-section skeletons. A slow sync or DB query blocks the full page render.

### 7. Participant dedup without email is name-only
If a speaker has no email, roster reconciliation prevents duplicates within one sync, but there is no cross-institution dedup by name alone.
