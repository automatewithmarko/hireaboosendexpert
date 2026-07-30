'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import type { AccountRole, AppNotification, ExpertApplicationStatus } from '@/types';
import { NotificationBell } from '@/components/notifications/NotificationBell';

interface NavbarViewer {
  name: string;
  email: string;
  roles: AccountRole[];
  expertStatus: ExpertApplicationStatus | null;
  isAdmin: boolean;
  accountId: string;
  initialUnreadCount: number;
  initialNotifications: AppNotification[];
}

interface NavbarProps {
  viewer: NavbarViewer | null;
}

export function Navbar({ viewer }: NavbarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isExpert =
    viewer?.roles.includes('expert') ||
    viewer?.expertStatus === 'submitted' ||
    viewer?.expertStatus === 'under_review' ||
    viewer?.expertStatus === 'approved';
  const expertHref = viewer?.expertStatus === 'approved'
    ? '/expert/dashboard'
    : '/expert/onboarding';

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="navbar-brand">
          <Image src="/logo.png" alt="BooSend" className="navbar-logo" width={28} height={28} />
          <div className="navbar-brand-text">BooSend<span>Experts</span></div>
        </Link>

        <div className="navbar-nav">
          <Link href="/inbox" className={`nav-link${pathname === '/inbox' ? ' active' : ''}`}>Inbox</Link>
          <Link href="/orders" className={`nav-link${pathname.startsWith('/orders') ? ' active' : ''}`}>Your Orders</Link>
          <Link
            href={viewer ? expertHref : '/become-an-expert'}
            className={`nav-link${pathname.startsWith('/expert') ? ' active' : ''}`}
          >
            {isExpert ? 'Expert Hub' : 'Become a Seller'}
          </Link>
          {viewer && (
            <NotificationBell
              accountId={viewer.accountId}
              initialNotifications={viewer.initialNotifications}
              initialUnreadCount={viewer.initialUnreadCount}
            />
          )}
          <div className="navbar-signin-wrap">
            <button className="navbar-cta">
              {viewer ? viewer.name.split(' ')[0] : 'Sign In'}
              <svg className="navbar-cta-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            <div className="navbar-signin-dropdown">
              {viewer ? (
                <>
                  <Link href="/account" className="navbar-signin-option">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <div>
                      <span className="navbar-signin-option-title">Your Account</span>
                      <span className="navbar-signin-option-desc">{viewer.email}</span>
                    </div>
                  </Link>
                  <Link href={expertHref} className="navbar-signin-option">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <div>
                      <span className="navbar-signin-option-title">Expert Dashboard</span>
                      <span className="navbar-signin-option-desc">
                        {viewer.expertStatus === 'approved'
                          ? 'Manage gigs and orders'
                          : 'Complete onboarding'}
                      </span>
                    </div>
                  </Link>
                  {viewer.isAdmin && (
                    <Link href="/admin" className="navbar-signin-option">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                      <div>
                        <span className="navbar-signin-option-title">Admin</span>
                        <span className="navbar-signin-option-desc">Review experts and gigs</span>
                      </div>
                    </Link>
                  )}
                  <Link href="/auth/logout" className="navbar-signin-option">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                      <path d="M16 17l5-5-5-5" />
                      <path d="M21 12H9" />
                    </svg>
                    <div>
                      <span className="navbar-signin-option-title">Sign Out</span>
                      <span className="navbar-signin-option-desc">End your BooSend session</span>
                    </div>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/signin" className="navbar-signin-option">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <div>
                      <span className="navbar-signin-option-title">Sign in as Customer</span>
                      <span className="navbar-signin-option-desc">Browse and hire experts</span>
                    </div>
                  </Link>
                  <Link href="/become-an-expert" className="navbar-signin-option">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <div>
                      <span className="navbar-signin-option-title">Sign in as Expert</span>
                      <span className="navbar-signin-option-desc">Build automations &amp; earn</span>
                    </div>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        <div
          className={`navbar-toggle${mobileOpen ? ' open' : ''}`}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </nav>
  );
}
