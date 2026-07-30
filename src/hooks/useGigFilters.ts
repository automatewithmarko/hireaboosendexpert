'use client';

import { useState, useMemo } from 'react';
import type { GigCategory, GigWithSeller } from '@/types';

export type SortOption = 'recommended' | 'price-asc' | 'price-desc' | 'delivery' | 'rating';

function getDeliveryDays(gig: GigWithSeller): number {
  const basic = gig.seller.packages[0];
  if (!basic) return 999;
  const match = basic.delivery.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 999;
}

export function useGigFilters(initialGigs: GigWithSeller[]) {
  const allGigs = useMemo(() => initialGigs, [initialGigs]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<GigCategory | 'all'>('all');

  // Filters
  const [minRating, setMinRating] = useState<number | null>(null);
  const [maxDeliveryDays, setMaxDeliveryDays] = useState<number | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('recommended');

  // Compute price bounds from all gigs
  const priceBounds = useMemo(() => {
    const prices = allGigs.map((g) => g.price);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [allGigs]);

  const filteredGigs = useMemo(() => {
    let result: GigWithSeller[] = allGigs;

    if (activeCategory !== 'all') {
      result = result.filter((g) => g.category === activeCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.seller.name.toLowerCase().includes(q) ||
          g.category.toLowerCase().includes(q) ||
          g.seller.skills.some((s) => s.toLowerCase().includes(q))
      );
    }
    if (minRating !== null) {
      result = result.filter((g) => g.rating >= minRating);
    }
    if (maxDeliveryDays !== null) {
      result = result.filter((g) => getDeliveryDays(g) <= maxDeliveryDays);
    }
    if (priceRange !== null) {
      result = result.filter((g) => g.price >= priceRange[0] && g.price <= priceRange[1]);
    }

    // Sort
    if (sortBy === 'price-asc') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'delivery') {
      result = [...result].sort((a, b) => getDeliveryDays(a) - getDeliveryDays(b));
    } else if (sortBy === 'rating') {
      result = [...result].sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [allGigs, searchQuery, activeCategory, minRating, maxDeliveryDays, priceRange, sortBy]);

  return {
    searchQuery, setSearchQuery,
    activeCategory, setActiveCategory,
    minRating, setMinRating,
    maxDeliveryDays, setMaxDeliveryDays,
    priceRange, setPriceRange,
    sortBy, setSortBy,
    priceBounds,
    filteredGigs,
    allGigs,
  };
}
