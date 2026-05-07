import type { Db } from './db';

export interface Product {
  id: string;
  name: string;
  priceCents: number;
  inStock: boolean;
}

export async function searchProducts(db: Db, query: string, limit = 20): Promise<Product[]> {
  const trimmed = query.trim();
  if (trimmed.length === 0) return [];

  if (trimmed.length > 200) {
    throw new Error('query too long');
  }

  const { rows } = await db.query<Product>(
    'SELECT id, name, price_cents AS "priceCents", in_stock AS "inStock" FROM products WHERE name ILIKE $1 LIMIT $2',
    [`%${trimmed}%`, limit],
  );
  return rows;
}

export function rankByRelevance(products: Product[], query: string): Product[] {
  const q = query.toLowerCase();
  return [...products].sort((a, b) => {
    const aExact = a.name.toLowerCase() === q ? 0 : 1;
    const bExact = b.name.toLowerCase() === q ? 0 : 1;
    if (aExact !== bExact) return aExact - bExact;
    return a.name.localeCompare(b.name);
  });
}
