import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatNPR, NEPAL_PROVINCES, DEFAULT_DELIVERY_ZONES } from '../data/nepalData';
import {
  X,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  ShoppingCart,
  Zap,
  MapPin,
  Heart,
  SlidersHorizontal,
} from 'lucide-react';

export const ProductDetailModal: React.FC = () => {
  const {
    selectedProduct,
    setSelectedProduct,
    setActiveModal,
    activeModal,
    addToCart,
    toggleWishlist,
    isInWishlist,
    addToCompare,
    isInCompare,
    language,
  } = useApp();

  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [selectedProvince, setSelectedProvince] = useState('Bagmati Province');
  const [activeTab, setActiveTab] = useState<'specs' | 'reviews'>('specs');
  const [added, setAdded] = useState(false);

  if (activeModal !== 'product_detail' || !selectedProduct) {
    return null;
  }

  const p = selectedProduct;
  const isWished = isInWishlist(p.id);
  const isCompared = isInCompare(p.id);

  // Calculate dynamic price based on selected variants
  let unitPrice = p.discountPrice || p.price;
  if (p.variants) {
    for (const v of p.variants) {
      const selectedOptionLabel = selectedVariants[v.name] || v.options[0]?.label;
      const opt = v.options.find((o) => o.label === selectedOptionLabel);
      if (opt && opt.priceModifier) {
        unitPrice += opt.priceModifier;
      }
    }
  }

  // Delivery zone rule
  const deliveryRule =
    DEFAULT_DELIVERY_ZONES.find((z) => z.province === selectedProvince) ||
    DEFAULT_DELIVERY_ZONES[0];

  const handleVariantSelect = (variantName: string, optionLabel: string) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [variantName]: optionLabel,
    }));
  };

  const handleAddToCart = () => {
    // Fill default variants if not clicked yet
    const resolvedVariants: Record<string, string> = { ...selectedVariants };
    if (p.variants) {
      for (const v of p.variants) {
        if (!resolvedVariants[v.name] && v.options[0]) {
          resolvedVariants[v.name] = v.options[0].label;
        }
      }
    }

    addToCart(p, quantity, resolvedVariants);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    setActiveModal('checkout');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header Close Button */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <span className="font-bold text-neutral-900 uppercase tracking-wider">{p.brand}</span>
            <span aria-hidden="true">·</span>
            <span>{p.category}</span>
            {p.originDistrict && (
              <>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1 text-red-600 font-medium">
                  <MapPin className="w-3 h-3" />
                  <span>{p.originDistrict}, Nepal</span>
                </span>
              </>
            )}
          </div>

          <button
            onClick={() => {
              setActiveModal(null);
              setSelectedProduct(null);
            }}
            className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Gallery Image (Left Column) */}
            <div className="space-y-4">
              <div className="relative aspect-4/3 w-full bg-neutral-100 rounded-xl overflow-hidden border border-neutral-200">
                <img
                  src={p.featuredImage}
                  alt={p.name}
                  className="w-full h-full object-cover object-center"
                  referrerPolicy="no-referrer"
                />
                {p.isLocalNepaliProduct && (
                  <div className="absolute top-3 left-3 bg-red-600 text-white text-[11px] font-bold px-2.5 py-1 rounded shadow-xs uppercase tracking-wider">
                    {language === 'ne' ? 'स्वदेशी उत्पादन' : 'Authentic Nepali'}
                  </div>
                )}
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-100">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                  <div className="font-bold text-neutral-900 text-[11px]">100% Genuine</div>
                  <div className="text-[10px] text-neutral-500">Verified Quality</div>
                </div>
                <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-100">
                  <Truck className="w-4 h-4 text-red-600 mx-auto mb-1" />
                  <div className="font-bold text-neutral-900 text-[11px]">Cash on Delivery</div>
                  <div className="text-[10px] text-neutral-500">All 77 Districts</div>
                </div>
                <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-100">
                  <RotateCcw className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                  <div className="font-bold text-neutral-900 text-[11px]">7-Day Return</div>
                  <div className="text-[10px] text-neutral-500">Easy Replacement</div>
                </div>
              </div>
            </div>

            {/* Product Purchase Module (Right Column) */}
            <div className="flex flex-col justify-between space-y-5">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-neutral-900 leading-tight">
                  {language === 'ne' && p.nameNepali ? p.nameNepali : p.name}
                </h2>

                {/* Rating & Stock */}
                <div className="flex items-center gap-3 mt-2 text-xs">
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{p.rating.toFixed(1)}</span>
                    <span className="text-neutral-400 font-normal">({p.reviewCount} customer reviews)</span>
                  </div>
                  <span className="text-neutral-300" aria-hidden="true">·</span>
                  <span className={`font-semibold ${p.stock <= p.lowStockThreshold ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {p.stock > 0 ? (p.stock <= p.lowStockThreshold ? `Only ${p.stock} left in stock!` : 'In Stock') : 'Out of Stock'}
                  </span>
                </div>

                {/* Price Display */}
                <div className="mt-4 p-4 bg-neutral-50 rounded-xl border border-neutral-100 flex items-baseline gap-3">
                  <span className="text-2xl font-extrabold text-neutral-900 font-mono tabular-nums">
                    {formatNPR(unitPrice)}
                  </span>
                  {p.discountPrice && (
                    <span className="text-sm text-neutral-400 line-through font-mono tabular-nums">
                      {formatNPR(p.price)}
                    </span>
                  )}
                  {p.discountPrice && (
                    <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded">
                      Save {formatNPR(p.price - p.discountPrice)}
                    </span>
                  )}
                </div>

                {/* Variants Picker (e.g. Size, Storage, Color) */}
                {p.variants && p.variants.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {p.variants.map((variant) => {
                      const currentSelected = selectedVariants[variant.name] || variant.options[0]?.label;
                      return (
                        <div key={variant.id}>
                          <label className="text-xs font-bold text-neutral-800 block mb-1.5">
                            {variant.name}: <span className="text-red-600 font-medium">{currentSelected}</span>
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {variant.options.map((opt) => {
                              const isOptionActive = currentSelected === opt.label;
                              return (
                                <button
                                  key={opt.sku}
                                  type="button"
                                  onClick={() => handleVariantSelect(variant.name, opt.label)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                    isOptionActive
                                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                                      : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-400'
                                  }`}
                                >
                                  <span>{opt.label}</span>
                                  {opt.priceModifier > 0 && (
                                    <span className="ml-1 opacity-75 font-mono text-[10px]">
                                      (+{formatNPR(opt.priceModifier)})
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Nepal Delivery Estimator */}
                <div className="mt-4 p-3 bg-neutral-50 rounded-xl border border-neutral-200/80">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-red-600" />
                      <span>Delivery Across Nepal</span>
                    </span>
                    <span className="text-xs text-neutral-500">{deliveryRule.estimatedDays}</span>
                  </div>

                  <select
                    value={selectedProvince}
                    onChange={(e) => setSelectedProvince(e.target.value)}
                    className="w-full text-xs bg-white border border-neutral-300 rounded-lg p-2 font-medium text-neutral-800 focus:outline-none focus:ring-1 focus:ring-red-500"
                  >
                    {NEPAL_PROVINCES.map((prov) => (
                      <option key={prov.id} value={prov.name}>
                        {prov.name} ({prov.nameNepali})
                      </option>
                    ))}
                  </select>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-600">
                    <span>Shipping Fee: <strong className="text-neutral-900 font-mono">{formatNPR(deliveryRule.standardFee)}</strong></span>
                    <span>Free on orders over {formatNPR(deliveryRule.freeDeliveryThreshold)}</span>
                  </div>
                </div>

                {/* Quantity Selector */}
                <div className="mt-4 flex items-center gap-3">
                  <label className="text-xs font-bold text-neutral-800">Quantity:</label>
                  <div className="flex items-center border border-neutral-300 rounded-lg bg-white">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-2.5 py-1 text-sm font-bold text-neutral-600 hover:text-neutral-900"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-xs font-mono font-bold text-neutral-900">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(p.stock, q + 1))}
                      className="px-2.5 py-1 text-sm font-bold text-neutral-600 hover:text-neutral-900"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-4 border-t border-neutral-100">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={p.stock === 0}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all shadow-xs ${
                      added
                        ? 'bg-emerald-600 text-white'
                        : p.stock === 0
                        ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                        : 'bg-neutral-900 hover:bg-neutral-800 text-white'
                    }`}
                  >
                    {added ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Added to Cart</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleBuyNow}
                    disabled={p.stock === 0}
                    className="flex items-center justify-center gap-2 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Buy Now</span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    onClick={() => toggleWishlist(p.id)}
                    className="flex items-center gap-1.5 text-neutral-600 hover:text-red-600"
                  >
                    <Heart className={`w-4 h-4 ${isWished ? 'fill-red-600 text-red-600' : ''}`} />
                    <span>{isWished ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
                  </button>

                  <button
                    onClick={() => addToCompare(p)}
                    className="flex items-center gap-1.5 text-neutral-600 hover:text-blue-600"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span>{isCompared ? 'In Comparison' : 'Compare'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Description & Technical Specifications Tabs */}
          <div className="mt-8 pt-6 border-t border-neutral-200">
            <div className="flex items-center gap-4 border-b border-neutral-200 pb-2 mb-4">
              <button
                onClick={() => setActiveTab('specs')}
                className={`text-xs font-bold pb-2 transition-colors ${
                  activeTab === 'specs' ? 'text-red-600 border-b-2 border-red-600' : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                Specifications & Details
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`text-xs font-bold pb-2 transition-colors ${
                  activeTab === 'reviews' ? 'text-red-600 border-b-2 border-red-600' : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                Nepali Customer Reviews ({p.reviewCount})
              </button>
            </div>

            {activeTab === 'specs' ? (
              <div className="space-y-4">
                <p className="text-xs text-neutral-600 leading-relaxed">{p.description}</p>
                {p.descriptionNepali && (
                  <p className="text-xs text-neutral-700 leading-relaxed font-medium bg-red-50/50 p-3 rounded-lg border border-red-100">
                    {p.descriptionNepali}
                  </p>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border border-neutral-200 rounded-lg">
                    <tbody>
                      {Object.entries(p.specifications).map(([key, val], idx) => (
                        <tr key={key} className={idx % 2 === 0 ? 'bg-neutral-50' : 'bg-white'}>
                          <th className="py-2.5 px-4 font-semibold text-neutral-700 w-1/3 border-b border-neutral-200">
                            {key}
                          </th>
                          <td className="py-2.5 px-4 text-neutral-600 border-b border-neutral-200 font-mono">
                            {val}
                          </td>
                        </tr>
                      ))}
                      <tr>
                        <th className="py-2.5 px-4 font-semibold text-neutral-700">Official Warranty</th>
                        <td className="py-2.5 px-4 text-neutral-600">{p.warranty}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-neutral-900">Bikash Shrestha, Kathmandu</span>
                    <span className="text-[11px] text-neutral-400">September 2026</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                    <span className="text-[10px] text-emerald-600 font-semibold ml-2">Verified Nepali Purchase</span>
                  </div>
                  <p className="text-xs text-neutral-600 pt-1">
                    "Delivered to Baluwatar within 24 hours. The packaging was immaculate with official VAT bill. 100% genuine product!"
                  </p>
                </div>

                <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-neutral-900">Anjana Karki, Pokhara</span>
                    <span className="text-[11px] text-neutral-400">August 2026</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                    <span className="text-[10px] text-emerald-600 font-semibold ml-2">Verified Nepali Purchase</span>
                  </div>
                  <p className="text-xs text-neutral-600 pt-1">
                    "Paid easily using eSewa. Authentic quality, and the staff even phoned to confirm my address in Lakeside. Thank you Sajilo Bazar!"
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
