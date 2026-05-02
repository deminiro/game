import { HttpException, HttpStatus } from '@nestjs/common';

export abstract class GameException extends HttpException {}

export class GameNotFoundException extends GameException {
  constructor(sessionId: string) {
    super(`Game with id ${sessionId} not found`, HttpStatus.NOT_FOUND);
  }
}

export class GameNotJoinableException extends GameException {
  constructor() {
    super('Game has already started or finished', HttpStatus.CONFLICT);
  }
}

export class ActiveGameExistsException extends GameException {
  constructor() {
    super('Game already exist', HttpStatus.CONFLICT);
  }
}

export class AlreadyInGameException extends GameException {
  constructor() {
    super('User already joined this game', HttpStatus.CONFLICT);
  }
}
