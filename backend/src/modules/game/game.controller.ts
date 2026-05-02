import { GameService } from '@/modules/game/game.service';
import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUserEntity } from '../auth/entities/auth-user.entity';
import { MakeSessionMoveDto } from './dto/make-session-move.dto';

@ApiTags('game')
@Controller({ path: 'game', version: '1' })
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post('sessions')
  createSession(@CurrentUser() user: AuthUserEntity) {
    return this.gameService.createSession(user);
  }

  @Put('sessions/:id/join')
  joinSession(@Param() id: string, @CurrentUser() user: AuthUserEntity) {
    return this.gameService.joinGame(user, id);
  }

  @Put('sessions/:id/start')
  startSession(@Param() id: string, @CurrentUser() user: AuthUserEntity) {
    return this.gameService.startGame(user, id);
  }

  @Post('sessions/:id/move')
  makeSessionMove(
    @Param() id: string,
    @CurrentUser() user: AuthUserEntity,
    @Body() dto: MakeSessionMoveDto,
  ) {
    return this.gameService.makeSessionMove(id, user, dto);
  }

  @Get('sessions/current')
  getCurrentSession() {
    return this.gameService.getSession();
  }

  @Get('sessions')
  getSessions() {
    return this.gameService.getSessions();
  }
}
