import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateMockHandler } from '@/modules/mock/commands/create-mock.handler';
import { MockCreatedHandler } from '@/modules/mock/events/mock-created.handler';
import { MockEventsStream } from '@/modules/mock/events/mock-events.stream';
import { MockController } from '@/modules/mock/mock.controller';
import { MockService } from '@/modules/mock/mock.service';

const CommandHandlers = [CreateMockHandler];
const EventHandlers = [MockCreatedHandler];

@Module({
  imports: [CqrsModule],
  controllers: [MockController],
  providers: [MockService, MockEventsStream, ...CommandHandlers, ...EventHandlers],
  exports: [MockService],
})
export class MockModule {}
