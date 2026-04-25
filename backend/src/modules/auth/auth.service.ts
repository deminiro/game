import { Injectable, NotImplementedException } from '@nestjs/common';

@Injectable()
export class AuthService {
  register(): never {
    throw new NotImplementedException('AuthService.register not implemented');
  }

  login(): never {
    throw new NotImplementedException('AuthService.login not implemented');
  }

  refresh(): never {
    throw new NotImplementedException('AuthService.refresh not implemented');
  }

  logout(): never {
    throw new NotImplementedException('AuthService.logout not implemented');
  }
}
