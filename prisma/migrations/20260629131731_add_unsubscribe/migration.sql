-- CreateTable
CREATE TABLE "Unsubscribed" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Unsubscribed_email_key" ON "Unsubscribed"("email");
