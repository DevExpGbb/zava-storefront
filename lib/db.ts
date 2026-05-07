import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
});

export type Product = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
};

export const db = {
  async listProducts({ limit = 20, offset = 0 }: { limit?: number; offset?: number }): Promise<Product[]> {
    const result = await pool.query<{ id: string; name: string; description: string; price_cents: number }>(
      `SELECT id, name, description, price_cents
       FROM products
       WHERE archived_at IS NULL
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      priceCents: r.price_cents,
    }));
  },
  async query<T = Record<string, unknown>>(
    sql: string,
    params: ReadonlyArray<unknown> = []
  ): Promise<{ rows: T[] }> {
    const result = await pool.query(sql, params as unknown[]);
    return { rows: result.rows as T[] };
  },
};

export type Db = typeof db;
