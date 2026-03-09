import type { DomainEvent } from '../../domain/events/domain-event.ts';

export interface EventStore {
  readFromStream(streamName: string): Promise<DomainEvent[]>;
  appendToStream(streamName: string, events: DomainEvent[]): Promise<void>;
}
