import 'server-only';

import type { Enums, Tables } from '@/lib/supabase/database.types';
import { getMarketplaceAdminClient } from '@/lib/supabase/marketplace-admin';
import type {
  AccountRole,
  AppNotification,
  Conversation,
  ConversationWithSeller,
  Gig,
  GigCategory,
  GigComment,
  GigWithSeller,
  NotificationKind,
  Order,
  OrderTimelineEvent,
  OrderWithSeller,
  Package,
  Review,
  Seller,
} from '@/types';

type AccountRow = Tables<'accounts'>;
type AccountRoleRow = Tables<'account_roles'>;
type ConversationParticipantRow = Tables<'conversation_participants'>;
type ConversationRow = Tables<'conversations'>;
type ExpertApplicationRow = Tables<'expert_applications'>;
type ExpertProfileRow = Tables<'expert_profiles'>;
type GigMediaRow = Tables<'gig_media'>;
type GigPackageRow = Tables<'gig_packages'>;
type GigRow = Tables<'gigs'>;
type MessageRow = Tables<'messages'>;
type NotificationRow = Tables<'notifications'>;
type OrderEventRow = Tables<'order_events'>;
type OrderRow = Tables<'orders'>;
type GigCommentRow = Tables<'gig_comments'>;
type ReviewRow = Tables<'reviews'>;

const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const MONTH_YEAR_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  year: 'numeric',
});

const RELATIVE_FORMATTER = new Intl.RelativeTimeFormat('en', {
  numeric: 'auto',
});

const DEFAULT_GRADIENT = 'linear-gradient(135deg, #1f2937 0%, #2563eb 100%)';
const DEFAULT_AVATAR_COLOR = '#475569';

interface SellerBundle {
  sellerMap: Map<string, Seller>;
  gigRowsByAccountId: Map<string, GigRow[]>;
  packageMapByGigId: Map<number, Package[]>;
}

function createConversationContact(
  account: AccountRow,
  profile?: ExpertProfileRow | null,
): Seller {
  const usernameSource =
    profile?.username?.trim() || account.email.split('@')[0] || 'member';

  return {
    id: profile?.public_id ?? 0,
    accountId: account.id,
    featuredGigId: undefined,
    name: account.full_name ?? account.email,
    username: usernameSource.startsWith('@') ? usernameSource : `@${usernameSource}`,
    avatar: profile?.avatar_text ?? getInitials(account.full_name, account.email),
    avatarColor: profile?.avatar_color ?? DEFAULT_AVATAR_COLOR,
    level: profile?.level ?? 'Marketplace member',
    online: profile?.is_online ?? false,
    location: profile?.location ?? 'Remote',
    memberSince: profile?.member_since ?? formatMonthYear(account.created_at),
    responseTime: profile?.response_time ?? 'Usually replies soon',
    completedOrders: profile?.completed_orders ?? 0,
    rating: profile?.rating ?? 0,
    reviews: profile?.reviews_count ?? 0,
    bio: profile?.bio ?? 'Marketplace member',
    skills: profile?.skills ?? [],
    gigs: [],
    serviceTitle: profile?.service_title ?? `${account.full_name ?? 'Member'} profile`,
    serviceDescription:
      profile?.service_description ?? 'Conversation contact',
    packages: [],
    reviewsList: [],
    applicationStatus: profile?.application_status ?? undefined,
    headline: profile?.headline ?? undefined,
  };
}

export interface AccountOverview {
  ordersCount: number;
  activeOrdersCount: number;
  conversationsCount: number;
  unreadNotificationsCount: number;
  gigsCount: number;
}

export interface ExpertDashboardData {
  seller: Seller | null;
  roles: AccountRole[];
  latestApplication: ExpertApplicationRow | null;
  gigs: Gig[];
  activeOrdersCount: number;
  completedOrdersCount: number;
  totalRevenue: number;
}

export interface ExpertOrderListItem {
  buyerName: string;
  buyerEmail: string;
  order: Order;
}

export interface AdminApplicationItem {
  application: ExpertApplicationRow;
  seller: Seller;
}

export interface AdminGigItem {
  gig: Gig;
  seller: Seller;
  status: Enums<'gig_status'>;
}

function unwrap<T>(
  data: T | null,
  error: { message: string } | null,
  fallbackMessage: string,
) {
  if (error) {
    throw new Error(`${fallbackMessage}: ${error.message}`);
  }

  return data;
}

function mapGigCategory(category: string): GigCategory {
  if (category === 'ai' || category === 'support' || category === 'dm' || category === 'setup') {
    return category;
  }

  return 'setup';
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return 'TBD';
  }

  return DATE_FORMATTER.format(new Date(value));
}

function formatMonthYear(value: string | null | undefined) {
  if (!value) {
    return MONTH_YEAR_FORMATTER.format(new Date());
  }

  return MONTH_YEAR_FORMATTER.format(new Date(value));
}

function formatRelativeTime(value: string | null | undefined) {
  if (!value) {
    return 'Just now';
  }

  const date = new Date(value);
  const diffMs = date.getTime() - Date.now();
  const diffSeconds = Math.round(diffMs / 1000);
  const absSeconds = Math.abs(diffSeconds);

  if (absSeconds < 60) {
    return 'Just now';
  }

  const intervals = [
    { unit: 'year', seconds: 60 * 60 * 24 * 365 },
    { unit: 'month', seconds: 60 * 60 * 24 * 30 },
    { unit: 'week', seconds: 60 * 60 * 24 * 7 },
    { unit: 'day', seconds: 60 * 60 * 24 },
    { unit: 'hour', seconds: 60 * 60 },
    { unit: 'minute', seconds: 60 },
  ] as const;

  for (const interval of intervals) {
    if (absSeconds >= interval.seconds) {
      const valueForUnit = Math.round(diffSeconds / interval.seconds);
      return RELATIVE_FORMATTER.format(valueForUnit, interval.unit);
    }
  }

  return formatDate(value);
}

function getInitials(name: string | null, email: string) {
  if (name) {
    const parts = name
      .split(' ')
      .map((part) => part.trim())
      .filter(Boolean)
      .slice(0, 2);

    if (parts.length > 0) {
      return parts.map((part) => part[0]?.toUpperCase() ?? '').join('');
    }
  }

  return email.slice(0, 2).toUpperCase();
}

function formatDeliveryDays(days: number | null | undefined) {
  if (!days || days <= 0) {
    return 'Flexible';
  }

  return `${days} day${days === 1 ? '' : 's'}`;
}

function mapPackage(row: GigPackageRow): Package {
  return {
    id: row.id,
    gigId: row.gig_id,
    name: row.tier_name,
    subtitle: row.subtitle ?? undefined,
    price: row.price,
    description: row.description,
    delivery: formatDeliveryDays(row.delivery_days),
    deliveryDays: row.delivery_days,
    revisions: row.revisions,
    features: row.features,
  };
}

function mapReview(row: ReviewRow): Review {
  return {
    id: row.id,
    name: row.reviewer_display_name,
    color: row.reviewer_avatar_color ?? DEFAULT_AVATAR_COLOR,
    text: row.body,
    rating: row.rating,
    date: formatRelativeTime(row.created_at),
  };
}

function mapGig(
  row: GigRow,
  sellerPublicId: number,
  packages: Package[],
  mediaRows: GigMediaRow[],
): Gig {
  const imageRows = mediaRows.filter((media) => media.public_url);

  return {
    id: row.id,
    slug: row.slug,
    sellerId: sellerPublicId,
    title: row.title,
    price: row.base_price || packages[0]?.price || 0,
    rating: row.rating,
    reviews: row.reviews_count,
    category: mapGigCategory(row.category),
    badge: row.badge ?? undefined,
    gradient:
      mediaRows[0]?.gradient ??
      row.cover_gradient ??
      DEFAULT_GRADIENT,
    shortDescription: row.short_description ?? undefined,
    deliveryDays: row.delivery_days ?? packages[0]?.deliveryDays,
    imageUrl: imageRows[0]?.public_url ?? undefined,
    galleryUrls: imageRows.map((media) => media.public_url!).filter(Boolean),
  };
}

async function loadSellerBundle(
  accountIds: string[],
  options: { publishedOnly: boolean },
): Promise<SellerBundle> {
  const uniqueAccountIds = [...new Set(accountIds.filter(Boolean))];

  if (uniqueAccountIds.length === 0) {
    return {
      sellerMap: new Map(),
      gigRowsByAccountId: new Map(),
      packageMapByGigId: new Map(),
    };
  }

  const marketplace = getMarketplaceAdminClient();
  const [{ data: profileRows, error: profilesError }, { data: accountRows, error: accountsError }] =
    await Promise.all([
      marketplace
        .from('expert_profiles')
        .select('*')
        .in('account_id', uniqueAccountIds),
      marketplace
        .from('accounts')
        .select('*')
        .in('id', uniqueAccountIds),
    ]);

  const profiles = unwrap(profileRows, profilesError, 'Unable to load expert profiles') ?? [];
  const accounts = unwrap(accountRows, accountsError, 'Unable to load accounts') ?? [];
  const accountMap = new Map(accounts.map((row) => [row.id, row]));

  let gigsQuery = marketplace
    .from('gigs')
    .select('*')
    .in('expert_account_id', uniqueAccountIds)
    .order('sort_order', { ascending: true });

  if (options.publishedOnly) {
    gigsQuery = gigsQuery.eq('status', 'published');
  }

  const { data: gigRows, error: gigsError } = await gigsQuery;
  const gigs = unwrap(gigRows, gigsError, 'Unable to load gigs') ?? [];
  const gigIds = gigs.map((row) => row.id);

  const [
    { data: packageRows, error: packagesError },
    { data: mediaRows, error: mediaError },
    { data: reviewRows, error: reviewsError },
  ] = await Promise.all([
    gigIds.length > 0
      ? marketplace
          .from('gig_packages')
          .select('*')
          .in('gig_id', gigIds)
          .order('sort_order', { ascending: true })
      : Promise.resolve({ data: [], error: null }),
    gigIds.length > 0
      ? marketplace
          .from('gig_media')
          .select('*')
          .in('gig_id', gigIds)
          .order('sort_order', { ascending: true })
      : Promise.resolve({ data: [], error: null }),
    marketplace
      .from('reviews')
      .select('*')
      .in('reviewee_account_id', uniqueAccountIds)
      .order('created_at', { ascending: false }),
  ]);

  const packages = unwrap(packageRows, packagesError, 'Unable to load gig packages') ?? [];
  const media = unwrap(mediaRows, mediaError, 'Unable to load gig media') ?? [];
  const reviews = unwrap(reviewRows, reviewsError, 'Unable to load reviews') ?? [];

  const packagesByGigId = new Map<number, Package[]>();
  for (const row of packages) {
    const existing = packagesByGigId.get(row.gig_id) ?? [];
    existing.push(mapPackage(row));
    packagesByGigId.set(row.gig_id, existing);
  }

  const mediaByGigId = new Map<number, GigMediaRow[]>();
  for (const row of media) {
    const existing = mediaByGigId.get(row.gig_id) ?? [];
    existing.push(row);
    mediaByGigId.set(row.gig_id, existing);
  }

  const reviewsByAccountId = new Map<string, Review[]>();
  for (const row of reviews) {
    const existing = reviewsByAccountId.get(row.reviewee_account_id) ?? [];
    existing.push(mapReview(row));
    reviewsByAccountId.set(row.reviewee_account_id, existing);
  }

  const gigsByAccountId = new Map<string, GigRow[]>();
  for (const row of gigs) {
    const existing = gigsByAccountId.get(row.expert_account_id) ?? [];
    existing.push(row);
    gigsByAccountId.set(row.expert_account_id, existing);
  }

  const sellerMap = new Map<string, Seller>();
  for (const profile of profiles) {
    const account = accountMap.get(profile.account_id);
    if (!account) {
      continue;
    }

    const sellerGigRows = gigsByAccountId.get(profile.account_id) ?? [];
    const sellerGigs = sellerGigRows.map((row) =>
      mapGig(
        row,
        profile.public_id,
        packagesByGigId.get(row.id) ?? [],
        mediaByGigId.get(row.id) ?? [],
      ),
    );
    const featuredGig = sellerGigRows[0] ?? null;

    sellerMap.set(profile.account_id, {
      id: profile.public_id,
      accountId: profile.account_id,
      featuredGigId: featuredGig?.id,
      name: account.full_name ?? account.email,
      username: profile.username.startsWith('@') ? profile.username : `@${profile.username}`,
      avatar: profile.avatar_text ?? getInitials(account.full_name, account.email),
      avatarColor: profile.avatar_color ?? DEFAULT_AVATAR_COLOR,
      level: profile.level ?? 'New Expert',
      online: profile.is_online,
      location: profile.location ?? 'Remote',
      memberSince: profile.member_since ?? formatMonthYear(account.created_at),
      responseTime: profile.response_time ?? '1 day',
      completedOrders: profile.completed_orders,
      rating: profile.rating,
      reviews: profile.reviews_count,
      bio: profile.bio ?? 'This expert is still completing their public profile.',
      skills: profile.skills,
      gigs: sellerGigs,
      serviceTitle:
        profile.service_title ??
        sellerGigs[0]?.title ??
        `${account.full_name ?? 'Expert'} services`,
      serviceDescription:
        profile.service_description ??
        sellerGigs[0]?.shortDescription ??
        'Marketplace services coming soon.',
      packages: featuredGig ? packagesByGigId.get(featuredGig.id) ?? [] : [],
      reviewsList: reviewsByAccountId.get(profile.account_id) ?? [],
      applicationStatus: profile.application_status,
      headline: profile.headline ?? undefined,
    });
  }

  return {
    sellerMap,
    gigRowsByAccountId: gigsByAccountId,
    packageMapByGigId: packagesByGigId,
  };
}

async function loadConversationContacts(accountIds: string[]) {
  const uniqueAccountIds = [...new Set(accountIds.filter(Boolean))];

  if (uniqueAccountIds.length === 0) {
    return new Map<string, Seller>();
  }

  const marketplace = getMarketplaceAdminClient();
  const [{ data: accountRows, error: accountsError }, { data: profileRows, error: profilesError }] =
    await Promise.all([
      marketplace.from('accounts').select('*').in('id', uniqueAccountIds),
      marketplace.from('expert_profiles').select('*').in('account_id', uniqueAccountIds),
    ]);

  const accounts = unwrap(accountRows, accountsError, 'Unable to load conversation contacts') ?? [];
  const profiles = unwrap(profileRows, profilesError, 'Unable to load conversation profiles') ?? [];
  const profileMap = new Map(profiles.map((row) => [row.account_id, row]));

  return new Map(
    accounts.map((account) => [
      account.id,
      createConversationContact(account, profileMap.get(account.id) ?? null),
    ]),
  );
}

function mapOrderStatusToProgress(
  status: Enums<'order_status'>,
  progress: number,
) {
  if (progress > 0) {
    return progress;
  }

  switch (status) {
    case 'pending':
      return 10;
    case 'in_progress':
      return 55;
    case 'revision_requested':
      return 75;
    case 'delivered':
      return 90;
    case 'completed':
      return 100;
    case 'cancelled':
    case 'disputed':
      return 0;
    default:
      return 0;
  }
}

function mapOrder(
  row: OrderRow,
  seller: Seller,
  review: ReviewRow | null,
): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    sellerId: seller.id,
    sellerAccountId: row.expert_account_id,
    gigId: row.gig_id,
    packageId: row.gig_package_id,
    gigTitle: row.title_snapshot,
    packageName: row.package_name_snapshot,
    price: row.price,
    serviceFee: row.service_fee,
    total: row.total,
    status: row.status,
    deliveryStatus: row.delivery_status,
    paymentStatus: row.payment_status,
    orderDate: formatDate(row.order_date),
    deliveryDate: formatDate(row.delivery_due_at),
    progress: mapOrderStatusToProgress(row.status, row.progress),
    review: review
      ? {
          rating: review.rating,
          text: review.body,
          date: formatDate(review.created_at),
        }
      : undefined,
  };
}

function buildTimeline(order: Order, events: OrderEventRow[]) {
  const timeline: OrderTimelineEvent[] = events.map((event, index) => ({
    label: event.label,
    date: formatDate(event.created_at),
    status:
      index === events.length - 1 && order.status !== 'completed' && order.status !== 'cancelled'
        ? 'current'
        : 'done',
  }));

  if (order.status !== 'completed' && order.status !== 'cancelled') {
    timeline.push({
      label: order.status === 'delivered' ? 'Buyer review pending' : 'Delivery expected',
      date: order.deliveryDate,
      status: order.status === 'delivered' ? 'current' : 'upcoming',
    });
  }

  return timeline;
}

async function getOrdersForColumn(
  column: 'customer_account_id' | 'expert_account_id',
  accountId: string,
) {
  const marketplace = getMarketplaceAdminClient();
  const { data: orderRows, error: ordersError } = await marketplace
    .from('orders')
    .select('*')
    .eq(column, accountId)
    .order('order_date', { ascending: false });

  const orders = unwrap(orderRows, ordersError, 'Unable to load orders') ?? [];
  const sellerAccountIds = [...new Set(orders.map((row) => row.expert_account_id))];
  const orderIds = orders.map((row) => row.id);
  const [{ sellerMap }, { data: reviewRows, error: reviewsError }] = await Promise.all([
    loadSellerBundle(sellerAccountIds, { publishedOnly: false }),
    orderIds.length > 0
      ? marketplace.from('reviews').select('*').in('order_id', orderIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  const reviews = unwrap(reviewRows, reviewsError, 'Unable to load order reviews') ?? [];
  const reviewMap = new Map(reviews.map((row) => [row.order_id, row]));

  return orders
    .map((row) => {
      const seller = sellerMap.get(row.expert_account_id);
      if (!seller) {
        return null;
      }

      return {
        order: mapOrder(row, seller, reviewMap.get(row.id) ?? null),
        seller,
      } satisfies OrderWithSeller;
    })
    .filter((row): row is OrderWithSeller => row !== null);
}

export async function listPublishedGigs() {
  const marketplace = getMarketplaceAdminClient();
  const { data: gigRows, error: gigsError } = await marketplace
    .from('gigs')
    .select('*')
    .eq('status', 'published')
    .order('sort_order', { ascending: true });

  const gigs = unwrap(gigRows, gigsError, 'Unable to load marketplace gigs') ?? [];
  const sellerAccountIds = [...new Set(gigs.map((row) => row.expert_account_id))];
  const { sellerMap } = await loadSellerBundle(sellerAccountIds, { publishedOnly: true });

  return gigs
    .map((row) => {
      const seller = sellerMap.get(row.expert_account_id);
      if (!seller) {
        return null;
      }

      const gig = seller.gigs.find((candidate) => candidate.id === row.id);
      if (!gig) {
        return null;
      }

      return {
        ...gig,
        seller,
      } satisfies GigWithSeller;
    })
    .filter((row): row is GigWithSeller => row !== null);
}

export async function getPublicSellerById(publicId: number) {
  const marketplace = getMarketplaceAdminClient();
  const { data: profileRow, error: profileError } = await marketplace
    .from('expert_profiles')
    .select('*')
    .eq('public_id', publicId)
    .maybeSingle();

  const profile = unwrap(profileRow, profileError, 'Unable to load seller profile');
  if (!profile) {
    return null;
  }

  const { sellerMap } = await loadSellerBundle([profile.account_id], {
    publishedOnly: true,
  });

  return sellerMap.get(profile.account_id) ?? null;
}

export async function getPublishedGigById(gigId: number) {
  const marketplace = getMarketplaceAdminClient();
  const { data: gigRow, error: gigError } = await marketplace
    .from('gigs')
    .select('*')
    .eq('id', gigId)
    .eq('status', 'published')
    .maybeSingle();

  const gig = unwrap(gigRow, gigError, 'Unable to load gig');
  if (!gig) {
    return null;
  }

  const { sellerMap, packageMapByGigId } = await loadSellerBundle([gig.expert_account_id], {
    publishedOnly: true,
  });
  const seller = sellerMap.get(gig.expert_account_id);
  if (!seller) {
    return null;
  }

  const selectedGig = seller.gigs.find((row) => row.id === gigId);
  if (!selectedGig) {
    return null;
  }

  return {
    gig: {
      ...selectedGig,
      seller,
    } satisfies GigWithSeller,
    seller,
    packages: packageMapByGigId.get(gigId) ?? [],
  };
}

export async function listCustomerOrders(accountId: string) {
  return getOrdersForColumn('customer_account_id', accountId);
}

export async function listExpertOrders(accountId: string) {
  const marketplace = getMarketplaceAdminClient();
  const { data: orderRows, error: ordersError } = await marketplace
    .from('orders')
    .select('*')
    .eq('expert_account_id', accountId)
    .order('order_date', { ascending: false });

  const orders = unwrap(orderRows, ordersError, 'Unable to load expert orders') ?? [];
  const buyerIds = [...new Set(orders.map((row) => row.customer_account_id))];
  const sellerBundle = await loadSellerBundle([accountId], { publishedOnly: false });
  const seller = sellerBundle.sellerMap.get(accountId) ?? null;

  if (!seller) {
    return [];
  }

  const [{ data: buyerRows, error: buyersError }, { data: reviewRows, error: reviewsError }] =
    await Promise.all([
      buyerIds.length > 0
        ? marketplace.from('accounts').select('*').in('id', buyerIds)
        : Promise.resolve({ data: [], error: null }),
      orders.length > 0
        ? marketplace.from('reviews').select('*').in('order_id', orders.map((row) => row.id))
        : Promise.resolve({ data: [], error: null }),
    ]);

  const buyers = unwrap(buyerRows, buyersError, 'Unable to load buyers') ?? [];
  const reviews = unwrap(reviewRows, reviewsError, 'Unable to load expert order reviews') ?? [];
  const buyerMap = new Map(buyers.map((row) => [row.id, row]));
  const reviewMap = new Map(reviews.map((row) => [row.order_id, row]));

  return orders.map((row) => {
    const buyer = buyerMap.get(row.customer_account_id);

    return {
      buyerName: buyer?.full_name ?? buyer?.email ?? 'Buyer',
      buyerEmail: buyer?.email ?? '',
      order: mapOrder(row, seller, reviewMap.get(row.id) ?? null),
    } satisfies ExpertOrderListItem;
  });
}

export async function getOrderDetailById(
  orderId: number,
  viewerAccountId: string,
  isAdmin: boolean,
) {
  const marketplace = getMarketplaceAdminClient();
  const { data: orderRow, error: orderError } = await marketplace
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .maybeSingle();

  const order = unwrap(orderRow, orderError, 'Unable to load order');
  if (!order) {
    return null;
  }

  const canAccess =
    isAdmin ||
    order.customer_account_id === viewerAccountId ||
    order.expert_account_id === viewerAccountId;

  if (!canAccess) {
    return null;
  }

  // Auto-complete: if delivered for > 3 days, auto-complete the order
  if (order.status === 'delivered') {
    const { data: deliveryEvent } = await marketplace
      .from('order_events')
      .select('created_at')
      .eq('order_id', orderId)
      .eq('event_type', 'delivery_submitted')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (deliveryEvent) {
      const deliveryDate = new Date(deliveryEvent.created_at);
      const threeDaysLater = new Date(deliveryDate.getTime() + 3 * 24 * 60 * 60 * 1000);
      if (new Date() > threeDaysLater) {
        await marketplace.from('orders').update({
          status: 'completed',
          delivery_status: 'accepted',
          payment_status: 'released',
          completed_at: new Date().toISOString(),
        }).eq('id', orderId).eq('status', 'delivered');

        await marketplace.from('order_events').insert({
          order_id: orderId,
          event_type: 'auto_completed',
          label: 'Order auto-completed',
          body: 'Order was automatically completed after 3 days.',
        });

        // Re-read the order
        const { data: refreshed } = await marketplace
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .maybeSingle();
        if (refreshed) {
          Object.assign(order, refreshed);
        }
      }
    }
  }

  const [
    { sellerMap },
    { data: eventRows, error: eventsError },
    { data: reviewRow, error: reviewError },
  ] = await Promise.all([
    loadSellerBundle([order.expert_account_id], { publishedOnly: false }),
    marketplace
      .from('order_events')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true }),
    marketplace
      .from('reviews')
      .select('*')
      .eq('order_id', orderId)
      .maybeSingle(),
  ]);

  const seller = sellerMap.get(order.expert_account_id);
  if (!seller) {
    return null;
  }

  const events = unwrap(eventRows, eventsError, 'Unable to load order timeline') ?? [];
  const review = unwrap(reviewRow, reviewError, 'Unable to load order review');
  const mappedOrder = mapOrder(order, seller, review);

  return {
    order: mappedOrder,
    seller,
    timeline: buildTimeline(mappedOrder, events),
  };
}

export async function listConversations(accountId: string) {
  const marketplace = getMarketplaceAdminClient();
  const { data: participantRows, error: participantsError } = await marketplace
    .from('conversation_participants')
    .select('*')
    .eq('account_id', accountId);

  const viewerParticipants =
    unwrap(participantRows, participantsError, 'Unable to load conversations') ?? [];
  const conversationIds = viewerParticipants.map((row) => row.conversation_id);

  if (conversationIds.length === 0) {
    return [];
  }

  const [
    { data: conversationRows, error: conversationsError },
    { data: allParticipantRows, error: allParticipantsError },
    { data: messageRows, error: messagesError },
  ] = await Promise.all([
    marketplace
      .from('conversations')
      .select('*')
      .in('id', conversationIds)
      .order('last_message_at', { ascending: false, nullsFirst: false }),
    marketplace
      .from('conversation_participants')
      .select('*')
      .in('conversation_id', conversationIds),
    marketplace
      .from('messages')
      .select('*')
      .in('conversation_id', conversationIds)
      .order('created_at', { ascending: true }),
  ]);

  const conversations =
    unwrap(conversationRows, conversationsError, 'Unable to load conversation threads') ?? [];
  const participants =
    unwrap(allParticipantRows, allParticipantsError, 'Unable to load conversation participants') ??
    [];
  const messages = unwrap(messageRows, messagesError, 'Unable to load messages') ?? [];

  const participantsByConversation = new Map<number, ConversationParticipantRow[]>();
  for (const row of participants) {
    const existing = participantsByConversation.get(row.conversation_id) ?? [];
    existing.push(row);
    participantsByConversation.set(row.conversation_id, existing);
  }

  const messagesByConversation = new Map<number, MessageRow[]>();
  for (const row of messages) {
    const existing = messagesByConversation.get(row.conversation_id) ?? [];
    existing.push(row);
    messagesByConversation.set(row.conversation_id, existing);
  }

  // Load custom offers for offer-type messages
  const offerMessageIds = messages
    .filter((m) => m.message_type === 'custom_offer' && m.custom_offer_id)
    .map((m) => m.custom_offer_id!);

  let offerMap = new Map<number, {
    id: number;
    conversationId: number;
    senderAccountId: string;
    gigId: number | null;
    description: string;
    price: number;
    deliveryDays: number;
    revisions: number;
    status: string;
    expiresAt: string;
    orderId: number | null;
    createdAt: string;
  }>();

  if (offerMessageIds.length > 0) {
    const { data: offerRows } = await marketplace
      .from('custom_offers')
      .select('*')
      .in('id', offerMessageIds);

    for (const row of offerRows ?? []) {
      // Auto-expire pending offers past their expiration
      let status = row.status;
      if (status === 'pending' && new Date(row.expires_at) < new Date()) {
        status = 'expired';
        marketplace.from('custom_offers').update({ status: 'expired' }).eq('id', row.id).then(() => {});
      }
      offerMap.set(row.id, {
        id: row.id,
        conversationId: row.conversation_id,
        senderAccountId: row.sender_account_id,
        gigId: row.gig_id,
        description: row.description,
        price: row.price,
        deliveryDays: row.delivery_days,
        revisions: row.revisions,
        status,
        expiresAt: row.expires_at,
        orderId: row.order_id,
        createdAt: row.created_at,
      });
    }
  }

  const otherParticipantIds = [
    ...new Set(
      participants
        .filter((row) => row.account_id !== accountId)
        .map((row) => row.account_id),
    ),
  ];
  const sellerMap = await loadConversationContacts(otherParticipantIds);

  const threads = conversations
    .map((conversationRow) => {
      const threadParticipants =
        participantsByConversation.get(conversationRow.id) ?? [];
      const viewerParticipant = threadParticipants.find(
        (row) => row.account_id === accountId,
      );
      const otherParticipant = threadParticipants.find(
        (row) => row.account_id !== accountId,
      );

      if (!viewerParticipant || !otherParticipant) {
        return null;
      }

      const seller = sellerMap.get(otherParticipant.account_id);
      if (!seller) {
        return null;
      }

      const threadMessages = messagesByConversation.get(conversationRow.id) ?? [];
      const lastMessage = threadMessages[threadMessages.length - 1];
      const unread =
        !!lastMessage &&
        lastMessage.id !== viewerParticipant.last_read_message_id &&
        lastMessage.sender_account_id !== accountId;

      const otherReadId = otherParticipant.last_read_message_id;

      return {
        seller,
        conversation: {
          id: conversationRow.id,
          sellerId: seller.id,
          sellerAccountId: otherParticipant.account_id,
          lastMessage:
            conversationRow.last_message_preview ??
            lastMessage?.body ??
            'Start the conversation',
          time: formatRelativeTime(
            conversationRow.last_message_at ??
              lastMessage?.created_at ??
              conversationRow.created_at,
          ),
          unread,
          subject: conversationRow.subject,
          gigId: conversationRow.gig_id,
          orderId: conversationRow.order_id,
          otherLastReadMessageId: otherReadId,
          messages: threadMessages.map((message) => {
            const isOwn = message.sender_account_id === accountId;
            let status: 'sent' | 'seen' | undefined;
            if (isOwn) {
              status = otherReadId && message.id <= otherReadId ? 'seen' : 'sent';
            }
            const offer = message.custom_offer_id ? offerMap.get(message.custom_offer_id) : undefined;
            return {
              id: message.id,
              senderAccountId: message.sender_account_id,
              from: isOwn ? ('user' as const) : ('seller' as const),
              text: message.body,
              time: formatRelativeTime(message.created_at),
              status,
              messageType: (message.message_type || 'text') as 'text' | 'custom_offer' | 'system',
              customOffer: offer ? {
                id: offer.id,
                conversationId: offer.conversationId,
                senderAccountId: offer.senderAccountId,
                gigId: offer.gigId ?? undefined,
                description: offer.description,
                price: offer.price,
                deliveryDays: offer.deliveryDays,
                revisions: offer.revisions,
                status: offer.status as 'pending' | 'accepted' | 'withdrawn' | 'expired',
                expiresAt: offer.expiresAt,
                orderId: offer.orderId ?? undefined,
                createdAt: offer.createdAt,
              } : undefined,
            };
          }),
        } satisfies Conversation,
      } satisfies ConversationWithSeller;
    });

  return threads.filter(Boolean) as ConversationWithSeller[];
}

export async function openOrCreateConversation(
  viewerAccountId: string,
  expertPublicId: number,
) {
  const marketplace = getMarketplaceAdminClient();
  const { data: expertProfileRow, error: expertProfileError } = await marketplace
    .from('expert_profiles')
    .select('*')
    .eq('public_id', expertPublicId)
    .maybeSingle();

  const expertProfile = unwrap(
    expertProfileRow,
    expertProfileError,
    'Unable to load expert profile',
  );
  if (!expertProfile) {
    return null;
  }

  const expertParticipantQuery = await marketplace
    .from('conversation_participants')
    .select('*')
    .eq('account_id', expertProfile.account_id);
  const expertParticipants = unwrap(
    expertParticipantQuery.data,
    expertParticipantQuery.error,
    'Unable to inspect expert conversations',
  ) ?? [];

  const sharedConversationIds = expertParticipants.map((row) => row.conversation_id);
  if (sharedConversationIds.length > 0) {
    const { data: viewerMatches, error: viewerMatchesError } = await marketplace
      .from('conversation_participants')
      .select('*')
      .eq('account_id', viewerAccountId)
      .in('conversation_id', sharedConversationIds)
      .limit(1);

    const matches = unwrap(
      viewerMatches,
      viewerMatchesError,
      'Unable to inspect viewer conversations',
    ) ?? [];

    if (matches[0]) {
      return matches[0].conversation_id;
    }
  }

  const { data: conversationRow, error: conversationError } = await marketplace
    .from('conversations')
    .insert({
      subject: 'New project inquiry',
    })
    .select('*')
    .single();

  const conversation = unwrap(
    conversationRow,
    conversationError,
    'Unable to create conversation',
  );

  if (!conversation) {
    return null;
  }

  const { error: participantError } = await marketplace
    .from('conversation_participants')
    .insert([
      {
        conversation_id: conversation.id,
        account_id: viewerAccountId,
      },
      {
        conversation_id: conversation.id,
        account_id: expertProfile.account_id,
      },
    ]);

  if (participantError) {
    throw new Error(`Unable to create conversation participants: ${participantError.message}`);
  }

  return conversation.id;
}

export async function markConversationRead(
  accountId: string,
  conversationId: number,
) {
  const marketplace = getMarketplaceAdminClient();
  const { data: latestMessageRow, error: latestMessageError } = await marketplace
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('id', { ascending: false })
    .limit(1)
    .maybeSingle();

  const latestMessage = unwrap(
    latestMessageRow,
    latestMessageError,
    'Unable to inspect latest message',
  );
  if (!latestMessage) {
    return;
  }

  const { error } = await marketplace
    .from('conversation_participants')
    .update({
      last_read_message_id: latestMessage.id,
    })
    .eq('conversation_id', conversationId)
    .eq('account_id', accountId);

  if (error) {
    throw new Error(`Unable to mark conversation as read: ${error.message}`);
  }
}

export async function getAccountOverview(accountId: string) {
  const marketplace = getMarketplaceAdminClient();
  const [
    { count: ordersCount, error: ordersError },
    { count: activeOrdersCount, error: activeOrdersError },
    { count: conversationsCount, error: conversationsError },
    { count: unreadNotificationsCount, error: notificationsError },
    { count: gigsCount, error: gigsError },
  ] = await Promise.all([
    marketplace
      .from('orders')
      .select('*', { head: true, count: 'exact' })
      .eq('customer_account_id', accountId),
    marketplace
      .from('orders')
      .select('*', { head: true, count: 'exact' })
      .eq('customer_account_id', accountId)
      .in('status', ['pending', 'in_progress', 'delivered', 'revision_requested']),
    marketplace
      .from('conversation_participants')
      .select('*', { head: true, count: 'exact' })
      .eq('account_id', accountId),
    marketplace
      .from('notifications')
      .select('*', { head: true, count: 'exact' })
      .eq('account_id', accountId)
      .is('read_at', null),
    marketplace
      .from('gigs')
      .select('*', { head: true, count: 'exact' })
      .eq('expert_account_id', accountId),
  ]);

  unwrap(true, ordersError, 'Unable to count orders');
  unwrap(true, activeOrdersError, 'Unable to count active orders');
  unwrap(true, conversationsError, 'Unable to count conversations');
  unwrap(true, notificationsError, 'Unable to count notifications');
  unwrap(true, gigsError, 'Unable to count gigs');

  return {
    ordersCount: ordersCount ?? 0,
    activeOrdersCount: activeOrdersCount ?? 0,
    conversationsCount: conversationsCount ?? 0,
    unreadNotificationsCount: unreadNotificationsCount ?? 0,
    gigsCount: gigsCount ?? 0,
  } satisfies AccountOverview;
}

export async function getExpertDashboardData(
  accountId: string,
  roles: AccountRole[],
) {
  const marketplace = getMarketplaceAdminClient();
  const { sellerMap, gigRowsByAccountId } = await loadSellerBundle([accountId], {
    publishedOnly: false,
  });
  const seller = sellerMap.get(accountId) ?? null;

  const [
    { data: applicationRows, error: applicationsError },
    { data: orderRows, error: ordersError },
  ] = await Promise.all([
    marketplace
      .from('expert_applications')
      .select('*')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false })
      .limit(1),
    marketplace
      .from('orders')
      .select('*')
      .eq('expert_account_id', accountId),
  ]);

  const applications =
    unwrap(applicationRows, applicationsError, 'Unable to load expert applications') ?? [];
  const orders = unwrap(orderRows, ordersError, 'Unable to load expert order stats') ?? [];
  const latestApplication = applications[0] ?? null;
  const gigs = seller?.gigs ?? [];
  const activeOrdersCount = orders.filter((order) =>
    ['pending', 'in_progress', 'delivered', 'revision_requested'].includes(order.status),
  ).length;
  const completedOrdersCount = orders.filter((order) => order.status === 'completed').length;
  const totalRevenue = orders
    .filter((order) => order.status === 'completed')
    .reduce((sum, order) => sum + order.price, 0);

  return {
    seller,
    roles,
    latestApplication,
    gigs: gigs.length > 0 ? gigs : (gigRowsByAccountId.get(accountId) ?? []).map((row) => ({
      id: row.id,
      slug: row.slug,
      sellerId: seller?.id,
      title: row.title,
      price: row.base_price,
      rating: row.rating,
      reviews: row.reviews_count,
      category: mapGigCategory(row.category),
      badge: row.badge ?? undefined,
      gradient: row.cover_gradient ?? DEFAULT_GRADIENT,
      shortDescription: row.short_description ?? undefined,
      deliveryDays: row.delivery_days ?? undefined,
    })),
    activeOrdersCount,
    completedOrdersCount,
    totalRevenue,
  } satisfies ExpertDashboardData;
}

export async function listAccountRoles(accountId: string) {
  const marketplace = getMarketplaceAdminClient();
  const { data: roleRows, error: rolesError } = await marketplace
    .from('account_roles')
    .select('*')
    .eq('account_id', accountId);

  const rows = unwrap(roleRows, rolesError, 'Unable to load account roles') ?? [];
  return rows.map((row) => row.role);
}

export async function listAdminApplications() {
  const marketplace = getMarketplaceAdminClient();
  const { data: applicationRows, error: applicationsError } = await marketplace
    .from('expert_applications')
    .select('*')
    .in('status', ['submitted', 'under_review'])
    .order('created_at', { ascending: true });

  const applications =
    unwrap(applicationRows, applicationsError, 'Unable to load admin applications') ?? [];
  const sellerAccountIds = [...new Set(applications.map((row) => row.account_id))];
  const { sellerMap } = await loadSellerBundle(sellerAccountIds, { publishedOnly: false });

  return applications
    .map((application) => {
      const seller = sellerMap.get(application.account_id);
      if (!seller) {
        return null;
      }

      return {
        application,
        seller,
      } satisfies AdminApplicationItem;
    })
    .filter((item): item is AdminApplicationItem => item !== null);
}

export async function listAdminGigQueue() {
  const marketplace = getMarketplaceAdminClient();
  const { data: gigRows, error: gigsError } = await marketplace
    .from('gigs')
    .select('*')
    .neq('status', 'published')
    .order('created_at', { ascending: false });

  const gigs = unwrap(gigRows, gigsError, 'Unable to load admin gig queue') ?? [];
  const sellerAccountIds = [...new Set(gigs.map((row) => row.expert_account_id))];
  const { sellerMap, packageMapByGigId } = await loadSellerBundle(sellerAccountIds, {
    publishedOnly: false,
  });

  return gigs
    .map((gig) => {
      const seller = sellerMap.get(gig.expert_account_id);
      if (!seller) {
        return null;
      }

      return {
        gig: mapGig(
          gig,
          seller.id,
          packageMapByGigId.get(gig.id) ?? [],
          [],
        ),
        seller,
        status: gig.status,
      } satisfies AdminGigItem;
    })
    .filter((item): item is AdminGigItem => item !== null);
}

export async function listUnreadNotifications(accountId: string) {
  const marketplace = getMarketplaceAdminClient();
  const { data: notificationRows, error } = await marketplace
    .from('notifications')
    .select('*')
    .eq('account_id', accountId)
    .is('read_at', null)
    .order('created_at', { ascending: false })
    .limit(10);

  return (
    unwrap(
      notificationRows,
      error,
      'Unable to load unread notifications',
    ) ?? []
  ) as NotificationRow[];
}

function mapNotification(row: NotificationRow): AppNotification {
  return {
    id: row.id,
    kind: row.kind as NotificationKind,
    title: row.title,
    body: row.body,
    createdAt: formatRelativeTime(row.created_at),
    read: row.read_at !== null,
    relatedConversationId: row.related_conversation_id,
    relatedOrderId: row.related_order_id,
  };
}

export async function getUnreadNotificationCount(accountId: string): Promise<number> {
  const marketplace = getMarketplaceAdminClient();
  const { count, error } = await marketplace
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('account_id', accountId)
    .is('read_at', null);

  if (error) return 0;
  return count ?? 0;
}

export async function listRecentNotifications(accountId: string): Promise<AppNotification[]> {
  const marketplace = getMarketplaceAdminClient();
  const { data, error } = await marketplace
    .from('notifications')
    .select('*')
    .eq('account_id', accountId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error || !data) return [];
  return data.map(mapNotification);
}

export async function listExpertPublishedGigs(accountId: string): Promise<Gig[]> {
  const marketplace = getMarketplaceAdminClient();

  const { data: profile } = await marketplace
    .from('expert_profiles')
    .select('public_id')
    .eq('account_id', accountId)
    .maybeSingle();

  const publicId = profile?.public_id ?? 0;

  const { data: gigRows } = await marketplace
    .from('gigs')
    .select('*')
    .eq('expert_account_id', accountId)
    .eq('status', 'published')
    .order('sort_order', { ascending: true });

  if (!gigRows || gigRows.length === 0) return [];

  return gigRows.map((row) => mapGig(row, publicId, [], []));
}

export async function listGigComments(gigId: number): Promise<GigComment[]> {
  const marketplace = getMarketplaceAdminClient();

  const { data: comments, error: commentsError } = await marketplace
    .from('gig_comments')
    .select('*')
    .eq('gig_id', gigId)
    .order('created_at', { ascending: true });

  if (commentsError || !comments || comments.length === 0) return [];

  const { data: gigRow } = await marketplace
    .from('gigs')
    .select('expert_account_id')
    .eq('id', gigId)
    .single();

  const expertAccountId = gigRow?.expert_account_id ?? '';

  const accountIds = [...new Set(comments.map((c) => c.account_id))];
  const { data: accounts } = await marketplace
    .from('accounts')
    .select('*')
    .in('id', accountIds);

  const accountMap = new Map<string, AccountRow>();
  for (const account of accounts ?? []) {
    accountMap.set(account.id, account);
  }

  const { data: profiles } = await marketplace
    .from('expert_profiles')
    .select('*')
    .in('account_id', accountIds);

  const profileMap = new Map<string, ExpertProfileRow>();
  for (const profile of profiles ?? []) {
    profileMap.set(profile.account_id, profile);
  }

  const { data: verifiedOrders } = await marketplace
    .from('orders')
    .select('customer_account_id')
    .eq('gig_id', gigId)
    .eq('status', 'completed')
    .in('customer_account_id', accountIds);

  const verifiedBuyerIds = new Set(
    (verifiedOrders ?? []).map((o) => o.customer_account_id),
  );

  function mapComment(row: GigCommentRow): GigComment {
    const account = accountMap.get(row.account_id);
    const profile = profileMap.get(row.account_id);
    const name = account?.full_name ?? account?.email ?? 'User';

    return {
      id: row.id,
      gigId: row.gig_id,
      accountId: row.account_id,
      parentCommentId: row.parent_comment_id,
      authorName: name,
      authorAvatar: profile?.avatar_text ?? getInitials(account?.full_name ?? null, account?.email ?? ''),
      authorAvatarColor: profile?.avatar_color ?? DEFAULT_AVATAR_COLOR,
      isGigOwner: row.account_id === expertAccountId,
      isVerifiedBuyer: verifiedBuyerIds.has(row.account_id),
      body: row.body,
      createdAt: formatRelativeTime(row.created_at),
      replies: [],
    };
  }

  const topLevel: GigComment[] = [];
  const replyMap = new Map<number, GigComment[]>();

  for (const row of comments) {
    const comment = mapComment(row);
    if (row.parent_comment_id === null) {
      topLevel.push(comment);
    } else {
      const existing = replyMap.get(row.parent_comment_id) ?? [];
      existing.push(comment);
      replyMap.set(row.parent_comment_id, existing);
    }
  }

  for (const comment of topLevel) {
    comment.replies = replyMap.get(comment.id) ?? [];
  }

  return topLevel;
}
