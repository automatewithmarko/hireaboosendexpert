import { redirect } from 'next/navigation';
import { getCurrentUserContext } from '@/lib/auth/session';
import {
  reviewExpertApplicationAction,
  reviewGigAction,
} from '@/lib/marketplace/actions';
import {
  listAdminApplications,
  listAdminGigQueue,
} from '@/lib/marketplace/repository';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin | BooSend Experts',
};

export default async function AdminPage() {
  const { user, marketplace } = await getCurrentUserContext();
  if (!user || !marketplace) {
    redirect('/signin?next=/admin');
  }

  if (!marketplace.isAdmin) {
    redirect('/');
  }

  const [applications, gigQueue] = await Promise.all([
    listAdminApplications(),
    listAdminGigQueue(),
  ]);

  return (
    <div className="orders-page" style={{ maxWidth: 1120, margin: '0 auto' }}>
      <div className="orders-header">
        <h1 className="orders-title">Admin Panel</h1>
        <p className="orders-subtitle">
          Review expert applications and approve or archive gigs before they go live.
        </p>
      </div>

      <div className="profile-page-content" style={{ display: 'grid', gap: '1.5rem' }}>
        <section className="order-detail-service-card">
          <h2 className="order-detail-section-title">Expert Applications</h2>
          {applications.length > 0 ? (
            <div className="orders-list">
              {applications.map(({ application, seller }) => (
                <div key={application.id} className="order-card" style={{ cursor: 'default' }}>
                  <div className="order-card-body">
                    <h3 className="order-card-gig-title">{seller.name}</h3>
                    <p style={{ color: '#6b7280', marginBottom: '0.75rem' }}>
                      {application.notes ?? application.motivation ?? 'No extra notes provided.'}
                    </p>
                    <div className="order-card-dates">
                      <span>Status: {application.status}</span>
                      <span>Submitted: {new Date(application.created_at).toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                      <form action={reviewExpertApplicationAction}>
                        <input type="hidden" name="applicationId" value={application.id} />
                        <input type="hidden" name="decision" value="approve" />
                        <button type="submit" className="order-detail-action-btn">
                          Approve
                        </button>
                      </form>
                      <form action={reviewExpertApplicationAction} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <input type="hidden" name="applicationId" value={application.id} />
                        <input type="hidden" name="decision" value="reject" />
                        <input
                          name="rejectionReason"
                          className="auth-input"
                          placeholder="Reason for rejection"
                          style={{ minWidth: 240 }}
                        />
                        <button type="submit" className="order-detail-action-btn order-detail-action-btn--danger">
                          Reject
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="orders-empty">No expert applications waiting right now.</div>
          )}
        </section>

        <section className="order-detail-service-card">
          <h2 className="order-detail-section-title">Gig Review Queue</h2>
          {gigQueue.length > 0 ? (
            <div className="orders-list">
              {gigQueue.map(({ gig, seller, status }) => (
                <div key={gig.id ?? gig.title} className="order-card" style={{ cursor: 'default' }}>
                  <div className="order-card-body">
                    <h3 className="order-card-gig-title">{gig.title}</h3>
                    <div className="order-card-meta">
                      <span className="order-card-package">{seller.name}</span>
                      <span className="order-card-price">{status}</span>
                    </div>
                    <p style={{ color: '#6b7280', marginTop: '0.75rem' }}>
                      {gig.shortDescription}
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                      <form action={reviewGigAction}>
                        <input type="hidden" name="gigId" value={gig.id} />
                        <input type="hidden" name="decision" value="publish" />
                        <button type="submit" className="order-detail-action-btn">
                          Publish
                        </button>
                      </form>
                      <form action={reviewGigAction}>
                        <input type="hidden" name="gigId" value={gig.id} />
                        <input type="hidden" name="decision" value="archive" />
                        <button type="submit" className="order-detail-action-btn order-detail-action-btn--danger">
                          Archive
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="orders-empty">No gigs are waiting for review.</div>
          )}
        </section>
      </div>
    </div>
  );
}
