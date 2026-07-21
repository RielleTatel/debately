-- CreateEnum
CREATE TYPE "team_validation_kind" AS ENUM ('INCOMPLETE', 'INELIGIBLE_SPEAKER', 'MISSING_JUDGE');

-- CreateTable
CREATE TABLE "institution_claims" (
    "tournament_institution_id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "claimed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "institution_claims_pkey" PRIMARY KEY ("tournament_institution_id")
);

-- CreateTable
CREATE TABLE "team_validation_flags" (
    "id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "kind" "team_validation_kind" NOT NULL,
    "note" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_validation_flags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "team_validation_flags_team_id_kind_key" ON "team_validation_flags"("team_id", "kind");

-- CreateIndex
CREATE INDEX "institution_claims_profile_id_idx" ON "institution_claims"("profile_id");

-- CreateIndex
CREATE INDEX "team_validation_flags_team_id_idx" ON "team_validation_flags"("team_id");

-- AddForeignKeys
ALTER TABLE "institution_claims" ADD CONSTRAINT "institution_claims_tournament_institution_id_fkey" FOREIGN KEY ("tournament_institution_id") REFERENCES "tournament_institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "institution_claims" ADD CONSTRAINT "institution_claims_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "team_validation_flags" ADD CONSTRAINT "team_validation_flags_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Partial unique index: only one active portal token per institution
CREATE UNIQUE INDEX "institution_portal_tokens_active_unique"
  ON public.institution_portal_tokens (tournament_institution_id)
  WHERE active = true;
