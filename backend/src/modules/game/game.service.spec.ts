import { PrismaService } from '@/database/prisma.service';
import { Test } from '@nestjs/testing';
import { GameResult, GameStorageItem } from '@prisma/client';
import { AuthUserEntity } from '../auth/entities/auth-user.entity';
import { GameUserStorageEntity } from './entities/game-user-storage.enitiy';
import { ActiveGameExistsException } from './exceptions/game.exceptions';
import { GameService } from './game.service';
import { GameEventType } from './types/enums/game-event-type.enum';
import { GameStatus } from './types/enums/game-status.enum';

describe('GameService', () => {
  let service: GameService;
  let prisma: {
    game: {
      findFirst: jest.Mock;
      findUnique: jest.Mock;
      findMany: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    gameUserStorage: {
      findMany: jest.Mock;
      createMany: jest.Mock;
      deleteMany: jest.Mock;
      update: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  const user: AuthUserEntity = {
    id: 'user-1',
    displayName: 'Test User',
    email: 'test@example.com',
  };

  const baseGame = {
    id: 'game-1',
    deck: ['NOTHING', 'NOTHING', 'NOTHING', 'NOTHING', 'NOTHING', 'NOTHING'],
    deckActionIdx: 0,
    activePlayerIdx: 0,
    moveType: GameEventType.NONE,
    status: GameStatus.PREPARING,
    result: GameResult.NONE,
    balance: 0,
    goals: [
      { amount: 5, item: GameStorageItem.FISH },
      { amount: 5, item: GameStorageItem.MINERAL },
    ],
    completedGoalsIdx: [] as number[],
    players: [{ id: user.id }],
  };

  const baseStorage: GameUserStorageEntity = {
    id: 'storage-1',
    limit: 6,
    items: [],
    playerId: user.id,
    gameId: baseGame.id,
  };

  let currentGame: typeof baseGame;
  let currentStorage: GameUserStorageEntity;

  const applyUpdate = <T extends Record<string, unknown>>(target: T, data: Record<string, unknown>): T => {
    const next: Record<string, unknown> = { ...target };
    for (const [key, value] of Object.entries(data)) {
      if (value && typeof value === 'object' && 'increment' in value) {
        next[key] = ((target[key] as number) ?? 0) + (value as { increment: number }).increment;
      } else {
        next[key] = value;
      }
    }
    return next as T;
  };

  beforeEach(async () => {
    currentGame = { ...baseGame, completedGoalsIdx: [] };
    currentStorage = { ...baseStorage, items: [] };

    prisma = {
      game: {
        findFirst: jest.fn().mockImplementation(({ include } = {}) => ({
          ...currentGame,
          ...(include?.players ? { players: currentGame.players } : {}),
          ...(include?.storages ? { storages: [currentStorage] } : {}),
        })),
        findUnique: jest.fn().mockImplementation(() => ({ ...currentGame })),
        findMany: jest.fn().mockResolvedValue([baseGame]),
        create: jest.fn().mockImplementation(() => ({ ...currentGame })),
        update: jest.fn().mockImplementation(({ data }) => {
          currentGame = applyUpdate(currentGame, data);
          return currentGame;
        }),
        delete: jest.fn().mockImplementation(() => ({ ...currentGame })),
      },
      gameUserStorage: {
        findMany: jest.fn().mockImplementation(() => [currentStorage]),
        createMany: jest.fn().mockResolvedValue({ count: 1 }),
        deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
        update: jest.fn().mockImplementation(({ data }) => {
          currentStorage = { ...currentStorage, items: data.items ?? currentStorage.items };
          return currentStorage;
        }),
      },
      $transaction: jest.fn().mockImplementation((cb) => cb(prisma)),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [GameService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = moduleRef.get(GameService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Generating a new game', async () => {
    prisma.game.findFirst.mockResolvedValueOnce(null);

    const result = await service.createSession(user);

    expect(result.status).toBe(GameStatus.PREPARING);
  });

  it('Starting a new game', async () => {
    currentGame = { ...currentGame, status: GameStatus.PREPARING };

    const result = await service.startGame(user, currentGame.id);

    expect(result.status).toBe(GameStatus.IN_PROGRESS);
    expect(prisma.gameUserStorage.createMany).toHaveBeenCalledWith({
      data: [{ playerId: user.id, gameId: currentGame.id, limit: 6, items: [] }],
    });
  });

  it("Starting a new game, when previous hasn't finished", async () => {
    currentGame = { ...currentGame, status: GameStatus.IN_PROGRESS };

    await expect(service.createSession(user)).rejects.toThrow(ActiveGameExistsException);
  });

  it('List joinable sessions', async () => {
    const preparing = { ...baseGame, id: 'a', status: GameStatus.PREPARING };
    prisma.game.findMany.mockResolvedValueOnce([preparing]);

    const result = await service.getSessions();

    expect(prisma.game.findMany).toHaveBeenCalledWith({
      where: { status: GameStatus.PREPARING },
    });
    expect(result).toEqual([preparing]);
  });

  it('Get active session', async () => {
    currentGame = { ...currentGame, status: GameStatus.IN_PROGRESS };

    const result = await service.getSession(user, currentGame.id);

    expect(result.status).toBe(GameStatus.IN_PROGRESS);
  });

  it('Delete active session removes storages then game', async () => {
    const result = await service.deleteSession(user, currentGame.id);

    expect(result).toBe(true);
    expect(prisma.gameUserStorage.deleteMany).toHaveBeenCalledWith({
      where: { gameId: currentGame.id },
    });
    expect(prisma.game.delete).toHaveBeenCalledWith({ where: { id: currentGame.id } });
  });

  describe('makeSessionMove', () => {
    beforeEach(() => {
      currentGame = { ...currentGame, status: GameStatus.IN_PROGRESS };
    });

    it(`${GameEventType.FISHING} success`, async () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.99);

      const result = await service.makeSessionMove(currentGame.id, user, {
        type: GameEventType.FISHING,
      });

      expect(result.move.pass).toBe(true);
      expect(result.move.storage.items).toContain(GameStorageItem.FISH);
    });

    it(`${GameEventType.FISHING} fail`, async () => {
      jest.spyOn(Math, 'random').mockReturnValue(0);

      const result = await service.makeSessionMove(currentGame.id, user, {
        type: GameEventType.FISHING,
      });

      expect(result.move.pass).toBe(false);
      expect(result.move.storage.items).not.toContain(GameStorageItem.FISH);
    });

    it(`${GameEventType.MINING} success`, async () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.99);

      const result = await service.makeSessionMove(currentGame.id, user, {
        type: GameEventType.MINING,
      });

      expect(result.move.pass).toBe(true);
      expect(result.move.storage.items).toContain(GameStorageItem.MINERAL);
    });

    it(`${GameEventType.MINING} fail`, async () => {
      jest.spyOn(Math, 'random').mockReturnValue(0);

      const result = await service.makeSessionMove(currentGame.id, user, {
        type: GameEventType.MINING,
      });

      expect(result.move.pass).toBe(false);
      expect(result.move.storage.items).not.toContain(GameStorageItem.MINERAL);
    });
  });

  it('Completes the FISH goal at game end', async () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.99);
    currentGame = { ...currentGame, status: GameStatus.IN_PROGRESS };

    const goalIdx = baseGame.goals.findIndex((g) => g.item === GameStorageItem.FISH);

    let result = await service.makeSessionMove(currentGame.id, user, {
      type: GameEventType.FISHING,
    });
    while (result.game.status !== GameStatus.FINISHED) {
      result = await service.makeSessionMove(currentGame.id, user, {
        type: GameEventType.FISHING,
      });
    }

    expect(result.game.result).toBe(GameResult.LOST);
    expect(currentGame.completedGoalsIdx).toEqual([goalIdx]);
  });

  describe('makeFishing', () => {
    const buildStorage = (overrides: Partial<GameUserStorageEntity> = {}): GameUserStorageEntity => ({
      id: 's1',
      limit: 6,
      items: [],
      playerId: user.id,
      gameId: baseGame.id,
      ...overrides,
    });

    let tx: { gameUserStorage: { update: jest.Mock } };

    beforeEach(() => {
      tx = {
        gameUserStorage: {
          update: jest.fn().mockImplementation(({ where, data }) => ({
            id: where.id,
            limit: 6,
            items: data.items,
            playerId: user.id,
            gameId: baseGame.id,
          })),
        },
      };
    });

    it('appends FISH and persists when dice succeeds', async () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.99);
      const storage = buildStorage({ items: [] });

      const result = await service.makeFishing(tx, storage);

      expect(result.pass).toBe(true);
      expect(result.storage.items).toEqual([GameStorageItem.FISH]);
      expect(tx.gameUserStorage.update).toHaveBeenCalledWith({
        where: { id: storage.id },
        data: { items: [GameStorageItem.FISH] },
      });
    });

    it('returns failedMove without writing when dice fails', async () => {
      jest.spyOn(Math, 'random').mockReturnValue(0);
      const storage = buildStorage({ items: [GameStorageItem.MINERAL] });

      const result = await service.makeFishing(tx, storage);

      expect(result.pass).toBe(false);
      expect(result.storage).toBe(storage);
      expect(tx.gameUserStorage.update).not.toHaveBeenCalled();
    });

    it('drops the oldest item when storage is at the limit', async () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.99);
      const storage = buildStorage({
        limit: 3,
        items: [GameStorageItem.MINERAL, GameStorageItem.FISH, GameStorageItem.MINERAL],
      });

      const result = await service.makeFishing(tx, storage);

      expect(result.pass).toBe(true);
      expect(result.storage.items).toEqual([
        GameStorageItem.FISH,
        GameStorageItem.MINERAL,
        GameStorageItem.FISH,
      ]);
      expect(result.storage.items).toHaveLength(3);
    });

    it('does not mutate the input storage.items array', async () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.99);
      const original = [GameStorageItem.MINERAL];
      const storage = buildStorage({ items: original });

      await service.makeFishing(tx, storage);

      expect(original).toEqual([GameStorageItem.MINERAL]);
    });
  });

  describe('makeMining', () => {
    const buildStorage = (overrides: Partial<GameUserStorageEntity> = {}): GameUserStorageEntity => ({
      id: 's1',
      limit: 6,
      items: [],
      playerId: user.id,
      gameId: baseGame.id,
      ...overrides,
    });

    let tx: { gameUserStorage: { update: jest.Mock } };

    beforeEach(() => {
      tx = {
        gameUserStorage: {
          update: jest.fn().mockImplementation(({ where, data }) => ({
            id: where.id,
            limit: 6,
            items: data.items,
            playerId: user.id,
            gameId: baseGame.id,
          })),
        },
      };
    });

    it('appends MINERAL and persists when dice succeeds', async () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.99);
      const storage = buildStorage({ items: [] });

      const result = await service.makeMining(tx, storage);

      expect(result.pass).toBe(true);
      expect(result.storage.items).toEqual([GameStorageItem.MINERAL]);
      expect(tx.gameUserStorage.update).toHaveBeenCalledWith({
        where: { id: storage.id },
        data: { items: [GameStorageItem.MINERAL] },
      });
    });

    it('returns failedMove without writing when dice fails', async () => {
      jest.spyOn(Math, 'random').mockReturnValue(0);
      const storage = buildStorage({ items: [GameStorageItem.FISH] });

      const result = await service.makeMining(tx, storage);

      expect(result.pass).toBe(false);
      expect(result.storage).toBe(storage);
      expect(tx.gameUserStorage.update).not.toHaveBeenCalled();
    });

    it('drops the oldest item when storage is at the limit', async () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.99);
      const storage = buildStorage({
        limit: 3,
        items: [GameStorageItem.FISH, GameStorageItem.MINERAL, GameStorageItem.FISH],
      });

      const result = await service.makeMining(tx, storage);

      expect(result.pass).toBe(true);
      expect(result.storage.items).toEqual([
        GameStorageItem.MINERAL,
        GameStorageItem.FISH,
        GameStorageItem.MINERAL,
      ]);
      expect(result.storage.items).toHaveLength(3);
    });

    it('does not mutate the input storage.items array', async () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.99);
      const original = [GameStorageItem.FISH];
      const storage = buildStorage({ items: original });

      await service.makeMining(tx, storage);

      expect(original).toEqual([GameStorageItem.FISH]);
    });
  });
});
