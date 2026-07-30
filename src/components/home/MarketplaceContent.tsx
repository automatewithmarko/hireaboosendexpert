'use client';

import { Hero } from './Hero';
import { CategoriesBar } from './CategoriesBar';
import { FiltersBar } from './FiltersBar';
import { GigsGrid } from './GigsGrid';
import { TrustBanner } from './TrustBanner';
import { useGigFilters } from '@/hooks/useGigFilters';
import type { GigCategory, GigWithSeller } from '@/types';

interface MarketplaceContentProps {
  gigs: GigWithSeller[];
}

const categoryTitles: Record<GigCategory | 'all', { title: string; subtitle: string }> = {
  all: {
    title: 'All Services',
    subtitle: 'Vetted automation experts ready to ship.',
  },
  ai: {
    title: 'AI Sales Agents',
    subtitle: 'Conversational agents that qualify, close, and book.',
  },
  support: {
    title: 'Customer Support',
    subtitle: 'Always-on support flows that deflect tickets.',
  },
  dm: {
    title: 'DM Automation',
    subtitle: 'Instagram & WhatsApp funnels that actually convert.',
  },
  setup: {
    title: 'Setup & Integration',
    subtitle: 'Plumbing your stack so the automations just work.',
  },
};

export function MarketplaceContent({ gigs }: MarketplaceContentProps) {
  const {
    searchQuery, setSearchQuery,
    activeCategory, setActiveCategory,
    minRating, setMinRating,
    maxDeliveryDays, setMaxDeliveryDays,
    priceRange, setPriceRange,
    priceBounds,
    sortBy, setSortBy,
    filteredGigs,
    allGigs,
  } = useGigFilters(gigs);

  const allPrices = allGigs.map((g) => g.price);
  const meta = categoryTitles[activeCategory];

  return (
    <>
      <Hero
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <CategoriesBar
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />
      <div className="main-content" id="mainContent">
        <header className="marketplace-header">
          <div className="marketplace-header-titles">
            <h2 className="marketplace-title">{meta.title}</h2>
            <p className="marketplace-subtitle">{meta.subtitle}</p>
          </div>
          <div className="marketplace-header-count">
            <span className="marketplace-header-count-num">{filteredGigs.length}</span>
            <span className="marketplace-header-count-label">
              {filteredGigs.length === 1 ? 'service' : 'services'}
            </span>
          </div>
        </header>

        <FiltersBar
          resultCount={filteredGigs.length}
          minRating={minRating}
          setMinRating={setMinRating}
          maxDeliveryDays={maxDeliveryDays}
          setMaxDeliveryDays={setMaxDeliveryDays}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          priceBounds={priceBounds}
          allPrices={allPrices}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />
        <GigsGrid gigs={filteredGigs} />
        <TrustBanner />
      </div>
    </>
  );
}
