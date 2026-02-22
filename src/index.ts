import 'reflect-metadata';

import { createApp } from './app.ts';
import { dataSource } from './modules/ordering/infrastructure/database/data-source.ts';
import {initializeKurrentClient} from './modules/ordering/infrastructure/database/kurrent.ts';

dataSource
  .initialize()
  .then(() => {
    console.log('Database connection established successfully');
  })
  .catch((error: Error) =>
    console.error('Error connecting to the database:', error),
  );

initializeKurrentClient()
  .then(() => {
    console.log('KurrentDB initialized successfully');
  })
  .catch((error: Error) => {
    console.error('Error in KurrentDB test:', error);
  })

const app = createApp();

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
