import type { AllStreamSubscription } from '@kurrent/kurrentdb-client';

export interface EventStoreSubscriber {
  subscribeToStream(
    streamNamePrefix: string,
    checkpoint?: StreamCheckpoint,
  ): Promise<AllStreamSubscription>;
}

export interface StreamCheckpoint {
  commit: string;
  prepare: string;
}
