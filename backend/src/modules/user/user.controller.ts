import { Controller, Get, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserService } from '@/modules/user/user.service';

@ApiTags('users')
@Controller({ path: 'users', version: '1' })
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  getMe() {
    return this.userService.getProfile();
  }

  @Patch('me')
  updateMe() {
    return this.userService.updateProfile();
  }
}
