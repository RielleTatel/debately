-- CreateTable
CREATE TABLE "google_form_submissions" (
    "id" TEXT NOT NULL,
    "form_id" TEXT NOT NULL,
    "response_id" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "google_form_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "google_form_submissions_response_id_key" ON "google_form_submissions"("response_id");

-- CreateIndex
CREATE INDEX "google_form_submissions_form_id_created_at_idx" ON "google_form_submissions"("form_id", "created_at" DESC);
