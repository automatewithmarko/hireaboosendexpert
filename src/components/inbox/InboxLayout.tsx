'use client';

import { useState, useCallback } from 'react';
import { ConversationSidebar } from './ConversationSidebar';
import { ChatArea } from './ChatArea';
import { getSellerById } from '@/lib/sellers';
import { autoReplies } from '@/data/constants';
import { initialConversations } from '@/data/conversations';
import type { Conversation } from '@/types';

export function InboxLayout() {
  const [conversations, setConversations] = useState<Conversation[]>(() =>
    initialConversations.map((c) => ({ ...c, messages: [...c.messages] }))
  );
  const [activeIndex, setActiveIndex] = useState(0);

  const handleSelect = useCallback((index: number) => {
    setActiveIndex(index);
    setConversations((prev) =>
      prev.map((c, i) => (i === index ? { ...c, unread: false } : c))
    );
  }, []);

  const handleSend = useCallback((text: string) => {
    const newMsg = { from: 'user' as const, text, time: 'Just now' };

    setConversations((prev) =>
      prev.map((c, i) =>
        i === activeIndex
          ? { ...c, messages: [...c.messages, newMsg], lastMessage: text, time: 'Just now' }
          : c
      )
    );

    // Auto-reply after 1.5s
    setTimeout(() => {
      const reply = autoReplies[Math.floor(Math.random() * autoReplies.length)];
      const replyMsg = { from: 'seller' as const, text: reply, time: 'Just now' };

      setConversations((prev) =>
        prev.map((c, i) =>
          i === activeIndex
            ? { ...c, messages: [...c.messages, replyMsg], lastMessage: reply }
            : c
        )
      );
    }, 1500);
  }, [activeIndex]);

  const activeConv = conversations[activeIndex];
  const activeSeller = activeConv ? getSellerById(activeConv.sellerId) : undefined;

  return (
    <div className="inbox-layout">
      <ConversationSidebar
        conversations={conversations}
        activeIndex={activeIndex}
        onSelect={handleSelect}
      />
      {activeSeller && activeConv && (
        <ChatArea
          seller={activeSeller}
          messages={activeConv.messages}
          onSend={handleSend}
        />
      )}
    </div>
  );
}
