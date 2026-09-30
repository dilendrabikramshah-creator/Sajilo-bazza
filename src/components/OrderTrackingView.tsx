import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Order, DeliveryStatus } from '../types';
import { formatNPR } from '../data/nepalData';
import {
  Search,
  Truck,
  CheckCircle2,
  Clock,
  Package,
  FileText,
  MapPin,
  Phone,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

export const OrderTrackingView: React.FC = () => {
  const {
    orders,
    trackingOrderNumber,
    setTrackingOrderNumber,
    setSelectedOrderForInvoice,
    setActiveModal,
    setActiveView,
    language,
    showToast,
  } = useApp();

  const [inputNum, setInputNum] = useState(trackingOrderNumber || 'SB-2026-000123');
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchOrder = async (num: string) => {
    if (!num.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/orders/track/${num.trim()}`);
      const data = await res.json();
      if (data.success) {
        setCurrentOrder(data.data);
      } else {
        setError('Order not found. Please verify the order number (e.g. SB-2026-000123)');
        setCurrentOrder(null);
      }
    } catch {
      // Fallback from local state
      const match = orders.find(
        (o) => o.orderNumber.toUpperCase() === num.trim().toUpperCase()
      );
      if (match) {
        setCurrentOrder(match);
      } else {
        setError('Order not found. Please try SB-2026-000123');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (trackingOrderNumber) {
      setInputNum(trackingOrderNumber);
      fetchOrder(trackingOrderNumber);
    } else {
      fetchOrder('SB-2026-000123');
    }
  }, [trackingOrderNumber]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(inputNum);
  };

  const deliveryStages: { key: DeliveryStatus; label: string; desc: string }[] = [
    { key: 'order_placed', label: 'Order Placed', desc: 'Order verified in system' },
    { key: 'confirmed', label: 'Confirmed', desc: 'Payment or COD verified' },
    { key: 'processing', label: 'Processing', desc: 'Sourcing at Kathmandu hub' },
    { key: 'packed', label: 'Packed', desc: 'Security taped & sealed' },
    { key: 'dispatched', label: 'Dispatched', desc: 'Handed over to courier' },
    { key: 'out_for_delivery', label: 'Out for Delivery', desc: 'Rider on the way' },
    { key: 'delivered', label: 'Delivered', desc: 'Delivered to customer' },
  ];

  const getStageIndex = (status: DeliveryStatus) => {
    const idx = deliveryStages.findIndex((s) => s.key === status);
    return idx === -1 ? 1 : idx;
  };

  const currentStageIndex = currentOrder ? getStageIndex(currentOrder.deliveryStatus) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 my-10 space-y-6">
      {/* Title & Search bar */}
      <div className="text-center max-w-xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
          {language === 'ne' ? 'अर्डर लाइभ ट्र्याकिङ' : 'Real-Time Order Tracking'}
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Track delivery progress, courier info, and view official Nepali tax invoice.
        </p>

        <form onSubmit={handleSearch} className="mt-4 flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputNum}
              onChange={(e) => setInputNum(e.target.value)}
              placeholder="Enter order number (e.g. SB-2026-000123)"
              className="w-full pl-9 pr-3 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3 pointer-events-none" />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
          >
            {loading ? 'Locating...' : 'Track'}
          </button>
        </form>

        {error && (
          <div className="mt-2 text-xs text-red-600 font-medium">
            {error}
          </div>
        )}
      </div>

      {currentOrder && (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-md overflow-hidden">
          {/* Top Order Summary Header */}
          <div className="p-5 sm:p-6 bg-neutral-50/70 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-[11px] text-neutral-400 uppercase font-bold tracking-wider">
                Order Tracking Details
              </div>
              <div className="text-xl font-black text-neutral-900 font-mono mt-0.5">
                {currentOrder.orderNumber}
              </div>
              <div className="text-xs text-neutral-500 mt-0.5">
                Placed on {new Date(currentOrder.createdAt).toLocaleDateString()} · Estimated Delivery: <strong>{currentOrder.estimatedDeliveryDate}</strong>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedOrderForInvoice(currentOrder);
                  setActiveModal('invoice');
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-white border border-neutral-300 hover:border-neutral-400 text-neutral-800 text-xs font-bold rounded-xl transition-colors shadow-xs"
              >
                <FileText className="w-4 h-4 text-red-600" />
                <span>Tax Invoice</span>
              </button>
            </div>
          </div>

          {/* 7-Stage Progress Stepper */}
          <div className="p-6 border-b border-neutral-200">
            <div className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-6">
              Delivery Progress Timeline
            </div>

            <div className="relative">
              {/* Progress Line */}
              <div className="hidden sm:block absolute top-4 left-6 right-6 h-0.5 bg-neutral-200 z-0">
                <div
                  className="h-full bg-red-600 transition-all duration-500"
                  style={{
                    width: `${(currentStageIndex / (deliveryStages.length - 1)) * 100}%`,
                  }}
                />
              </div>

              {/* Stepper Dots */}
              <div className="grid grid-cols-2 sm:grid-cols-7 gap-4 relative z-10">
                {deliveryStages.map((stage, idx) => {
                  const isDone = idx <= currentStageIndex;
                  const isCurrent = idx === currentStageIndex;

                  return (
                    <div key={stage.key} className="flex flex-col items-center text-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors shadow-xs ${
                          isDone
                            ? 'bg-red-600 text-white'
                            : 'bg-white border-2 border-neutral-300 text-neutral-400'
                        } ${isCurrent ? 'ring-4 ring-red-500/20' : ''}`}
                      >
                        {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>
                      <div className={`mt-2 text-xs font-bold ${isCurrent ? 'text-red-600' : isDone ? 'text-neutral-900' : 'text-neutral-400'}`}>
                        {stage.label}
                      </div>
                      <div className="text-[10px] text-neutral-400 mt-0.5 hidden sm:block">
                        {stage.desc}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Details 2-Column Grid */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Courier & Shipping Information */}
            <div className="space-y-4">
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-red-600" />
                    <span>Courier & Rider Details</span>
                  </div>
                  <span className="text-[10px] bg-red-50 text-red-700 font-bold px-2 py-0.5 rounded border border-red-200">
                    Live Assigned
                  </span>
                </div>

                <div className="text-neutral-600 space-y-1">
                  <div>Provider: <strong className="text-neutral-900">{currentOrder.courierInfo?.provider || 'Pathao Express Nepal'}</strong></div>
                  <div>Tracking Code: <strong className="text-neutral-900 font-mono">{currentOrder.courierInfo?.trackingNumber || 'PTH-NP-99281'}</strong></div>
                  <div>Contact Rider: <strong className="text-neutral-900 font-mono">{currentOrder.courierInfo?.courierPhone || '+977 9801234567'}</strong></div>
                </div>
              </div>

              {/* Delivery Destination */}
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-neutral-700" />
                  <span>Delivery Destination</span>
                </div>
                <div className="text-neutral-600">
                  <p className="font-semibold text-neutral-900">{currentOrder.shippingAddress.fullName} ({currentOrder.shippingAddress.phone})</p>
                  <p>{currentOrder.shippingAddress.tole}, {currentOrder.shippingAddress.ward}</p>
                  <p>{currentOrder.shippingAddress.municipality}, {currentOrder.shippingAddress.district}</p>
                  <p>{currentOrder.shippingAddress.province}</p>
                </div>
              </div>
            </div>

            {/* Order Items & Payment Info */}
            <div className="space-y-4">
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-3">
                <div className="flex items-center justify-between font-bold text-neutral-900">
                  <span>Ordered Items</span>
                  <span className="font-mono text-neutral-500">{currentOrder.items.length} items</span>
                </div>

                <div className="divide-y divide-neutral-200/80">
                  {currentOrder.items.map((item) => (
                    <div key={item.productId} className="py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-10 h-10 rounded-lg object-cover bg-neutral-200 border border-neutral-300 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="font-semibold text-neutral-900 line-clamp-1">{item.productName}</div>
                          <div className="text-[11px] text-neutral-500">Qty: {item.quantity} · Rate: {formatNPR(item.unitPrice)}</div>
                        </div>
                      </div>
                      <div className="font-mono font-bold text-neutral-900">{formatNPR(item.totalPrice)}</div>
                    </div>
                  ))}
                </div>

                {/* Financial Summary */}
                <div className="pt-2 border-t border-neutral-200 space-y-1 text-[11px] text-neutral-600">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-mono">{formatNPR(currentOrder.subtotal)}</span>
                  </div>
                  {currentOrder.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount ({currentOrder.couponCode || 'Promo'}):</span>
                      <span className="font-mono">-{formatNPR(currentOrder.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Delivery Fee:</span>
                    <span className="font-mono">{formatNPR(currentOrder.deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>13% VAT (Tax):</span>
                    <span className="font-mono">{formatNPR(currentOrder.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-neutral-900 pt-1 border-t border-neutral-200">
                    <span>Total Paid/Payable:</span>
                    <span className="font-mono text-red-600">{formatNPR(currentOrder.totalAmount)}</span>
                  </div>
                </div>

                {/* Payment Badge */}
                <div className="pt-1 flex items-center justify-between text-[11px]">
                  <span className="text-neutral-500">Payment Status:</span>
                  <span className={`px-2 py-0.5 rounded font-bold uppercase ${
                    currentOrder.payment.status === 'verified'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {currentOrder.payment.method.toUpperCase()} ({currentOrder.payment.status})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
