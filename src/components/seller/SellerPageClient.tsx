'use client';

import Link from 'next/link';
import type { Seller } from '@/types';

export function SellerPageClient({ seller }: { seller: Seller }) {
  return (
    <Link href={`/inbox?expert=${seller.id}`} className="chat-fab">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
      Contact Seller
    </Link>
  );
}
