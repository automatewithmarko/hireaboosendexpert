export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-section footer-section--links">
            <h3 className="footer-heading">Links</h3>
            <nav className="footer-nav">
              <a href="#" className="footer-link">Help Center</a>
              <a href="/terms-of-service" className="footer-link">Terms of Service</a>
              <a href="/privacy-policy" className="footer-link">Privacy Policy</a>
              <a href="/affiliate" className="footer-link">Affiliate Program</a>
              <a href="/blog" className="footer-link">Blog</a>
            </nav>
          </div>
          <div className="footer-section footer-section--center">
            <div className="footer-logo-wrapper">
              <div className="footer-logo-float">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://i.postimg.cc/NGngYQTW/image.png" alt="BooSend Logo" className="footer-logo" loading="lazy" />
              </div>
            </div>
            <div className="footer-brand">
              <p className="footer-brand-text">
                <span className="footer-brand-name">BooSend</span>
                <span className="footer-brand-built"> built by </span>
                <a href="https://thementorprogram.xyz" target="_blank" rel="noopener noreferrer" className="footer-brand-mentor">MENTOR AI</a>
              </p>
            </div>
            <div className="footer-meta-badge">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/MetaTechProvider.png" alt="Meta Tech Provider" className="footer-meta-image" loading="lazy" />
            </div>
          </div>
          <div className="footer-section footer-section--contact">
            <h3 className="footer-heading">Contact</h3>
            <nav className="footer-nav">
              <a href="mailto:support@boosend.ai" className="footer-link">Send Us An Email</a>
              <a href="https://t.me/+a4K8YuuAfA41ZDcx" target="_blank" rel="noopener noreferrer" className="footer-link">Telegram Community</a>
              <a href="https://nas.io/boosend" target="_blank" rel="noopener noreferrer" className="footer-link">Community</a>
            </nav>
            <div className="footer-social">
              <a href="https://instagram.com/boosend.ai" target="_blank" rel="noopener noreferrer" className="footer-social-link footer-social-link--instagram" aria-label="Instagram">
                <svg className="footer-social-icon" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a href="https://nas.io/boosend" target="_blank" rel="noopener noreferrer" className="footer-social-link footer-social-link--nas" aria-label="Nas.io">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logos/nas.jpeg" alt="Nas.io" className="footer-social-img" />
              </a>
              <a href="https://www.linkedin.com/company/boosend/" target="_blank" rel="noopener noreferrer" className="footer-social-link footer-social-link--linkedin" aria-label="LinkedIn">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logos/LinkedIn_logo_square.png" alt="LinkedIn" className="footer-social-img" />
              </a>
              <a href="https://instagram.com/automatewithmarko" target="_blank" rel="noopener noreferrer" className="footer-social-link footer-social-link--marko" aria-label="Marko">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logos/marko.jpg" alt="Marko" className="footer-social-img" />
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p className="footer-copyright">&copy; 2026 BooSend. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
