/*
  Warnings:

  - You are about to drop the column `closedAt` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `resolvedAt` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Task` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Task" DROP COLUMN "closedAt",
DROP COLUMN "resolvedAt",
DROP COLUMN "status",
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "position" INTEGER;

-- CreateIndex
CREATE INDEX "Task_projectId_idx" ON "Task"("projectId");

-- CreateIndex
CREATE INDEX "Task_columnId_idx" ON "Task"("columnId");

-- CreateIndex
CREATE INDEX "Task_assigneeId_idx" ON "Task"("assigneeId");
