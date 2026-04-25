import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AppConfigModule } from '@/config/app-config.module';
import { PrismaModule } from '@/database/prisma.module';
import { AuthController } from '@/modules/auth/auth.controller';
import { AuthService } from '@/modules/auth/auth.service';
import { AuthenticatedGuard } from '@/modules/auth/guards/authenticated.guard';
import { LocalAuthGuard } from '@/modules/auth/guards/local-auth.guard';
import { SessionSerializer } from '@/modules/auth/session.serializer';
import { LocalStrategy } from '@/modules/auth/strategies/local.strategy';

@Module({
  imports: [
    PrismaModule,
    AppConfigModule,
    PassportModule.register({ session: true }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    SessionSerializer,
    LocalAuthGuard,
    AuthenticatedGuard,
  ],
  exports: [AuthService, AuthenticatedGuard],
})
export class AuthModule {}
