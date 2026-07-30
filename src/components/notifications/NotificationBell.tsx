'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import {
  markNotificationReadAction,
  markAllNotificationsReadAction,
} from '@/lib/marketplace/actions';
import type { AppNotification } from '@/types';

function notificationHref(n: AppNotification): string {
  switch (n.kind) {
    case 'message':
      return n.relatedConversationId
        ? `/inbox?conversation=${n.relatedConversationId}`
        : '/inbox';
    case 'order':
      return n.relatedOrderId ? `/orders/${n.relatedOrderId}` : '/orders';
    case 'review':
      return n.relatedOrderId ? `/orders/${n.relatedOrderId}` : '/orders';
    case 'application':
      return '/expert/onboarding';
    default:
      return '/account';
  }
}

function NotificationIcon({ kind }: { kind: string }) {
  switch (kind) {
    case 'message':
      return (
        <div className="notification-item-icon message">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
        </div>
      );
    case 'order':
      return (
        <div className="notification-item-icon order">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
        </div>
      );
    case 'review':
      return (
        <div className="notification-item-icon review">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
      );
    default:
      return (
        <div className="notification-item-icon">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
        </div>
      );
  }
}

interface NotificationBellProps {
  accountId: string;
  initialNotifications: AppNotification[];
  initialUnreadCount: number;
}

export function NotificationBell({
  accountId,
  initialNotifications,
  initialUnreadCount,
}: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markRead, markAllRead } =
    useRealtimeNotifications(accountId, initialNotifications, initialUnreadCount);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function handleMarkAllRead() {
    markAllRead();
    await markAllNotificationsReadAction();
  }

  async function handleNotificationClick(n: AppNotification) {
    if (!n.read) {
      markRead(n.id);
      await markNotificationReadAction(n.id);
    }
    setOpen(false);
  }

  return (
    <div className="notification-bell" ref={ref} onClick={() => setOpen(!open)}>
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 01-3.46 0" />
      </svg>
      {unreadCount > 0 && (
        <span className="notification-badge">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}

      {open && (
        <div className="notification-dropdown" onClick={(e) => e.stopPropagation()}>
          <div className="notification-dropdown-header">
            Notifications
            {unreadCount > 0 && (
              <button className="notification-mark-all" onClick={handleMarkAllRead}>
                Mark all read
              </button>
            )}
          </div>
          <div className="notification-dropdown-list">
            {notifications.length === 0 ? (
              <div className="notification-empty">No notifications yet</div>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n.id}
                  href={notificationHref(n)}
                  className={`notification-item${n.read ? '' : ' unread'}`}
                  onClick={() => handleNotificationClick(n)}
                >
                  <NotificationIcon kind={n.kind} />
                  <div className="notification-item-content">
                    <div className="notification-item-title">{n.title}</div>
                    {n.body && (
                      <div className="notification-item-body">{n.body}</div>
                    )}
                  </div>
                  <span className="notification-item-time">{n.createdAt}</span>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
