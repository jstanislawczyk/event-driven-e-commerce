import express, { type Express } from 'express';
import { buildOrderRoutes } from './modules/ordering/infrastructure/http/routes/order.routes.ts';
import type { CustomerReader } from './modules/ordering/application/ports/customer-reader.ts';

export async function createApp(
  customerReader: CustomerReader,
): Promise<Express> {
  const app = express();

  const orderRoutes = await buildOrderRoutes(customerReader);

  app.use(express.json());
  app.use('/orders', orderRoutes);
  return app;
}
