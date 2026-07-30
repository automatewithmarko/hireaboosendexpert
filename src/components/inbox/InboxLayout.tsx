'use client';

import { useState, useCallback, useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ConversationSidebar } from './ConversationSidebar';
import { ChatArea } from './ChatArea';
import {
  sendConversationMessageAction,
  markConversationReadAction,
  acceptCustomOfferAction,
  withdrawCustomOfferAction,
} from '@/lib/marketplace/actions';
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';
import type { ConversationWithSeller, Gig } from '@/types';

interface InboxLayoutProps {
  initialConversations: ConversationWithSeller[];
  initialConversationId: number | null;
  viewerAccountId: string;
  viewerIsExpert?: boolean;
  viewerGigs?: Gig[];
}

export function InboxLayout({
  initialConversations,
  initialConversationId,
  viewerAccountId,
  viewerIsExpert,
  viewerGigs,
}: InboxLayoutProps) {
  const router = useRouter();
  const [conversations, setConversations] = useState<ConversationWithSeller[]>(() =>
    initialConversations.map(({ conversation, seller }) => ({
      seller,
      conversation: {
        ...conversation,
        messages: [...conversation.messages],
      },
    })),
  );
  const [activeConversationId, setActiveConversationId] = useState<number | null>(
    initialConversationId ?? initialConversations[0]?.conversation.id ?? null,
  );
  const [actionError, setActionError] = useState('');
  const [isSending, startTransition] = useTransition();
  const [isOfferPending, startOfferTransition] = useTransition();

  const conversationIds = useMemo(
    () => conversations.map(({ conversation }) => conversation.id).filter(Boolean) as number[],
    [conversations],
  );

  const activeThread = useMemo(
    () =>
      conversations.find(
        ({ conversation }) => conversation.id === activeConversationId,
      ) ?? conversations[0],
    [activeConversationId, conversations],
  );

  useRealtimeMessages({
    conversationIds,
    viewerAccountId,
    onNewMessage: useCallback((msg) => {
      setConversations((prev) => {
        const updated = prev.map((thread) => {
          if (thread.conversation.id !== msg.conversationId) return thread;

          const isActive = thread.conversation.id === activeConversationId;
          const newMsg = {
            id: msg.id,
            senderAccountId: msg.senderAccountId,
            from: 'seller' as const,
            text: msg.body,
            time: 'Just now',
          };

          if (isActive) {
            markConversationReadAction(msg.conversationId).catch(() => {});
          }

          return {
            ...thread,
            conversation: {
              ...thread.conversation,
              lastMessage: msg.body,
              time: 'Just now',
              unread: !isActive,
              messages: [...thread.conversation.messages, newMsg],
            },
          };
        });

        return updated.sort((a, b) => {
          if (a.conversation.time === 'Just now') return -1;
          if (b.conversation.time === 'Just now') return 1;
          return 0;
        });
      });
    }, [activeConversationId]),
    onReadUpdate: useCallback((conversationId, _accountId, lastReadMessageId) => {
      setConversations((prev) =>
        prev.map((thread) => {
          if (thread.conversation.id !== conversationId) return thread;
          return {
            ...thread,
            conversation: {
              ...thread.conversation,
              otherLastReadMessageId: lastReadMessageId,
              messages: thread.conversation.messages.map((msg) => {
                if (msg.from !== 'user' || !msg.id) return msg;
                return {
                  ...msg,
                  status: msg.id <= lastReadMessageId ? 'seen' as const : msg.status,
                };
              }),
            },
          };
        }),
      );
    }, []),
  });

  const handleSelect = useCallback((conversationId: number) => {
    if (!conversationId) return;

    setActiveConversationId(conversationId);
    setConversations((prev) =>
      prev.map((thread) =>
        thread.conversation.id === conversationId
          ? {
              ...thread,
              conversation: {
                ...thread.conversation,
                unread: false,
              },
            }
          : thread,
      ),
    );
    markConversationReadAction(conversationId).catch(() => {});
    router.replace(`/inbox?conversation=${conversationId}`);
  }, [router]);

  const handleSend = useCallback((text: string) => {
    if (!activeThread?.conversation.id) {
      return;
    }

    setActionError('');
    const optimisticMessage = {
      id: -Date.now(),
      senderAccountId: viewerAccountId,
      from: 'user' as const,
      text,
      time: 'Just now',
      status: 'sending' as const,
    };

    setConversations((prev) =>
      prev.map((thread) =>
        thread.conversation.id === activeThread.conversation.id
          ? {
              ...thread,
              conversation: {
                ...thread.conversation,
                unread: false,
                lastMessage: text,
                time: 'Just now',
                messages: [...thread.conversation.messages, optimisticMessage],
              },
            }
          : thread,
      ),
    );

    startTransition(async () => {
      const result = await sendConversationMessageAction({
        conversationId: activeThread.conversation.id!,
        body: text,
      });

      if (result?.error) {
        setActionError(result.error);
        return;
      }

      setConversations((prev) =>
        prev.map((thread) =>
          thread.conversation.id === activeThread.conversation.id
            ? {
                ...thread,
                conversation: {
                  ...thread.conversation,
                  messages: thread.conversation.messages.map((msg) =>
                    msg.id === optimisticMessage.id
                      ? { ...msg, status: 'sent' as const }
                      : msg,
                  ),
                },
              }
            : thread,
        ),
      );
    });
  }, [activeThread, viewerAccountId]);

  const handleAcceptOffer = useCallback((offerId: number) => {
    startOfferTransition(async () => {
      const result = await acceptCustomOfferAction(offerId);
      if (result.error) {
        setActionError(result.error);
        return;
      }
      if (result.orderId) {
        router.push(`/orders/${result.orderId}`);
      }
    });
  }, [router]);

  const handleWithdrawOffer = useCallback((offerId: number) => {
    startOfferTransition(async () => {
      const result = await withdrawCustomOfferAction(offerId);
      if (result.error) {
        setActionError(result.error);
        return;
      }
      // Update local state - mark the offer as withdrawn
      setConversations((prev) =>
        prev.map((thread) => ({
          ...thread,
          conversation: {
            ...thread.conversation,
            messages: thread.conversation.messages.map((msg) =>
              msg.customOffer?.id === offerId
                ? { ...msg, customOffer: { ...msg.customOffer!, status: 'withdrawn' as const } }
                : msg,
            ),
          },
        })),
      );
    });
  }, []);

  return (
    <div className="inbox-layout">
      <ConversationSidebar
        conversations={conversations}
        activeConversationId={activeThread?.conversation.id ?? null}
        onSelect={handleSelect}
      />
      {activeThread && (
        <ChatArea
          seller={activeThread.seller}
          messages={activeThread.conversation.messages}
          onSend={handleSend}
          isSending={isSending}
          viewerIsExpert={viewerIsExpert}
          conversationId={activeThread.conversation.id ?? undefined}
          viewerGigs={viewerGigs}
          onAcceptOffer={handleAcceptOffer}
          onWithdrawOffer={handleWithdrawOffer}
          isOfferPending={isOfferPending}
        />
      )}
      {actionError && (
        <div style={{ padding: '0 1.5rem 1.5rem', color: '#b91c1c', fontSize: '0.9rem' }}>
          {actionError}
        </div>
      )}
    </div>
  );
}
