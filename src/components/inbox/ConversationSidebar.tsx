import { ConversationItem } from './ConversationItem';
import { getSellerById } from '@/lib/sellers';
import type { Conversation } from '@/types';

interface ConversationSidebarProps {
  conversations: Conversation[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

export function ConversationSidebar({ conversations, activeIndex, onSelect }: ConversationSidebarProps) {
  return (
    <div className="inbox-sidebar">
      <div className="inbox-sidebar-header">
        <h2>Messages</h2>
        <div className="inbox-sidebar-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input type="text" placeholder="Search conversations..." />
        </div>
      </div>
      <div className="inbox-conversations">
        {conversations.map((conv, i) => {
          const seller = getSellerById(conv.sellerId);
          if (!seller) return null;
          return (
            <ConversationItem
              key={conv.sellerId}
              conversation={conv}
              seller={seller}
              active={i === activeIndex}
              onClick={() => onSelect(i)}
            />
          );
        })}
      </div>
    </div>
  );
}
