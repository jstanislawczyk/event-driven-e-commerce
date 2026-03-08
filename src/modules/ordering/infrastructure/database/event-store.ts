import type { EventStore } from '../../application/ports/event-store.ts';
import type { KurrentDBClient, ResolvedEvent } from '@kurrent/kurrentdb-client';
import { jsonEvent, StreamNotFoundError } from '@kurrent/kurrentdb-client';
import type { DomainEvent } from '../../domain/events/domain-event.ts';

export class KurrentEventStore implements EventStore {
  constructor(private readonly client: KurrentDBClient) {}

  async readFromStream(streamName: string): Promise<DomainEvent[]> {
    const streamEvents = this.client.readStream(streamName);

    let domainEvents: DomainEvent[] = [];

    try {
      for await (const event of streamEvents) {
        const domainEvent = this.mapToDomainEvent(event);

        if (!domainEvent) {
          continue;
        }

        domainEvents.push(domainEvent);
      }
    } catch (error) {
      if (error instanceof StreamNotFoundError) {
        return [];
      }

      throw error;
    }

    return domainEvents;
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

  private mapToDomainEvent(event: ResolvedEvent): DomainEvent | undefined {
    const rawEvent = event.event;

    if (!rawEvent) {
      return;
    }

    return {
      type: rawEvent.type,
      data: rawEvent.data,
    };
  }
}
