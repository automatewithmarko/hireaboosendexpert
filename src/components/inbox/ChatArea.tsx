import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { PlaceholderAvatar } from '@/components/shared/PlaceholderAvatar';
import { ChatMessage } from './ChatMessage';
import type { Seller, ChatMessage as ChatMessageType } from '@/types';

interface ChatAreaProps {
  seller: Seller;
  messages: ChatMessageType[];
  onSend: (text: string) => void;
}

export function ChatArea({ seller, messages, onSend }: ChatAreaProps) {
  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    const val = inputRef.current?.value.trim();
    if (!val) return;
    onSend(val);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="inbox-chat">
      <div className="inbox-chat-header">
        <div className="inbox-chat-avatar">
          <PlaceholderAvatar initials={seller.avatar} color={seller.avatarColor} size={40} fontSize="0.9rem" />
        </div>
        <div>
          <div className="inbox-chat-seller-name">{seller.name}</div>
          <div className={`inbox-chat-seller-status${seller.online ? ' online' : ''}`}>
            {seller.online ? 'Online' : 'Last seen recently'}
          </div>
        </div>
        <Link href={`/listing/${seller.id}`} className="inbox-chat-link">
          View Profile &rarr;
        </Link>
      </div>
      <div className="inbox-chat-messages" ref={messagesRef}>
        {messages.map((msg, i) => (
          <ChatMessage key={i} msg={msg} />
        ))}
      </div>
      <div className="inbox-chat-input">
        <input
          ref={inputRef}
          type="text"
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button className="chat-send-btn" onClick={handleSend}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2L11 13" />
            <path d="M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
