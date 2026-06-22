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

export type Cart = {
  id: string;
  items: Array<{ productId: string; quantity: number; unitPriceCents: number }>;
  promoCode: string | null;
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  createdAt: string;
  updatedAt: string;
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

  /**
   * Fetches a cart by ID.
   *
   * @param cartId - The cart ID
   * @returns Cart if found, null otherwise
   *
   * @example
   * const cart = await db.getCart("cart_123");
   */
  async getCart(cartId: string): Promise<Cart | null> {
    const result = await pool.query<{
      id: string;
      items: string;
      promo_code: string | null;
      subtotal_cents: number;
      discount_cents: number;
      total_cents: number;
      created_at: string;
      updated_at: string;
    }>(
      `SELECT id, items, promo_code, subtotal_cents, discount_cents, total_cents, created_at, updated_at
       FROM carts
       WHERE id = $1`,
      [cartId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      items: JSON.parse(row.items),
      promoCode: row.promo_code,
      subtotalCents: row.subtotal_cents,
      discountCents: row.discount_cents,
      totalCents: row.total_cents,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },

  /**
   * Updates a cart with discount and promo code information.
   *
   * @param cartId - The cart ID
   * @param promoCode - The promo code to apply
   * @param discountCents - The discount amount in cents
   * @param newTotalCents - The new total in cents
   *
   * @example
   * await db.updateCartWithPromo("cart_123", "SAVE10", 1000, 9000);
   */
  async updateCartWithPromo(
    cartId: string,
    promoCode: string,
    discountCents: number,
    newTotalCents: number
  ): Promise<void> {
    const now = new Date().toISOString();
    await pool.query(
      `UPDATE carts
       SET promo_code = $1, discount_cents = $2, total_cents = $3, updated_at = $4
       WHERE id = $5`,
      [promoCode, discountCents, newTotalCents, now, cartId]
    );
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
