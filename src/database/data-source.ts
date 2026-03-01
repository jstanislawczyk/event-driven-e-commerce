import { DataSource } from 'typeorm';

export const dataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'root',
  database: 'ordering',
  synchronize: true,
  logging: false,
  entities: [
    'src/modules/ordering/infrastructure/database/entities/**/*.{js,ts}',
    'src/modules/customers/infrastructure/database/entities/**/*.{js,ts}',
  ],
  migrations: [],
  subscribers: [],
});
