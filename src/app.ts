import express, { type Express } from 'express';
import { buildOrderRoutes } from './modules/ordering/infrastructure/http/routes/order.routes.ts';
import { dataSource } from './database/data-source.ts';
import { CustomerReaderAdapter } from './modules/customers/infrastructure/database/customer-reader.adapter.ts';
import { CustomerEntity } from './modules/customers/infrastructure/database/entities/customer.entity.ts';

export async function createApp(): Promise<Express> {
  const app = express();

  const customerReader = buildCustomerReader();
  const orderRoutes = await buildOrderRoutes(customerReader);

  app.use(express.json());
  app.use('/orders', orderRoutes);
  return app;
}

const buildCustomerReader = (): CustomerReaderAdapter => {
  const customerRepository = dataSource.getRepository(CustomerEntity);
  return new CustomerReaderAdapter(customerRepository);
};
