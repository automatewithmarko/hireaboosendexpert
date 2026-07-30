import { getCurrentUserContext } from '@/lib/auth/session';
import {
  getUnreadNotificationCount,
  listRecentNotifications,
} from '@/lib/marketplace/repository';
import { Navbar } from './Navbar';

export async function AppNavbar() {
  const { user, marketplace } = await getCurrentUserContext();

  let initialUnreadCount = 0;
  let initialNotifications: Awaited<ReturnType<typeof listRecentNotifications>> = [];

  if (marketplace) {
    [initialUnreadCount, initialNotifications] = await Promise.all([
      getUnreadNotificationCount(marketplace.account.id),
      listRecentNotifications(marketplace.account.id),
    ]);
  }

  return (
    <Navbar
      viewer={
        user && marketplace
          ? {
              name: marketplace.account.full_name ?? user.email ?? 'BooSend User',
              email: marketplace.account.email,
              roles: marketplace.roles,
              expertStatus: marketplace.expertProfile?.application_status ?? null,
              isAdmin: marketplace.isAdmin,
              accountId: marketplace.account.id,
              initialUnreadCount,
              initialNotifications,
            }
          : null
      }
    />
  );
}
