import {
  type AllStreamSubscription,
  type KurrentDBClient,
  START,
  streamNameFilter,
} from '@kurrent/kurrentdb-client';
import type {
  EventStoreSubscriber,
  StreamCheckpoint,
} from './event-store.subscriber.ts';

export class KurrentEventStoreSubscriber implements EventStoreSubscriber {
  constructor(private readonly client: KurrentDBClient) {}

  async subscribeToStream(
    streamNamePrefix: string,
    checkpoint?: StreamCheckpoint,
  ): Promise<AllStreamSubscription> {
    const fromPosition = checkpoint
      ? {
          commit: BigInt(checkpoint.commit),
          prepare: BigInt(checkpoint.prepare),
        }
      : START;

    return this.client.subscribeToAll({
      filter: streamNameFilter({
        prefixes: [streamNamePrefix],
      }),
      fromPosition,
    });
  }
}
