import { GameService } from '@/modules/game/game.service';
import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUserEntity } from '../auth/entities/auth-user.entity';
import { MakeSessionMoveDto } from './dto/make-session-move.dto';
import { GameEntity } from './entities/game.entity';
import { MakeSessionMoveResponseEntity } from './entities/make-session-move-response.entity';

@ApiTags('game')
@Controller({ path: 'game', version: '1' })
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post('sessions')
  @ApiOkResponse({ type: GameEntity })
  createSession(@CurrentUser() user: AuthUserEntity) {
    return this.gameService.createSession(user);
  }

  @Put('sessions/:id/join')
  @ApiOkResponse({ type: GameEntity })
  joinSession(@Param('id') id: string, @CurrentUser() user: AuthUserEntity) {
    return this.gameService.joinGame(user, id);
  }

  @Put('sessions/:id/start')
  @ApiOkResponse({ type: GameEntity })
  startSession(@Param('id') id: string, @CurrentUser() user: AuthUserEntity) {
    return this.gameService.startGame(user, id);
  }

  @Post('sessions/:id/move')
  @ApiOkResponse({ type: MakeSessionMoveResponseEntity })
  makeSessionMove(
    @Param('id') id: string,
    @CurrentUser() user: AuthUserEntity,
    @Body() dto: MakeSessionMoveDto,
  ) {
    return this.gameService.makeSessionMove(id, user, dto);
  }

  @Get('sessions/:id')
  @ApiOkResponse({ type: GameEntity })
  getCurrentSession(@Param('id') id: string, @CurrentUser() user: AuthUserEntity) {
    return this.gameService.getSession(user, id);
  }

  @Get('sessions')
  @ApiOkResponse({ type: GameEntity, isArray: true })
  getSessions() {
    return this.gameService.getSessions();
  }

  @Delete('sessions/:id')
  @ApiOkResponse({ type: Boolean })
  deleteSession(@Param('id') id: string, @CurrentUser() user: AuthUserEntity) {
    return this.gameService.deleteSession(user, id);
  }
}
