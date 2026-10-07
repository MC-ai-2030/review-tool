-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FlowEmail" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "brandId" TEXT NOT NULL,
    "flowType" TEXT NOT NULL DEFAULT 'review',
    "position" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "delayMinutes" INTEGER NOT NULL DEFAULT 30,
    "subject" TEXT NOT NULL DEFAULT '',
    "body" TEXT NOT NULL DEFAULT '',
    "blocks" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "FlowEmail_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_FlowEmail" ("body", "brandId", "delayMinutes", "enabled", "flowType", "id", "position", "subject") SELECT "body", "brandId", "delayMinutes", "enabled", "flowType", "id", "position", "subject" FROM "FlowEmail";
DROP TABLE "FlowEmail";
ALTER TABLE "new_FlowEmail" RENAME TO "FlowEmail";
CREATE INDEX "FlowEmail_brandId_idx" ON "FlowEmail"("brandId");
CREATE UNIQUE INDEX "FlowEmail_brandId_flowType_position_key" ON "FlowEmail"("brandId", "flowType", "position");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
