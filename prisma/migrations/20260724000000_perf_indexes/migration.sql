-- Performance indexes for hot query paths (all additive; safe to apply online)

-- Tournament: listings under an org sort by (startDate, createdAt)
CREATE INDEX IF NOT EXISTS "tournaments_org_id_start_date_created_at_idx"
  ON "tournaments" ("org_id", "start_date", "created_at");

-- Tournament: public page lookup by slug filtered on publicPageEnabled
CREATE INDEX IF NOT EXISTS "tournaments_slug_public_page_enabled_idx"
  ON "tournaments" ("slug", "public_page_enabled");

-- Adjudicator: listings for a tournament sort by (status, displayName)
CREATE INDEX IF NOT EXISTS "adjudicators_tournament_id_status_display_name_idx"
  ON "adjudicators" ("tournament_id", "status", "display_name");

-- Participant: listings for an institution sort by displayName
CREATE INDEX IF NOT EXISTS "participants_tournament_institution_id_display_name_idx"
  ON "participants" ("tournament_institution_id", "display_name");

-- PaymentReceipt: listings for an invoice sort by createdAt DESC
CREATE INDEX IF NOT EXISTS "payment_receipts_invoice_id_created_at_idx"
  ON "payment_receipts" ("invoice_id", "created_at" DESC);
