/*
  Warnings:

  - You are about to drop the column `progress` on the `game` table. All the data in the column will be lost.
  - You are about to drop the `game_events` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `balance` to the `game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `moveType` to the `game` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "GameMoveType" AS ENUM ('NONE', 'MOVE', 'FISHING', 'MINING');

-- AlterEnum
ALTER TYPE "game_statuses" ADD VALUE 'PREPARING';

-- DropForeignKey
ALTER TABLE "game_events" DROP CONSTRAINT "game_events_gameId_fkey";

-- AlterTable
ALTER TABLE "game" DROP COLUMN "progress",
ADD COLUMN     "activePlayerIdx" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "balance" INTEGER NOT NULL,
ADD COLUMN     "completedGoals" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "deckActionIdx" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "goals" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "moveType" "GameMoveType" NOT NULL;

-- DropTable
DROP TABLE "game_events";

-- DropEnum
DROP TYPE "GameEventType";

-- DropEnum
DROP TYPE "game_event_statuses";

-- CreateTable
CREATE TABLE "game_user_storage" (
    "id" TEXT NOT NULL,
    "limit" INTEGER NOT NULL DEFAULT 6,
    "items" TEXT[],
    "userId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,

    CONSTRAINT "game_user_storage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "game_user_storage" ADD CONSTRAINT "game_user_storage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_user_storage" ADD CONSTRAINT "game_user_storage_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
