import { ApiProperty } from '@nestjs/swagger';
import { Game } from '@prisma/client';
import { GameEventType } from '../types/enums/game-event-type.enum';
import { GameStatus } from '../types/enums/game-status.enum';
import { GameStorageItem } from '../types/enums/game-storage-item.enums';

export class GameEntity implements Game {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  deck!: string[];

  @ApiProperty()
  deckActionIdx!: number;

  players?: string[];

  @ApiProperty()
  activePlayerIdx!: number;

  @ApiProperty()
  moveType!: GameEventType;

  @ApiProperty()
  status!: GameStatus;

  @ApiProperty()
  balance!: number;

  @ApiProperty()
  goals!: { amount: number; item: GameStorageItem }[];

  @ApiProperty()
  completedGoalsIdx!: number[];

  storages?: string[];
}
