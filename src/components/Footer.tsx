import React from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  PhoneCall,
  Mail,
  MapPin,
  Home,
  Grid,
  Search,
  ShoppingCart,
  User,
} from 'lucide-react';

export const Footer: React.FC = () => {
  const {
    language,
    cartCount,
    setCartOpen,
    setActiveView,
    activeView,
    setSelectedCategory,
  } = useApp();

  return (
    <>
      <footer className="bg-neutral-950 text-neutral-400 text-xs border-t border-neutral-800 pt-12 pb-24 md:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
          {/* Main 4-Column Directory */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Col 1: Brand Info */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-extrabold text-sm">
                  SB
                </div>
                <span className="text-lg font-black text-white tracking-tight">Sajilo Bazar</span>
              </div>
              <p className="text-neutral-400 text-xs leading-relaxed max-w-sm">
                Nepal’s trusted online shopping destination. Delivering authentic handicrafts, pure Himalayan cashmere, organic Ilam teas, shoes, and brand electronics across all 77 districts with eSewa, Khalti, Fonepay, and Cash on Delivery.
              </p>
              <div className="text-[11px] text-neutral-500 pt-1 space-y-1">
                <div>Registered Company: <strong>Sajilo Bazar E-Commerce Pvt. Ltd.</strong></div>
                <div>PAN / VAT Registration No: <strong className="text-neutral-300 font-mono">609823411</strong></div>
                <div>Central Hub: Tripureshwor-11, Kathmandu, Nepal</div>
              </div>
            </div>

            {/* Col 2: Customer Care */}
            <div className="space-y-2.5">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">Customer Care</h4>
              <ul className="space-y-2 text-xs text-neutral-400">
                <li><a href="#track" onClick={() => setActiveView('tracking')} className="hover:text-white transition-colors">Track Your Order</a></li>
                <li><a href="#help" onClick={() => setActiveView('customer_portal')} className="hover:text-white transition-colors">Help Center & FAQs</a></li>
                <li><a href="#return" className="hover:text-white transition-colors">7-Day Return Policy</a></li>
                <li><a href="#warranty" className="hover:text-white transition-colors">Brand Warranty Claims</a></li>
                <li><a href="#shipping" className="hover:text-white transition-colors">Nepal Delivery Rates</a></li>
              </ul>
            </div>

            {/* Col 3: Popular Categories */}
            <div className="space-y-2.5">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">Categories</h4>
              <ul className="space-y-2 text-xs text-neutral-400">
                <li>
                  <button onClick={() => { setSelectedCategory('local-nepali'); setActiveView('shop'); }} className="hover:text-white text-left">
                    Authentic Nepali (स्वदेशी)
                  </button>
                </li>
                <li>
                  <button onClick={() => { setSelectedCategory('electronics-mobiles'); setActiveView('shop'); }} className="hover:text-white text-left">
                    Electronics & Mobiles
                  </button>
                </li>
                <li>
                  <button onClick={() => { setSelectedCategory('shoes-footwear'); setActiveView('shop'); }} className="hover:text-white text-left">
                    Goldstar & Shoes
                  </button>
                </li>
                <li>
                  <button onClick={() => { setSelectedCategory('home-kitchen'); setActiveView('shop'); }} className="hover:text-white text-left">
                    Home & Kitchen Appliances
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 4: Contact & Hotline */}
            <div className="space-y-2.5">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">Contact Us</h4>
              <div className="space-y-2 text-xs text-neutral-400">
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-3.5 h-3.5 text-red-500" />
                  <span className="font-mono text-white">+977-1-4200000</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-red-500" />
                  <span>support@sajilobazar.com.np</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  <span>Kathmandu, Nepal</span>
                </div>
                <div className="pt-2 text-[11px] text-neutral-500">
                  Support hours: 9 AM - 8 PM (Sunday - Friday NPT)
                </div>
              </div>
            </div>
          </div>

          {/* Nepal 7 Provinces Delivery Network */}
          <div className="pt-6 border-t border-neutral-900">
            <div className="text-[11px] text-neutral-500 uppercase font-bold tracking-wider mb-2">
              All 7 Provinces Delivery Network
            </div>
            <div className="flex flex-wrap gap-2 text-[11px] text-neutral-400">
              <span className="bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded">Koshi Province (Biratnagar/Jhapa/Ilam)</span>
              <span className="bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded">Madhesh Province (Birgunj/Janakpur)</span>
              <span className="bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded">Bagmati Province (Kathmandu/Chitwan/Lalitpur)</span>
              <span className="bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded">Gandaki Province (Pokhara/Mustang/Tanahun)</span>
              <span className="bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded">Lumbini Province (Butwal/Bhairahawa/Nepalgunj)</span>
              <span className="bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded">Karnali Province (Surkhet/Jumla)</span>
              <span className="bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded">Sudurpashchim (Dhangadhi/Mahendranagar)</span>
            </div>
          </div>

          {/* Payment Badges & Copyright */}
          <div className="pt-6 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-neutral-400">Payment Partners:</span>
              <div className="flex items-center gap-2 text-white font-bold text-[10px]">
                <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded">eSewa</span>
                <span className="bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded">Khalti</span>
                <span className="bg-red-950 text-red-300 border border-red-800 px-2 py-0.5 rounded">Fonepay</span>
                <span className="bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded">ConnectIPS</span>
                <span className="bg-neutral-800 text-neutral-300 border border-neutral-700 px-2 py-0.5 rounded">COD</span>
              </div>
            </div>

            <div>
              © 2026 Sajilo Bazar E-Commerce Pvt. Ltd. All Rights Reserved. Nepal Ko Sajilo Online Bazar.
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar (PWA Standard) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-neutral-200 px-2 py-2 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => setActiveView('shop')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold ${
            activeView === 'shop' ? 'text-red-600' : 'text-neutral-500'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </button>

        <button
          onClick={() => {
            setSelectedCategory('local-nepali');
            setActiveView('shop');
          }}
          className="flex flex-col items-center gap-0.5 text-[10px] font-semibold text-neutral-500"
        >
          <Grid className="w-4 h-4" />
          <span>Categories</span>
        </button>

        <button
          onClick={() => setActiveView('tracking')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold ${
            activeView === 'tracking' ? 'text-red-600' : 'text-neutral-500'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Tracking</span>
        </button>

        <button
          onClick={() => setCartOpen(true)}
          className="relative flex flex-col items-center gap-0.5 text-[10px] font-semibold text-neutral-500"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Cart</span>
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center text-[9px] font-bold">
              {cartCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveView('customer_portal')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold ${
            activeView === 'customer_portal' ? 'text-red-600' : 'text-neutral-500'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Account</span>
        </button>
      </div>
    </>
  );
};
