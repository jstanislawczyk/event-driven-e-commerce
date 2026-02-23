import type {
  DomainEvent,
  EventStore,
} from '../../application/ports/event-store.ts';
import { jsonEvent, type KurrentDBClient } from '@kurrent/kurrentdb-client';

export class KurrentEventStore implements EventStore {
  constructor(private readonly client: KurrentDBClient) {}

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
