import { PrismaService } from '@/database/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { WalletEntity } from './entities/wallet.entity';
import { BalanceOperation } from './types/enums/balance-operations';

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  async updateBalance(
    userId: string,
    {
      value,
      type,
    }: {
      value: number;
      type: BalanceOperation;
    },
  ): Promise<number> {
    const data =
      type === BalanceOperation.ADD
        ? { balance: { increment: value } }
        : { balance: { decrement: value } };

    try {
      const result = await this.prisma.wallet.update({
        where: { userId },
        data,
      });

      return result.balance;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
        throw new NotFoundException(`Wallet with userId ${userId} is not exist`);
      }
      throw e;
    }
  }

  async getBalanceByUserId(userId: string): Promise<number> {
    const wallet = await this.ensureExistsByUserId(userId);

    return wallet.balance;
  }

  private async ensureExistsByUserId(userId: string): Promise<WalletEntity> {
    const exists = await this.prisma.wallet.findUnique({
      where: { userId },
    });
    if (!exists) {
      throw new NotFoundException(`Wallet with userId ${userId} is not exist`);
    }

    return exists;
  }
}
