import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatNPR } from '../data/nepalData';
import {
  Package,
  Heart,
  MapPin,
  Award,
  MessageSquare,
  FileText,
  Truck,
  ShoppingCart,
  Send,
  CheckCircle2,
} from 'lucide-react';

export const CustomerPortal: React.FC = () => {
  const {
    currentUser,
    orders,
    wishlist,
    products,
    addToCart,
    toggleWishlist,
    setTrackingOrderNumber,
    setSelectedOrderForInvoice,
    setActiveModal,
    setActiveView,
    showToast,
    language,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'addresses' | 'loyalty' | 'support'>('orders');

  // Support ticket form
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMsg, setTicketMsg] = useState('');
  const [ticketSent, setTicketSent] = useState(false);

  const customerOrders = orders.filter(
    (o) => o.customerPhone === currentUser?.phone || o.customerEmail === currentUser?.email || o.userId === currentUser?.id
  );

  const wishedProducts = products.filter((p) => wishlist.includes(p.id));

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMsg.trim()) return;

    try {
      await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: currentUser?.name || 'Valued Customer',
          customerEmail: currentUser?.email || 'customer@sajilobazar.com',
          customerPhone: currentUser?.phone || '+977 9841234567',
          subject: ticketSubject,
          initialMessage: ticketMsg,
          priority: 'medium',
        }),
      });
      setTicketSent(true);
      setTicketSubject('');
      setTicketMsg('');
      showToast('Support ticket created. Our team will contact you shortly.');
      setTimeout(() => setTicketSent(false), 4000);
    } catch {
      showToast('Failed to send ticket. Please try again.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 my-10 space-y-6">
      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-red-600 text-white font-black text-xl flex items-center justify-center shadow-md">
            {currentUser?.name ? currentUser.name.charAt(0) : 'C'}
          </div>
          <div>
            <h1 className="text-xl font-black text-neutral-900">
              Namaste, {currentUser ? currentUser.name : 'Customer'}!
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              {currentUser?.phone || '+977 9841234567'} · {currentUser?.email || 'customer@sajilobazar.com'}
            </p>
          </div>
        </div>

        {/* Loyalty Balance Badge */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-2.5 flex items-center gap-3">
          <Award className="w-7 h-7 text-amber-600 shrink-0" />
          <div>
            <div className="text-[10px] text-amber-800 font-bold uppercase tracking-wider">Sajilo Loyalty Points</div>
            <div className="text-lg font-black text-neutral-900 font-mono">
              {currentUser?.loyaltyPoints || 480} <span className="text-xs font-normal text-neutral-500">pts (Worth Rs. {Math.round((currentUser?.loyaltyPoints || 480) * 0.5)})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-2 overflow-x-auto text-xs font-semibold text-neutral-600">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'orders' ? 'bg-neutral-900 text-white' : 'hover:bg-neutral-100 text-neutral-700'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Orders ({customerOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('wishlist')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'wishlist' ? 'bg-neutral-900 text-white' : 'hover:bg-neutral-100 text-neutral-700'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Saved Wishlist ({wishedProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('addresses')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'addresses' ? 'bg-neutral-900 text-white' : 'hover:bg-neutral-100 text-neutral-700'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Saved Addresses</span>
        </button>

        <button
          onClick={() => setActiveTab('loyalty')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'loyalty' ? 'bg-neutral-900 text-white' : 'hover:bg-neutral-100 text-neutral-700'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Loyalty & Referrals</span>
        </button>

        <button
          onClick={() => setActiveTab('support')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'support' ? 'bg-neutral-900 text-white' : 'hover:bg-neutral-100 text-neutral-700'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Support Tickets</span>
        </button>
      </div>

      {/* TAB 1: MY ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {customerOrders.length > 0 ? (
            customerOrders.map((ord) => (
              <div key={ord.id} className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs space-y-4 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-neutral-100">
                  <div>
                    <span className="font-mono font-bold text-neutral-900 text-sm">{ord.orderNumber}</span>
                    <span className="text-neutral-400 mx-2" aria-hidden="true">·</span>
                    <span className="text-neutral-500">{new Date(ord.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                      ord.deliveryStatus === 'delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {ord.deliveryStatus.replace(/_/g, ' ')}
                    </span>
                    <button
                      onClick={() => {
                        setTrackingOrderNumber(ord.orderNumber);
                        setActiveView('tracking');
                      }}
                      className="flex items-center gap-1 px-3 py-1 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Live Track</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedOrderForInvoice(ord);
                        setActiveModal('invoice');
                      }}
                      className="flex items-center gap-1 px-3 py-1 bg-white border border-neutral-300 rounded-lg text-neutral-700 font-semibold hover:bg-neutral-50"
                    >
                      <FileText className="w-3.5 h-3.5 text-red-600" />
                      <span>Tax Bill</span>
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-neutral-100">
                  {ord.items.map((item) => (
                    <div key={item.productId} className="py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-12 h-12 rounded-lg object-cover bg-neutral-100 border border-neutral-200 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="font-semibold text-neutral-900">{item.productName}</div>
                          <div className="text-[11px] text-neutral-500">Qty: {item.quantity} · Rate: {formatNPR(item.unitPrice)}</div>
                        </div>
                      </div>
                      <div className="font-mono font-bold text-neutral-900">{formatNPR(item.totalPrice)}</div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-neutral-600">
                  <div>
                    <span>Delivery: <strong>{ord.shippingAddress.district}, {ord.shippingAddress.province}</strong></span>
                  </div>
                  <div className="text-right">
                    <span>Total Paid: </span>
                    <strong className="text-neutral-900 text-sm font-mono">{formatNPR(ord.totalAmount)}</strong>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center text-neutral-400">
              <Package className="w-10 h-10 mx-auto mb-2 text-neutral-300" />
              <p className="font-semibold text-neutral-700">No orders placed yet</p>
              <button
                onClick={() => setActiveView('shop')}
                className="mt-3 px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-semibold"
              >
                Browse Bazar Deals
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SAVED WISHLIST */}
      {activeTab === 'wishlist' && (
        <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
          <h3 className="font-bold text-sm text-neutral-900">Your Saved Wishlist Products</h3>
          {wishedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {wishedProducts.map((p) => (
                <div key={p.id} className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex flex-col justify-between">
                  <div className="flex gap-3">
                    <img
                      src={p.featuredImage}
                      alt={p.name}
                      className="w-16 h-16 rounded-lg object-cover bg-neutral-100 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="font-bold text-xs text-neutral-900 line-clamp-1">{p.name}</h4>
                      <div className="font-mono font-extrabold text-neutral-900 mt-1">{formatNPR(p.discountPrice || p.price)}</div>
                      <div className="text-[11px] text-neutral-400">{p.brand}</div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-neutral-200 flex items-center justify-between text-xs">
                    <button
                      onClick={() => toggleWishlist(p.id)}
                      className="text-neutral-400 hover:text-red-600"
                    >
                      Remove
                    </button>
                    <button
                      onClick={() => {
                        addToCart(p, 1);
                        showToast(`Added ${p.name} to cart`);
                      }}
                      className="flex items-center gap-1 px-3 py-1 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg font-semibold"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Move to Cart</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-neutral-400">
              <Heart className="w-8 h-8 mx-auto mb-2 text-neutral-300" />
              <p>Your wishlist is empty. Tap the heart icon on any product to save it!</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ADDRESSES */}
      {activeTab === 'addresses' && (
        <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
          <h3 className="font-bold text-sm text-neutral-900">Saved Nepal Delivery Addresses</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-neutral-50 rounded-xl border-2 border-red-500/50 space-y-1 relative">
              <span className="absolute top-3 right-3 text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded uppercase">
                Default
              </span>
              <div className="font-bold text-neutral-900 text-sm">Kathmandu Home</div>
              <p className="text-neutral-600">Bikash Shrestha (+977 9841234567)</p>
              <p className="text-neutral-600">Baluwatar, Ward 4 (Near PM Residence Gate)</p>
              <p className="text-neutral-600">Kathmandu Metropolitan City, Bagmati Province</p>
            </div>

            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
              <div className="font-bold text-neutral-900 text-sm">Pokhara Lakeside House</div>
              <p className="text-neutral-600">Bikash Shrestha (+977 9841234567)</p>
              <p className="text-neutral-600">Baidam, Ward 6 (Near Barahi Temple Chowk)</p>
              <p className="text-neutral-600">Pokhara Metropolitan City, Gandaki Province</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LOYALTY */}
      {activeTab === 'loyalty' && (
        <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
          <h3 className="font-bold text-sm text-neutral-900">Sajilo Bazar Rewards & Loyalty Program</h3>
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-2">
            <p className="font-bold text-sm">Earn 1 Point for Every Rs. 100 Spent on Sajilo Bazar!</p>
            <p>Redeem your points directly at checkout: 100 points = Rs. 50 instant discount.</p>
          </div>

          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-xs space-y-2">
            <div className="font-bold text-neutral-800">Your Referral Code:</div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 bg-white border border-neutral-300 font-mono font-bold text-sm rounded">
                BIKASH-SAJILO
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText('BIKASH-SAJILO');
                  showToast('Referral code copied to clipboard!');
                }}
                className="px-3 py-1.5 bg-neutral-900 text-white rounded font-semibold text-xs"
              >
                Copy Link
              </button>
            </div>
            <p className="text-[11px] text-neutral-500">Share with family & friends in Nepal to earn 200 points on their first completed order.</p>
          </div>
        </div>
      )}

      {/* TAB 5: SUPPORT TICKETS */}
      {activeTab === 'support' && (
        <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
          <h3 className="font-bold text-sm text-neutral-900">Submit a Support Request</h3>
          <p className="text-xs text-neutral-500">Need help with an order, return, or Nepal delivery? Write to us.</p>

          {ticketSent ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Ticket received! Our customer service executive will phone or email you within 2 hours.</span>
            </div>
          ) : (
            <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Subject *</label>
                <input
                  type="text"
                  required
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="e.g. Inquire about delivery date in Pokhara"
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Message / Issue Details *</label>
                <textarea
                  rows={4}
                  required
                  value={ticketMsg}
                  onChange={(e) => setTicketMsg(e.target.value)}
                  placeholder="Describe your issue or question..."
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-xs"
                />
              </div>

              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-xs transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>Submit Ticket</span>
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
