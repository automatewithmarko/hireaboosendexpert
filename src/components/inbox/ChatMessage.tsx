import type { ChatMessage as ChatMessageType } from '@/types';

export function ChatMessage({ msg }: { msg: ChatMessageType }) {
  return (
    <div className={`chat-msg ${msg.from === 'user' ? 'sent' : 'received'}`}>
      {msg.text}
      <div className="chat-msg-time">{msg.time}</div>
    </div>
  );
}
