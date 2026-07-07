-- Self-hosted indexer: hub pages and discovery pipeline fields on TaskUrl

ALTER TABLE "TaskUrl" ADD COLUMN IF NOT EXISTS "hubToken" TEXT;
ALTER TABLE "TaskUrl" ADD COLUMN IF NOT EXISTS "indexNowAt" TIMESTAMP(3);
ALTER TABLE "TaskUrl" ADD COLUMN IF NOT EXISTS "botHitAt" TIMESTAMP(3);
ALTER TABLE "TaskUrl" ADD COLUMN IF NOT EXISTS "botHitCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "TaskUrl" ADD COLUMN IF NOT EXISTS "attempts" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "TaskUrl" ADD COLUMN IF NOT EXISTS "nextRunAt" TIMESTAMP(3);
ALTER TABLE "TaskUrl" ADD COLUMN IF NOT EXISTS "lastError" TEXT;
ALTER TABLE "TaskUrl" ADD COLUMN IF NOT EXISTS "verifiedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX IF NOT EXISTS "TaskUrl_hubToken_key" ON "TaskUrl"("hubToken");
CREATE INDEX IF NOT EXISTS "TaskUrl_status_nextRunAt_idx" ON "TaskUrl"("status", "nextRunAt");
CREATE INDEX IF NOT EXISTS "TaskUrl_hubToken_idx" ON "TaskUrl"("hubToken");
