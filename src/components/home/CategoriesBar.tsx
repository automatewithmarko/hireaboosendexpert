'use client';

import type { GigCategory } from '@/types';

interface CategoriesBarProps {
  activeCategory: GigCategory | 'all';
  onCategoryChange: (category: GigCategory | 'all') => void;
}

interface CategoryDef {
  key: GigCategory | 'all';
  label: string;
  shortLabel?: string;
  icon: React.ReactNode;
}

const Icon = {
  Grid: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  Sparkles: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  ),
  Headset: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 13a9 9 0 0 1 18 0" />
      <path d="M3 13v3a2 2 0 0 0 2 2h1v-7H5a2 2 0 0 0-2 2z" />
      <path d="M21 13v3a2 2 0 0 1-2 2h-1v-7h1a2 2 0 0 1 2 2z" />
      <path d="M18 18v.5a2.5 2.5 0 0 1-2.5 2.5H13" />
    </svg>
  ),
  Bolt: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
    </svg>
  ),
  Plug: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 2v6M15 2v6" />
      <rect x="6" y="8" width="12" height="6" rx="2" />
      <path d="M12 14v3a3 3 0 0 0 3 3h0" />
    </svg>
  ),
};

const categories: CategoryDef[] = [
  { key: 'all', label: 'All Services', icon: Icon.Grid },
  { key: 'ai', label: 'AI Sales Agents', shortLabel: 'AI Sales', icon: Icon.Sparkles },
  { key: 'support', label: 'Customer Support', shortLabel: 'Support', icon: Icon.Headset },
  { key: 'dm', label: 'DM Automation', shortLabel: 'DMs', icon: Icon.Bolt },
  { key: 'setup', label: 'Setup & Integration', shortLabel: 'Setup', icon: Icon.Plug },
];

export function CategoriesBar({ activeCategory, onCategoryChange }: CategoriesBarProps) {
  return (
    <div className="categories-bar" id="categoriesBar">
      <div className="categories-inner">
        <div className="categories-eyebrow">Browse by</div>
        <div className="categories-strip">
          {categories.map((cat) => (
            <button
              key={cat.key}
              type="button"
              className={`category-chip${activeCategory === cat.key ? ' active' : ''}`}
              onClick={() => onCategoryChange(cat.key)}
              aria-pressed={activeCategory === cat.key}
            >
              <span className="category-chip-icon" aria-hidden>{cat.icon}</span>
              <span className="category-chip-label">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
