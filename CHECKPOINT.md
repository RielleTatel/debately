# Checkpoint — 2026-07-25 (Session 2)

## What was implemented this session

### 1. Multi-phase Google Sheets ingest architecture

**Problem:** The ingest pipeline only processed Phase 1 (INSTITUTIONS). TEAMS and ADJUDICATORS phases returned 0 and were never handled. The single `ingest.ts` file had all institution logic monolithically and would need to grow impossibly large.

**What was built:**

#### Shared utilities — `features/google-form-integration/services/handlers/_utils.ts`

Extracted helpers used by all three handlers:
- `SubmissionPayload` type — shape of the stored `googleFormSubmission.payload` JSON
- `pick(payload, mapping, field)` — looks up the header for a canonical key, finds the matching response
- `toInt(v)` — parses integer or returns null
- `toBool(v)` — parses "yes" / "true" / "1" to boolean (used for novice flags)

---

#### Phase 1 handler — `features/google-form-integration/services/handlers/ingest-institutions.ts`

Extracted from the old `ingest.ts` with one key improvement: institution resolution now uses `resolveInstitutionByName(tournamentId, name)` from `features/institutions/queries/institutions.ts`, which does **case-insensitive matching + alias lookup**. Previously, a name case mismatch would create a duplicate institution instead of updating the existing one.

Logic per submission:
1. Pick `institutionName` → required, mark processed and skip if missing
2. `resolveInstitutionByName()` → update if found (by exact name or alias), create if not
3. Upsert fields: `contactEmail`, `contactName`, `contactPhone`, `teamsIntended`, `adjudicatorsIntended`
4. Mark `processedAt`

---

#### Phase 2 handler — `features/google-form-integration/services/handlers/ingest-teams.ts`

Logic per submission:
1. Pick `institutionName` → resolve via `resolveInstitutionByName()`; warn and mark processed if not found
2. Pick `teamName` → if both inst + teamName present: upsert `Team` (unique on `[tournamentInstitutionId, name]`), set `isNovice` from `teamIsNovice`
3. Speakers 1–3: pick `speaker${i}Name`, `speaker${i}Email`, `speaker${i}Contact`
   - Dedup by email within institution (`participant.findFirst({ where: { tournamentInstitutionId, email } })`)
   - Create or update `Participant`, linked to team
4. Pick `adjudicatorName` → if present: resolve `adjudicatorInstitution` (falls back to team's institution if unresolved), dedup by email tournament-wide, create or update `Adjudicator`
5. Mark `processedAt` regardless; count `ingested` only if team or adjudicator was created/updated

**Note:** Because Phase 2 and Phase 3 from ZDO use the same Google Form and same column headers, a single TEAMS-phase sheet source handles both team rows (teamName filled) and independent adjudicator rows (teamName empty, adjudicatorName filled) from the same spreadsheet.

---

#### Phase 3 handler — `features/google-form-integration/services/handlers/ingest-adjudicators.ts`

For tournaments that have a dedicated adjudicator-only registration form.

Logic per submission:
1. Pick `adjudicatorName` → required, mark processed and skip if missing
2. Pick `institutionName` → optional; resolve to `tournamentInstitutionId` (null = independent adjudicator)
3. Dedup by email tournament-wide (`adjudicator.findFirst({ where: { tournamentId, email } })`)
4. If found by email: update `displayName`, `phone`, `tournamentInstitutionId`; if not: create `Adjudicator`
5. Mark `processedAt`

---

#### Dispatcher — `features/google-form-integration/services/ingest.ts`

Replaced the old institution-only monolith with a clean 3-branch dispatcher:

```typescript
export async function ingestSource(sourceId, tournamentId, phase, columnMapping) {
  switch (phase) {
    case 'INSTITUTIONS': return ingestInstitutions(...)
    case 'TEAMS':        return ingestTeams(...)
    case 'ADJUDICATORS': return ingestAdjudicators(...)
  }
}
```

---

### 2. Phase-aware column mapping editor

**File:** `features/tournament-sheet-sources/components/column-mapping-editor.tsx`

Added `phase: RegistrationPhase` prop. The static 11-field `CANONICAL_FIELDS` array is replaced by a `FIELDS_BY_PHASE` map that shows the right fields for each phase:

| Phase | Fields shown |
|---|---|
| INSTITUTIONS | 8 fields: registrationType, institutionName, representativeName, email, contactNumber, numberOfTeams, numberOfAdjudicators, facebookUrl |
| TEAMS | 25 fields: registrationType, institutionName, representativeName, teamName, teamIsNovice, debater 1–3 (name/email/contact/facebook/isNovice), judge name/institution/email/contact/facebook |
| ADJUDICATORS | 6 fields: registrationType, institutionName, adjudicatorName, adjudicatorEmail, adjudicatorContact, adjudicatorFacebook |

The dialog is now scrollable (`overflow-y-auto max-h-[85vh]`) to accommodate the long TEAMS field list.

The system never assumes what column header maps to what canonical key — users map arbitrary headers (e.g. "Debater 1 Full Name (First Name, last Name - E.g., Angelo Corteza)") to canonical keys like `speaker1Name`. Any form structure is supported.

---

### 3. Phase threaded through UI

**`features/tournament-sheet-sources/components/row-actions.tsx`**
- Added `phase: RegistrationPhase` prop to `EditMappingButton`
- Passed to `ColumnMappingEditor`

**`features/tournament-sheet-sources/components/sources-table.tsx`**
- Passes `s.phase` to `EditMappingButton`

---

## Idempotency strategy

| Entity | Dedup key |
|---|---|
| TournamentInstitution | Case-insensitive name match + alias lookup via `resolveInstitutionByName()` |
| Team | `[tournamentInstitutionId, name]` unique constraint (upsert) |
| Participant | Email within institution (`findFirst` + create/update) |
| Adjudicator | Email within tournament (`findFirst` + create/update) |

Re-running sync is safe: all writes are creates or targeted updates. `processedAt` is reset by `updateMappingAction` when the mapping changes, so all rows are re-ingested with the new mapping.

---

## Current data pipeline flow

```
Google Sheet
    │
    ▼ (Sync now button / cron POST /api/cron/google-sheets-sync)
GoogleFormSubmission (raw payload — all columns stored)
    │
    ▼ (ingestSource dispatcher → phase-specific handler)
    ├── INSTITUTIONS → TournamentInstitution (name, contact fields, intended counts)
    ├── TEAMS → Team + Participant(s) + Adjudicator (linked to institution)
    └── ADJUDICATORS → Adjudicator (institution optional)
    │
    ▼ (institutions / teams / adjudicators pages)
UI
```

---

## Files changed this session

| File | Change |
|---|---|
| `features/google-form-integration/services/ingest.ts` | Replaced with dispatcher |
| `features/google-form-integration/services/handlers/_utils.ts` | New — shared types + helpers |
| `features/google-form-integration/services/handlers/ingest-institutions.ts` | New — Phase 1 handler |
| `features/google-form-integration/services/handlers/ingest-teams.ts` | New — Phase 2 handler |
| `features/google-form-integration/services/handlers/ingest-adjudicators.ts` | New — Phase 3 handler |
| `features/tournament-sheet-sources/components/column-mapping-editor.tsx` | Phase-aware FIELDS_BY_PHASE map + scrollable dialog |
| `features/tournament-sheet-sources/components/row-actions.tsx` | EditMappingButton now accepts + forwards `phase` |
| `features/tournament-sheet-sources/components/sources-table.tsx` | Passes `s.phase` to EditMappingButton |

---

## Known limitations / next steps

- `speaker${i}IsNovice` and `speaker${i}Facebook` fields appear in the TEAMS mapping editor but are not yet stored — `Participant` schema has no `isNovice` or `facebookUrl` columns
- Adjudicator `facebookUrl` field is in the mapping editor but `Adjudicator` schema has no `facebookUrl` column
- Loading/error handling refactor (Suspense + `loading.tsx` + `error.tsx`) for institutions, teams, adjudicators pages was started in the previous session but not completed
- `TournamentStatus.ACTIVE` exists in the schema but no action transitions a tournament from `DRAFT` → `ACTIVE`
- The `importPhase` field on Team, Participant, Adjudicator is set to `'sheet-sync'` for all sheet-synced records (vs `'phase-1'`, `'phase-2'`, `'phase-3'` from CSV import)
