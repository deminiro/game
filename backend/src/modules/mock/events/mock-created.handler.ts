import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { MockCreatedEvent } from '@/modules/mock/events/mock-created.event';
import { MockEventsStream } from '@/modules/mock/events/mock-events.stream';

@EventsHandler(MockCreatedEvent)
export class MockCreatedHandler implements IEventHandler<MockCreatedEvent> {
  private readonly logger = new Logger(MockCreatedHandler.name);

  constructor(private readonly mockEventsStream: MockEventsStream) {}

  handle(event: MockCreatedEvent): void {
    this.logger.log(
      `[${event.type}@v${event.version}] ${event.aggregateType}/${event.aggregateId}`,
    );
    this.mockEventsStream.emitMockCreated(event);
  }
}
