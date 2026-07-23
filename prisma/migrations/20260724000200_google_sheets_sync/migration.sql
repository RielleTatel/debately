-- Drop and recreate google_form_submissions with new pull-based schema
DROP TABLE IF EXISTS "google_form_submissions";

CREATE TABLE "google_form_submissions" (
    "id" TEXT NOT NULL,
    "spreadsheet_id" TEXT NOT NULL,
    "row_index" INTEGER NOT NULL,
    "payload" JSONB NOT NULL,
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "google_form_submissions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "google_form_submissions_spreadsheet_id_row_index_key"
ON "google_form_submissions"("spreadsheet_id", "row_index");

CREATE INDEX "google_form_submissions_spreadsheet_id_created_at_idx"
ON "google_form_submissions"("spreadsheet_id", "created_at" DESC);

-- Sync state cursor table
CREATE TABLE "google_sheet_sync_states" (
    "spreadsheet_id" TEXT NOT NULL,
    "last_synced_row" INTEGER NOT NULL DEFAULT 1,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "google_sheet_sync_states_pkey" PRIMARY KEY ("spreadsheet_id")
);
