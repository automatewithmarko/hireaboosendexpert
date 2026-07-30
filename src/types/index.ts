export type GigCategory = 'ai' | 'support' | 'dm' | 'setup';
export type AccountRole = 'customer' | 'expert' | 'admin';
export type ExpertApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected';
export type DeliveryStatus =
  | 'not_started'
  | 'submitted'
  | 'revision_requested'
  | 'accepted';
export type PaymentStatus =
  | 'none'
  | 'pending'
  | 'authorized'
  | 'paid'
  | 'released'
  | 'refunded'
  | 'held';

export interface Gig {
  id?: number;
  slug?: string;
  sellerId?: number;
  title: string;
  price: number;
  rating: number;
  reviews: number;
  category: GigCategory;
  badge?: string;
  gradient: string;
  shortDescription?: string;
  deliveryDays?: number;
  imageUrl?: string;
  galleryUrls?: string[];
}

export interface GigWithSeller extends Gig {
  seller: Seller;
}

export interface Package {
  id?: number;
  gigId?: number;
  name: string;
  subtitle?: string;
  price: number;
  description: string;
  delivery: string;
  deliveryDays?: number;
  revisions: number;
  features: string[];
}

export interface Review {
  id?: number;
  name: string;
  color: string;
  text: string;
  rating: number;
  date: string;
}

export interface Seller {
  id: number;
  accountId?: string;
  featuredGigId?: number;
  name: string;
  username: string;
  avatar: string;
  avatarColor: string;
  level: string;
  online: boolean;
  location: string;
  memberSince: string;
  responseTime: string;
  completedOrders: number;
  rating: number;
  reviews: number;
  bio: string;
  skills: string[];
  gigs: Gig[];
  serviceTitle: string;
  serviceDescription: string;
  packages: Package[];
  reviewsList: Review[];
  applicationStatus?: ExpertApplicationStatus;
  headline?: string;
}

export type MessageStatus = 'sending' | 'sent' | 'seen';
export type MessageType = 'text' | 'custom_offer' | 'system';
export type CustomOfferStatus = 'pending' | 'accepted' | 'withdrawn' | 'expired';

export interface CustomOffer {
  id: number;
  conversationId: number;
  senderAccountId: string;
  gigId?: number;
  gigTitle?: string;
  description: string;
  price: number;
  deliveryDays: number;
  revisions: number;
  status: CustomOfferStatus;
  expiresAt: string;
  orderId?: number;
  createdAt: string;
}

export interface ChatMessage {
  id?: number;
  senderAccountId?: string;
  from: 'user' | 'seller';
  text: string;
  time: string;
  status?: MessageStatus;
  messageType?: MessageType;
  customOffer?: CustomOffer;
}

export interface Conversation {
  id?: number;
  sellerId: number;
  sellerAccountId?: string;
  lastMessage: string;
  time: string;
  unread: boolean;
  messages: ChatMessage[];
  subject?: string | null;
  gigId?: number | null;
  orderId?: number | null;
  otherLastReadMessageId?: number | null;
}

export type OrderStatus =
  | 'pending'
  | 'in_progress'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'disputed'
  | 'revision_requested';

export interface OrderReview {
  rating: number;
  text: string;
  date: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  sellerId: number;
  sellerAccountId?: string;
  gigId?: number;
  packageId?: number;
  gigTitle: string;
  packageName: string;
  price: number;
  serviceFee?: number;
  total?: number;
  status: OrderStatus;
  deliveryStatus?: DeliveryStatus;
  paymentStatus?: PaymentStatus;
  orderDate: string;
  deliveryDate: string;
  progress: number;
  review?: OrderReview;
}

export interface OrderTimelineEvent {
  label: string;
  date: string;
  status: 'done' | 'current' | 'upcoming';
}

export interface OrderWithSeller {
  order: Order;
  seller: Seller;
}

export interface ConversationWithSeller {
  conversation: Conversation;
  seller: Seller;
}

export interface GigComment {
  id: number;
  gigId: number;
  accountId: string;
  parentCommentId: number | null;
  authorName: string;
  authorAvatar: string;
  authorAvatarColor: string;
  isGigOwner: boolean;
  isVerifiedBuyer: boolean;
  body: string;
  createdAt: string;
  replies: GigComment[];
}

export type NotificationKind = 'message' | 'order' | 'review' | 'application' | 'system';

export interface AppNotification {
  id: number;
  kind: NotificationKind;
  title: string;
  body: string | null;
  createdAt: string;
  read: boolean;
  relatedConversationId: number | null;
  relatedOrderId: number | null;
}
