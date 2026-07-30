'use client';

import { useState, useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { PlaceholderImage } from '@/components/shared/PlaceholderImage';
import { placeOrderAction } from '@/lib/marketplace/actions';
import type { Gig, Package, Seller } from '@/types';

interface CheckoutClientProps {
  gig: Gig;
  seller: Seller;
  packages: Package[];
  selectedPackageId: number;
}

export function CheckoutClient({ gig, seller, packages, selectedPackageId }: CheckoutClientProps) {
  const router = useRouter();
  const [selectedPkgId, setSelectedPkgId] = useState(selectedPackageId);
  const [notes, setNotes] = useState('');
  const [stage, setStage] = useState<'idle' | 'processing' | 'success'>('idle');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const selectedPkg = packages.find((p) => p.id === selectedPkgId) ?? packages[0];
  const serviceFee = Math.round((selectedPkg?.price ?? 0) * 0.1);
  const total = (selectedPkg?.price ?? 0) + serviceFee;

  const handlePay = useCallback(() => {
    if (!selectedPkg?.id || !gig.id) return;
    setError('');
    setStage('processing');

    startTransition(async () => {
      const result = await placeOrderAction({
        gigId: gig.id!,
        packageId: selectedPkg.id!,
        notes,
      });

      if (result.error) {
        setError(result.error);
        setStage('idle');
        return;
      }

      setStage('success');
      setTimeout(() => {
        router.push(`/orders/${result.orderId}`);
      }, 2000);
    });
  }, [selectedPkg, gig.id, notes, router]);

  if (stage === 'processing') {
    return (
      <div className="checkout-page">
        <div className="checkout-processing">
          <div className="checkout-spinner" />
          <div className="checkout-processing-text">Processing your payment...</div>
        </div>
      </div>
    );
  }

  if (stage === 'success') {
    return (
      <div className="checkout-page">
        <div className="checkout-success">
          <div className="checkout-success-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 12l5 5L20 7" />
            </svg>
          </div>
          <div className="checkout-success-title">Payment Successful!</div>
          <div className="checkout-success-text">
            Your order has been created. Redirecting to order details...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-header">
        <h1 className="checkout-title">Checkout</h1>
        <p className="checkout-subtitle">Review your order and complete payment</p>
      </div>

      {error && <div className="checkout-error">{error}</div>}

      <div className="checkout-layout">
        <div className="checkout-main">
          {/* Gig Preview */}
          <div className="checkout-card">
            <div className="checkout-gig-preview">
              <div className="checkout-gig-image">
                <PlaceholderImage gradient={gig.gradient} imageUrl={gig.imageUrl} alt={gig.title} />
              </div>
              <div className="checkout-gig-info">
                <div className="checkout-gig-title">{gig.title}</div>
                <div className="checkout-gig-seller">by {seller.name}</div>
              </div>
            </div>

            <div className="checkout-card-title">Select Package</div>
            <div className="checkout-package-select">
              {packages.map((pkg) => (
                <label
                  key={pkg.id}
                  className={`checkout-package-option${pkg.id === selectedPkgId ? ' selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="package"
                    checked={pkg.id === selectedPkgId}
                    onChange={() => setSelectedPkgId(pkg.id!)}
                  />
                  <div style={{ flex: 1 }}>
                    <div className="checkout-package-name">{pkg.name}</div>
                    <div className="checkout-package-delivery">{pkg.delivery} delivery</div>
                  </div>
                  <span className="checkout-package-price">${pkg.price}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Project Notes */}
          <div className="checkout-card">
            <div className="checkout-card-title">Project Notes</div>
            <textarea
              className="checkout-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Share your goals, assets, timeline, and anything the expert should know before starting."
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="checkout-sidebar">
          <div className="checkout-summary">
            <div className="checkout-summary-title">Order Summary</div>
            <div className="checkout-summary-rows">
              <div className="checkout-summary-row">
                <span>{selectedPkg?.name}</span>
                <span>${selectedPkg?.price ?? 0}</span>
              </div>
              <div className="checkout-summary-row">
                <span>Service Fee</span>
                <span>${serviceFee}</span>
              </div>
            </div>
            <div className="checkout-summary-total">
              <span>Total</span>
              <span>${total}</span>
            </div>

            <div className="checkout-payment-method">
              <div className="checkout-payment-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 12V7H5a2 2 0 010-4h14v4" />
                  <path d="M3 5v14a2 2 0 002 2h16v-5" />
                  <path d="M18 12a2 2 0 000 4h4v-4h-4z" />
                </svg>
              </div>
              <div>
                <div className="checkout-payment-label">BooSend Wallet</div>
                <div className="checkout-payment-desc">Instant payment</div>
              </div>
            </div>
          </div>

          <button
            className="checkout-pay-btn"
            onClick={handlePay}
            disabled={isPending || !selectedPkg}
          >
            Pay ${total}
          </button>
        </div>
      </div>
    </div>
  );
}
