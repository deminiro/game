import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, Max, Min } from 'class-validator';
import { BalanceOperation } from '../types/enums/balance-operations';

export class UpdateWalletBalanceDto {
  @ApiProperty({ minimum: 1, maximum: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  value!: number;

  @ApiProperty({ enum: BalanceOperation })
  @IsEnum(BalanceOperation)
  type!: BalanceOperation;
}
