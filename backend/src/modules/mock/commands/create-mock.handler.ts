import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '@/database/prisma.service';
import { MockEntity } from '@/modules/mock/entities/mock.entity';
import { MockCreatedEvent } from '@/modules/mock/events/mock-created.event';
import { CreateMockCommand } from '@/modules/mock/commands/create-mock.command';

@CommandHandler(CreateMockCommand)
export class CreateMockHandler implements ICommandHandler<CreateMockCommand, MockEntity> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateMockCommand): Promise<MockEntity> {
    const created = await this.prisma.mock.create({ data: command.dto });
    const entity = new MockEntity(created);

    this.eventBus.publish(
      new MockCreatedEvent({
        mockId: entity.id,
        name: entity.name,
      }),
    );

    return entity;
  }
}
