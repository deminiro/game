import { ApiProperty } from '@nestjs/swagger';
import { GameUserStorage } from '@prisma/client';
import { GameStorageItem } from '../types/enums/game-storage-item.enums';

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
