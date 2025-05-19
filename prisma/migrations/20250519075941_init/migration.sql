-- DropIndex
DROP INDEX "UserSession_userId_userAgent_key";

-- AlterTable
ALTER TABLE "UserSession" ADD COLUMN     "tokenId" TEXT;

-- CreateIndex
CREATE INDEX "UserSession_tokenId_idx" ON "UserSession"("tokenId");
