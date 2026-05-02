import { PrismaService } from '@/database/prisma.service';
import {
  ConflictException,
  Injectable,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import { Game } from '@prisma/client';
import { AuthUserEntity } from '../auth/entities/auth-user.entity';
import { MakeSessionMoveDto } from './dto/make-session-move.dto';
import { GameUserStorageEntity } from './entities/game-user-storage.enitiy';
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

    if (!existing) throw new NotFoundException(`Game with id ${sessionId} not found`);

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

  async startGame(user: AuthUserEntity, sessionId: string): Promise<Game> {
    return await this.prisma.$transaction(async (tx) => {
      const existing = await tx.game.findFirst({
        where: {
          id: sessionId,
          players: { some: { id: user.id } },
        },
      });

      if (!existing) throw new NotFoundException(`Game with id ${sessionId} not found`);
      if (existing.status !== GameStatus.PREPARING) {
        throw new ConflictException('Game has already started or finished');
      }

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

      if (!existing) throw new NotFoundException(`Game with id ${sessionId} not found`);
      if (existing.status !== GameStatus.PREPARING) {
        throw new ConflictException('Game has already started or finished');
      }
      if (existing.players.some((p) => p.id === user.id)) {
        throw new ConflictException('User already joined this game');
      }

      return tx.game.update({
        where: { id: sessionId },
        data: { players: { connect: { id: user.id } } },
      });
    });
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
