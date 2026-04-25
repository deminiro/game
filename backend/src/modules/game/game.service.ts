import { Injectable, NotImplementedException } from '@nestjs/common';

@Injectable()
export class GameService {
  createSession(): never {
    throw new NotImplementedException('GameService.createSession not implemented');
  }

  getSession(): never {
    throw new NotImplementedException('GameService.getSession not implemented');
  }
}
