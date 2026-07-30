import { redirect } from 'next/navigation';
import { InboxLayout } from '@/components/inbox/InboxLayout';
import { getCurrentUserContext } from '@/lib/auth/session';
import {
  listConversations,
  listExpertPublishedGigs,
  markConversationRead,
  openOrCreateConversation,
} from '@/lib/marketplace/repository';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Inbox | BooSend Experts',
};

interface PageProps {
  searchParams: Promise<{ expert?: string; conversation?: string }>;
}

export default async function InboxPage({ searchParams }: PageProps) {
  const [{ user, marketplace }, params] = await Promise.all([
    getCurrentUserContext(),
    searchParams,
  ]);

  const queryString = new URLSearchParams();
  if (params.expert) queryString.set('expert', params.expert);
  if (params.conversation) queryString.set('conversation', params.conversation);
  const next = queryString.toString() ? `/inbox?${queryString.toString()}` : '/inbox';

  if (!user || !marketplace) {
    redirect(`/signin?next=${encodeURIComponent(next)}`);
  }

  let activeConversationId = params.conversation ? Number(params.conversation) : null;
  if (!activeConversationId && params.expert) {
    activeConversationId = await openOrCreateConversation(
      marketplace.account.id,
      Number(params.expert),
    );
  }

  if (activeConversationId) {
    await markConversationRead(marketplace.account.id, activeConversationId);
  }

  const viewerIsExpert = marketplace.roles.includes('expert');
  const [conversations, viewerGigs] = await Promise.all([
    listConversations(marketplace.account.id),
    viewerIsExpert ? listExpertPublishedGigs(marketplace.account.id) : Promise.resolve([]),
  ]);

  return (
    <InboxLayout
      initialConversations={conversations}
      initialConversationId={
        activeConversationId ?? conversations[0]?.conversation.id ?? null
      }
      viewerAccountId={marketplace.account.id}
      viewerIsExpert={viewerIsExpert}
      viewerGigs={viewerGigs}
    />
  );
}
