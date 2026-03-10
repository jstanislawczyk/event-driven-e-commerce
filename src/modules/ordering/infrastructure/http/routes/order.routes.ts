import { Router } from 'express';
import { buildOrderController } from '../factories/order-controller.factory.ts';
import type { CustomerReader } from '../../../application/ports/customer-reader.ts';

export async function buildOrderRoutes(
  customerReader: CustomerReader,
): Promise<Router> {
  const controller = await buildOrderController(customerReader);
  const router = Router();

  router.post('/', controller.create.bind(controller));
  router.post('/:orderId/ship', controller.shipOrder.bind(controller));
  router.post(
    '/:orderId/payment/authorize',
    controller.authorizePayment.bind(controller),
  );
  router.post(
    '/:orderId/payment/reject',
    controller.rejectPayment.bind(controller),
  );

  return router;
}
