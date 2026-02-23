import express, { type Express } from 'express';
import { buildOrderRoutes } from './modules/ordering/infrastructure/http/routes/order.routes.ts';

export async function createApp(): Promise<Express> {
  const app = express();
  const orderRoutes = await buildOrderRoutes();

  app.use(express.json());
  app.use('/orders', orderRoutes);
  return app;
}
