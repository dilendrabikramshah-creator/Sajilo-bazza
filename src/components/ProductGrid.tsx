import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ProductCard } from './ProductCard';
import { SlidersHorizontal, RotateCcw, Flag } from 'lucide-react';
import { formatNPR } from '../data/nepalData';

export const ProductGrid: React.FC = () => {
  const {
    products,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    language,
  } = useApp();

  const [localOnly, setLocalOnly] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [maxPrice, setMaxPrice] = useState<number>(150000);
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'rating' | 'discount'>('featured');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Extract unique brands
  const brands = Array.from(new Set(products.map((p) => p.brand)));

  // Filter products
  const filtered = products.filter((p) => {
    if (selectedCategory !== 'all' && p.categorySlug !== selectedCategory) {
      return false;
    }
    if (localOnly && !p.isLocalNepaliProduct) {
      return false;
    }
    if (selectedBrand !== 'all' && p.brand !== selectedBrand) {
      return false;
    }
    const price = p.discountPrice || p.price;
    if (price > maxPrice) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchNepali = p.nameNepali?.includes(q);
      const matchBrand = p.brand.toLowerCase().includes(q);
      const matchTags = p.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchName && !matchNepali && !matchBrand && !matchTags) {
        return false;
      }
    }
    return true;
  });

  // Sort products
  const sorted = [...filtered].sort((a, b) => {
    const priceA = a.discountPrice || a.price;
    const priceB = b.discountPrice || b.price;

    if (sortBy === 'price_asc') return priceA - priceB;
    if (sortBy === 'price_desc') return priceB - priceA;
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'discount') {
      const discA = a.discountPrice ? (a.price - a.discountPrice) / a.price : 0;
      const discB = b.discountPrice ? (b.price - b.discountPrice) / b.price : 0;
      return discB - discA;
    }
    return 0; // featured default
  });

  const resetFilters = () => {
    setSelectedCategory('all');
    setLocalOnly(false);
    setSelectedBrand('all');
    setMaxPrice(150000);
    setSearchQuery('');
    setSortBy('featured');
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    localOnly ||
    selectedBrand !== 'all' ||
    maxPrice < 150000 ||
    searchQuery.trim().length > 0;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 my-10" id="products-catalog">
      {/* Section Header & Interactive Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
            {language === 'ne' ? 'सबै सामान तथा विशेष अफरहरू' : 'All Products & Marketplace'}
          </h2>
          <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1">
            <span>Showing <strong className="text-neutral-900 font-mono tabular-nums">{sorted.length}</strong> items in Nepal</span>
            {searchQuery && (
              <>
                <span aria-hidden="true">·</span>
                <span>Keyword: "{searchQuery}"</span>
              </>
            )}
          </div>
        </div>

        {/* Filter & Sort Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Swadeshi Nepali Toggle */}
          <button
            onClick={() => setLocalOnly(!localOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              localOnly
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-white border border-neutral-300 text-neutral-700 hover:border-neutral-400'
            }`}
          >
            <Flag className={`w-3.5 h-3.5 ${localOnly ? 'text-white' : 'text-red-600'}`} />
            <span>{language === 'ne' ? 'स्वदेशी मात्र' : 'Nepali Origin Only'}</span>
          </button>

          {/* Filter Drawer Toggle */}
          <button
            onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              filterDrawerOpen || hasActiveFilters
                ? 'bg-neutral-900 text-white border-neutral-900'
                : 'bg-white border-neutral-300 text-neutral-700 hover:border-neutral-400'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-red-500" />
            )}
          </button>

          {/* Sort By Select */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs text-neutral-800 font-medium focus:outline-none focus:ring-1 focus:ring-red-500"
          >
            <option value="featured">Sort: Featured</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="discount">Biggest Discount</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-md transition-colors"
              title="Reset all filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Expanded Filter Panel */}
      {filterDrawerOpen && (
        <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-4 sm:p-6 my-4 grid grid-cols-1 sm:grid-cols-3 gap-6 animate-in fade-in duration-150">
          {/* Category Filter */}
          <div>
            <label className="text-xs font-bold text-neutral-900 uppercase tracking-wider block mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg text-xs text-neutral-800 font-medium focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Brand Filter */}
          <div>
            <label className="text-xs font-bold text-neutral-900 uppercase tracking-wider block mb-2">
              Brand
            </label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg text-xs text-neutral-800 font-medium focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              <option value="all">All Brands in Nepal</option>
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Max Price Range Filter */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                Max Price
              </label>
              <span className="text-xs font-bold text-red-600 font-mono tabular-nums">
                {formatNPR(maxPrice)}
              </span>
            </div>
            <input
              type="range"
              min={500}
              max={150000}
              step={500}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-red-600 cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Grid of Product Cards */}
      {sorted.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sorted.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="my-16 text-center py-12 px-4 bg-white rounded-2xl border border-neutral-200">
          <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-3 text-neutral-400">
            <SlidersHorizontal className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-neutral-900">No products found</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            We couldn't find any products matching your current filters in Sajilo Bazar. Try broadening your criteria or reset.
          </p>
          <button
            onClick={resetFilters}
            className="mt-4 px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}
    </section>
  );
};
