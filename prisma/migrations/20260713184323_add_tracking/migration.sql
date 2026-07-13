-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "clicked" BOOLEAN NOT NULL DEFAULT false,
    "clickedAt" DATETIME,
    "convertedRevenue" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SentEmail_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SentEmail" ("brandId", "createdAt", "customerEmail", "customerName", "flowPosition", "flowType", "id", "orderId", "resendEmailId", "scheduledAt", "sentAt", "status") SELECT "brandId", "createdAt", "customerEmail", "customerName", "flowPosition", "flowType", "id", "orderId", "resendEmailId", "scheduledAt", "sentAt", "status" FROM "SentEmail";
DROP TABLE "SentEmail";
ALTER TABLE "new_SentEmail" RENAME TO "SentEmail";
CREATE INDEX "SentEmail_brandId_idx" ON "SentEmail"("brandId");
CREATE INDEX "SentEmail_status_scheduledAt_idx" ON "SentEmail"("status", "scheduledAt");
CREATE INDEX "SentEmail_customerEmail_flowType_status_idx" ON "SentEmail"("customerEmail", "flowType", "status");
CREATE UNIQUE INDEX "SentEmail_brandId_orderId_flowType_flowPosition_key" ON "SentEmail"("brandId", "orderId", "flowType", "flowPosition");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
