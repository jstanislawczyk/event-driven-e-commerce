import 'reflect-metadata';

import { createApp } from './app.ts';
import { dataSource } from './modules/appointments/infrastructure/database/data-source.ts';

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
