import { OrdersSubscriber } from '../orders.subscriber.ts';
import { KurrentEventStoreSubscriber } from '../../database/subscribers/kurrent-event-store.subscriber.ts';
import { getKurrentClient } from '../../database/clients/kurrent.ts';
import { DatabaseOrderReadRepository } from '../../database/repositories/database-order-read.repository.ts';
import type { CustomerReader } from '../../../application/ports/customer-reader.ts';
import { DatabaseSubscriptionCheckpointRepository } from '../../database/repositories/subscription-checkpoint.repository.ts';

export const buildOrdersSubscriber = async (customerReader: CustomerReader) => {
  const kurrentClient = await getKurrentClient();
  const eventStoreSubscriber = new KurrentEventStoreSubscriber(kurrentClient);
  const orderReadRepository = new DatabaseOrderReadRepository();
  const subscriptionCheckpointRepository =
    new DatabaseSubscriptionCheckpointRepository();

  return new OrdersSubscriber(
    eventStoreSubscriber,
    orderReadRepository,
    customerReader,
    subscriptionCheckpointRepository,
  );
};
