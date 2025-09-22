const { Client } = require('pg');

const dbConfig = {
  type: process.env.DB_TYPE || 'postgres',
  host: process.env.DB_HOST || 'db',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USERNAME || process.env.POSTGRES_USER || 'chavito',
  password: process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD || 'chavito',
  database: process.env.DB_DATABASE || process.env.POSTGRES_DB || 'chavito'
};

async function waitForDb(retries = 20, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      const client = new Client(dbConfig);
      await client.connect();
      await client.end();
      console.log('DB is ready');
      return;
    } catch (err) {
      console.log(`DB not ready yet (${i+1}/${retries}) - retrying in ${delay}ms`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  console.error('DB did not become ready in time');
  process.exit(1);
}

waitForDb();
