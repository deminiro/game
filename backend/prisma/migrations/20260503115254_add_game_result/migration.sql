-- CreateEnum
CREATE TYPE "game_result" AS ENUM ('NONE', 'WON', 'LOST');

-- AlterTable
ALTER TABLE "game" ADD COLUMN     "result" "game_result" NOT NULL DEFAULT 'NONE',
ALTER COLUMN "status" SET DEFAULT 'PREPARING';
