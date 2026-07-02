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
    "emailSubject" TEXT NOT NULL DEFAULT '',
    "emailBody" TEXT NOT NULL DEFAULT '',
    "webhookId" TEXT NOT NULL DEFAULT '',
    "emailEnabled" BOOLEAN NOT NULL DEFAULT false,
    "emailDelayMin" INTEGER NOT NULL DEFAULT 30,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Brand" ("createdAt", "emailDelayMin", "emailEnabled", "id", "language", "logoUrl", "name", "primaryColor", "shopifyAccessToken", "shopifyClientId", "shopifyClientSecret", "shopifyDomain", "slug", "trustpilotUrl", "webhookId") SELECT "createdAt", "emailDelayMin", "emailEnabled", "id", "language", "logoUrl", "name", "primaryColor", "shopifyAccessToken", "shopifyClientId", "shopifyClientSecret", "shopifyDomain", "slug", "trustpilotUrl", "webhookId" FROM "Brand";
DROP TABLE "Brand";
ALTER TABLE "new_Brand" RENAME TO "Brand";
CREATE UNIQUE INDEX "Brand_slug_key" ON "Brand"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
