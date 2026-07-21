CREATE TYPE "payment_method" AS ENUM ('BANK_TRANSFER', 'GCASH', 'CHECK', 'CASH', 'OTHER');
CREATE TYPE "receipt_status" AS ENUM ('SUBMITTED', 'APPROVED', 'REJECTED');
CREATE TYPE "invoice_line_kind" AS ENUM ('TEAM_FEE', 'ADJUDICATOR_FEE', 'FLAT_FEE');

CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "tournament_institution_id" TEXT NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "subtotal_minor" INTEGER NOT NULL DEFAULT 0,
    "discount_minor" INTEGER NOT NULL DEFAULT 0,
    "discount_reason" TEXT,
    "total_minor" INTEGER NOT NULL DEFAULT 0,
    "currency" CHAR(3) NOT NULL,
    "override_minor" INTEGER,
    "override_reason" TEXT,
    "override_by_id" TEXT,
    "override_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "invoices_tournament_institution_id_key" ON "invoices"("tournament_institution_id");
CREATE UNIQUE INDEX "invoices_invoice_number_key" ON "invoices"("invoice_number");
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_tournament_institution_id_fkey" FOREIGN KEY ("tournament_institution_id") REFERENCES "tournament_institutions"("id") ON DELETE CASCADE;
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_override_by_id_fkey" FOREIGN KEY ("override_by_id") REFERENCES "profiles"("id") ON DELETE SET NULL;

CREATE TABLE "invoice_line_items" (
    "id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "kind" "invoice_line_kind" NOT NULL,
    "label" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_price_minor" INTEGER NOT NULL,
    "subtotal_minor" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "invoice_line_items_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "invoice_line_items_invoice_id_idx" ON "invoice_line_items"("invoice_id");
ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE;

CREATE TABLE "payment_receipts" (
    "id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "uploader_id" TEXT NOT NULL,
    "amount_minor" INTEGER NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL,
    "reference_number" TEXT NOT NULL,
    "method" "payment_method" NOT NULL,
    "storage_path" TEXT NOT NULL,
    "status" "receipt_status" NOT NULL DEFAULT 'SUBMITTED',
    "verified_by_id" TEXT,
    "verified_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "payment_receipts_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "payment_receipts_invoice_id_status_idx" ON "payment_receipts"("invoice_id", "status");
CREATE INDEX "payment_receipts_status_created_at_idx" ON "payment_receipts"("status", "created_at");
ALTER TABLE "payment_receipts" ADD CONSTRAINT "payment_receipts_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE;
ALTER TABLE "payment_receipts" ADD CONSTRAINT "payment_receipts_uploader_id_fkey" FOREIGN KEY ("uploader_id") REFERENCES "profiles"("id") ON DELETE RESTRICT;
ALTER TABLE "payment_receipts" ADD CONSTRAINT "payment_receipts_verified_by_id_fkey" FOREIGN KEY ("verified_by_id") REFERENCES "profiles"("id") ON DELETE SET NULL;

CREATE TABLE "payment_reminder_logs" (
    "id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "sent_by_id" TEXT NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "payment_reminder_logs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "payment_reminder_logs_invoice_id_sent_at_idx" ON "payment_reminder_logs"("invoice_id", "sent_at" DESC);
ALTER TABLE "payment_reminder_logs" ADD CONSTRAINT "payment_reminder_logs_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE;
ALTER TABLE "payment_reminder_logs" ADD CONSTRAINT "payment_reminder_logs_sent_by_id_fkey" FOREIGN KEY ("sent_by_id") REFERENCES "profiles"("id") ON DELETE RESTRICT;
