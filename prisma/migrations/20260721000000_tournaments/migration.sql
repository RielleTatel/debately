-- CreateEnum
CREATE TYPE "tournament_status" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "debate_format" AS ENUM ('BP', 'AP', 'WSDC', 'CP', 'CUSTOM');

-- CreateEnum
CREATE TYPE "schedule_entry_kind" AS ENUM ('DEADLINE', 'ROUND', 'CEREMONY', 'BREAK', 'OTHER');

-- CreateTable
CREATE TABLE "tournaments" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "format" "debate_format" NOT NULL,
    "status" "tournament_status" NOT NULL DEFAULT 'DRAFT',
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "registration_deadline" TIMESTAMP(3) NOT NULL,
    "payment_deadline" TIMESTAMP(3),
    "venue" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "max_team_slots" INTEGER NOT NULL,
    "description" TEXT,
    "logo_url" TEXT,
    "rules_url" TEXT,
    "fee_structure" JSONB NOT NULL DEFAULT '{"kind":"none","lines":[]}',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "format_config" JSONB NOT NULL DEFAULT '{"speakerCount":3,"customEligibility":""}',
    "registration_open" BOOLEAN NOT NULL DEFAULT false,
    "max_teams_per_institution" INTEGER,
    "max_adjudicators_per_institution" INTEGER,
    "portal_active" BOOLEAN NOT NULL DEFAULT false,
    "public_page_enabled" BOOLEAN NOT NULL DEFAULT false,
    "archived_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tournaments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournament_directors" (
    "id" TEXT NOT NULL,
    "tournament_id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tournament_directors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournament_schedule_entries" (
    "id" TEXT NOT NULL,
    "tournament_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "kind" "schedule_entry_kind" NOT NULL,
    "start_at" TIMESTAMP(3) NOT NULL,
    "end_at" TIMESTAMP(3),
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tournament_schedule_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tournaments_org_id_idx" ON "tournaments"("org_id");

-- CreateIndex
CREATE INDEX "tournaments_status_idx" ON "tournaments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "tournaments_org_id_slug_key" ON "tournaments"("org_id", "slug");

-- CreateIndex
CREATE INDEX "tournament_directors_profile_id_idx" ON "tournament_directors"("profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "tournament_directors_tournament_id_profile_id_key" ON "tournament_directors"("tournament_id", "profile_id");

-- CreateIndex
CREATE INDEX "tournament_schedule_entries_tournament_id_start_at_idx" ON "tournament_schedule_entries"("tournament_id", "start_at");

-- AddForeignKey
ALTER TABLE "tournaments" ADD CONSTRAINT "tournaments_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_directors" ADD CONSTRAINT "tournament_directors_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_directors" ADD CONSTRAINT "tournament_directors_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_schedule_entries" ADD CONSTRAINT "tournament_schedule_entries_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
