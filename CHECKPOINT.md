# Checkpoint — 2026-07-25

## What was implemented this session

### 1. Sheet sync ingest pipeline (`features/google-form-integration`)

**Problem:** The sync cron was storing raw Google Sheet rows into `GoogleFormSubmission` but nothing ever converted those records into actual Debately entities. The institutions page always showed "No institutions yet."

**What was built:**
- `ingest.ts` — reads unprocessed `GoogleFormSubmission` rows for a source, applies the saved `columnMapping` to extract field values, and upserts `TournamentInstitution` records. Marks each submission `processedAt` once done.
- `sync.ts` updated — now passes `phase` and `tournamentId` through the pipeline and calls `ingestSource()` automatically after every sync. Added `syncAndIngestOneSource(sourceId)` for single-source manual trigger.

**Ingest field mapping (camelCase → Prisma field):**
| Column mapping key | `TournamentInstitution` field |
|---|---|
| `institutionName` | `name` |
| `email` | `contactEmail` |
| `representativeName` | `contactName` |
| `contactNumber` | `contactPhone` |
| `numberOfTeams` | `teamsIntended` |
| `numberOfAdjudicators` | `adjudicatorsIntended` |

---

### 2. Manual "Sync now" trigger (`features/tournament-sheet-sources`)

- `actions/sync-now.ts` — server action that syncs + ingests a single source, revalidates both the settings path and the institutions page.
- `components/row-actions.tsx` — added `SyncNowButton` (disabled until mapping is configured, shows "Synced X row(s)" or error inline).
- `components/sources-table.tsx` — added `SyncNowButton` to each source row, plus status hints:
  - Mapping column: "⚠ Not set — click Mapping to continue" when unconfigured
  - Last synced column: "Waiting for mapping" / "Never — click Sync now" to guide the workflow

---

### 3. Column mapping editor expanded (`features/tournament-sheet-sources/components/column-mapping-editor.tsx`)

Was hardcoded to 5 fields. Now supports 11 fields with human-readable labels:

| Label | Key |
|---|---|
| Registration Type | `registrationType` |
| Institution Name | `institutionName` |
| Representative Name | `representativeName` |
| Email | `email` |
| Contact Number | `contactNumber` |
| Number of Teams | `numberOfTeams` |
| Number of Adjudicators | `numberOfAdjudicators` |
| Team Name | `teamName` |
| Speaker Name | `speakerName` |
| Adjudicator Name | `adjudicatorName` |
| Facebook URL | `facebookUrl` |

---

### 4. Re-ingest on mapping change (`features/tournament-sheet-sources/actions/update-mapping.ts`)

**Problem:** After the first sync, submissions were marked `processedAt = now()`. If the user later added more fields to the mapping (e.g., `numberOfTeams`) and re-synced, already-processed submissions were skipped — so `teamsIntended` and `adjudicatorsIntended` never got populated.

**Fix:** Saving a new mapping now resets `processedAt = null` on all submissions for that source, so the next "Sync now" re-ingests every row with the updated mapping.

---

### 5. Institution detail page — Registration details card

**Problem:** `teamsIntended` and `adjudicatorsIntended` were being stored but never displayed anywhere.

**Fix:** Added a "Registration details" card to the institution detail page showing:
- Teams intended
- Adjudicators intended
- Representative name
- Email
- Contact number

Card only renders if at least one of those fields is populated.

---

### 6. Institutions list — intended counts fallback

When no actual `Team` or `Adjudicator` records exist for an institution (roster not yet imported), the Teams / Judges columns in the institutions list now show the intended counts from the form submission (greyed out, with a tooltip "Intended (no rosters yet)").

---

### 7. Archive tournament form fix

**Problem:** Confirm-name button never enabled even when the correct name was typed.

**Fix:** Changed exact string comparison to trimmed comparison (`confirmName.trim() !== tournament.name.trim()`) on both the client (`archive-tournament-form.tsx`) and server (`actions/archive.ts`) sides.

---

### 8. Regex pattern fix (`tournament-basic-settings-form.tsx`, `tournament-create-form.tsx`)

Chrome's Unicode `v`-flag regex mode (enabled by default in newer versions) rejects bare `-` in character classes. Changed `[a-z0-9-]+` → `[a-z0-9\-]+` in both slug input fields.

---

### 9. Tab-not-found error message (`features/tournament-sheet-sources/services/detect-headers.ts`)

Cryptic Sheets API message `"Unable to parse range: 'foo'!A1:Z1"` is now caught and replaced with: `Tab "foo" was not found in this spreadsheet. Check the exact tab name (case-sensitive) or leave it blank to use the first tab.`

---

## Current data pipeline flow

```
Google Sheet
    │
    ▼ (Sync now button / cron POST /api/cron/google-sheets-sync)
GoogleFormSubmission (raw payload — all columns stored)
    │
    ▼ (ingestSource — applies columnMapping)
TournamentInstitution (name, contactEmail, contactName, contactPhone, teamsIntended, adjudicatorsIntended)
    │
    ▼ (institutions page / detail page)
UI
```

## Known limitations / next steps

- Ingest only handles the `INSTITUTIONS` phase. `TEAMS` and `ADJUDICATORS` phases return 0 and are not yet processed.
- Actual `Team` and `Adjudicator` records must still be created via CSV import — the form only captures intended counts, not rosters.
- `TournamentStatus.ACTIVE` exists in the schema but no action transitions a tournament from `DRAFT` → `ACTIVE`. This is a missing feature.
- The loading/error handling refactor (Suspense + `loading.tsx` + `error.tsx`) for institutions, teams, and adjudicators pages was started but not completed this session.
