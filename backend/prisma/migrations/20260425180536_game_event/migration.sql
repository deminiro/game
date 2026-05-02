/*
  Warnings:

  - You are about to drop the column `deck` on the `game_events` table. All the data in the column will be lost.
  - You are about to drop the column `progress` on the `game_events` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "game_events" DROP COLUMN "deck",
DROP COLUMN "progress";
