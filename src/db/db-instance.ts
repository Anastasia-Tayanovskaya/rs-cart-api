import { Pool, ClientConfig } from 'pg';

const { PG_HOST, PG_USER, PG_DATABASE, PG_PASSWORD, PG_PORT } = process.env;

const dbConfig: ClientConfig = {
  host: PG_HOST,
  user: PG_USER,
  database: PG_DATABASE,
  password: PG_PASSWORD,
  port: Number(PG_PORT),
  ssl: {
    require: true,
    rejectUnauthorized: false,
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000,
};

const pool = new Pool(dbConfig);

class Database {
  #pool: Pool;

  constructor(pool: Pool) {
    this.#pool = pool;
  }

  query = query => {
    return this.#pool.query(query);
  }

  getClient = () => this.#pool.connect();
}

const db = new Database(pool);

export type { Database }
export { db }