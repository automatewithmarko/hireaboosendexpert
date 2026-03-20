'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      if (!email.trim()) {
        setError('Please enter your email');
        return;
      }
      if (!password) {
        setError('Please enter your password');
        return;
      }

      setLoading(true);
      // Mock sign-in — redirect to home after brief delay
      setTimeout(() => {
        router.push('/');
      }, 800);
    },
    [email, password, router],
  );

  const handleGoogleSignIn = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      router.push('/');
    }, 800);
  }, [router]);

  return (
    <div className="signin-page">
      {/* Left Panel — Black */}
      <div className="signin-left">
        <div className="signin-left-content">
          <div className="signin-left-header">
            <Image src="/logo.png" alt="BooSend" width={52} height={52} className="signin-logo" />
            <div className="signin-logo-text">
              BooSend<span>Experts</span>
            </div>
          </div>

          <h1 className="signin-left-headline">
            Build. Certify.<br />Earn.
          </h1>
          <p className="signin-left-subheadline">
            Join the marketplace where automation builders thrive.
          </p>

          <div className="signin-cards">
            <div className="signin-card">
              <div className="signin-card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                </svg>
              </div>
              <div className="signin-card-body">
                <h3>Earn Money Building Automations</h3>
                <p>Set your own rates, pick your projects, and earn by building automations for businesses worldwide. Top builders earn $5,000+/month.</p>
              </div>
            </div>

            <div className="signin-card">
              <div className="signin-card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M9 12l2 2 4-4" />
                  <path d="M12 2a10 10 0 110 20 10 10 0 010-20z" />
                </svg>
              </div>
              <div className="signin-card-body">
                <h3>Get AI Certified</h3>
                <p>Our AI evaluation system tests your skills and certifies you as a verified builder. Stand out with a trusted badge that clients recognize.</p>
              </div>
            </div>

            <div className="signin-card">
              <div className="signin-card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                </svg>
              </div>
              <div className="signin-card-body">
                <h3>Join a Growing Network</h3>
                <p>Be part of an exclusive community of certified automation experts. Access resources, collaborate on projects, and grow your reputation.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — White */}
      <div className="signin-right">
        <div className="signin-right-content">
          <h2 className="signin-right-title">Sign In To Become A Builder</h2>
          <p className="signin-right-subtitle">Use your BooSend account to get started</p>

          {error && (
            <div className="signin-error">{error}</div>
          )}

          <form className="signin-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="signin-email" className="auth-label">Email</label>
              <input
                type="email"
                id="signin-email"
                className="auth-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="signin-password" className="auth-label">Password</label>
              <input
                type="password"
                id="signin-password"
                className="auth-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Please wait...' : 'Sign In'}
            </button>

            <div className="auth-social">
              <button type="button" className="auth-social-btn" onClick={handleGoogleSignIn} disabled={loading}>
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Sign In With Google</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
