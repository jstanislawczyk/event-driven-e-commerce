import { Router } from 'express';
import { buildOrderController } from '../factories/order-controller.factory.ts';

export async function buildOrderRoutes(): Promise<Router> {
  const controller = await buildOrderController();
  const router = Router();

  router.post('/', controller.create.bind(controller));

  return router;
}
