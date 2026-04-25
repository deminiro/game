import { ApiProperty } from '@nestjs/swagger';
import { Wallet } from '@prisma/client';

export class WalletEntity implements Wallet {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  balance!: number;

  userId!: string;
}
