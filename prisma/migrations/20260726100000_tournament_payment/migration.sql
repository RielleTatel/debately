CREATE TYPE "payment_source" AS ENUM ('GOOGLE_FORM', 'MANUAL');
CREATE TYPE "tournament_payment_status" AS ENUM ('PENDING', 'CONFIRMED', 'VOIDED');

ALTER TYPE "activity_action" ADD VALUE 'PAYMENT_CREATED';
ALTER TYPE "activity_action" ADD VALUE 'PAYMENT_UPDATED';
ALTER TYPE "activity_action" ADD VALUE 'PAYMENT_VOIDED';

CREATE TABLE "tournament_payments" (
  "id" TEXT NOT NULL,
  "tournament_id" TEXT NOT NULL,
  "tournament_institution_id" TEXT NOT NULL,
  "phase" "registration_phase",
  "amount_minor" INTEGER NOT NULL,
  "currency" CHAR(3) NOT NULL,
  "payment_source" "payment_source" NOT NULL DEFAULT 'GOOGLE_FORM',
  "source_submission_id" TEXT,
  "received_at" TIMESTAMP(3),
  "status" "tournament_payment_status" NOT NULL DEFAULT 'PENDING',
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "tournament_payments_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "tournament_payments"
  ADD CONSTRAINT "tournament_payments_tournament_id_fkey"
    FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "tournament_payments_institution_id_fkey"
    FOREIGN KEY ("tournament_institution_id") REFERENCES "tournament_institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE UNIQUE INDEX "tournament_payments_institution_submission_key"
  ON "tournament_payments"("tournament_institution_id", "source_submission_id");

CREATE INDEX "tournament_payments_tournament_id_idx" ON "tournament_payments"("tournament_id");
CREATE INDEX "tournament_payments_institution_id_idx" ON "tournament_payments"("tournament_institution_id");
