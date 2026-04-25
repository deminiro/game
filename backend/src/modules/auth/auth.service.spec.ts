import { AppConfigService } from '@/config/app-config.service';
import { PrismaService } from '@/database/prisma.service';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { hash } from '@node-rs/argon2';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    user: { findUnique: jest.Mock; create: jest.Mock };
    wallet: { create: jest.Mock };
    $transaction: jest.Mock;
  };
  let config: Pick<
    AppConfigService,
    'argon2MemoryCost' | 'argon2TimeCost' | 'argon2Parallelism'
  >;

  beforeEach(async () => {
    prisma = {
      user: { findUnique: jest.fn(), create: jest.fn() },
      wallet: { create: jest.fn() },
      $transaction: jest.fn(async (cb) => cb(prisma)),
    };
    config = {
      argon2MemoryCost: 19456,
      argon2TimeCost: 2,
      argon2Parallelism: 1,
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: AppConfigService, useValue: config },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  it('register creates user + wallet and returns entity', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 'u1',
      email: 'a@b.com',
      displayName: null,
    });
    prisma.wallet.create.mockResolvedValue({});

    const result = await service.register({
      email: 'a@b.com',
      password: 'password123',
    });

    expect(result).toEqual({ id: 'u1', email: 'a@b.com', displayName: null });
    expect(prisma.wallet.create).toHaveBeenCalledWith({
      data: { userId: 'u1' },
    });
  });

  it('register throws Conflict when email taken', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'u1' });

    await expect(
      service.register({ email: 'a@b.com', password: 'password123' }),
    ).rejects.toThrow(ConflictException);
  });

  it('validateUser returns entity on correct password', async () => {
    const passwordHash = await hash('password123', {
      memoryCost: 8,
      timeCost: 1,
      parallelism: 1,
    });
    prisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      email: 'a@b.com',
      displayName: null,
      passwordHash,
    });

    const result = await service.validateUser('a@b.com', 'password123');
    expect(result).toEqual({ id: 'u1', email: 'a@b.com', displayName: null });
  });

  it('validateUser throws Unauthorized on missing user', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(service.validateUser('x@y.com', 'pw')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('validateUser throws Unauthorized on wrong password', async () => {
    const passwordHash = await hash('password123', {
      memoryCost: 8,
      timeCost: 1,
      parallelism: 1,
    });
    prisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      email: 'a@b.com',
      displayName: null,
      passwordHash,
    });

    await expect(
      service.validateUser('a@b.com', 'wrongpassword'),
    ).rejects.toThrow(UnauthorizedException);
  });
});
