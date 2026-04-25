import { AppConfigModule } from '@/config/app-config.module';
import { AppConfigService } from '@/config/app-config.service';
import { envValidationSchema } from '@/config/env.validation';
import { PrismaModule } from '@/database/prisma.module';
import { HealthModule } from '@/health/health.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { GameModule } from '@/modules/game/game.module';
import { MockModule } from '@/modules/mock/mock.module';
import { UserModule } from '@/modules/user/user.module';
import { WalletModule } from '@/modules/wallet/wallet.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { LoggerModule } from 'nestjs-pino';
import { AuthenticatedGuard } from '@/modules/auth/guards/authenticated.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: ['.env'],
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: true,
        allowUnknown: true,
      },
    }),
    AppConfigModule,
    LoggerModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        pinoHttp: {
          level: config.logLevel,
          transport: config.isProduction
            ? undefined
            : {
                target: 'pino-pretty',
                options: {
                  singleLine: true,
                  translateTime: 'SYS:HH:MM:ss.l',
                  ignore: 'pid,hostname,req,res,responseTime',
                },
              },
          autoLogging: true,
          redact: ['req.headers.authorization', 'req.headers.cookie'],
        },
      }),
    }),
    CqrsModule.forRoot(),
    PrismaModule,
    HealthModule,
    AuthModule,
    UserModule,
    GameModule,
    WalletModule,
    MockModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: AuthenticatedGuard }],
})
export class AppModule {}
