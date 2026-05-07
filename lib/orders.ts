import { z } from 'zod';
import type { Db } from './db';
import { cartItemSchema, type CartItem, totalize } from './cart';

export const orderSchema = z.object({
  userId: z.string().min(1),
  items: z.array(cartItemSchema).min(1),
  discountCode: z.string().nullable(),
  region: z.string().min(2).max(8),
});

export type OrderInput = z.infer<typeof orderSchema>;

export interface Order {
  id: string;
  userId: string;
  totalCents: number;
  status: 'pending' | 'paid' | 'fulfilled' | 'cancelled';
  createdAt: string;
}

export async function createOrder(db: Db, input: OrderInput): Promise<Order> {
  const totals = totalize(input.items, input.discountCode, input.region);
  if (totals.totalCents <= 0) {
    throw new Error('order total must be positive');
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await db.query(
    'INSERT INTO orders (id, user_id, total_cents, status, created_at) VALUES ($1, $2, $3, $4, $5)',
    [id, input.userId, totals.totalCents, 'pending', now],
  );

  return {
    id,
    userId: input.userId,
    totalCents: totals.totalCents,
    status: 'pending',
    createdAt: now,
  };
}

export async function findOrder(db: Db, id: string): Promise<Order | null> {
  const { rows } = await db.query<Order>(
    'SELECT id, user_id AS "userId", total_cents AS "totalCents", status, created_at AS "createdAt" FROM orders WHERE id = $1',
    [id],
  );
  return rows[0] ?? null;
}

export function canCancel(order: Order): boolean {
  return order.status === 'pending';
}

export function fulfillmentMessage(order: Order): string {
  switch (order.status) {
    case 'pending':
      return `Order ${order.id} is awaiting payment.`;
    case 'paid':
      return `Order ${order.id} is being prepared.`;
    case 'fulfilled':
      return `Order ${order.id} has shipped.`;
    case 'cancelled':
      return `Order ${order.id} was cancelled.`;
  }
}

export function summarize(items: CartItem[]): string {
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const lines = items.length;
  return `${count} item${count === 1 ? '' : 's'} across ${lines} line${lines === 1 ? '' : 's'}`;
}
