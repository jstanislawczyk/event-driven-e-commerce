import { OrderController } from '../controllers/order.controller.ts';
import { PlaceOrderHandler } from '../../../application/command-handlers/place-order.handler.ts';
import { getKurrentClient } from '../../database/clients/kurrent.ts';
import { KurrentEventStore } from '../../database/event-store.ts';
import type { CustomerReader } from '../../../application/ports/customer-reader.ts';

export const buildOrderController = async (
  customerReader: CustomerReader,
): Promise<OrderController> => {
  const kurrentClient = await getKurrentClient();
  const eventStore = new KurrentEventStore(kurrentClient);
  const placeOrderHandler = new PlaceOrderHandler(eventStore, customerReader);

  return new OrderController(placeOrderHandler);
};
