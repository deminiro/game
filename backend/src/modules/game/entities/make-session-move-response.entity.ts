import { ApiProperty } from '@nestjs/swagger';
import { GameResult, GameStatus } from '@prisma/client';
import { GameUserStorageEntity } from './game-user-storage.enitiy';

class MakeSessionMoveGameEntity {
  @ApiProperty()
  activePlayerIdx!: number;

  @ApiProperty()
  deckActionIdx!: number;

  @ApiProperty()
  result!: GameResult;

  @ApiProperty()
  status!: GameStatus;
}

class MakeSessionMoveMoveEntity {
  @ApiProperty()
  pass!: boolean;

  @ApiProperty({ type: GameUserStorageEntity })
  storage!: GameUserStorageEntity;
}

export class MakeSessionMoveResponseEntity {
  @ApiProperty({ type: MakeSessionMoveGameEntity })
  game!: MakeSessionMoveGameEntity;

  @ApiProperty({ type: MakeSessionMoveMoveEntity })
  move!: MakeSessionMoveMoveEntity;
}
