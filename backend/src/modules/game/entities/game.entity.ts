import { ApiProperty } from '@nestjs/swagger';
import { Game, GameResult } from '@prisma/client';
import { GameEventType } from '../types/enums/game-event-type.enum';
import { GameStatus } from '../types/enums/game-status.enum';
import { GameGoal } from '../types/game-goal.type';

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
  result!: GameResult;

  @ApiProperty()
  balance!: number;

  @ApiProperty()
  goals!: GameGoal[];

  @ApiProperty()
  completedGoalsIdx!: number[];

  storages?: string[];
}
