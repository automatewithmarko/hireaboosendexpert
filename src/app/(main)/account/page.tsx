import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUserContext } from '@/lib/auth/session';
import {
  getAccountOverview,
  listUnreadNotifications,
} from '@/lib/marketplace/repository';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Account | BooSend Experts',
};

export default async function AccountPage() {
  const { user, marketplace } = await getCurrentUserContext();
  if (!user || !marketplace) {
    redirect('/signin?next=/account');
  }

  const [overview, notifications] = await Promise.all([
    getAccountOverview(marketplace.account.id),
    listUnreadNotifications(marketplace.account.id),
  ]);

  return (
    <div className="orders-page" style={{ maxWidth: 1120, margin: '0 auto' }}>
      <div className="orders-header">
        <h1 className="orders-title">Your Account</h1>
        <p className="orders-subtitle">
          Shared BooSend auth is active. This account works across the main app
          and the expert marketplace.
        </p>
      </div>

      <div className="profile-page-content" style={{ display: 'grid', gap: '1.5rem' }}>
        <section className="order-detail-service-card">
          <h2 className="order-detail-section-title">Profile</h2>
          <div className="order-detail-package-info">
            <div className="order-detail-package-row">
              <span className="order-detail-package-label">Name</span>
              <span className="order-detail-package-value">
                {marketplace.account.full_name ?? user.email}
              </span>
            </div>
            <div className="order-detail-package-row">
              <span className="order-detail-package-label">Email</span>
              <span className="order-detail-package-value">{marketplace.account.email}</span>
            </div>
            <div className="order-detail-package-row">
              <span className="order-detail-package-label">Roles</span>
              <span className="order-detail-package-value">
                {marketplace.roles.join(', ') || 'customer'}
              </span>
            </div>
            <div className="order-detail-package-row">
              <span className="order-detail-package-label">Expert status</span>
              <span className="order-detail-package-value">
                {marketplace.expertProfile?.application_status ?? 'not started'}
              </span>
            </div>
          </div>
        </section>

        <section className="provider-stats">
          <div className="provider-stat">
            <div className="provider-stat-value">{overview.ordersCount}</div>
            <div className="provider-stat-label">Orders</div>
          </div>
          <div className="provider-stat">
            <div className="provider-stat-value">{overview.activeOrdersCount}</div>
            <div className="provider-stat-label">Active Orders</div>
          </div>
          <div className="provider-stat">
            <div className="provider-stat-value">{overview.conversationsCount}</div>
            <div className="provider-stat-label">Conversations</div>
          </div>
          <div className="provider-stat">
            <div className="provider-stat-value">{overview.unreadNotificationsCount}</div>
            <div className="provider-stat-label">Unread Alerts</div>
          </div>
        </section>

        <section className="order-detail-service-card">
          <h2 className="order-detail-section-title">Quick Actions</h2>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <Link href="/orders" className="order-detail-action-btn">
              View Orders
            </Link>
            <Link href="/inbox" className="order-detail-action-btn">
              Open Inbox
            </Link>
            <Link
              href={
                marketplace.expertProfile?.application_status === 'approved'
                  ? '/expert/dashboard'
                  : '/expert/onboarding'
              }
              className="order-detail-action-btn"
            >
              {marketplace.expertProfile ? 'Expert Hub' : 'Become an Expert'}
            </Link>
            {marketplace.isAdmin && (
              <Link href="/admin" className="order-detail-action-btn">
                Admin Panel
              </Link>
            )}
          </div>
        </section>

        <section className="order-detail-service-card">
          <h2 className="order-detail-section-title">Unread Notifications</h2>
          {notifications.length > 0 ? (
            <div className="orders-list">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="order-card"
                  style={{ cursor: 'default' }}
                >
                  <div className="order-card-body">
                    <h3 className="order-card-gig-title">{notification.title}</h3>
                    {notification.body && (
                      <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                        {notification.body}
                      </p>
                    )}
                    <div className="order-card-dates">
                      <span>{new Date(notification.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="orders-empty">You&apos;re all caught up.</div>
          )}
        </section>
      </div>
    </div>
  );
}
