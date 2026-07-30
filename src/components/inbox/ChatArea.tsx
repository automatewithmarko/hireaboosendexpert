'use client';

import { useRef, useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { PlaceholderAvatar } from '@/components/shared/PlaceholderAvatar';
import { ChatMessage } from './ChatMessage';
import { CreateOfferModal } from './CreateOfferModal';
import type { Seller, ChatMessage as ChatMessageType, Gig } from '@/types';

interface ChatAreaProps {
  seller: Seller;
  messages: ChatMessageType[];
  onSend: (text: string) => void;
  isSending: boolean;
  viewerIsExpert?: boolean;
  conversationId?: number;
  viewerGigs?: Gig[];
  onAcceptOffer?: (offerId: number) => void;
  onWithdrawOffer?: (offerId: number) => void;
  isOfferPending?: boolean;
}

const MAX_TEXTAREA_HEIGHT = 140;

function groupByDay(messages: ChatMessageType[]) {
  const groups: { day: string; items: ChatMessageType[] }[] = [];
  for (const msg of messages) {
    const day = (msg.time || '').includes('Just now') ? 'Today' : 'Earlier';
    const last = groups[groups.length - 1];
    if (last && last.day === day) {
      last.items.push(msg);
    } else {
      groups.push({ day, items: [msg] });
    }
  }
  return groups;
}

export function ChatArea({
  seller,
  messages,
  onSend,
  isSending,
  viewerIsExpert,
  conversationId,
  viewerGigs,
  onAcceptOffer,
  onWithdrawOffer,
  isOfferPending,
}: ChatAreaProps) {
  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const canViewProfile = seller.id > 0;
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-grow textarea
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT) + 'px';
  }, [draft]);

  const handleSend = () => {
    const val = draft.trim();
    if (!val) return;
    onSend(val);
    setDraft('');
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const groups = useMemo(() => groupByDay(messages), [messages]);
  const canSend = draft.trim().length > 0 && !isSending;

  return (
    <div className="inbox-chat">
      <div className="inbox-chat-header">
        <div className={`inbox-chat-avatar${seller.online ? ' is-online' : ''}`}>
          <PlaceholderAvatar initials={seller.avatar} color={seller.avatarColor} size={42} fontSize="0.95rem" />
        </div>
        <div className="inbox-chat-header-info">
          <div className="inbox-chat-seller-name">{seller.name}</div>
          <div className={`inbox-chat-seller-status${seller.online ? ' online' : ''}`}>
            {seller.online ? 'Online now' : 'Last seen recently'}
          </div>
        </div>
        <div className="inbox-chat-actions">
          {canViewProfile && (
            <Link
              href={`/listing/${seller.id}`}
              className="inbox-chat-action-btn"
              title="View profile"
              aria-label="View profile"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="3.5" />
                <path d="M5 20a7 7 0 0 1 14 0" />
              </svg>
              <span>Profile</span>
            </Link>
          )}
          <button
            type="button"
            className="inbox-chat-action-icon"
            title="More options"
            aria-label="More options"
            onClick={(e) => e.preventDefault()}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <circle cx="5" cy="12" r="1.6" />
              <circle cx="12" cy="12" r="1.6" />
              <circle cx="19" cy="12" r="1.6" />
            </svg>
          </button>
        </div>
      </div>

      <div className="inbox-chat-messages" ref={messagesRef}>
        {messages.length === 0 ? (
          <div className="inbox-chat-empty">
            <div className="inbox-chat-empty-icon" aria-hidden>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div className="inbox-chat-empty-title">Start the conversation</div>
            <div className="inbox-chat-empty-desc">
              Say hi to {seller.name.split(' ')[0]} — most experts reply in under an hour.
            </div>
          </div>
        ) : (
          groups.map((group, gi) => (
            <div key={gi} className="inbox-chat-day-group">
              <div className="inbox-chat-day-divider">
                <span>{group.day}</span>
              </div>
              {group.items.map((msg, i) => (
                <ChatMessage
                  key={msg.id ?? `${gi}-${i}`}
                  msg={msg}
                  viewerIsExpert={viewerIsExpert}
                  onAcceptOffer={onAcceptOffer}
                  onWithdrawOffer={onWithdrawOffer}
                  isOfferPending={isOfferPending}
                />
              ))}
            </div>
          ))
        )}
      </div>

      <div className="inbox-chat-composer">
        <div className="inbox-chat-composer-toolbar">
          <button
            type="button"
            className="composer-tool-btn"
            title="Attach file"
            aria-label="Attach file"
            onClick={(e) => e.preventDefault()}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
          </button>
          {viewerIsExpert && conversationId && (
            <button
              type="button"
              className="composer-tool-btn composer-tool-btn--accent"
              onClick={() => setShowOfferModal(true)}
              title="Send a custom offer"
              aria-label="Send a custom offer"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
              <span>Offer</span>
            </button>
          )}
        </div>
        <div className="inbox-chat-composer-field">
          <textarea
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${seller.name.split(' ')[0]}…`}
            rows={1}
            aria-label="Type a message"
          />
        </div>
        <button
          type="button"
          className={`chat-send-btn${canSend ? ' is-active' : ''}`}
          onClick={handleSend}
          disabled={!canSend}
          aria-label="Send message"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2L11 13" />
            <path d="M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </button>
      </div>
      <div className="inbox-chat-composer-hint">
        <span>
          <kbd>Enter</kbd> to send · <kbd>Shift</kbd>+<kbd>Enter</kbd> for new line
        </span>
        {isSending && <span className="inbox-chat-sending">Sending…</span>}
      </div>

      {showOfferModal && conversationId && (
        <CreateOfferModal
          conversationId={conversationId}
          gigs={viewerGigs ?? []}
          onClose={() => setShowOfferModal(false)}
          onCreated={() => {}}
        />
      )}
    </div>
  );
}
