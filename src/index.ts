import 'reflect-metadata';

import { createApp } from './app.ts';
import { initializeKurrentClient } from './modules/ordering/infrastructure/database/clients/kurrent.ts';
import { buildOrdersSubscriber } from './modules/ordering/infrastructure/subscribers/factories/orders-subscriber.factory.ts';
import { dataSource } from './database/data-source.ts';
import { CustomerReaderAdapter } from './modules/customers/infrastructure/database/customer-reader.adapter.ts';
import { CustomerEntity } from './modules/customers/infrastructure/database/entities/customer.entity.ts';

dataSource
  .initialize()
  .then(() => {
    console.log('Database connection established successfully');

    initializeKurrentClient()
      .then(async () => {
        console.log('KurrentDB initialized successfully');

        const customerReader = buildCustomerReader();
        const ordersSubscriber = await buildOrdersSubscriber(customerReader);
        await ordersSubscriber.start();

        createApp(customerReader).then((value) => {
          value.listen(3000, () => {
            console.log('Server is running on http://localhost:3000');
          });
        });

        console.log('OrdersProjection started successfully');
      })
      .catch((error: Error) => {
        console.error('Error in KurrentDB setup:', error);
      });
  })
  .catch((error: Error) =>
    console.error('Error connecting to the database:', error),
  );

const buildCustomerReader = (): CustomerReaderAdapter => {
  const customerRepository = dataSource.getRepository(CustomerEntity);
  return new CustomerReaderAdapter(customerRepository);
};
