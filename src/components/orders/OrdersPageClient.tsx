'use client';

import { useState } from 'react';
import { OrderCard } from './OrderCard';
import type { OrderWithSeller } from '@/types';

type OrderTab = 'active' | 'past';

interface OrdersPageClientProps {
  initialOrders: OrderWithSeller[];
}

export function OrdersPageClient({ initialOrders }: OrdersPageClientProps) {
  const [orders] = useState<OrderWithSeller[]>(() =>
    initialOrders.map(({ order, seller }) => ({
      order: { ...order },
      seller,
    })),
  );
  const [activeTab, setActiveTab] = useState<OrderTab>('active');

  const activeOrders = orders.filter(({ order }) => order.status !== 'completed');
  const pastOrders = orders.filter(({ order }) => order.status === 'completed');
  const displayedOrders = activeTab === 'active' ? activeOrders : pastOrders;

  return (
    <div className="orders-page">
      <div className="orders-header">
        <h1 className="orders-title">Your Orders</h1>
        <p className="orders-subtitle">Track your active orders and review past work</p>
      </div>

      <div className="orders-tabs">
        <button
          className={`orders-tab${activeTab === 'active' ? ' active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          Active Orders
          <span className="orders-tab-count">{activeOrders.length}</span>
        </button>
        <button
          className={`orders-tab${activeTab === 'past' ? ' active' : ''}`}
          onClick={() => setActiveTab('past')}
        >
          Past Orders
          <span className="orders-tab-count">{pastOrders.length}</span>
        </button>
      </div>

      <div className="orders-list">
        {displayedOrders.length > 0 ? (
          displayedOrders.map(({ order, seller }) => (
            <OrderCard
              key={order.id}
              order={order}
              seller={seller}
            />
          ))
        ) : (
          <div className="orders-empty">
            {activeTab === 'active'
              ? 'No active orders right now.'
              : 'No past orders yet.'}
          </div>
        )}
      </div>
    </div>
  );
}
