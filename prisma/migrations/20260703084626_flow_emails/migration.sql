/*
  Warnings:

  - You are about to drop the column `emailBody` on the `Brand` table. All the data in the column will be lost.
  - You are about to drop the column `emailDelayMin` on the `Brand` table. All the data in the column will be lost.
  - You are about to drop the column `emailSubject` on the `Brand` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "FlowEmail" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "brandId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "delayMinutes" INTEGER NOT NULL DEFAULT 30,
    "subject" TEXT NOT NULL DEFAULT '',
    "body" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "FlowEmail_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

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
    "webhookId" TEXT NOT NULL DEFAULT '',
    "emailEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Brand" ("createdAt", "emailEnabled", "id", "language", "logoUrl", "name", "primaryColor", "shopifyAccessToken", "shopifyClientId", "shopifyClientSecret", "shopifyDomain", "slug", "trustpilotUrl", "webhookId") SELECT "createdAt", "emailEnabled", "id", "language", "logoUrl", "name", "primaryColor", "shopifyAccessToken", "shopifyClientId", "shopifyClientSecret", "shopifyDomain", "slug", "trustpilotUrl", "webhookId" FROM "Brand";
DROP TABLE "Brand";
ALTER TABLE "new_Brand" RENAME TO "Brand";
CREATE UNIQUE INDEX "Brand_slug_key" ON "Brand"("slug");
CREATE TABLE "new_SentEmail" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "brandId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "flowPosition" INTEGER NOT NULL DEFAULT 1,
    "customerEmail" TEXT NOT NULL,
    "customerName" TEXT NOT NULL DEFAULT '',
    "scheduledAt" DATETIME NOT NULL,
    "sentAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SentEmail_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SentEmail" ("brandId", "createdAt", "customerEmail", "customerName", "id", "orderId", "scheduledAt", "sentAt", "status") SELECT "brandId", "createdAt", "customerEmail", "customerName", "id", "orderId", "scheduledAt", "sentAt", "status" FROM "SentEmail";
DROP TABLE "SentEmail";
ALTER TABLE "new_SentEmail" RENAME TO "SentEmail";
CREATE INDEX "SentEmail_brandId_idx" ON "SentEmail"("brandId");
CREATE INDEX "SentEmail_status_scheduledAt_idx" ON "SentEmail"("status", "scheduledAt");
CREATE UNIQUE INDEX "SentEmail_brandId_orderId_flowPosition_key" ON "SentEmail"("brandId", "orderId", "flowPosition");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "FlowEmail_brandId_idx" ON "FlowEmail"("brandId");

-- CreateIndex
CREATE UNIQUE INDEX "FlowEmail_brandId_position_key" ON "FlowEmail"("brandId", "position");
