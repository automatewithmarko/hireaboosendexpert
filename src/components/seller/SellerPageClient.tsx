'use client';

import { useChat } from '@/hooks/useChat';
import { ChatPopup } from './ChatPopup';
import type { Seller } from '@/types';

export function SellerPageClient({ seller }: { seller: Seller }) {
  const { isOpen, openChat, closeChat, messages, sendMessage, isTyping, unreadCount } = useChat(seller);

  return (
    <>
      <button className={`chat-fab${isOpen ? ' chat-fab--hidden' : ''}`} onClick={openChat}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        Contact Seller
        {unreadCount > 0 && (
          <span className="chat-fab-badge">{unreadCount}</span>
        )}
      </button>
      <ChatPopup
        seller={seller}
        isOpen={isOpen}
        messages={messages}
        isTyping={isTyping}
        onClose={closeChat}
        onSend={sendMessage}
      />
    </>
  );
}
