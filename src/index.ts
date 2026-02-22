import 'reflect-metadata';

import { createApp } from './app.ts';
import { dataSource } from './modules/ordering/infrastructure/database/data-source.ts';
import {simpleTest} from './kurrent.ts';

dataSource
  .initialize()
  .then(() => {
    console.log('Database connection established successfully');
  })
  .catch((error: Error) =>
    console.error('Error connecting to the database:', error),
  );

const app = createApp();

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});

simpleTest()
  .then(() => {
    console.log('KurrentDB test completed successfully');
  })
  .catch((error: Error) => {
    console.error('Error in KurrentDB test:', error);
  })
