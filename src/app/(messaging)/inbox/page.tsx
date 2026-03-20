import { InboxLayout } from '@/components/inbox/InboxLayout';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Inbox | BooSend Experts',
};

export default function InboxPage() {
  return <InboxLayout />;
}
