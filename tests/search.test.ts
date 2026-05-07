import { describe, it, expect } from 'vitest';
import { rankByRelevance } from '../lib/search';

describe('search · ranking', () => {
  it('places exact matches first', () => {
    const ranked = rankByRelevance(
      [
        { id: 'a', name: 'hammer drill', priceCents: 0, inStock: true },
        { id: 'b', name: 'drill', priceCents: 0, inStock: true },
      ],
      'drill',
    );
    expect(ranked[0].id).toBe('b');
  });
});

// NOTE (workshop): no tests for searchProducts query trimming, length cap, or empty-query
// short-circuit. Track 1 should fill those.
