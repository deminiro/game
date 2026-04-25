import { Injectable } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { MockCreatedEvent } from '@/modules/mock/events/mock-created.event';

@Injectable()
export class MockEventsStream {
  private readonly mockCreatedSubject = new Subject<MockCreatedEvent>();

  emitMockCreated(event: MockCreatedEvent): void {
    this.mockCreatedSubject.next(event);
  }

  onMockCreated(): Observable<MockCreatedEvent> {
    return this.mockCreatedSubject.asObservable();
  }
}
