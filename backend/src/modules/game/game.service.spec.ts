import { PrismaService } from '@/database/prisma.service';
import { ConflictException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthUserEntity } from '../auth/entities/auth-user.entity';
import { GameUserStorageEntity } from './entities/game-user-storage.enitiy';
import { GameEntity } from './entities/game.entity';
import { GameService } from './game.service';
import { GameEventType } from './types/enums/game-event-type.enum';
import { GameStatus } from './types/enums/game-status.enum';
import { GameStorageItem } from './types/enums/game-storage-item.enums';

describe('GameService', () => {
  let service: GameService;
  let prisma: {
    user: { findUnique: jest.Mock };
    storage: { findUnique: jest.Mock; update: jest.Mock };
    game: {
      findFirst: jest.Mock;
      findUnique: jest.Mock;
      findMany: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  const sample: GameEntity = {
    id: '111-1111-111',
    deck: ['1', '2', '3', '4', '5', '6'],
    deckActionIdx: 0,
    players: ['123241', '23213', '324214'],
    activePlayerIdx: 0,
    moveType: GameEventType.NONE,
    status: GameStatus.PREPARING,
    balance: 0,
    goals: [
      { amount: 5, item: GameStorageItem.FISH },
      { amount: 5, item: GameStorageItem.MINERAL },
    ],
    completedGoalsIdx: [],
    storages: [],
  };

  const storageSamples: GameUserStorageEntity[] = [
    {
      id: '231',
      limit: 6,
      items: [],

      playerId: sample.players![0],
      gameId: sample.id,
    },
  ];

  const user: AuthUserEntity = {
    id: 'dwqcdwq',
    displayName: 'qazwsxedc',
    email: 'qswcqdqw@gmail.com',
  };

  let currentGame: GameEntity;

  beforeEach(async () => {
    currentGame = { ...sample, completedGoalsIdx: [...sample.completedGoalsIdx] };

    prisma = {
      user: { findUnique: jest.fn() },
      storage: {
        findUnique: jest.fn().mockResolvedValue({ ...storageSamples[0], items: [] }),
        update: jest.fn().mockImplementation(({ data }) => ({
          ...storageSamples[0],
          items: data.items ?? storageSamples[0].items,
        })),
      },
      game: {
        findFirst: jest.fn().mockImplementation(() => currentGame),
        findUnique: jest.fn().mockImplementation(() => currentGame),
        findMany: jest.fn().mockResolvedValue([sample]),
        create: jest.fn().mockResolvedValue({ ...sample }),
        update: jest.fn().mockImplementation(({ data }) => {
          currentGame = { ...currentGame, ...data };
          return currentGame;
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

    const result = await service.startGame(user, sample.id);

    expect(result.status).toBe(GameStatus.IN_PROGRESS);
  });

  it("Starting a new game, when previous hasn't finished", async () => {
    currentGame = { ...currentGame, status: GameStatus.IN_PROGRESS };

    await expect(service.createSession(user)).rejects.toThrow(ConflictException);
  });

  it('List joinable sessions', async () => {
    const preparing = { ...sample, id: 'a', status: GameStatus.PREPARING };
    prisma.game.findMany.mockResolvedValueOnce([preparing]);

    const result = await service.getSessions();

    expect(prisma.game.findMany).toHaveBeenCalledWith({
      where: { status: GameStatus.PREPARING },
    });
    expect(result).toEqual([preparing]);
  });

  it('Get active session', async () => {
    currentGame = { ...currentGame, status: GameStatus.IN_PROGRESS };

    const result = await service.getSession();

    expect(result.status).toBe(GameStatus.IN_PROGRESS);
  });

  it(`Make move ${GameEventType.FISHING} success`, async () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.99);

    const result = await service.makeSessionMove(sample.id, user, { type: GameEventType.FISHING });

    expect(result.pass).toBe(true);
    expect(result.storage).toBeInstanceOf(GameUserStorageEntity);
    expect(result.storage.items).toContain(GameStorageItem.FISH);
  });

  it(`Make move ${GameEventType.FISHING} fail`, async () => {
    jest.spyOn(Math, 'random').mockReturnValue(0);

    const result = await service.makeSessionMove(sample.id, user, { type: GameEventType.FISHING });

    expect(result.pass).toBe(false);
    expect(result.storage).toBeInstanceOf(GameUserStorageEntity);
    expect(result.storage.items).not.toContain(GameStorageItem.FISH);
  });

  it(`Make move ${GameEventType.MINING} success`, async () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.99);

    const result = await service.makeSessionMove(sample.id, user, { type: GameEventType.MINING });

    expect(result.pass).toBe(true);
    expect(result.storage).toBeInstanceOf(GameUserStorageEntity);
    expect(result.storage.items).toContain(GameStorageItem.MINERAL);
  });

  it(`Make move ${GameEventType.MINING} fail`, async () => {
    jest.spyOn(Math, 'random').mockReturnValue(0);

    const result = await service.makeSessionMove(sample.id, user, { type: GameEventType.MINING });

    expect(result.pass).toBe(false);
    expect(result.storage).toBeInstanceOf(GameUserStorageEntity);
    expect(result.storage.items).not.toContain(GameStorageItem.MINERAL);
  });

  it('Complete goal fishing', async () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.99);

    const goalFish = sample.goals.find((el) => el.item === GameStorageItem.FISH);
    const goalIdx = sample.goals.findIndex((el) => el.item === GameStorageItem.FISH);

    let result: Awaited<ReturnType<(typeof service)['makeSessionMove']>> = {
      pass: false,
      storage: storageSamples[0],
    };

    while (
      result.storage.items.filter((el) => el === GameStorageItem.FISH).length <
      (goalFish?.amount ?? 0)
    ) {
      result = await service.makeSessionMove(sample.id, user, { type: GameEventType.FISHING });
    }

    const game = await prisma.game.findUnique({ where: { id: sample.id } });

    expect(game.completedGoalsIdx).toContain(goalIdx);
    expect(game.completedGoalsIdx.length).toBe(1);
  });
});
