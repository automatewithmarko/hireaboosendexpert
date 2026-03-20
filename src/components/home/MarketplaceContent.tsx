'use client';

import { Hero } from './Hero';
import { CategoriesBar } from './CategoriesBar';
import { FiltersBar } from './FiltersBar';
import { GigsGrid } from './GigsGrid';
import { TrustBanner } from './TrustBanner';
import { useGigFilters } from '@/hooks/useGigFilters';

export function MarketplaceContent() {
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
  } = useGigFilters();

  const allPrices = allGigs.map((g) => g.price);

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
