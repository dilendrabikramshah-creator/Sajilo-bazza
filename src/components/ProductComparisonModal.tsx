import React from 'react';
import { useApp } from '../context/AppContext';
import { formatNPR } from '../data/nepalData';
import { X, Trash2, ShoppingCart, Star, Check } from 'lucide-react';

export const ProductComparisonModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    compareList,
    removeFromCompare,
    clearCompare,
    addToCart,
    showToast,
  } = useApp();

  if (activeModal !== 'compare') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-neutral-300 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50/70">
          <div>
            <h2 className="text-base font-bold text-neutral-900">
              Product Comparison ({compareList.length} of 4)
            </h2>
            <p className="text-[11px] text-neutral-500">
              Side-by-side comparison of prices in NPR, specifications, and warranty in Nepal.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {compareList.length > 0 && (
              <button
                onClick={clearCompare}
                className="text-xs text-neutral-500 hover:text-red-600 font-medium px-2 py-1"
              >
                Clear All
              </button>
            )}
            <button
              onClick={() => setActiveModal(null)}
              className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-lg hover:bg-neutral-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Table */}
        <div className="p-6 overflow-x-auto flex-1">
          {compareList.length > 0 ? (
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr>
                  <th className="p-3 w-40 font-bold text-neutral-400 uppercase text-[10px] bg-neutral-50 border border-neutral-200">
                    Product
                  </th>
                  {compareList.map((p) => (
                    <th key={p.id} className="p-3 w-64 border border-neutral-200 align-top">
                      <div className="flex flex-col items-center text-center space-y-2">
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200">
                          <img
                            src={p.featuredImage}
                            alt={p.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <button
                            onClick={() => removeFromCompare(p.id)}
                            className="absolute top-1 right-1 p-1 bg-white/90 rounded-full text-neutral-500 hover:text-red-600 shadow-xs"
                            title="Remove from comparison"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <h4 className="font-bold text-neutral-900 line-clamp-2">{p.name}</h4>
                        <div className="text-base font-extrabold text-neutral-900 font-mono">
                          {formatNPR(p.discountPrice || p.price)}
                        </div>
                        <button
                          onClick={() => {
                            addToCart(p, 1);
                            showToast(`Added ${p.name} to cart`);
                          }}
                          className="w-full py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Add to Cart</span>
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                <tr>
                  <th className="p-3 font-semibold text-neutral-700 bg-neutral-50 border border-neutral-200">Brand</th>
                  {compareList.map((p) => (
                    <td key={p.id} className="p-3 border border-neutral-200 font-bold text-neutral-800">
                      {p.brand}
                    </td>
                  ))}
                </tr>

                <tr>
                  <th className="p-3 font-semibold text-neutral-700 bg-neutral-50 border border-neutral-200">Rating</th>
                  {compareList.map((p) => (
                    <td key={p.id} className="p-3 border border-neutral-200">
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-4 h-4 fill-current" />
                        <span>{p.rating.toFixed(1)}</span>
                        <span className="text-neutral-400 font-normal">({p.reviewCount})</span>
                      </div>
                    </td>
                  ))}
                </tr>

                <tr>
                  <th className="p-3 font-semibold text-neutral-700 bg-neutral-50 border border-neutral-200">Stock Availability</th>
                  {compareList.map((p) => (
                    <td key={p.id} className="p-3 border border-neutral-200">
                      {p.stock > 0 ? (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>In Stock ({p.stock} units)</span>
                        </span>
                      ) : (
                        <span className="text-red-600 font-semibold">Out of Stock</span>
                      )}
                    </td>
                  ))}
                </tr>

                <tr>
                  <th className="p-3 font-semibold text-neutral-700 bg-neutral-50 border border-neutral-200">Nepali Origin</th>
                  {compareList.map((p) => (
                    <td key={p.id} className="p-3 border border-neutral-200">
                      {p.isLocalNepaliProduct ? (
                        <span className="text-red-600 font-bold">Yes ({p.originDistrict || 'Nepal'})</span>
                      ) : (
                        <span className="text-neutral-500">Imported Certified</span>
                      )}
                    </td>
                  ))}
                </tr>

                <tr>
                  <th className="p-3 font-semibold text-neutral-700 bg-neutral-50 border border-neutral-200">Warranty & Return</th>
                  {compareList.map((p) => (
                    <td key={p.id} className="p-3 border border-neutral-200 text-neutral-600">
                      <div>Warranty: <strong>{p.warranty}</strong></div>
                      <div>Returns: {p.returnPolicy}</div>
                    </td>
                  ))}
                </tr>

                <tr>
                  <th className="p-3 font-semibold text-neutral-700 bg-neutral-50 border border-neutral-200">Key Specifications</th>
                  {compareList.map((p) => (
                    <td key={p.id} className="p-3 border border-neutral-200 align-top">
                      <div className="space-y-1 text-[11px] text-neutral-600">
                        {Object.entries(p.specifications).map(([k, v]) => (
                          <div key={k}>
                            <span className="font-semibold text-neutral-700">{k}:</span> {v}
                          </div>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          ) : (
            <div className="py-16 text-center text-neutral-400">
              <p>No products selected for comparison.</p>
              <p className="text-[11px] mt-1">Click the compare button on any product card in Sajilo Bazar.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
