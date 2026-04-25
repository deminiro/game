import { Injectable, NotImplementedException } from '@nestjs/common';

@Injectable()
export class UserService {
  getProfile(): never {
    throw new NotImplementedException('UserService.getProfile not implemented');
  }

  updateProfile(): never {
    throw new NotImplementedException('UserService.updateProfile not implemented');
  }
}
