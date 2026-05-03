import { PrismaService } from '@/database/prisma.service';
import { Injectable } from '@nestjs/common';
import {
  Game,
  GameResult,
  GameStatus,
  GameStorageItem,
  GameUserStorage,
  Prisma,
} from '@prisma/client';
import { AuthUserEntity } from '../auth/entities/auth-user.entity';
import { MakeSessionMoveDto } from './dto/make-session-move.dto';
import {
  ActiveGameExistsException,
  AlreadyInGameException,
  GameForbiddenMoveException,
  GameNotFoundException,
  GameNotJoinableException,
} from './exceptions/game.exceptions';
import { GameDice } from './helpers/game-dice.helper';
import { GameStorage } from './helpers/game-storage.helper';
import { GameEventType } from './types/enums/game-event-type.enum';
import { GameGoal } from './types/game-goal.type';

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
  ): Promise<{
    game: Pick<Game, 'activePlayerIdx' | 'deckActionIdx' | 'result' | 'status'>;
    move: { pass: boolean; storage: GameUserStorage };
  }> {
    return await this.prisma.$transaction(async (tx) => {
      const game = await tx.game.findFirst({
        where: {
          id: sessionId,
          players: { some: { id: user.id } },
        },
        include: {
          players: { select: { id: true } },
          storages: { where: { playerId: user.id } },
        },
      });

      if (!game || !game.storages[0]) throw new GameNotFoundException(sessionId);
      if (
        game.status !== GameStatus.IN_PROGRESS ||
        game.players[game.activePlayerIdx].id !== user.id
      ) {
        throw new GameForbiddenMoveException();
      }

      const move = await this.makeMove(tx, game.storages[0], dto);
      const nextGame = await this.validateNextGameStep(tx, game);

      return { game: nextGame, move };
    });
  }

  private async validateNextGameStep(
    tx: Prisma.TransactionClient,
    game: Prisma.GameGetPayload<{ include: { players: { select: { id: true } } } }>,
  ): Promise<Awaited<ReturnType<GameService['makeSessionMove']>>['game']> {
    const playersCount = game.players.length;
    const nextActivePlayerIdx = game.activePlayerIdx + 1;
    let updatedGame: Game | null = null;

    if (nextActivePlayerIdx === playersCount) {
      updatedGame = await this.nextDeckCard(tx, game);
    } else {
      updatedGame = await tx.game.update({
        where: { id: game.id },
        data: {
          activePlayerIdx: nextActivePlayerIdx,
        },
      });
    }

    return {
      activePlayerIdx: updatedGame.activePlayerIdx,
      deckActionIdx: updatedGame.deckActionIdx,
      result: updatedGame.result,
      status: updatedGame.status,
    };
  }

  private async makeMove(
    tx: Prisma.TransactionClient,
    storage: GameUserStorage,
    dto: MakeSessionMoveDto,
  ): Promise<Awaited<ReturnType<GameService['makeSessionMove']>>['move']> {
    switch (dto.type) {
      case GameEventType.FISHING:
        return this.makeFishing(tx, storage);
      case GameEventType.MINING:
        return this.makeMining(tx, storage);
      default:
        return this.failedMove(storage);
    }
  }

  private async makeFishing(
    tx: Prisma.TransactionClient,
    storage: GameUserStorage,
  ): Promise<Awaited<ReturnType<GameService['makeSessionMove']>>['move']> {
    if (new GameDice().isFailed()) return this.failedMove(storage);

    const items = new GameStorage(storage).addNew(GameStorageItem.FISH);

    const newStorage = await tx.gameUserStorage.update({
      where: { id: storage.id },
      data: { items },
    });

    return { pass: true, storage: newStorage };
  }

  private async makeMining(
    tx: Prisma.TransactionClient,
    storage: GameUserStorage,
  ): Promise<Awaited<ReturnType<GameService['makeSessionMove']>>['move']> {
    if (new GameDice().isFailed()) return this.failedMove(storage);

    const items = new GameStorage(storage).addNew(GameStorageItem.MINERAL);

    const newStorage = await tx.gameUserStorage.update({
      where: { id: storage.id },
      data: { items },
    });

    return { pass: true, storage: newStorage };
  }

  private failedMove(
    storage: GameUserStorage,
  ): Awaited<ReturnType<GameService['makeSessionMove']>>['move'] {
    return {
      pass: false,
      storage,
    };
  }

  private async nextDeckCard(
    tx: Prisma.TransactionClient,
    game: Prisma.GameGetPayload<{ include: { players: { select: { id: true } } } }>,
  ): Promise<Game> {
    const deckAction = game.deckActionIdx + 1 < game.deck.length ? 'update-active' : 'finish-game';

    switch (deckAction) {
      case 'update-active':
        return await tx.game.update({
          where: { id: game.id },
          data: {
            deckActionIdx: { increment: 1 },
            activePlayerIdx: 0,
          },
        });
      case 'finish-game':
        return await this.finishGame(tx, game);
    }
  }

  private async finishGame(
    tx: Prisma.TransactionClient,
    game: Prisma.GameGetPayload<{ include: { players: { select: { id: true } } } }>,
  ): Promise<Game> {
    const storages = await tx.gameUserStorage.findMany({
      where: { gameId: game.id },
    });

    const goals = game.goals as unknown as GameGoal[];
    const completed = new Set(game.completedGoalsIdx);

    goals.forEach((goal, idx) => {
      if (completed.has(idx)) return;
      const satisfied = storages.some(
        (storage) => storage.items.filter((item) => item === goal.item).length >= goal.amount,
      );
      if (satisfied) completed.add(idx);
    });

    const completedGoalsIdx = Array.from(completed);
    const result = completedGoalsIdx.length === goals.length ? GameResult.WON : GameResult.LOST;

    return await tx.game.update({
      where: { id: game.id },
      data: { completedGoalsIdx, result },
    });
  }
}
