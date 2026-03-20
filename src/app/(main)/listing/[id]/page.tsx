import { notFound } from 'next/navigation';
import { getSellerById, getSellerSlugs } from '@/lib/sellers';
import { SellerBreadcrumb } from '@/components/seller/SellerBreadcrumb';
import { ImageSlideshow } from '@/components/seller/ImageSlideshow';
import { SellerProfileCard } from '@/components/seller/SellerProfileCard';
import { PricingTable } from '@/components/seller/PricingTable';
import { SellerAbout } from '@/components/seller/SellerAbout';
import { SellerSkills } from '@/components/seller/SellerSkills';
import { ReviewsList } from '@/components/seller/ReviewsList';
import { SellerPageClient } from '@/components/seller/SellerPageClient';
import type { Metadata } from 'next';

export function generateStaticParams() {
  return getSellerSlugs();
}

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const seller = getSellerById(Number(id));
  if (!seller) return {};
  return {
    title: `${seller.name} | BooSend Experts`,
    openGraph: {
      title: `${seller.name} - Automation Expert | BooSend Experts`,
      description: seller.bio.slice(0, 160),
      type: 'profile',
    },
  };
}

export default async function SellerPage({ params }: PageProps) {
  const { id } = await params;
  const seller = getSellerById(Number(id));
  if (!seller) notFound();

  return (
    <>
      <SellerBreadcrumb name={seller.name} />

      <div className="listing-flow">
        <div className="listing-sidebar">
          <SellerProfileCard seller={seller} />
          <PricingTable packages={seller.packages} />
        </div>

        <div className="listing-slideshow">
          <ImageSlideshow gigs={seller.gigs} />
        </div>

        <div className="listing-service-header">
          <h2 className="listing-service-title">{seller.serviceTitle}</h2>
          <p className="listing-service-desc">{seller.serviceDescription}</p>
        </div>

        <SellerAbout bio={seller.bio} />
        <SellerSkills skills={seller.skills} />
        <ReviewsList reviews={seller.reviewsList} />
      </div>

      <SellerPageClient seller={seller} />
    </>
  );
}
