CREATE TYPE "announcement_status" AS ENUM ('DRAFT', 'SCHEDULED', 'PUBLISHED', 'RETRACTED');
CREATE TYPE "request_type" AS ENUM ('TEAM_ADDITION', 'TEAM_WITHDRAWAL', 'SPEAKER_REPLACEMENT', 'ADJUDICATOR_ADD', 'ADJUDICATOR_REMOVE', 'INSTITUTION_INFO_UPDATE', 'BILLING_QUESTION', 'DEADLINE_EXTENSION', 'ACCESSIBILITY_ACCOMMODATION', 'DIETARY_ACCOMMODATION', 'EQUIPMENT_REQUEST', 'RULES_CLARIFICATION', 'OTHER');
CREATE TYPE "request_status" AS ENUM ('PENDING', 'MORE_INFO', 'APPROVED', 'REJECTED');
CREATE TYPE "request_activity_kind" AS ENUM ('SUBMITTED', 'COMMENT', 'MORE_INFO_REQUESTED', 'MORE_INFO_PROVIDED', 'APPROVED', 'REJECTED', 'APPROVAL_ATTEMPT_FAILED');

CREATE TABLE "announcements" (
    "id" TEXT NOT NULL,
    "tournament_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body_html" TEXT NOT NULL,
    "attachment_path" TEXT,
    "status" "announcement_status" NOT NULL DEFAULT 'DRAFT',
    "is_all_institutions" BOOLEAN NOT NULL DEFAULT false,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "scheduled_for" TIMESTAMP(3),
    "published_at" TIMESTAMP(3),
    "edited_at" TIMESTAMP(3),
    "retraction_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "announcements_tournament_id_status_published_at_idx" ON "announcements"("tournament_id", "status", "published_at" DESC);
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE;
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "profiles"("id") ON DELETE RESTRICT;

CREATE TABLE "announcement_targets" (
    "announcement_id" TEXT NOT NULL,
    "tournament_institution_id" TEXT NOT NULL,
    CONSTRAINT "announcement_targets_pkey" PRIMARY KEY ("announcement_id", "tournament_institution_id")
);
CREATE INDEX "announcement_targets_tournament_institution_id_idx" ON "announcement_targets"("tournament_institution_id");
ALTER TABLE "announcement_targets" ADD CONSTRAINT "announcement_targets_announcement_id_fkey" FOREIGN KEY ("announcement_id") REFERENCES "announcements"("id") ON DELETE CASCADE;
ALTER TABLE "announcement_targets" ADD CONSTRAINT "announcement_targets_tournament_institution_id_fkey" FOREIGN KEY ("tournament_institution_id") REFERENCES "tournament_institutions"("id") ON DELETE CASCADE;

CREATE TABLE "announcement_reads" (
    "announcement_id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "read_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "announcement_reads_pkey" PRIMARY KEY ("announcement_id", "profile_id")
);
CREATE INDEX "announcement_reads_profile_id_read_at_idx" ON "announcement_reads"("profile_id", "read_at" DESC);
ALTER TABLE "announcement_reads" ADD CONSTRAINT "announcement_reads_announcement_id_fkey" FOREIGN KEY ("announcement_id") REFERENCES "announcements"("id") ON DELETE CASCADE;
ALTER TABLE "announcement_reads" ADD CONSTRAINT "announcement_reads_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE;

CREATE TABLE "requests" (
    "id" TEXT NOT NULL,
    "tournament_id" TEXT NOT NULL,
    "tournament_institution_id" TEXT NOT NULL,
    "submitter_id" TEXT NOT NULL,
    "sequence_number" INTEGER NOT NULL,
    "type" "request_type" NOT NULL,
    "status" "request_status" NOT NULL DEFAULT 'PENDING',
    "description" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "attachment_path" TEXT,
    "resolved_by_id" TEXT,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "requests_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "requests_tournament_id_sequence_number_key" ON "requests"("tournament_id", "sequence_number");
CREATE INDEX "requests_tournament_id_status_created_at_idx" ON "requests"("tournament_id", "status", "created_at" DESC);
CREATE INDEX "requests_tournament_institution_id_status_idx" ON "requests"("tournament_institution_id", "status");
ALTER TABLE "requests" ADD CONSTRAINT "requests_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE;
ALTER TABLE "requests" ADD CONSTRAINT "requests_tournament_institution_id_fkey" FOREIGN KEY ("tournament_institution_id") REFERENCES "tournament_institutions"("id") ON DELETE CASCADE;
ALTER TABLE "requests" ADD CONSTRAINT "requests_submitter_id_fkey" FOREIGN KEY ("submitter_id") REFERENCES "profiles"("id") ON DELETE RESTRICT;
ALTER TABLE "requests" ADD CONSTRAINT "requests_resolved_by_id_fkey" FOREIGN KEY ("resolved_by_id") REFERENCES "profiles"("id") ON DELETE SET NULL;

CREATE TABLE "request_activities" (
    "id" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "actor_id" TEXT NOT NULL,
    "kind" "request_activity_kind" NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "request_activities_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "request_activities_request_id_created_at_idx" ON "request_activities"("request_id", "created_at");
ALTER TABLE "request_activities" ADD CONSTRAINT "request_activities_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "requests"("id") ON DELETE CASCADE;
ALTER TABLE "request_activities" ADD CONSTRAINT "request_activities_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "profiles"("id") ON DELETE RESTRICT;
