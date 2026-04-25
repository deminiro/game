import { PrismaService } from '@/database/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { WalletEntity } from './entities/wallet.entity';
import { BalanceOperation } from './types/enums/balance-operations';
import { WalletService } from './wallet.service';

describe('WalletService', () => {
  let service: WalletService;
  let prisma: {
    wallet: {
      findUnique: jest.Mock;
      update: jest.Mock;
    };
  };

  const sample: WalletEntity = {
    id: '111-1111-111',
    balance: 0,
    userId: '123241',
  };

  beforeEach(async () => {
    prisma = {
      wallet: {
        findUnique: jest.fn().mockResolvedValue(sample),
        update: jest.fn().mockImplementation(({ data }) => ({
          ...sample,
          balance: data.balance,
        })),
      },
    };

    const moduleRef = await Test.createTestingModule({
      providers: [WalletService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = moduleRef.get(WalletService);
  });

  it('add 50 to balance', async () => {
    const result = await service.updateBalance(sample.userId, {
      value: 50,
      type: BalanceOperation.ADD,
    });
    expect(result).toBe(sample.balance + 50);
  });

  it('remove 30 from balance', async () => {
    const result = await service.updateBalance(sample.userId, {
      value: 30,
      type: BalanceOperation.REMOVE,
    });
    expect(result).toBe(sample.balance - 30);
  });

  it('getBalanceByUserId', async () => {
    const result = await service.getBalanceByUserId(sample.userId);

    expect(result).toBe(sample.balance);
  });

  it('throws NotFoundException when wallet does not exist', async () => {
    prisma.wallet.findUnique.mockResolvedValue(null);

    await expect(service.getBalanceByUserId(sample.userId)).rejects.toThrow(NotFoundException);
  });
});
