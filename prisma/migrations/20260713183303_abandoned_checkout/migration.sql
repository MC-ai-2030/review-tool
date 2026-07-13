-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Brand" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT NOT NULL DEFAULT '',
    "primaryColor" TEXT NOT NULL DEFAULT '#000000',
    "trustpilotUrl" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "shopifyDomain" TEXT NOT NULL DEFAULT '',
    "shopifyClientId" TEXT NOT NULL DEFAULT '',
    "shopifyClientSecret" TEXT NOT NULL DEFAULT '',
    "shopifyAccessToken" TEXT NOT NULL DEFAULT '',
    "senderEmail" TEXT NOT NULL DEFAULT '',
    "senderName" TEXT NOT NULL DEFAULT '',
    "webhookId" TEXT NOT NULL DEFAULT '',
    "checkoutWebhookId" TEXT NOT NULL DEFAULT '',
    "emailEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Brand" ("createdAt", "emailEnabled", "id", "language", "logoUrl", "name", "primaryColor", "senderEmail", "senderName", "shopifyAccessToken", "shopifyClientId", "shopifyClientSecret", "shopifyDomain", "slug", "trustpilotUrl", "webhookId") SELECT "createdAt", "emailEnabled", "id", "language", "logoUrl", "name", "primaryColor", "senderEmail", "senderName", "shopifyAccessToken", "shopifyClientId", "shopifyClientSecret", "shopifyDomain", "slug", "trustpilotUrl", "webhookId" FROM "Brand";
DROP TABLE "Brand";
ALTER TABLE "new_Brand" RENAME TO "Brand";
CREATE UNIQUE INDEX "Brand_slug_key" ON "Brand"("slug");
CREATE TABLE "new_FlowEmail" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "brandId" TEXT NOT NULL,
    "flowType" TEXT NOT NULL DEFAULT 'review',
    "position" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "delayMinutes" INTEGER NOT NULL DEFAULT 30,
    "subject" TEXT NOT NULL DEFAULT '',
    "body" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "FlowEmail_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_FlowEmail" ("body", "brandId", "delayMinutes", "enabled", "id", "position", "subject") SELECT "body", "brandId", "delayMinutes", "enabled", "id", "position", "subject" FROM "FlowEmail";
DROP TABLE "FlowEmail";
ALTER TABLE "new_FlowEmail" RENAME TO "FlowEmail";
CREATE INDEX "FlowEmail_brandId_idx" ON "FlowEmail"("brandId");
CREATE UNIQUE INDEX "FlowEmail_brandId_flowType_position_key" ON "FlowEmail"("brandId", "flowType", "position");
CREATE TABLE "new_SentEmail" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "brandId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "flowType" TEXT NOT NULL DEFAULT 'review',
    "flowPosition" INTEGER NOT NULL DEFAULT 1,
    "customerEmail" TEXT NOT NULL,
    "customerName" TEXT NOT NULL DEFAULT '',
    "resendEmailId" TEXT NOT NULL DEFAULT '',
    "scheduledAt" DATETIME NOT NULL,
    "sentAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SentEmail_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SentEmail" ("brandId", "createdAt", "customerEmail", "customerName", "flowPosition", "id", "orderId", "scheduledAt", "sentAt", "status") SELECT "brandId", "createdAt", "customerEmail", "customerName", "flowPosition", "id", "orderId", "scheduledAt", "sentAt", "status" FROM "SentEmail";
DROP TABLE "SentEmail";
ALTER TABLE "new_SentEmail" RENAME TO "SentEmail";
CREATE INDEX "SentEmail_brandId_idx" ON "SentEmail"("brandId");
CREATE INDEX "SentEmail_status_scheduledAt_idx" ON "SentEmail"("status", "scheduledAt");
CREATE INDEX "SentEmail_customerEmail_flowType_status_idx" ON "SentEmail"("customerEmail", "flowType", "status");
CREATE UNIQUE INDEX "SentEmail_brandId_orderId_flowType_flowPosition_key" ON "SentEmail"("brandId", "orderId", "flowType", "flowPosition");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
