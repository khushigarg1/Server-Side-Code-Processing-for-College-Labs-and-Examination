/*
  Warnings:

  - You are about to drop the column `CodeFile_id` on the `Scoreboard` table. All the data in the column will be lost.
  - You are about to drop the column `CodeFile_id` on the `SubmissionRun` table. All the data in the column will be lost.
  - You are about to drop the `CodeFile` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[email,testId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "CodeFile" DROP CONSTRAINT "CodeFile_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Scoreboard" DROP CONSTRAINT "Scoreboard_CodeFile_id_fkey";

-- DropForeignKey
ALTER TABLE "SubmissionRun" DROP CONSTRAINT "SubmissionRun_CodeFile_id_fkey";

-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Configuration" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Scoreboard" DROP COLUMN "CodeFile_id",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "SubmissionRun" DROP COLUMN "CodeFile_id",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Test" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "TestCase" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "hidden" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "CodeFile";

-- CreateIndex
CREATE UNIQUE INDEX "User_email_testId_key" ON "User"("email", "testId");
