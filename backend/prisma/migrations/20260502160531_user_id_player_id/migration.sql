/*
  Warnings:

  - You are about to drop the column `userId` on the `game_user_storage` table. All the data in the column will be lost.
  - Added the required column `playerId` to the `game_user_storage` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "game_user_storage" DROP CONSTRAINT "game_user_storage_userId_fkey";

-- AlterTable
ALTER TABLE "game_user_storage" DROP COLUMN "userId",
ADD COLUMN     "playerId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "game_user_storage" ADD CONSTRAINT "game_user_storage_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
