import type { DomainEvent } from '../../domain/events/domain-event.ts';

export interface EventStore {
  appendToStream(streamName: string, events: DomainEvent[]): Promise<void>;
}
