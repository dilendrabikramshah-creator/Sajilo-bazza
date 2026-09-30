import React, { useState } from 'react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import { formatNPR } from '../data/nepalData';
import { Heart, ShoppingCart, SlidersHorizontal, Star, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    language,
    addToCart,
    toggleWishlist,
    isInWishlist,
    addToCompare,
    isInCompare,
    setSelectedProduct,
    setActiveModal,
    addRecentlyViewed,
  } = useApp();

  const [imgError, setImgError] = useState(false);
  const [added, setAdded] = useState(false);

  const isWished = isInWishlist(product.id);
  const isCompared = isInCompare(product.id);

  const handleCardClick = () => {
    setSelectedProduct(product);
    addRecentlyViewed(product);
    setActiveModal('product_detail');
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCompare(product);
  };

  const currentPrice = product.discountPrice || product.price;
  const originalPrice = product.discountPrice ? product.price : null;
  const discountPercent = originalPrice
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-white rounded-xl border border-neutral-200/80 hover:border-neutral-300 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col cursor-pointer"
    >
      {/* Visual Asset Container (4:3 Aspect Ratio) */}
      <div className="relative aspect-4/3 w-full bg-neutral-100 overflow-hidden">
        {!imgError ? (
          <img
            src={product.featuredImage}
            alt={product.name}
            onError={() => setImgError(true)}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-neutral-100 to-neutral-200 text-neutral-500">
            <span className="text-2xl font-bold mb-1 text-red-600">SB</span>
            <span className="text-xs font-medium text-center line-clamp-2">{product.name}</span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10 pointer-events-none">
          {product.isLocalNepaliProduct && (
            <span className="text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded shadow-xs uppercase tracking-wide">
              {language === 'ne' ? 'स्वदेशी' : 'Nepali Origin'}
            </span>
          )}
          {discountPercent > 0 && (
            <span className="text-[10px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded shadow-xs">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Hover Quick Action Buttons */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10">
          <button
            onClick={handleWishlist}
            className={`p-1.5 rounded-full shadow-md backdrop-blur-xs transition-colors ${
              isWished
                ? 'bg-red-600 text-white'
                : 'bg-white/90 text-neutral-700 hover:text-red-600 hover:bg-white'
            }`}
            title="Add to Wishlist"
          >
            <Heart className="w-4 h-4 fill-current" />
          </button>

          <button
            onClick={handleCompare}
            className={`p-1.5 rounded-full shadow-md backdrop-blur-xs transition-colors ${
              isCompared
                ? 'bg-blue-600 text-white'
                : 'bg-white/90 text-neutral-700 hover:text-blue-600 hover:bg-white'
            }`}
            title="Compare Product"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Out of Stock Scrim */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-neutral-900 text-white text-xs font-bold px-3 py-1 rounded">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content Details */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Brand & Rating metadata (Quiet inline text) */}
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span className="uppercase font-semibold tracking-wider text-[11px] text-neutral-400">
              {product.brand}
            </span>
            <div className="flex items-center gap-1 text-[11px] text-amber-500 font-medium">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-neutral-700 font-bold tabular-nums">{product.rating.toFixed(1)}</span>
              <span className="text-neutral-400">({product.reviewCount})</span>
            </div>
          </div>

          {/* Product Title */}
          <h3 className="font-semibold text-neutral-900 text-sm line-clamp-2 leading-snug group-hover:text-red-600 transition-colors">
            {language === 'ne' && product.nameNepali ? product.nameNepali : product.name}
          </h3>

          {/* District or Delivery Note */}
          {product.originDistrict && (
            <div className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
              <span>Origin:</span>
              <span className="font-medium text-neutral-700">{product.originDistrict}, Nepal</span>
            </div>
          )}
        </div>

        {/* Pricing & Add to Cart button */}
        <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between">
          <div>
            <div className="text-base font-extrabold text-neutral-900 font-mono tabular-nums leading-none">
              {formatNPR(currentPrice)}
            </div>
            {originalPrice && (
              <div className="text-[11px] text-neutral-400 line-through font-mono tabular-nums mt-0.5">
                {formatNPR(originalPrice)}
              </div>
            )}
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={product.stock === 0}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              added
                ? 'bg-emerald-600 text-white'
                : product.stock === 0
                ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                : 'bg-neutral-900 text-white hover:bg-red-600'
            }`}
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
