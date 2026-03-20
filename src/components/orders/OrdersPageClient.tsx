'use client';

import { useState } from 'react';
import { OrderCard } from './OrderCard';
import { getSellerById } from '@/lib/sellers';
import { initialOrders } from '@/data/orders';
import type { Order } from '@/types';

type OrderTab = 'active' | 'past';

export function OrdersPageClient() {
  const [orders] = useState<Order[]>(() =>
    initialOrders.map((o) => ({ ...o }))
  );
  const [activeTab, setActiveTab] = useState<OrderTab>('active');

  const activeOrders = orders.filter((o) => o.status !== 'completed');
  const pastOrders = orders.filter((o) => o.status === 'completed');
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
          displayedOrders.map((order) => {
            const seller = getSellerById(order.sellerId);
            if (!seller) return null;
            return (
              <OrderCard
                key={order.id}
                order={order}
                seller={seller}
              />
            );
          })
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
