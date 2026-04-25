import { EventBus } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { PrismaService } from '@/database/prisma.service';
import { MockCreatedEvent } from '@/modules/mock/events/mock-created.event';
import { CreateMockCommand } from '@/modules/mock/commands/create-mock.command';
import { CreateMockHandler } from '@/modules/mock/commands/create-mock.handler';

describe('CreateMockHandler', () => {
  let handler: CreateMockHandler;
  let prisma: { mock: { create: jest.Mock } };
  let eventBus: { publish: jest.Mock };

  const record = {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'sample',
    description: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = { mock: { create: jest.fn().mockResolvedValue(record) } };
    eventBus = { publish: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        CreateMockHandler,
        { provide: PrismaService, useValue: prisma },
        { provide: EventBus, useValue: eventBus },
      ],
    }).compile();

    handler = moduleRef.get(CreateMockHandler);
  });

  it('persists the mock and publishes MockCreatedEvent', async () => {
    const result = await handler.execute(new CreateMockCommand({ name: 'sample' }));

    expect(result.id).toBe(record.id);
    expect(prisma.mock.create).toHaveBeenCalledWith({ data: { name: 'sample' } });
    expect(eventBus.publish).toHaveBeenCalledTimes(1);

    const event = eventBus.publish.mock.calls[0][0] as MockCreatedEvent;
    expect(event).toBeInstanceOf(MockCreatedEvent);
    expect(event.type).toBe('mock.created');
    expect(event.version).toBe(1);
    expect(event.aggregateType).toBe('mock');
    expect(event.aggregateId).toBe(record.id);
    expect(event.payload).toEqual({ mockId: record.id, name: record.name });
  });
});
