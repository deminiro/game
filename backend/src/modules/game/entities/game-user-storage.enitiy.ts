import { ApiProperty } from '@nestjs/swagger';
import { GameStorageItem, GameUserStorage } from '@prisma/client';

export class GameUserStorageEntity implements GameUserStorage {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  items!: GameStorageItem[];

  playerId!: string;
  gameId!: string;
}
