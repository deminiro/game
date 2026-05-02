import { PrismaService } from '@/database/prisma.service';
import { ConflictException, Injectable, NotImplementedException } from '@nestjs/common';
import { Game } from '@prisma/client';
import { AuthUserEntity } from '../auth/entities/auth-user.entity';
import { MakeSessionMoveDto } from './dto/make-session-move.dto';
import { GameUserStorageEntity } from './entities/game-user-storage.enitiy';
import { GameEntity } from './entities/game.entity';
import { GameEventType } from './types/enums/game-event-type.enum';
import { GameStatus } from './types/enums/game-status.enum';
import { GameStorageItem } from './types/enums/game-storage-item.enums';

@Injectable()
export class GameService {
  constructor(private readonly prisma: PrismaService) {}

  async createSession(user: AuthUserEntity): Promise<Game> {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.game.findFirst({
        where: {
          status: { not: GameStatus.FINISHED },
          players: { some: { id: user.id } },
        },
      });

      if (existing) throw new ConflictException('Game already exist');

      const game = await tx.game.create({
        data: {
          deck: ['NOTHING', 'NOTHING', 'NOTHING', 'NOTHING', 'NOTHING', 'NOTHING'],
          deckActionIdx: 0,
          players: { connect: [{ id: user.id }] },
          activePlayerIdx: 0,
          moveType: GameEventType.NONE,
          status: GameStatus.PREPARING,
          balance: 0,
          goals: [{ amount: 5, item: GameStorageItem.FISH }],
          completedGoalsIdx: [],
        },
      });

      return game;
    });
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
