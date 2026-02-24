import { OrdersSubscriber } from '../orders.subscriber.ts';
import { KurrentEventStoreSubscriber } from '../../database/subscribers/kurrent-event-store.subscriber.ts';
import { getKurrentClient } from '../../database/clients/kurrent.ts';

export const buildOrdersSubscriber = async () => {
  const kurrentClient = await getKurrentClient();
  const eventStoreSubscriber = new KurrentEventStoreSubscriber(kurrentClient);

  return new OrdersSubscriber(eventStoreSubscriber);
};
