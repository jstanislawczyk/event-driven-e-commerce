import 'reflect-metadata';

import { createApp } from './app.ts';
import { initializeKurrentClient } from './modules/ordering/infrastructure/database/clients/kurrent.ts';
import { buildOrdersSubscriber } from './modules/ordering/infrastructure/subscribers/factories/orders-subscriber.factory.ts';
import { dataSource } from './database/data-source.ts';
import { CustomerReaderAdapter } from './modules/customers/infrastructure/database/customer-reader.adapter.ts';
import { CustomerEntity } from './modules/customers/infrastructure/database/entities/customer.entity.ts';
import type { CustomerReader } from './modules/ordering/application/ports/customer-reader.ts';

const initDatabase = async () => {
  try {
    await dataSource.initialize();
    console.log('Database connection established successfully');
  } catch (error) {
    console.error('Error connecting to the database:', error);
    throw error;
  }
};

const initEventStore = async () => {
  try {
    await initializeKurrentClient();
    console.log('KurrentDB initialized successfully');
  } catch (error) {
    console.error('Error in KurrentDB setup:', error);
    throw error;
  }
};

const initCrossModuleDependencies = () => {
  return {
    customerReader: buildCustomerReader(),
  };
};

const initEventStoreSubscribers = async (customerReader: CustomerReader) => {
  const ordersSubscriber = await buildOrdersSubscriber(customerReader);
  await ordersSubscriber.start();
  console.log('Orders subscriber started successfully');
};

const initializeApp = async (customerReader: CustomerReader) => {
  const app = await createApp(customerReader);

  app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
  });
};

const buildCustomerReader = (): CustomerReaderAdapter => {
  const customerRepository = dataSource.getRepository(CustomerEntity);
  return new CustomerReaderAdapter(customerRepository);
};

(async () => {
  await initDatabase();
  await initEventStore();

  const { customerReader } = initCrossModuleDependencies();

  await initEventStoreSubscribers(customerReader);
  await initializeApp(customerReader);
})();
