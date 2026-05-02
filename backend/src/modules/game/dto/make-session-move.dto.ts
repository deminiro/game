import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { GameEventType } from '../types/enums/game-event-type.enum';

export class MakeSessionMoveDto {
  @ApiProperty({ enum: GameEventType })
  @IsEnum(GameEventType)
  type!: GameEventType;
}
