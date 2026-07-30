'use client';

import type { CustomOffer } from '@/types';

interface OfferCardProps {
  offer: CustomOffer;
  /** True when the viewer is the one who sent this offer (can withdraw). False when the viewer received it (can accept). */
  viewerIsSender: boolean;
  onAccept?: (offerId: number) => void;
  onWithdraw?: (offerId: number) => void;
  isPending?: boolean;
}

const STATUS_COPY: Record<string, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  expired: 'Expired',
  withdrawn: 'Withdrawn',
  declined: 'Declined',
};

function formatExpiresIn(expiresAt: string) {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return null;
  const hours = Math.floor(ms / 3_600_000);
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `Expires in ${days}d`;
  }
  if (hours >= 1) return `Expires in ${hours}h`;
  const minutes = Math.max(1, Math.floor(ms / 60_000));
  return `Expires in ${minutes}m`;
}

export function OfferCard({ offer, viewerIsSender, onAccept, onWithdraw, isPending }: OfferCardProps) {
  const isExpired = offer.status === 'pending' && new Date(offer.expiresAt) < new Date();
  const effectiveStatus = isExpired ? 'expired' : offer.status;
  const expiresLabel = effectiveStatus === 'pending' ? formatExpiresIn(offer.expiresAt) : null;

  return (
    <div className={`offer-card offer-card--${effectiveStatus}${viewerIsSender ? ' is-sender' : ' is-recipient'}`}>
      <div className="offer-card-header">
        <div className="offer-card-eyebrow">
          <svg className="offer-card-eyebrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
          </svg>
          <span>Custom Offer</span>
        </div>
        <span className={`offer-card-status offer-card-status--${effectiveStatus}`}>
          <span className="offer-card-status-dot" aria-hidden />
          {STATUS_COPY[effectiveStatus] ?? effectiveStatus}
        </span>
      </div>

      <div className="offer-card-description">{offer.description}</div>

      <div className="offer-card-price-row">
        <div className="offer-card-price">
          <small>USD</small>
          ${offer.price.toLocaleString()}
        </div>
        {expiresLabel && <span className="offer-card-expires">{expiresLabel}</span>}
      </div>

      <dl className="offer-card-meta">
        <div className="offer-card-meta-item">
          <dt>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
            Delivery
          </dt>
          <dd>{offer.deliveryDays} day{offer.deliveryDays !== 1 ? 's' : ''}</dd>
        </div>
        <div className="offer-card-meta-item">
          <dt>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
              <path d="M3 21v-5h5" />
            </svg>
            Revisions
          </dt>
          <dd>{offer.revisions}</dd>
        </div>
      </dl>

      {effectiveStatus === 'pending' && (
        <div className="offer-card-actions">
          {!viewerIsSender && onAccept && (
            <button
              type="button"
              className="offer-card-accept"
              onClick={() => onAccept(offer.id)}
              disabled={isPending}
            >
              {isPending ? (
                'Processing…'
              ) : (
                <>
                  Accept &amp; Pay
                  <span className="offer-card-accept-price">${offer.price.toLocaleString()}</span>
                </>
              )}
            </button>
          )}
          {viewerIsSender && onWithdraw && (
            <button
              type="button"
              className="offer-card-withdraw"
              onClick={() => onWithdraw(offer.id)}
              disabled={isPending}
            >
              {isPending ? 'Withdrawing…' : 'Withdraw offer'}
            </button>
          )}
        </div>
      )}

      {effectiveStatus === 'accepted' && offer.orderId && (
        <div className="offer-card-actions">
          <a href={`/orders/${offer.orderId}`} className="offer-card-accept offer-card-accept--view">
            View order
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      )}
    </div>
  );
}
