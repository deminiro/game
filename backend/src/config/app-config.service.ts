import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService) {}

  get nodeEnv(): string {
    return this.config.get<string>('NODE_ENV', 'development');
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get port(): number {
    return this.config.get<number>('PORT', 3000);
  }

  get apiPrefix(): string {
    return this.config.get<string>('API_PREFIX', 'api');
  }

  get apiVersion(): string {
    return this.config.get<string>('API_VERSION', '1');
  }

  get databaseUrl(): string {
    return this.config.getOrThrow<string>('DATABASE_URL');
  }

  get logLevel(): string {
    return this.config.get<string>('LOG_LEVEL', 'info');
  }

  get jwtAccessSecret(): string {
    return this.config.getOrThrow<string>('JWT_ACCESS_SECRET');
  }

  get jwtRefreshSecret(): string {
    return this.config.getOrThrow<string>('JWT_REFRESH_SECRET');
  }

  get jwtAccessTtl(): string {
    return this.config.get<string>('JWT_ACCESS_TTL', '15m');
  }

  get jwtRefreshTtl(): string {
    return this.config.get<string>('JWT_REFRESH_TTL', '7d');
  }

  get argon2MemoryCost(): number {
    return this.config.get<number>('ARGON2_MEMORY_COST', 19456);
  }

  get argon2TimeCost(): number {
    return this.config.get<number>('ARGON2_TIME_COST', 2);
  }

  get argon2Parallelism(): number {
    return this.config.get<number>('ARGON2_PARALLELISM', 1);
  }

  get sessionSecret(): string {
    return this.config.getOrThrow<string>('SESSION_SECRET');
  }

  get sessionTtlMs(): number {
    return this.config.get<number>('SESSION_TTL_MS', 7 * 24 * 60 * 60 * 1000);
  }

  get cookieDomain(): string | undefined {
    const domain = this.config.get<string>('COOKIE_DOMAIN', '');
    return domain ? domain : undefined;
  }

  get cookieSecure(): boolean {
    return this.config.get<boolean>('COOKIE_SECURE', false);
  }

  get cookieSameSite(): 'lax' | 'strict' | 'none' {
    return this.config.get<'lax' | 'strict' | 'none'>('COOKIE_SAME_SITE', 'lax');
  }
}
