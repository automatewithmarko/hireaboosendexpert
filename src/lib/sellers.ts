import { sellers } from '@/data/sellers';
import type { Seller, GigWithSeller } from '@/types';

export function getSellerById(id: number): Seller | undefined {
  return sellers.find((s) => s.id === id);
}

export function getAllGigs(): GigWithSeller[] {
  return sellers.flatMap((seller) =>
    seller.gigs.map((gig) => ({ ...gig, seller }))
  );
}

export function getSellerSlugs() {
  return sellers.map((s) => ({ id: String(s.id) }));
}
