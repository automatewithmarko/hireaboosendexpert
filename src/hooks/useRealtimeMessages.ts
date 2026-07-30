'use client';

import { useEffect, useRef } from 'react';
import { getMarketplaceBrowserClient } from '@/lib/supabase/marketplace-browser';

interface RealtimeMessage {
  id: number;
  conversationId: number;
  senderAccountId: string;
  body: string;
  createdAt: string;
}

interface UseRealtimeMessagesInput {
  conversationIds: number[];
  viewerAccountId: string;
  onNewMessage: (message: RealtimeMessage) => void;
  onReadUpdate: (conversationId: number, accountId: string, lastReadMessageId: number) => void;
}

export function useRealtimeMessages({
  conversationIds,
  viewerAccountId,
  onNewMessage,
  onReadUpdate,
}: UseRealtimeMessagesInput) {
  const callbacksRef = useRef({ onNewMessage, onReadUpdate });
  callbacksRef.current = { onNewMessage, onReadUpdate };

  useEffect(() => {
    if (conversationIds.length === 0) return;

    const supabase = getMarketplaceBrowserClient();
    const channel = supabase.channel(`inbox:${viewerAccountId}`);

    for (const conversationId of conversationIds) {
      channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const row = payload.new as {
            id: number;
            conversation_id: number;
            sender_account_id: string;
            body: string;
            created_at: string;
          };

          if (row.sender_account_id === viewerAccountId) return;

          callbacksRef.current.onNewMessage({
            id: row.id,
            conversationId: row.conversation_id,
            senderAccountId: row.sender_account_id,
            body: row.body,
            createdAt: row.created_at,
          });
        },
      );

      channel.on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversation_participants',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const row = payload.new as {
            conversation_id: number;
            account_id: string;
            last_read_message_id: number | null;
          };

          if (row.account_id === viewerAccountId) return;
          if (row.last_read_message_id === null) return;

          callbacksRef.current.onReadUpdate(
            row.conversation_id,
            row.account_id,
            row.last_read_message_id,
          );
        },
      );
    }

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationIds.join(','), viewerAccountId]);
}
