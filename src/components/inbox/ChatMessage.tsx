import { OfferCard } from './OfferCard';
import type { ChatMessage as ChatMessageType } from '@/types';

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 8.5l4 4 8-8" />
    </svg>
  );
}

function DoubleCheckIcon() {
  return (
    <svg viewBox="0 0 20 16" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 8.5l4 4 8-8" />
      <path d="M7 8.5l4 4 8-8" />
    </svg>
  );
}

interface ChatMessageProps {
  msg: ChatMessageType;
  viewerIsExpert?: boolean;
  onAcceptOffer?: (offerId: number) => void;
  onWithdrawOffer?: (offerId: number) => void;
  isOfferPending?: boolean;
}

export function ChatMessage({ msg, viewerIsExpert, onAcceptOffer, onWithdrawOffer, isOfferPending }: ChatMessageProps) {
  // System messages
  if (msg.messageType === 'system') {
    return (
      <div className="chat-msg" style={{ justifyContent: 'center' }}>
        <div style={{ fontSize: '0.8rem', color: '#7c8599', fontStyle: 'italic', textAlign: 'center', width: '100%' }}>
          {msg.text}
        </div>
      </div>
    );
  }

  // Custom offer messages
  if (msg.messageType === 'custom_offer' && msg.customOffer) {
    const viewerIsSender = msg.from === 'user';
    return (
      <div className={`chat-msg ${viewerIsSender ? 'sent' : 'received'}`} style={{ background: 'transparent', padding: 0, boxShadow: 'none' }}>
        <OfferCard
          offer={msg.customOffer}
          viewerIsSender={viewerIsSender}
          onAccept={onAcceptOffer}
          onWithdraw={onWithdrawOffer}
          isPending={isOfferPending}
        />
        <div className="chat-msg-time" style={{ marginTop: '0.35rem' }}>{msg.time}</div>
      </div>
    );
  }

  // Regular text messages
  return (
    <div className={`chat-msg ${msg.from === 'user' ? 'sent' : 'received'}`}>
      {msg.text}
      <div className="chat-msg-time">
        {msg.time}
        {msg.from === 'user' && msg.status && (
          <span className={`chat-msg-status ${msg.status}`}>
            {msg.status === 'sending' && <CheckIcon />}
            {msg.status === 'sent' && <DoubleCheckIcon />}
            {msg.status === 'seen' && <DoubleCheckIcon />}
          </span>
        )}
      </div>
    </div>
  );
}
