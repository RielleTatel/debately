CREATE TYPE "public_asset_kind" AS ENUM ('RULES', 'INFO_PACK', 'TAB_GUIDE', 'CODE_OF_CONDUCT');
CREATE TYPE "notification_category" AS ENUM ('ANNOUNCEMENTS', 'PAYMENT_UPDATES', 'REQUEST_UPDATES', 'CALENDAR_NUDGES', 'TRANSACTIONAL');

CREATE TABLE "tournament_public_assets" (
    "id" TEXT NOT NULL, "tournament_id" TEXT NOT NULL, "kind" "public_asset_kind" NOT NULL,
    "storage_path" TEXT NOT NULL, "label" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tournament_public_assets_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "tournament_public_assets_tournament_id_kind_idx" ON "tournament_public_assets"("tournament_id", "kind");
ALTER TABLE "tournament_public_assets" ADD CONSTRAINT "tournament_public_assets_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE;

CREATE TABLE "tournament_contacts" (
    "id" TEXT NOT NULL, "tournament_id" TEXT NOT NULL,
    "name" TEXT NOT NULL, "email" TEXT NOT NULL, "social_links" JSONB,
    CONSTRAINT "tournament_contacts_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "tournament_contacts_tournament_id_idx" ON "tournament_contacts"("tournament_id");
ALTER TABLE "tournament_contacts" ADD CONSTRAINT "tournament_contacts_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE;

CREATE TABLE "public_contact_messages" (
    "id" TEXT NOT NULL, "tournament_id" TEXT NOT NULL,
    "sender_name" TEXT NOT NULL, "sender_email" TEXT NOT NULL,
    "body" TEXT NOT NULL, "sender_ip" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "public_contact_messages_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "public_contact_messages_tournament_id_created_at_idx" ON "public_contact_messages"("tournament_id", "created_at" DESC);
ALTER TABLE "public_contact_messages" ADD CONSTRAINT "public_contact_messages_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE;

CREATE TABLE "user_email_preferences" (
    "id" TEXT NOT NULL, "profile_id" TEXT NOT NULL,
    "announcements" BOOLEAN NOT NULL DEFAULT true,
    "payment_updates" BOOLEAN NOT NULL DEFAULT true,
    "request_updates" BOOLEAN NOT NULL DEFAULT true,
    "calendar_nudges" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "user_email_preferences_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "user_email_preferences_profile_id_key" ON "user_email_preferences"("profile_id");
ALTER TABLE "user_email_preferences" ADD CONSTRAINT "user_email_preferences_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE;
