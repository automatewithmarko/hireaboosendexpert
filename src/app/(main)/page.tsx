import { MarketplaceContent } from '@/components/home/MarketplaceContent';
import { listPublishedGigs } from '@/lib/marketplace/repository';

export default async function HomePage() {
  const gigs = await listPublishedGigs();

  return <MarketplaceContent gigs={gigs} />;
}
