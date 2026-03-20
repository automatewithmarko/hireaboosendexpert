'use client';

import type { GigCategory } from '@/types';

interface CategoriesBarProps {
  activeCategory: GigCategory | 'all';
  onCategoryChange: (category: GigCategory | 'all') => void;
}

const categories: { key: GigCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'All Services' },
  { key: 'ai', label: 'AI Sales Agents' },
  { key: 'support', label: 'Customer Support' },
  { key: 'dm', label: 'DM Automation' },
  { key: 'setup', label: 'Basic Setup & Integration Management' },
];

export function CategoriesBar({ activeCategory, onCategoryChange }: CategoriesBarProps) {
  return (
    <div className="categories-bar" id="categoriesBar">
      <div className="categories-inner">
        {categories.map((cat) => (
          <a
            key={cat.key}
            className={`category-link${activeCategory === cat.key ? ' active' : ''}`}
            onClick={() => onCategoryChange(cat.key)}
          >
            {cat.label}
          </a>
        ))}
      </div>
    </div>
  );
}
