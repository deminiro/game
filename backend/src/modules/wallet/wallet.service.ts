import { PrismaService } from '@/database/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { balanceOperations } from './constants/balance-operations';
import { WalletEntity } from './entities/wallet.entity';
import { BalanceOperation } from './types/enums/balance-operations';

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  async updateBalance({
    userId,
    value,
    type,
  }: {
    userId: string;
    value: number;
    type: BalanceOperation;
  }): Promise<number> {
    const wallet = await this.ensureExistsByUserId(userId);

    const result = await this.prisma.wallet.update({
      where: { userId },
      data: {
        ...wallet,
        balance: balanceOperations[type](wallet.balance, value),
      },
    });

    return result.balance;
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
