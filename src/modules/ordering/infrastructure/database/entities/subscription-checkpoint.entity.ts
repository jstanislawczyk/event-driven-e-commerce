import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('subscriptions_checkpoints')
export class SubscriptionCheckpointEntity {
  @PrimaryColumn()
  streamName: string;

  @Column()
  commit: string;

  @Column()
  prepare: string;
}
