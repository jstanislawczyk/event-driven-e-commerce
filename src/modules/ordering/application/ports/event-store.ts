export interface EventStore {
  appendToStream(streamName: string, events: any[]): Promise<void>;
}

export type DomainEvent = {
  type: string;
  data: any;
};
