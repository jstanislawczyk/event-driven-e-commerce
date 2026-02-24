import { OrdersSubscriber } from '../orders.subscriber.ts';
import { KurrentEventStoreSubscriber } from '../../database/subscribers/kurrent-event-store.subscriber.ts';
import { getKurrentClient } from '../../database/clients/kurrent.ts';
import { DatabaseOrderReadRepository } from '../../database/repositories/database-order-read.repository.ts';

export const buildOrdersSubscriber = async () => {
  const kurrentClient = await getKurrentClient();
  const eventStoreSubscriber = new KurrentEventStoreSubscriber(kurrentClient);
  const orderReadRepository = new DatabaseOrderReadRepository();

  return new OrdersSubscriber(eventStoreSubscriber, orderReadRepository);
};
