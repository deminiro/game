import { PrismaService } from '@/database/prisma.service';
import { Injectable, NotImplementedException } from '@nestjs/common';
import { Game, GameUserStorage } from '@prisma/client';
import { AuthUserEntity } from '../auth/entities/auth-user.entity';
import { MakeSessionMoveDto } from './dto/make-session-move.dto';
import {
  ActiveGameExistsException,
  AlreadyInGameException,
  GameForbiddenMoveException,
  GameNotFoundException,
  GameNotJoinableException,
} from './exceptions/game.exceptions';
import { GameEventType } from './types/enums/game-event-type.enum';
import { GameStatus } from './types/enums/game-status.enum';
import { GameStorageItem } from './types/enums/game-storage-item.enums';

@Injectable()
export class GameService {
  constructor(private readonly prisma: PrismaService) {}

  async getSessions(): Promise<Game[]> {
    return await this.prisma.game.findMany({ where: { status: GameStatus.PREPARING } });
  }

  async getSession(user: AuthUserEntity, sessionId: string): Promise<Game> {
    const existing = await this.prisma.game.findFirst({
      where: {
        id: sessionId,
        players: { some: { id: user.id } },
      },
    });

    if (!existing) throw new GameNotFoundException(sessionId);

    return existing;
  }

  async createSession(user: AuthUserEntity): Promise<Game> {
    return await this.prisma.$transaction(async (tx) => {
      const existing = await tx.game.findFirst({
        where: {
          status: { not: GameStatus.FINISHED },
          players: { some: { id: user.id } },
        },
      });

      if (existing) throw new ActiveGameExistsException();

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

  async startGame(user: AuthUserEntity, sessionId: string): Promise<Game> {
    return await this.prisma.$transaction(async (tx) => {
      const existing = await tx.game.findFirst({
        where: {
          id: sessionId,
          players: { some: { id: user.id } },
        },
      });

      if (!existing) throw new GameNotFoundException(sessionId);
      if (existing.status !== GameStatus.PREPARING) throw new GameNotJoinableException();

      return tx.game.update({
        where: { id: sessionId },
        data: { status: GameStatus.IN_PROGRESS },
      });
    });
  }

  async joinGame(user: AuthUserEntity, sessionId: string): Promise<Game> {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.game.findUnique({
        where: { id: sessionId },
        include: { players: { select: { id: true } } },
      });

      if (!existing) throw new GameNotFoundException(sessionId);
      if (existing.status !== GameStatus.PREPARING) throw new GameNotJoinableException();
      if (existing.players.some((p) => p.id === user.id)) throw new AlreadyInGameException();

      return tx.game.update({
        where: { id: sessionId },
        data: { players: { connect: { id: user.id } } },
      });
    });
  }

  async makeSessionMove(
    sessionId: string,
    user: AuthUserEntity,
    dto: MakeSessionMoveDto,
  ): Promise<{ pass: boolean; storage: GameUserStorage }> {
    return await this.prisma.$transaction(async (tx) => {
      const existing = await tx.game.findFirst({
        where: {
          id: sessionId,
          players: { some: { id: user.id } },
        },
        include: {
          storages: { where: { id: user.id } },
        },
      });

      if (!existing || !existing.storages[0]) throw new GameNotFoundException(sessionId);
      if (existing.status !== GameStatus.IN_PROGRESS) throw new GameForbiddenMoveException();

      const [storage] = existing.storages;

      switch (dto.type) {
        case GameEventType.FISHING:
          return this.makeFishing(storage);
        case GameEventType.MINING:
          return this.makeMining(storage);
        default:
          return this.failedMove(storage);
      }
    });
  }

  makeFishing(storage: GameUserStorage): ReturnType<GameService['makeSessionMove']> {
    throw new NotImplementedException('GameService.makeSessionMove not implemented');
  }

  makeMining(storage: GameUserStorage): ReturnType<GameService['makeSessionMove']> {
    throw new NotImplementedException('GameService.makeSessionMove not implemented');
  }

  failedMove(storage: GameUserStorage): Awaited<ReturnType<GameService['makeSessionMove']>> {
    return {
      pass: false,
      storage,
    };
  }
}
