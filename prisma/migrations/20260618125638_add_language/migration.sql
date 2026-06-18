/*
  Warnings:

  - You are about to drop the column `headingText` on the `Brand` table. All the data in the column will be lost.
  - You are about to drop the column `subText` on the `Brand` table. All the data in the column will be lost.

*/
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Brand" ("createdAt", "id", "logoUrl", "name", "primaryColor", "slug", "trustpilotUrl") SELECT "createdAt", "id", "logoUrl", "name", "primaryColor", "slug", "trustpilotUrl" FROM "Brand";
DROP TABLE "Brand";
ALTER TABLE "new_Brand" RENAME TO "Brand";
CREATE UNIQUE INDEX "Brand_slug_key" ON "Brand"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
