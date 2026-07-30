import { PlaceholderAvatar } from '@/components/shared/PlaceholderAvatar';
import type { Seller, Conversation } from '@/types';

interface ConversationItemProps {
  conversation: Conversation;
  seller: Seller;
  active: boolean;
  onClick: () => void;
}

export function ConversationItem({ conversation, seller, active, onClick }: ConversationItemProps) {
  return (
    <button
      type="button"
      className={`inbox-conversation${active ? ' active' : ''}${conversation.unread ? ' is-unread' : ''}`}
      onClick={onClick}
      aria-current={active ? 'true' : undefined}
    >
      <div className="inbox-conv-avatar">
        <PlaceholderAvatar initials={seller.avatar} color={seller.avatarColor} size={44} fontSize="0.9rem" />
        {seller.online && <span className="inbox-conv-presence" aria-label="Online" />}
      </div>
      <div className="inbox-conv-info">
        <div className="inbox-conv-top">
          <span className="inbox-conv-name">{seller.name}</span>
          <span className="inbox-conv-time">{conversation.time}</span>
        </div>
        <div className="inbox-conv-bottom">
          <div className="inbox-conv-preview">{conversation.lastMessage}</div>
          {conversation.unread && (
            <span className="inbox-conv-unread-badge" aria-label="Unread">1</span>
          )}
        </div>
      </div>
    </button>
  );
}
