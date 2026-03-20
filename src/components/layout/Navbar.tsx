'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

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
          <Link href="/become-an-expert" className="nav-link">Become a Seller</Link>
          <div className="navbar-signin-wrap">
            <button className="navbar-cta">
              Sign In
              <svg className="navbar-cta-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            <div className="navbar-signin-dropdown">
              <Link href="/signin" className="navbar-signin-option">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4-4v2" />
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
