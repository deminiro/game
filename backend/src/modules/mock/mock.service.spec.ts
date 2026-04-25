import { NotFoundException } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { PrismaService } from '@/database/prisma.service';
import { CreateMockCommand } from '@/modules/mock/commands/create-mock.command';
import { MockEntity } from '@/modules/mock/entities/mock.entity';
import { MockService } from '@/modules/mock/mock.service';

type MockRecord = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

describe('MockService', () => {
  let service: MockService;
  let commandBus: { execute: jest.Mock };
  let prisma: {
    mock: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      count: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  const sample: MockRecord = {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'sample',
    description: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      mock: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      $transaction: jest.fn(),
    };
    commandBus = { execute: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        MockService,
        { provide: PrismaService, useValue: prisma },
        { provide: CommandBus, useValue: commandBus },
      ],
    }).compile();

    service = moduleRef.get(MockService);
  });

  it('dispatches CreateMockCommand on create', async () => {
    commandBus.execute.mockResolvedValue(new MockEntity(sample));
    const result = await service.create({ name: 'sample' });
    expect(result.id).toBe(sample.id);
    expect(commandBus.execute).toHaveBeenCalledTimes(1);
    const command = commandBus.execute.mock.calls[0][0] as CreateMockCommand;
    expect(command).toBeInstanceOf(CreateMockCommand);
    expect(command.dto).toEqual({ name: 'sample' });
  });

  it('throws when findOne target is missing', async () => {
    prisma.mock.findUnique.mockResolvedValue(null);
    await expect(service.findOne(sample.id)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('lists with pagination defaults', async () => {
    prisma.$transaction.mockResolvedValue([[sample], 1]);
    const result = await service.findAll({ take: 20, skip: 0 });
    expect(result.total).toBe(1);
    expect(result.items).toHaveLength(1);
  });
});
