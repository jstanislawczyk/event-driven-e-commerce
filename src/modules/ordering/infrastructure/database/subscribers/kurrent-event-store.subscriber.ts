import {
  type AllStreamSubscription,
  type KurrentDBClient,
  streamNameFilter,
} from '@kurrent/kurrentdb-client';
import type { EventStoreSubscriber } from './event-store.subscriber.ts';

export class KurrentEventStoreSubscriber implements EventStoreSubscriber {
  constructor(private readonly client: KurrentDBClient) {}

  async subscribeToStream(
    streamNamePrefix: string,
  ): Promise<AllStreamSubscription> {
    return this.client.subscribeToAll({
      filter: streamNameFilter({
        prefixes: [streamNamePrefix],
      }),
    });
  }
}
