'use client';

import { useRef, useEffect, useState } from 'react';
import { PlaceholderAvatar } from '@/components/shared/PlaceholderAvatar';
import type { Seller, ChatMessage } from '@/types';

interface ChatPopupProps {
  seller: Seller;
  isOpen: boolean;
  messages: ChatMessage[];
  isTyping: boolean;
  onClose: () => void;
  onSend: (text: string) => void;
}

export function ChatPopup({ seller, isOpen, messages, isTyping, onClose, onSend }: ChatPopupProps) {
  const messagesRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  // Auto-scroll on new messages / typing indicator
  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const lastMsg = messages[messages.length - 1];
    if (distanceFromBottom < 150 || lastMsg?.from === 'user') {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Focus textarea when popup opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }, [inputValue]);

  const handleSend = () => {
    const val = inputValue.trim();
    if (!val) return;
    onSend(val);
    setInputValue('');
  };

  const handleScroll = () => {
    const el = messagesRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBtn(distanceFromBottom > 100);
  };

  const getGroupClass = (msg: ChatMessage, i: number) => {
    const prev = messages[i - 1];
    const next = messages[i + 1];
    const isFirst = !prev || prev.from !== msg.from;
    const isLast = !next || next.from !== msg.from;
    if (isFirst && isLast) return 'chat-msg--solo';
    if (isFirst) return 'chat-msg--first';
    if (isLast) return 'chat-msg--last';
    return 'chat-msg--middle';
  };

  return (
    <div className={`chat-popup${isOpen ? ' active' : ''}`}>
      {/* Header */}
      <div className="chat-popup-header">
        <div className="chat-popup-avatar">
          <PlaceholderAvatar initials={seller.avatar} color={seller.avatarColor} size={44} fontSize="0.9rem" />
          {seller.online && <span className="chat-popup-online-dot" />}
        </div>
        <div className="chat-popup-seller-info">
          <div className="chat-popup-seller-name">{seller.name}</div>
          <div className={`chat-popup-seller-status${seller.online ? ' online' : ''}`}>
            {seller.online ? 'Online' : `Typically responds in ${seller.responseTime}`}
          </div>
        </div>
        <button className="chat-popup-close" onClick={onClose} aria-label="Close chat">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="chat-popup-messages-wrapper">
        <div className="chat-popup-messages" ref={messagesRef} onScroll={handleScroll}>
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`chat-msg ${msg.from === 'user' ? 'sent' : 'received'} ${getGroupClass(msg, i)} chat-msg--enter`}
            >
              {msg.text}
              <div className="chat-msg-time">{msg.time}</div>
            </div>
          ))}
          {isTyping && (
            <div className="chat-msg received chat-msg--solo chat-typing-indicator chat-msg--enter">
              <span className="chat-typing-dot" />
              <span className="chat-typing-dot" />
              <span className="chat-typing-dot" />
            </div>
          )}
        </div>
        {showScrollBtn && (
          <button
            className="chat-popup-scroll-btn"
            onClick={() => messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: 'smooth' })}
            aria-label="Scroll to bottom"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        )}
      </div>

      {/* Input */}
      <div className="chat-popup-input">
        <textarea
          ref={textareaRef}
          className="chat-popup-textarea"
          placeholder="Type a message..."
          rows={1}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button
          className={`chat-send-btn${inputValue.trim() ? ' chat-send-btn--active' : ''}`}
          onClick={handleSend}
          disabled={!inputValue.trim()}
          aria-label="Send message"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2L11 13" />
            <path d="M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
