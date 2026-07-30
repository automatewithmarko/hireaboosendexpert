import { notFound } from 'next/navigation';
import { SellerBreadcrumb } from '@/components/seller/SellerBreadcrumb';
import { SellerHero } from '@/components/seller/SellerHero';
import { SellerStats } from '@/components/seller/SellerStats';
import { SellerAbout } from '@/components/seller/SellerAbout';
import { SellerSkills } from '@/components/seller/SellerSkills';
import { ProfileGigsList } from '@/components/seller/ProfileGigsList';
import { ReviewsList } from '@/components/seller/ReviewsList';
import { getPublicSellerById } from '@/lib/marketplace/repository';
import type { Metadata } from 'next';

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const seller = await getPublicSellerById(Number(id));
  if (!seller) return {};
  return {
    title: `${seller.name} - Profile | BooSend Experts`,
    openGraph: {
      title: `${seller.name} - Automation Expert | BooSend Experts`,
      description: seller.bio.slice(0, 160),
      type: 'profile',
    },
  };
}

export default async function ProfilePage({ params }: PageProps) {
  const { id } = await params;
  const seller = await getPublicSellerById(Number(id));
  if (!seller) notFound();

  return (
    <div className="profile-page">
      <SellerBreadcrumb name={seller.name} />

      <SellerHero seller={seller} />
      <SellerStats seller={seller} />

      <div className="profile-page-content">
        <SellerAbout bio={seller.bio} />
        <SellerSkills skills={seller.skills} />
        <ProfileGigsList seller={seller} />
        <ReviewsList reviews={seller.reviewsList} showBreakdown />
      </div>
    </div>
  );
}
