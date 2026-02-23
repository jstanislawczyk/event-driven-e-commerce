import { OrdersProjection } from '../orders.projection.ts';
import { KurrentEventStoreSubscriber } from '../../database/subscribers/kurrent-event-store.subscriber.ts';
import { getKurrentClient } from '../../database/clients/kurrent.ts';

export const buildOrdersProjection = async () => {
  const kurrentClient = await getKurrentClient();
  const eventStoreSubscriber = new KurrentEventStoreSubscriber(kurrentClient);

  return new OrdersProjection(eventStoreSubscriber);
};
