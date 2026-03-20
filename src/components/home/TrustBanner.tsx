export function TrustBanner() {
  return (
    <div className="trust-banner">
      <div className="trust-item">
        <div className="trust-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <h3>Verified Experts</h3>
        <p>Every seller is vetted and verified on the BooSend platform.</p>
      </div>
      <div className="trust-item">
        <div className="trust-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        </div>
        <h3>24/7 Support</h3>
        <p>Our team is here to help you find the perfect automation.</p>
      </div>
      <div className="trust-item">
        <div className="trust-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <path d="M2 10h20" />
          </svg>
        </div>
        <h3>Secure Payments</h3>
        <p>Pay safely. Funds are released only when you approve.</p>
      </div>
      <div className="trust-item">
        <div className="trust-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <path d="m9 11 3 3L22 4" />
          </svg>
        </div>
        <h3>Satisfaction Guaranteed</h3>
        <p>Not happy? Get your money back. Simple as that.</p>
      </div>
    </div>
  );
}
