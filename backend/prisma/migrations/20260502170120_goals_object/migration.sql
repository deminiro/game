/*
  Warnings:

  - The `goals` column on the `game` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "game" DROP COLUMN "goals",
ADD COLUMN     "goals" JSONB[] DEFAULT ARRAY[]::JSONB[];
