-- CreateEnum
CREATE TYPE "csv_import_status" AS ENUM ('STAGING', 'PROCESSED', 'FINALIZED', 'ROLLED_BACK');
CREATE TYPE "csv_import_row_status" AS ENUM ('PENDING', 'ERROR', 'WARNING', 'IMPORTED', 'SKIPPED', 'RESUBMISSION');
CREATE TYPE "adjudicator_status" AS ENUM ('ACTIVE', 'WITHDRAWN');
CREATE TYPE "participant_eligibility" AS ENUM ('ELIGIBLE', 'INELIGIBLE');

-- CreateTable
CREATE TABLE "tournament_institutions" (
    "id" TEXT NOT NULL,
    "tournament_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "aliases" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "logo_url" TEXT,
    "contact_name" TEXT,
    "contact_email" TEXT,
    "contact_phone" TEXT,
    "teams_intended" INTEGER,
    "adjudicators_intended" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tournament_institutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "institution_aliases" (
    "id" TEXT NOT NULL,
    "tournament_id" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "resolved_institution_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "institution_aliases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "tournament_institution_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_novice" BOOLEAN NOT NULL DEFAULT false,
    "import_phase" TEXT NOT NULL,
    "warning_flags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "participants" (
    "id" TEXT NOT NULL,
    "tournament_institution_id" TEXT NOT NULL,
    "team_id" TEXT,
    "display_name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "eligibility" "participant_eligibility" NOT NULL DEFAULT 'ELIGIBLE',
    "ineligibility_reason" TEXT,
    "import_phase" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adjudicators" (
    "id" TEXT NOT NULL,
    "tournament_id" TEXT NOT NULL,
    "tournament_institution_id" TEXT,
    "display_name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "experience_level" TEXT,
    "availability_notes" TEXT,
    "director_notes" TEXT,
    "status" "adjudicator_status" NOT NULL DEFAULT 'ACTIVE',
    "import_phase" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "adjudicators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "csv_imports" (
    "id" TEXT NOT NULL,
    "tournament_id" TEXT NOT NULL,
    "phase_label" TEXT NOT NULL,
    "uploader_id" TEXT NOT NULL,
    "storage_path" TEXT NOT NULL,
    "status" "csv_import_status" NOT NULL DEFAULT 'STAGING',
    "mapping_json" JSONB,
    "summary_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finalized_at" TIMESTAMP(3),

    CONSTRAINT "csv_imports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "csv_import_rows" (
    "id" TEXT NOT NULL,
    "import_id" TEXT NOT NULL,
    "row_index" INTEGER NOT NULL,
    "raw_json" JSONB NOT NULL,
    "status" "csv_import_row_status" NOT NULL DEFAULT 'PENDING',
    "messages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "csv_import_rows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "column_mappings" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mapping_json" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "column_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "institution_portal_tokens" (
    "id" TEXT NOT NULL,
    "tournament_institution_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "regenerated_at" TIMESTAMP(3),
    "disabled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "institution_portal_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tournament_institutions_tournament_id_name_key" ON "tournament_institutions"("tournament_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "institution_aliases_tournament_id_alias_key" ON "institution_aliases"("tournament_id", "alias");

-- CreateIndex
CREATE UNIQUE INDEX "teams_tournament_institution_id_name_key" ON "teams"("tournament_institution_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "csv_import_rows_import_id_row_index_key" ON "csv_import_rows"("import_id", "row_index");

-- CreateIndex
CREATE UNIQUE INDEX "column_mappings_org_id_name_key" ON "column_mappings"("org_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "institution_portal_tokens_token_key" ON "institution_portal_tokens"("token");

-- CreateIndex
CREATE INDEX "tournament_institutions_tournament_id_idx" ON "tournament_institutions"("tournament_id");

-- CreateIndex
CREATE INDEX "institution_aliases_resolved_institution_id_idx" ON "institution_aliases"("resolved_institution_id");

-- CreateIndex
CREATE INDEX "teams_tournament_institution_id_idx" ON "teams"("tournament_institution_id");

-- CreateIndex
CREATE INDEX "participants_tournament_institution_id_idx" ON "participants"("tournament_institution_id");

-- CreateIndex
CREATE INDEX "participants_team_id_idx" ON "participants"("team_id");

-- CreateIndex
CREATE INDEX "participants_email_idx" ON "participants"("email");

-- CreateIndex
CREATE INDEX "adjudicators_tournament_id_idx" ON "adjudicators"("tournament_id");

-- CreateIndex
CREATE INDEX "adjudicators_tournament_institution_id_idx" ON "adjudicators"("tournament_institution_id");

-- CreateIndex
CREATE INDEX "adjudicators_email_idx" ON "adjudicators"("email");

-- CreateIndex
CREATE INDEX "csv_imports_tournament_id_idx" ON "csv_imports"("tournament_id");

-- CreateIndex
CREATE INDEX "csv_imports_status_idx" ON "csv_imports"("status");

-- CreateIndex
CREATE INDEX "csv_import_rows_import_id_idx" ON "csv_import_rows"("import_id");

-- CreateIndex
CREATE INDEX "column_mappings_org_id_idx" ON "column_mappings"("org_id");

-- CreateIndex
CREATE INDEX "institution_portal_tokens_tournament_institution_id_idx" ON "institution_portal_tokens"("tournament_institution_id");

-- CreateIndex
CREATE INDEX "institution_portal_tokens_active_idx" ON "institution_portal_tokens"("active");

-- AddForeignKeys
ALTER TABLE "tournament_institutions" ADD CONSTRAINT "tournament_institutions_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "institution_aliases" ADD CONSTRAINT "institution_aliases_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "institution_aliases" ADD CONSTRAINT "institution_aliases_resolved_institution_id_fkey" FOREIGN KEY ("resolved_institution_id") REFERENCES "tournament_institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "teams" ADD CONSTRAINT "teams_tournament_institution_id_fkey" FOREIGN KEY ("tournament_institution_id") REFERENCES "tournament_institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "participants" ADD CONSTRAINT "participants_tournament_institution_id_fkey" FOREIGN KEY ("tournament_institution_id") REFERENCES "tournament_institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "participants" ADD CONSTRAINT "participants_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "adjudicators" ADD CONSTRAINT "adjudicators_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "adjudicators" ADD CONSTRAINT "adjudicators_tournament_institution_id_fkey" FOREIGN KEY ("tournament_institution_id") REFERENCES "tournament_institutions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "csv_imports" ADD CONSTRAINT "csv_imports_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "csv_imports" ADD CONSTRAINT "csv_imports_uploader_id_fkey" FOREIGN KEY ("uploader_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "csv_import_rows" ADD CONSTRAINT "csv_import_rows_import_id_fkey" FOREIGN KEY ("import_id") REFERENCES "csv_imports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "column_mappings" ADD CONSTRAINT "column_mappings_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "institution_portal_tokens" ADD CONSTRAINT "institution_portal_tokens_tournament_institution_id_fkey" FOREIGN KEY ("tournament_institution_id") REFERENCES "tournament_institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
