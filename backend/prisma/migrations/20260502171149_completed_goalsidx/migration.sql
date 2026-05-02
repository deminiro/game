/*
  Warnings:

  - You are about to drop the column `completedGoals` on the `game` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "game" DROP COLUMN "completedGoals",
ADD COLUMN     "completedGoalsIdx" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
