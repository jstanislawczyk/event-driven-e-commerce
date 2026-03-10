import { OrderController } from '../controllers/order.controller.ts';
import { PlaceOrderHandler } from '../../../application/command-handlers/place-order.handler.ts';
import { getKurrentClient } from '../../database/clients/kurrent.ts';
import { KurrentEventStore } from '../../database/event-store.ts';
import type { CustomerReader } from '../../../application/ports/customer-reader.ts';
import { AuthorizePaymentHandler } from '../../../application/command-handlers/authorize-payment.handler.ts';
import { RejectPaymentHandler } from '../../../application/command-handlers/reject-payment.handler.ts';
import { ShipOrderHandler } from '../../../application/command-handlers/ship-order.handler.ts';

export const buildOrderController = async (
  customerReader: CustomerReader,
): Promise<OrderController> => {
  const kurrentClient = await getKurrentClient();
  const eventStore = new KurrentEventStore(kurrentClient);
  const placeOrderHandler = new PlaceOrderHandler(eventStore, customerReader);
  const authorizePaymentHandler = new AuthorizePaymentHandler(eventStore);
  const rejectPaymentHandler = new RejectPaymentHandler(eventStore);
  const shipOrderHandler = new ShipOrderHandler(eventStore);

  return new OrderController(
    placeOrderHandler,
    authorizePaymentHandler,
    rejectPaymentHandler,
    shipOrderHandler,
  );
};
