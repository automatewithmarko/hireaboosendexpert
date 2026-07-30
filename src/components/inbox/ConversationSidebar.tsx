'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ConversationItem } from './ConversationItem';
import type { ConversationWithSeller } from '@/types';

interface ConversationSidebarProps {
  conversations: ConversationWithSeller[];
  activeConversationId: number | null;
  onSelect: (conversationId: number) => void;
}

type Filter = 'all' | 'unread';

export function ConversationSidebar({
  conversations,
  activeConversationId,
  onSelect,
}: ConversationSidebarProps) {
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  // ⌘K / Ctrl+K to focus search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const unreadCount = conversations.filter((c) => c.conversation.unread).length;

  const visibleConversations = useMemo(() => {
    let list = conversations;
    if (filter === 'unread') list = list.filter((c) => c.conversation.unread);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        ({ seller, conversation }) =>
          seller.name.toLowerCase().includes(q) ||
          conversation.lastMessage?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [conversations, filter, query]);

  return (
    <div className="inbox-sidebar">
      <div className="inbox-sidebar-header">
        <div className="inbox-sidebar-title-row">
          <h2>Messages</h2>
          {unreadCount > 0 && (
            <span className="inbox-sidebar-unread-count" aria-label={`${unreadCount} unread`}>
              {unreadCount}
            </span>
          )}
        </div>
        <div className="inbox-sidebar-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            ref={searchRef}
            type="text"
            placeholder="Search conversations…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search conversations"
          />
          <kbd className="inbox-sidebar-search-kbd" aria-hidden>⌘K</kbd>
        </div>

        <div className="inbox-sidebar-tabs" role="tablist">
          <button
            role="tab"
            aria-selected={filter === 'all'}
            className={`inbox-sidebar-tab${filter === 'all' ? ' active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
            <span className="inbox-sidebar-tab-count">{conversations.length}</span>
          </button>
          <button
            role="tab"
            aria-selected={filter === 'unread'}
            className={`inbox-sidebar-tab${filter === 'unread' ? ' active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            Unread
            {unreadCount > 0 && <span className="inbox-sidebar-tab-count">{unreadCount}</span>}
          </button>
        </div>
      </div>

      <div className="inbox-conversations">
        {visibleConversations.length === 0 ? (
          <div className="inbox-conversations-empty">
            <div className="inbox-conversations-empty-icon" aria-hidden>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div className="inbox-conversations-empty-title">
              {query.trim()
                ? 'No matches'
                : filter === 'unread'
                  ? 'No unread messages'
                  : 'No conversations yet'}
            </div>
            <div className="inbox-conversations-empty-desc">
              {query.trim()
                ? 'Try a different search term.'
                : filter === 'unread'
                  ? "You're all caught up."
                  : "Visit an expert's profile to start a conversation."}
            </div>
          </div>
        ) : (
          visibleConversations.map(({ conversation, seller }) => (
            <ConversationItem
              key={conversation.id ?? seller.id}
              conversation={conversation}
              seller={seller}
              active={conversation.id === activeConversationId}
              onClick={() => onSelect(conversation.id ?? 0)}
            />
          ))
        )}
      </div>
    </div>
  );
}
