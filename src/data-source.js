const { DataSource } = require('typeorm');
require('dotenv').config();

module.exports = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'db',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'chavito',
  password: process.env.DB_PASSWORD || 'chavito',
  database: process.env.DB_DATABASE || 'chavito',
  synchronize: false,
  logging: true,
  entities: ['src/**/*.entity.js'],
  migrations: ['src/migrations/*.js'],
  migrationsTableName: 'migrations',
});