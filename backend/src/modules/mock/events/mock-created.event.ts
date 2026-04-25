import { IEvent } from '@nestjs/cqrs';
import { DomainEvent, DomainEventMetadata } from '@/common/cqrs';

export interface MockCreatedPayload {
  readonly mockId: string;
  readonly name: string;
}

export class MockCreatedEvent
  extends DomainEvent<MockCreatedPayload>
  implements IEvent
{
  readonly type = 'mock.created';
  readonly version = 1;
  readonly aggregateType = 'mock';

  constructor(
    readonly payload: MockCreatedPayload,
    metadata?: DomainEventMetadata,
  ) {
    super(metadata);
  }

  get aggregateId(): string {
    return this.payload.mockId;
  }
}
