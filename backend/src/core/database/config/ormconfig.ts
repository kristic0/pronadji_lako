import { DataSource, DataSourceOptions } from 'typeorm';

export const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: 'localhost',
  port: 3307,
  username: 'admin',
  password: 'admin',
  database: 'pronadji_lako',
  entities: [__dirname + '/../typeorm/entities/*.entity{.ts,.js}'],
  logging: ['query', 'error', 'warn', 'info', 'log'],
  migrations: ['src/database/migrations/*.ts'],
};

console.log(dataSourceOptions);

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
