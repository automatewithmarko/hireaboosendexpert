'use client';

import { useState, useTransition } from 'react';
import { createCustomOfferAction } from '@/lib/marketplace/actions';
import type { Gig } from '@/types';

interface CreateOfferModalProps {
  conversationId: number;
  gigs: Gig[];
  onClose: () => void;
  onCreated: () => void;
}

export function CreateOfferModal({ conversationId, gigs, onClose, onCreated }: CreateOfferModalProps) {
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [deliveryDays, setDeliveryDays] = useState('');
  const [revisions, setRevisions] = useState('1');
  const [gigId, setGigId] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const isValid = description.trim() && Number(price) > 0 && Number(deliveryDays) > 0;

  function handleSubmit() {
    if (!isValid) return;
    setError('');

    startTransition(async () => {
      const result = await createCustomOfferAction({
        conversationId,
        description: description.trim(),
        price: Number(price),
        deliveryDays: Number(deliveryDays),
        revisions: Number(revisions) || 1,
        gigId: gigId ? Number(gigId) : undefined,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      onCreated();
      onClose();
    });
  }

  return (
    <div className="create-offer-overlay" onClick={onClose}>
      <div className="create-offer-modal" onClick={(e) => e.stopPropagation()}>
        <button className="create-offer-close" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <h2 className="create-offer-title">Create Custom Offer</h2>

        <div className="create-offer-field">
          <label className="create-offer-label">Description</label>
          <textarea
            className="create-offer-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what you will deliver..."
            rows={3}
          />
        </div>

        <div className="create-offer-row">
          <div className="create-offer-field">
            <label className="create-offer-label">Price ($)</label>
            <input
              type="number"
              className="create-offer-input"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="50"
              min="5"
            />
          </div>
          <div className="create-offer-field">
            <label className="create-offer-label">Delivery (days)</label>
            <input
              type="number"
              className="create-offer-input"
              value={deliveryDays}
              onChange={(e) => setDeliveryDays(e.target.value)}
              placeholder="3"
              min="1"
            />
          </div>
        </div>

        <div className="create-offer-row">
          <div className="create-offer-field">
            <label className="create-offer-label">Revisions</label>
            <input
              type="number"
              className="create-offer-input"
              value={revisions}
              onChange={(e) => setRevisions(e.target.value)}
              placeholder="1"
              min="0"
            />
          </div>
          {gigs.length > 0 && (
            <div className="create-offer-field">
              <label className="create-offer-label">Link to Gig (optional)</label>
              <select
                className="create-offer-input"
                value={gigId}
                onChange={(e) => setGigId(e.target.value)}
              >
                <option value="">None</option>
                {gigs.map((g) => (
                  <option key={g.id} value={g.id}>{g.title}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {error && <div className="checkout-error">{error}</div>}

        <button
          className="create-offer-submit"
          onClick={handleSubmit}
          disabled={isPending || !isValid}
        >
          {isPending ? 'Sending...' : 'Send Offer'}
        </button>
      </div>
    </div>
  );
}
