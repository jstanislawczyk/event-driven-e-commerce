import type { AllStreamSubscription } from '@kurrent/kurrentdb-client';

export interface EventStoreSubscriber {
  subscribeToStream(streamName: string): Promise<AllStreamSubscription>;
}
