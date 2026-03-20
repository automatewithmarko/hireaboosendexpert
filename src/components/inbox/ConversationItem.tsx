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
    <div className={`inbox-conversation${active ? ' active' : ''}`} onClick={onClick}>
      <div className="inbox-conv-avatar">
        <PlaceholderAvatar initials={seller.avatar} color={seller.avatarColor} size={44} fontSize="0.9rem" />
      </div>
      <div className="inbox-conv-info">
        <div className="inbox-conv-top">
          <span className="inbox-conv-name">{seller.name}</span>
          <span className="inbox-conv-time">{conversation.time}</span>
        </div>
        <div className="inbox-conv-preview">{conversation.lastMessage}</div>
      </div>
      {conversation.unread && <div className="inbox-conv-unread" />}
    </div>
  );
}
