/*
  Warnings:

  - A unique constraint covering the columns `[userId,userAgent]` on the table `UserSession` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserSession_userId_userAgent_key" ON "UserSession"("userId", "userAgent");
