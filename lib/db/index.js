import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import { schema } from "./schema";

const globalForDb = globalThis;

const pool =
  globalForDb.__belaviewMysqlPool ??
  mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000,
    // Match the API's pool so DATETIME values are read back as UTC and DECIMAL
    // columns are returned as numbers.
    decimalNumbers: true,
    timezone: "Z",
    charset: "UTF8MB4_UNICODE_CI",
  });

if (!globalForDb.__belaviewMysqlPool) {
  globalForDb.__belaviewMysqlPool = pool;
}

export { pool, schema };
export const db = drizzle(pool, { schema, mode: "default" });
