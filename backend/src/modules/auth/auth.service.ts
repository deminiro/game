import { PrismaService } from '@/database/prisma.service';
import { AppConfigService } from '@/config/app-config.service';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { hash, verify } from '@node-rs/argon2';
import { RegisterDto } from './dto/register.dto';
import { AuthUserEntity } from './entities/auth-user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthUserEntity> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await hash(dto.password, {
      memoryCost: this.config.argon2MemoryCost,
      timeCost: this.config.argon2TimeCost,
      parallelism: this.config.argon2Parallelism,
    });

    const user = await this.prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email: dto.email,
          passwordHash,
          displayName: dto.displayName ?? null,
        },
      });
      await tx.wallet.create({ data: { userId: created.id } });
      return created;
    });

    return this.toEntity(user);
  }

  async validateUser(email: string, password: string): Promise<AuthUserEntity> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const ok = await verify(user.passwordHash, password);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.toEntity(user);
  }

  async findById(id: string): Promise<AuthUserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? this.toEntity(user) : null;
  }

  private toEntity(user: {
    id: string;
    email: string;
    displayName: string | null;
  }): AuthUserEntity {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
    };
  }
}
