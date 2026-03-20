'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { ChatMessage, Seller } from '@/types';
import { autoReplies } from '@/data/constants';

export function useChat(seller: Seller) {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      from: 'seller',
      text: `Hi there! I'm ${seller.name}. Thanks for checking out my services. How can I help you today?`,
      time: 'Just now',
    },
  ]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const isOpenRef = useRef(isOpen);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  const openChat = useCallback(() => {
    setIsOpen(true);
    setUnreadCount(0);
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  const sendMessage = useCallback((text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { from: 'user', text, time: 'Just now' }]);
    setIsTyping(true);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      const reply = autoReplies[Math.floor(Math.random() * autoReplies.length)];
      setMessages((prev) => [...prev, { from: 'seller', text: reply, time: 'Just now' }]);

      if (!isOpenRef.current) {
        setUnreadCount((prev) => prev + 1);
      }
    }, 1200);
  }, []);

  return { isOpen, openChat, closeChat, messages, sendMessage, isTyping, unreadCount };
}
