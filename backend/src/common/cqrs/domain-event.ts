import { randomUUID } from 'node:crypto';

/**
 * Versioned envelope for every domain event.
 * Keeping this shape stable today makes migration to a broker
 * (RabbitMQ, Kafka, Pub/Sub) a drop-in change — handlers and
 * emit sites never need to care about the transport.
 */
export interface DomainEventMetadata {
  readonly traceId?: string;
  readonly userId?: string;
  readonly source?: string;
  readonly [key: string]: unknown;
}

export abstract class DomainEvent<TPayload = unknown> {
  readonly id: string;
  readonly occurredAt: Date;

  /** Dot-notated event name, e.g. "payment.succeeded" */
  abstract readonly type: string;

  /** Bump when the payload shape changes in a breaking way */
  abstract readonly version: number;

  /** Aggregate kind (e.g. "payment", "user", "game.session") */
  abstract readonly aggregateType: string;

  /** Aggregate instance identifier used for ordering/partitioning */
  abstract readonly aggregateId: string;

  abstract readonly payload: TPayload;
  readonly metadata: DomainEventMetadata;

  protected constructor(metadata: DomainEventMetadata = {}) {
    this.id = randomUUID();
    this.occurredAt = new Date();
    this.metadata = metadata;
  }
}
