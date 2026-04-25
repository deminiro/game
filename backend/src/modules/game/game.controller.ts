import { Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GameService } from '@/modules/game/game.service';

@ApiTags('game')
@Controller({ path: 'game', version: '1' })
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post('sessions')
  createSession() {
    return this.gameService.createSession();
  }

  @Get('sessions/current')
  getCurrentSession() {
    return this.gameService.getSession();
  }
}
