import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatNPR, DEFAULT_DELIVERY_ZONES, NEPAL_PROVINCES } from '../data/nepalData';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, Check, AlertCircle } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    cartOpen,
    setCartOpen,
    removeFromCart,
    updateCartQuantity,
    cartSubtotal,
    setActiveModal,
    showToast,
  } = useApp();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>({
    code: 'DASHAIN2026',
    discount: Math.round(cartSubtotal * 0.15),
  });
  const [couponError, setCouponError] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('Bagmati Province');

  if (!cartOpen) return null;

  const deliveryRule =
    DEFAULT_DELIVERY_ZONES.find((z) => z.province === selectedProvince) ||
    DEFAULT_DELIVERY_ZONES[0];

  const deliveryFee =
    cartSubtotal >= deliveryRule.freeDeliveryThreshold ? 0 : deliveryRule.standardFee;

  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const taxableSubtotal = Math.max(0, cartSubtotal - discountAmount);
  const vatAmount = Math.round(taxableSubtotal * 0.13); // Nepal 13% VAT
  const grandTotal = taxableSubtotal + vatAmount + deliveryFee;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    if (!couponCode.trim()) return;

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.trim(),
          subtotal: cartSubtotal,
          isFirstOrder: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAppliedCoupon({
          code: data.data.code,
          discount: data.data.discountAmount,
        });
        showToast(`Coupon ${data.data.code} applied: -${formatNPR(data.data.discountAmount)}`);
        setCouponCode('');
      } else {
        setCouponError(data.message || 'Invalid coupon');
      }
    } catch {
      // Fallback local check
      if (couponCode.toUpperCase() === 'SAJILO100') {
        setAppliedCoupon({ code: 'SAJILO100', discount: 100 });
        showToast('Coupon SAJILO100 applied: -Rs. 100');
        setCouponCode('');
      } else if (couponCode.toUpperCase() === 'DASHAIN2026') {
        const disc = Math.round(cartSubtotal * 0.15);
        setAppliedCoupon({ code: 'DASHAIN2026', discount: disc });
        showToast(`Coupon DASHAIN2026 applied: -${formatNPR(disc)}`);
        setCouponCode('');
      } else {
        setCouponError('Invalid or expired coupon');
      }
    }
  };

  const handleProceedCheckout = () => {
    setCartOpen(false);
    setActiveModal('checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-red-600" />
            <h2 className="text-base font-bold text-neutral-900">Your Shopping Cart</h2>
            <span className="text-xs bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded-full font-bold">
              {cart.length}
            </span>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-neutral-100">
          {cart.length > 0 ? (
            cart.map((item) => (
              <div key={`${item.productId}-${JSON.stringify(item.selectedVariants)}`} className="py-3 flex gap-3">
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-lg bg-neutral-100 overflow-hidden shrink-0 border border-neutral-200">
                  <img
                    src={item.product.featuredImage}
                    alt={item.product.name}
                    className="w-full h-full object-cover object-center"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-semibold text-neutral-900 line-clamp-1">
                        {item.product.name}
                      </h4>
                      {item.selectedVariants && (
                        <div className="text-[11px] text-neutral-500 mt-0.5">
                          {Object.entries(item.selectedVariants)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(', ')}
                        </div>
                      )}
                      <div className="text-xs font-bold text-neutral-900 font-mono tabular-nums mt-1">
                        {formatNPR(item.unitPrice)}
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-neutral-400 hover:text-red-600 p-1 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center border border-neutral-300 rounded bg-white">
                      <button
                        onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                        className="px-2 py-0.5 text-xs font-bold text-neutral-600 hover:text-neutral-900"
                      >
                        -
                      </button>
                      <span className="px-2.5 py-0.5 text-xs font-mono font-bold text-neutral-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                        className="px-2 py-0.5 text-xs font-bold text-neutral-600 hover:text-neutral-900"
                      >
                        +
                      </button>
                    </div>

                    <span className="text-[11px] text-neutral-400">
                      Sub: <strong className="text-neutral-800 font-mono">{formatNPR(item.unitPrice * item.quantity)}</strong>
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-16 text-center">
              <ShoppingBag className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-neutral-700">Your cart is empty</p>
              <p className="text-xs text-neutral-400 mt-1">
                Explore Nepali handcrafted specials, electronics, and daily essentials.
              </p>
              <button
                onClick={() => setCartOpen(false)}
                className="mt-4 px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800"
              >
                Start Shopping
              </button>
            </div>
          )}
        </div>

        {/* Footer Order Summary & Checkout */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-neutral-200 bg-neutral-50/70 space-y-3">
            {/* Delivery Province Selection */}
            <div>
              <label className="text-[11px] font-bold text-neutral-700 uppercase tracking-wider block mb-1">
                Deliver to:
              </label>
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
            </div>

            {/* Coupon Code Input */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Coupon code (e.g. SAJILO100)"
                  className="w-full pl-8 pr-2 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 uppercase"
                />
                <Tag className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5 pointer-events-none" />
              </div>
              <button
                type="submit"
                className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg"
              >
                Apply
              </button>
            </form>

            {appliedCoupon && (
              <div className="flex items-center justify-between text-xs p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800">
                <span className="flex items-center gap-1 font-semibold">
                  <Check className="w-3.5 h-3.5" />
                  <span>Coupon {appliedCoupon.code} applied</span>
                </span>
                <span className="font-mono font-bold">-{formatNPR(appliedCoupon.discount)}</span>
              </div>
            )}

            {couponError && (
              <div className="flex items-center gap-1 text-[11px] text-red-600">
                <AlertCircle className="w-3 h-3" />
                <span>{couponError}</span>
              </div>
            )}

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs pt-2 border-t border-neutral-200 text-neutral-600">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-mono font-medium text-neutral-900">{formatNPR(cartSubtotal)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-600">
                  <span>Festival Discount:</span>
                  <span className="font-mono font-medium">-{formatNPR(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Charge ({deliveryRule.province.split(' ')[0]}):</span>
                <span className="font-mono font-medium text-neutral-900">
                  {deliveryFee === 0 ? <strong className="text-emerald-600 uppercase text-[11px]">FREE</strong> : formatNPR(deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>13% Nepal VAT (Official Tax):</span>
                <span className="font-mono font-medium text-neutral-900">{formatNPR(vatAmount)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-neutral-900 pt-2 border-t border-neutral-200">
                <span>Grand Total:</span>
                <span className="font-mono text-base text-red-600 font-extrabold">{formatNPR(grandTotal)}</span>
              </div>
            </div>

            {/* Checkout Action */}
            <button
              onClick={handleProceedCheckout}
              className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-md mt-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
