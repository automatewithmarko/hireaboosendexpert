import { notFound } from 'next/navigation';
import { SellerBreadcrumb } from '@/components/seller/SellerBreadcrumb';
import { ImageSlideshow } from '@/components/seller/ImageSlideshow';
import { SellerProfileCard } from '@/components/seller/SellerProfileCard';
import { PricingTable } from '@/components/seller/PricingTable';
import { SellerAbout } from '@/components/seller/SellerAbout';
import { SellerSkills } from '@/components/seller/SellerSkills';
import { ReviewsList } from '@/components/seller/ReviewsList';
import { SellerPageClient } from '@/components/seller/SellerPageClient';
import { CommentSection } from '@/components/listing/CommentSection';
import { getPublicSellerById, listGigComments } from '@/lib/marketplace/repository';
import { getCurrentUserContext } from '@/lib/auth/session';
import type { Metadata } from 'next';

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const seller = await getPublicSellerById(Number(id));
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
  const [seller, { marketplace }] = await Promise.all([
    getPublicSellerById(Number(id)),
    getCurrentUserContext(),
  ]);
  if (!seller) notFound();

  const featuredGigId = seller.featuredGigId ?? seller.gigs[0]?.id;
  const comments = featuredGigId ? await listGigComments(featuredGigId) : [];
  const isOwnGig = marketplace?.account.id === seller.accountId;

  return (
    <>
      <SellerBreadcrumb name={seller.name} />

      <div className="listing-flow">
        <div className="listing-sidebar">
          <SellerProfileCard seller={seller} />
          <PricingTable packages={seller.packages} isOwnGig={isOwnGig} />
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

        {featuredGigId && (
          <CommentSection
            gigId={featuredGigId}
            comments={comments}
            viewerAccountId={marketplace?.account.id ?? null}
          />
        )}
      </div>

      {!isOwnGig && <SellerPageClient seller={seller} />}
    </>
  );
}
