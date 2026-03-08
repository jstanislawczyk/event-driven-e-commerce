import type { EventStore } from '../../application/ports/event-store.ts';
import { jsonEvent, type KurrentDBClient } from '@kurrent/kurrentdb-client';
import type { DomainEvent } from '../../domain/events/domain-event.ts';

export class KurrentEventStore implements EventStore {
  constructor(private readonly client: KurrentDBClient) {}

  async readFromStream(streamName: string): Promise<DomainEvent[]> {
    return [];
  }

  async appendToStream(
    streamName: string,
    events: DomainEvent[],
  ): Promise<void> {
    const mappedEvents = events.map((event) =>
      jsonEvent({
        type: event.type,
        data: event.data,
      }),
    );

    await this.client.appendToStream(streamName, mappedEvents);
  }
}
