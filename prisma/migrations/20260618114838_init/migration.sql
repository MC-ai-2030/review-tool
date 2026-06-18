-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT NOT NULL DEFAULT '',
    "primaryColor" TEXT NOT NULL DEFAULT '#000000',
    "trustpilotUrl" TEXT NOT NULL,
    "headingText" TEXT NOT NULL DEFAULT 'We''re happy to offer you a 50% refund on your order.',
    "subText" TEXT NOT NULL DEFAULT 'Your honest review helps us improve, and we value that.',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Brand_slug_key" ON "Brand"("slug");
