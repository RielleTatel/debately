-- Enum
CREATE TYPE "registration_phase" AS ENUM ('INSTITUTIONS', 'TEAMS', 'ADJUDICATORS');

-- New source registry
CREATE TABLE "tournament_sheet_sources" (
    "id" TEXT NOT NULL,
    "tournament_id" TEXT NOT NULL,
    "phase" "registration_phase" NOT NULL,
    "spreadsheet_id" TEXT NOT NULL,
    "sheet_tab_name" TEXT,
    "column_mapping" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "last_synced_row" INTEGER NOT NULL DEFAULT 1,
    "last_synced_at" TIMESTAMP(3),
    "last_sync_error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tournament_sheet_sources_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "tournament_sheet_sources_tournament_id_fkey"
        FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "tournament_sheet_sources_spreadsheet_id_sheet_tab_name_key"
    ON "tournament_sheet_sources"("spreadsheet_id", COALESCE("sheet_tab_name", ''));

CREATE INDEX "tournament_sheet_sources_tournament_id_phase_idx"
    ON "tournament_sheet_sources"("tournament_id", "phase");

CREATE INDEX "tournament_sheet_sources_active_idx"
    ON "tournament_sheet_sources"("active");

-- Rebuild google_form_submissions with sourceId FK (drops test data)
DROP TABLE IF EXISTS "google_form_submissions";

CREATE TABLE "google_form_submissions" (
    "id" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,
    "row_index" INTEGER NOT NULL,
    "payload" JSONB NOT NULL,
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "google_form_submissions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "google_form_submissions_source_id_fkey"
        FOREIGN KEY ("source_id") REFERENCES "tournament_sheet_sources"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "google_form_submissions_source_id_row_index_key"
    ON "google_form_submissions"("source_id", "row_index");

CREATE INDEX "google_form_submissions_source_id_created_at_idx"
    ON "google_form_submissions"("source_id", "created_at" DESC);

-- Drop old cursor table (cursor now lives on source row)
DROP TABLE IF EXISTS "google_sheet_sync_states";
