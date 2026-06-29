-- CreateTable
CREATE TABLE "SentEmail" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "brandId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerName" TEXT NOT NULL DEFAULT '',
    "scheduledAt" DATETIME NOT NULL,
    "sentAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SentEmail_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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
    "shopifyToken" TEXT NOT NULL DEFAULT '',
    "webhookId" TEXT NOT NULL DEFAULT '',
    "emailEnabled" BOOLEAN NOT NULL DEFAULT false,
    "emailDelayMin" INTEGER NOT NULL DEFAULT 30,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Brand" ("createdAt", "id", "language", "logoUrl", "name", "primaryColor", "slug", "trustpilotUrl") SELECT "createdAt", "id", "language", "logoUrl", "name", "primaryColor", "slug", "trustpilotUrl" FROM "Brand";
DROP TABLE "Brand";
ALTER TABLE "new_Brand" RENAME TO "Brand";
CREATE UNIQUE INDEX "Brand_slug_key" ON "Brand"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "SentEmail_brandId_idx" ON "SentEmail"("brandId");

-- CreateIndex
CREATE UNIQUE INDEX "SentEmail_brandId_orderId_key" ON "SentEmail"("brandId", "orderId");
