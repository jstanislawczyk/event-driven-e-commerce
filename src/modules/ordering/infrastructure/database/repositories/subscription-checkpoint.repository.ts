import type { Repository } from 'typeorm';
import { dataSource } from '../../../../../database/data-source.ts';
import { SubscriptionCheckpointEntity } from '../entities/subscription-checkpoint.entity.ts';

export interface SubscriptionCheckpointRepository {
  get(streamName: string): Promise<SubscriptionCheckpointEntity | null>;
  save(
    saveCheckpoint: Pick<
      SubscriptionCheckpointEntity,
      'streamName' | 'commit' | 'prepare'
    >,
  ): Promise<SubscriptionCheckpointEntity>;
}

export class DatabaseSubscriptionCheckpointRepository implements SubscriptionCheckpointRepository {
  private readonly subscriptionCheckpointRepository: Repository<SubscriptionCheckpointEntity>;

  constructor() {
    this.subscriptionCheckpointRepository = dataSource.getRepository(
      SubscriptionCheckpointEntity,
    );
  }

  async get(streamName: string): Promise<SubscriptionCheckpointEntity | null> {
    return this.subscriptionCheckpointRepository.findOneBy({ streamName });
  }

  async save(
    saveCheckpoint: Pick<
      SubscriptionCheckpointEntity,
      'streamName' | 'commit' | 'prepare'
    >,
  ): Promise<SubscriptionCheckpointEntity> {
    const { streamName, commit, prepare } = saveCheckpoint;
    const entityToInsert = this.subscriptionCheckpointRepository.create({
      streamName,
      commit,
      prepare,
    });

    return this.subscriptionCheckpointRepository.save(entityToInsert);
  }
}
