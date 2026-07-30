import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUserContext } from '@/lib/auth/session';
import {
  getExpertDashboardData,
} from '@/lib/marketplace/repository';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Expert Dashboard | BooSend Experts',
};

interface PageProps {
  searchParams: Promise<{ gigCreated?: string }>;
}

export default async function ExpertDashboardPage({ searchParams }: PageProps) {
  const [{ user, marketplace }, params] = await Promise.all([
    getCurrentUserContext(),
    searchParams,
  ]);

  if (!user || !marketplace) {
    redirect('/become-an-expert');
  }

  if (marketplace.expertProfile?.application_status !== 'approved') {
    redirect('/expert/onboarding');
  }

  const dashboard = await getExpertDashboardData(
    marketplace.account.id,
    marketplace.roles,
  );

  return (
    <div className="orders-page" style={{ maxWidth: 1120, margin: '0 auto' }}>
      <div className="orders-header">
        <h1 className="orders-title">Expert Dashboard</h1>
        <p className="orders-subtitle">
          Manage your gigs, track orders, and keep your marketplace presence fresh.
        </p>
      </div>

      {params.gigCreated && (
        <div className="order-detail-toast" style={{ position: 'static', marginBottom: '1.5rem' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M9 12l2 2 4-4" />
            <circle cx="12" cy="12" r="10" />
          </svg>
          Gig submitted successfully. It&apos;s now waiting for admin review.
        </div>
      )}

      <div className="provider-stats">
        <div className="provider-stat">
          <div className="provider-stat-value">{dashboard.gigs.length}</div>
          <div className="provider-stat-label">Gigs</div>
        </div>
        <div className="provider-stat">
          <div className="provider-stat-value">{dashboard.activeOrdersCount}</div>
          <div className="provider-stat-label">Active Orders</div>
        </div>
        <div className="provider-stat">
          <div className="provider-stat-value">{dashboard.completedOrdersCount}</div>
          <div className="provider-stat-label">Completed Orders</div>
        </div>
        <div className="provider-stat">
          <div className="provider-stat-value">${dashboard.totalRevenue}</div>
          <div className="provider-stat-label">Completed Revenue</div>
        </div>
      </div>

      <div className="profile-page-content" style={{ display: 'grid', gap: '1.5rem', marginTop: '1.5rem' }}>
        <section className="order-detail-service-card">
          <h2 className="order-detail-section-title">Quick Actions</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            <Link href="/expert/gigs/new" className="order-detail-action-btn">
              Create New Gig
            </Link>
            <Link href="/expert/orders" className="order-detail-action-btn">
              Review Orders
            </Link>
            <Link href={`/profile/${dashboard.seller?.id}`} className="order-detail-action-btn">
              View Public Profile
            </Link>
          </div>
        </section>

        <section className="order-detail-service-card">
          <h2 className="order-detail-section-title">Your Gigs</h2>
          {dashboard.gigs.length > 0 ? (
            <div className="orders-list">
              {dashboard.gigs.map((gig) => (
                <div key={gig.id ?? gig.title} className="order-card" style={{ cursor: 'default' }}>
                  <div className="order-card-body">
                    <h3 className="order-card-gig-title">{gig.title}</h3>
                    {gig.shortDescription && (
                      <p style={{ color: '#6b7280', marginBottom: '0.75rem' }}>
                        {gig.shortDescription}
                      </p>
                    )}
                    <div className="order-card-meta">
                      <span className="order-card-package">{gig.category}</span>
                      <span className="order-card-price">From ${gig.price}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="orders-empty">No gigs yet. Start with your first service listing.</div>
          )}
        </section>
      </div>
    </div>
  );
}
