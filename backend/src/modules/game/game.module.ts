import { Module } from '@nestjs/common';
import { GameController } from '@/modules/game/game.controller';
import { GameService } from '@/modules/game/game.service';

@Module({
  controllers: [GameController],
  providers: [GameService],
  exports: [GameService],
})
export class GameModule {}
