'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { getMarketplaceBrowserClient } from '@/lib/supabase/marketplace-browser';
import type { AppNotification, NotificationKind } from '@/types';

function formatRelativeTime(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const seconds = Math.round(diffMs / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

interface NotificationRow {
  id: number;
  kind: string;
  title: string;
  body: string | null;
  created_at: string;
  read_at: string | null;
  related_conversation_id: number | null;
  related_order_id: number | null;
}

export function useRealtimeNotifications(
  accountId: string,
  initialNotifications: AppNotification[],
  initialUnreadCount: number,
) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const notificationsRef = useRef(notifications);
  notificationsRef.current = notifications;

  useEffect(() => {
    const supabase = getMarketplaceBrowserClient();
    const channel = supabase
      .channel(`notifications:${accountId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `account_id=eq.${accountId}`,
        },
        (payload) => {
          const row = payload.new as NotificationRow;

          const notification: AppNotification = {
            id: row.id,
            kind: row.kind as NotificationKind,
            title: row.title,
            body: row.body,
            createdAt: formatRelativeTime(row.created_at),
            read: row.read_at !== null,
            relatedConversationId: row.related_conversation_id,
            relatedOrderId: row.related_order_id,
          };

          setNotifications((prev) => {
            // Replace existing unread notification for the same conversation
            if (
              notification.kind === 'message' &&
              notification.relatedConversationId
            ) {
              const existingIdx = prev.findIndex(
                (n) =>
                  n.kind === 'message' &&
                  !n.read &&
                  n.relatedConversationId === notification.relatedConversationId,
              );
              if (existingIdx !== -1) {
                const updated = [...prev];
                updated.splice(existingIdx, 1);
                return [notification, ...updated].slice(0, 20);
              }
            }
            return [notification, ...prev].slice(0, 20);
          });
          if (!notification.read) {
            const hasExisting = notificationsRef.current.some(
              (n) =>
                n.kind === 'message' &&
                !n.read &&
                n.relatedConversationId === notification.relatedConversationId,
            );
            if (!hasExisting) {
              setUnreadCount((prev) => prev + 1);
            }
          }
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `account_id=eq.${accountId}`,
        },
        (payload) => {
          const row = payload.new as NotificationRow;
          const oldRow = payload.old as Partial<NotificationRow>;
          const wasUnread = oldRow.read_at === null || oldRow.read_at === undefined;
          const isNowRead = row.read_at !== null;

          if (wasUnread && isNowRead) {
            // Notification was marked as read (e.g. from opening conversation in inbox)
            setNotifications((prev) =>
              prev.map((n) => (n.id === row.id ? { ...n, read: true } : n)),
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
          }
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
          filter: `account_id=eq.${accountId}`,
        },
        (payload) => {
          const oldRow = payload.old as Partial<NotificationRow>;
          if (oldRow.id) {
            setNotifications((prev) => {
              const removed = prev.find((n) => n.id === oldRow.id);
              if (removed && !removed.read) {
                setUnreadCount((c) => Math.max(0, c - 1));
              }
              return prev.filter((n) => n.id !== oldRow.id);
            });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [accountId]);

  const markRead = useCallback((id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  return { notifications, unreadCount, markRead, markAllRead };
}
