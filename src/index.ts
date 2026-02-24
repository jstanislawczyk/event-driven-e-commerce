import 'reflect-metadata';

import { createApp } from './app.ts';
import { initializeKurrentClient } from './modules/ordering/infrastructure/database/clients/kurrent.ts';
import { dataSource } from './modules/ordering/infrastructure/database/clients/data-source.ts';
import { buildOrdersSubscriber } from './modules/ordering/infrastructure/subscribers/factories/orders-subscriber.factory.ts';

dataSource
  .initialize()
  .then(() => {
    console.log('Database connection established successfully');
  })
  .catch((error: Error) =>
    console.error('Error connecting to the database:', error),
  );

initializeKurrentClient()
  .then(async () => {
    console.log('KurrentDB initialized successfully');

    const ordersSubscriber = await buildOrdersSubscriber();
    await ordersSubscriber.start();

    console.log('OrdersProjection started successfully');
  })
  .catch((error: Error) => {
    console.error('Error in KurrentDB test:', error);
  });

createApp().then((value) => {
  value.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
  });
});
