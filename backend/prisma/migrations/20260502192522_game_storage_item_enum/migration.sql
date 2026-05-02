/*
  Warnings:

  - The `items` column on the `game_user_storage` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `moveType` on the `game` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "game_move_type" AS ENUM ('NONE', 'MOVE', 'FISHING', 'MINING');

-- CreateEnum
CREATE TYPE "game_storage_item" AS ENUM ('FISH', 'MINERAL');

-- AlterTable
ALTER TABLE "game" DROP COLUMN "moveType",
ADD COLUMN     "moveType" "game_move_type" NOT NULL;

-- AlterTable
ALTER TABLE "game_user_storage" DROP COLUMN "items",
ADD COLUMN     "items" "game_storage_item"[];

-- DropEnum
DROP TYPE "GameMoveType";
