import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from '@/modules/auth/auth.service';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { LoginDto } from '@/modules/auth/dto/login.dto';
import { RegisterDto } from '@/modules/auth/dto/register.dto';
import { AuthUserEntity } from '@/modules/auth/entities/auth-user.entity';
import { AuthenticatedGuard } from '@/modules/auth/guards/authenticated.guard';
import { LocalAuthGuard } from '@/modules/auth/guards/local-auth.guard';

@ApiTags('auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOkResponse({ type: AuthUserEntity })
  async register(
    @Body() dto: RegisterDto,
    @Req() req: Request,
  ): Promise<AuthUserEntity> {
    const user = await this.authService.register(dto);
    await new Promise<void>((resolve, reject) =>
      req.session.regenerate((err) => (err ? reject(err) : resolve())),
    );
    await new Promise<void>((resolve, reject) =>
      req.logIn(user, (err) => (err ? reject(err) : resolve())),
    );
    return user;
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AuthUserEntity })
  login(
    @Body() _dto: LoginDto,
    @CurrentUser() user: AuthUserEntity,
  ): AuthUserEntity {
    return user;
  }

  @UseGuards(AuthenticatedGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: Request): Promise<void> {
    await new Promise<void>((resolve, reject) =>
      req.logOut((err) => (err ? reject(err) : resolve())),
    );
    await new Promise<void>((resolve, reject) =>
      req.session.destroy((err) => (err ? reject(err) : resolve())),
    );
  }

  @UseGuards(AuthenticatedGuard)
  @Get('me')
  @ApiOkResponse({ type: AuthUserEntity })
  me(@CurrentUser() user: AuthUserEntity): AuthUserEntity {
    return user;
  }
}
