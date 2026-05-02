import { Injectable, NotImplementedException } from '@nestjs/common';
import { AuthUserEntity } from '../auth/entities/auth-user.entity';
import { MakeSessionMoveDto } from './dto/make-session-move.dto';
import { GameUserStorageEntity } from './entities/game-user-storage.enitiy';
import { GameEntity } from './entities/game.entity';

@Injectable()
export class GameService {
  createSession(): GameEntity {
    throw new NotImplementedException('GameService.createSession not implemented');
  }

  startGame(sessionId: string): GameEntity {
    throw new NotImplementedException('GameService.createSession not implemented');
  }

  getSession(): GameEntity {
    throw new NotImplementedException('GameService.getSession not implemented');
  }

  makeSessionMove(
    sessionId: string,
    currentUser: AuthUserEntity,
    dto: MakeSessionMoveDto,
  ): { pass: boolean; storage: GameUserStorageEntity } {
    throw new NotImplementedException('GameService.makeSessionMove not implemented');
  }

  makeFishing(): ReturnType<GameService['makeSessionMove']> {
    throw new NotImplementedException('GameService.makeSessionMove not implemented');
  }

  makeMining(): ReturnType<GameService['makeSessionMove']> {
    throw new NotImplementedException('GameService.makeSessionMove not implemented');
  }
}
