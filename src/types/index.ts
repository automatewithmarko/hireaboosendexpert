export type GigCategory = 'ai' | 'support' | 'dm' | 'setup';

export interface Gig {
  title: string;
  price: number;
  rating: number;
  reviews: number;
  category: GigCategory;
  badge?: string;
  gradient: string;
}

export interface GigWithSeller extends Gig {
  seller: Seller;
}

export interface Package {
  name: string;
  price: number;
  description: string;
  delivery: string;
  revisions: number;
  features: string[];
}

export interface Review {
  name: string;
  color: string;
  text: string;
  rating: number;
  date: string;
}

export interface Seller {
  id: number;
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
}

export interface ChatMessage {
  from: 'user' | 'seller';
  text: string;
  time: string;
}

export interface Conversation {
  sellerId: number;
  lastMessage: string;
  time: string;
  unread: boolean;
  messages: ChatMessage[];
}

export type OrderStatus = 'pending' | 'in_progress' | 'completed';

export interface OrderReview {
  rating: number;
  text: string;
  date: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  sellerId: number;
  gigTitle: string;
  packageName: string;
  price: number;
  status: OrderStatus;
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
