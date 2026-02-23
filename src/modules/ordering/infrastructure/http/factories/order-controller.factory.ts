import { OrderController } from '../controllers/order.controller.ts';
import { PlaceOrderHandler } from '../../../application/command-handlers/place-order.handler.ts';
import { getKurrentClient } from '../../database/clients/kurrent.ts';
import { KurrentEventStore } from '../../database/event-store.ts';

export const buildOrderController = async (): Promise<OrderController> => {
  const kurrentClient = await getKurrentClient();
  const eventStore = new KurrentEventStore(kurrentClient);
  const placeOrderHandler = new PlaceOrderHandler(eventStore);

  return new OrderController(placeOrderHandler);
};
