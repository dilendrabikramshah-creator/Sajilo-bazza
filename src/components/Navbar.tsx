import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PWAInstallButton } from './PWAInstallButton';
import {
  Search,
  ShoppingCart,
  Heart,
  User as UserIcon,
  Globe,
  SlidersHorizontal,
  ChevronDown,
  Layers,
  Sparkles,
  MapPin,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { UserRole } from '../types';

export const Navbar: React.FC = () => {
  const {
    language,
    setLanguage,
    t,
    currentUser,
    switchRole,
    cartCount,
    setCartOpen,
    wishlist,
    compareList,
    setActiveModal,
    setActiveView,
    activeView,
    searchQuery,
    setSearchQuery,
    categories,
    selectedCategory,
    setSelectedCategory,
    setTrackingOrderNumber,
  } = useApp();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);

  const searchSuggestions = [
    'Pure Cashmere Pashmina',
    'Organic Ilam Tea',
    'Hemp Backpack',
    'Goldstar Running Shoes',
    'OnePlus 12 5G',
    'Baltra Induction Cooker',
    'Palpali Dhaka Topi',
    'Mustang Dried Apples',
  ];

  const handleSuggestionClick = (query: string) => {
    setSearchQuery(query);
    setShowSearchSuggestions(false);
    setActiveView('shop');
  };

  const handleTrackQuickClick = () => {
    setTrackingOrderNumber('SB-2026-000123');
    setActiveView('tracking');
  };

  const roles: { role: UserRole | 'guest'; label: string; desc: string }[] = [
    { role: 'super_admin', label: 'Super Admin', desc: 'Full control, permissions & financial settings' },
    { role: 'admin', label: 'Store Admin', desc: 'Products, orders, coupons & analytics' },
    { role: 'manager', label: 'Store Manager', desc: 'Inventory, orders & campaigns' },
    { role: 'staff', label: 'Operations Staff', desc: 'Order status & fulfillment' },
    { role: 'vendor', label: 'Nepali Artisan Vendor', desc: 'Vendor portal & catalog' },
    { role: 'customer', label: 'Nepali Customer (Bikash)', desc: 'Shopping, cart & order tracking' },
    { role: 'guest', label: 'Guest Visitor', desc: 'Browsing without account' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-200 shadow-xs">
      {/* Top Festival & Delivery Utility Bar */}
      <div className="bg-neutral-900 text-neutral-300 text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-amber-400 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Dashain Dhamaka 2026: Use code <strong className="text-white">DASHAIN2026</strong> for 15% off</span>
            </span>
            <span className="hidden lg:inline text-neutral-500" aria-hidden="true">·</span>
            <span className="hidden lg:inline text-neutral-400">
              Free delivery on orders over Rs. 2,000 in Bagmati
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <button
              onClick={handleTrackQuickClick}
              className="text-neutral-300 hover:text-white transition-colors"
            >
              Track Order (SB-2026-000123)
            </button>
            <span className="text-neutral-600" aria-hidden="true">·</span>
            <div className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-neutral-400" />
              <button
                onClick={() => setLanguage(language === 'en' ? 'ne' : 'en')}
                className="hover:text-white transition-colors uppercase font-semibold text-[11px]"
                title="Toggle English / नेपाली"
              >
                {language === 'en' ? 'नेपाली' : 'English'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Top Bar Contract: Zone 1 (Brand) — Zone 2 (4-6 Clean Nav Links) — Zone 3 (Primary Actions) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              setActiveView('shop');
            }}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center text-white font-extrabold shadow-sm group-hover:bg-red-700 transition-colors">
              <span className="text-lg tracking-tight">SB</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-neutral-900 group-hover:text-red-600 transition-colors">
                {t('siteName')}
              </span>
              <span className="text-[10px] text-neutral-500 tracking-normal -mt-1 font-medium">
                {t('tagline')}
              </span>
            </div>
          </a>
        </div>

        {/* Search Bar with autocomplete (Central) */}
        <div className="relative flex-1 max-w-xl mx-2 hidden md:block">
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchSuggestions(true);
              }}
              onFocus={() => setShowSearchSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 200)}
              placeholder={t('searchPlaceholder')}
              className="w-full pl-9 pr-24 py-2 text-xs bg-neutral-100 border border-neutral-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition-all placeholder:text-neutral-400"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 pointer-events-none" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-12 text-xs text-neutral-400 hover:text-neutral-700 px-1"
              >
                Clear
              </button>
            )}
            <div className="absolute right-2 flex items-center text-[10px] text-neutral-400 font-medium pointer-events-none">
              <MapPin className="w-3 h-3 text-red-500 mr-0.5" />
              <span>Nepal</span>
            </div>
          </div>

          {/* Autocomplete suggestions */}
          {showSearchSuggestions && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-neutral-200 rounded-lg shadow-xl p-2 z-50">
              <div className="text-[11px] font-semibold text-neutral-400 px-2.5 py-1 uppercase tracking-wider">
                Popular Searches in Nepal
              </div>
              <div className="space-y-0.5">
                {searchSuggestions.map((sugg) => (
                  <button
                    key={sugg}
                    onClick={() => handleSuggestionClick(sugg)}
                    className="w-full text-left px-2.5 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50 rounded flex items-center justify-between group transition-colors"
                  >
                    <span>{sugg}</span>
                    <span className="text-[10px] text-neutral-400 group-hover:text-red-600">Search →</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-neutral-600">
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
              setActiveView('shop');
            }}
            className={`hover:text-red-600 transition-colors ${activeView === 'shop' && selectedCategory === 'all' ? 'text-red-600' : ''}`}
          >
            {t('deals')}
          </button>
          <button
            onClick={() => {
              setSelectedCategory('local-nepali');
              setActiveView('shop');
            }}
            className={`hover:text-red-600 transition-colors flex items-center gap-1 ${selectedCategory === 'local-nepali' ? 'text-red-600' : ''}`}
          >
            <span>{t('localNepali')}</span>
          </button>
          <button
            onClick={() => {
              setActiveView('tracking');
              setTrackingOrderNumber('SB-2026-000123');
            }}
            className={`hover:text-red-600 transition-colors ${activeView === 'tracking' ? 'text-red-600' : ''}`}
          >
            {t('trackOrder')}
          </button>
          <button
            onClick={() => setActiveView('customer_portal')}
            className={`hover:text-red-600 transition-colors ${activeView === 'customer_portal' ? 'text-red-600' : ''}`}
          >
            {t('myAccount')}
          </button>
          <button
            onClick={() => setActiveView('admin')}
            className={`hover:text-red-600 transition-colors flex items-center gap-1 ${activeView === 'admin' ? 'text-red-600 font-bold' : ''}`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-red-600" />
            <span>Admin</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions (PWA install, Compare, Wishlist, Cart, Role Switcher) */}
        <div className="flex items-center gap-2 sm:gap-3">
          <PWAInstallButton />

          {compareList.length > 0 && (
            <button
              onClick={() => setActiveModal('compare')}
              className="relative p-2 text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors"
              title="Compare Products"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {compareList.length}
              </span>
            </button>
          )}

          <button
            onClick={() => setActiveView('customer_portal')}
            className="relative p-2 text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors"
            title="Wishlist"
          >
            <Heart className="w-4 h-4" />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setCartOpen(true)}
            className="relative flex items-center gap-2 px-3 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg transition-colors text-xs font-semibold shadow-xs"
            title="Shopping Cart"
          >
            <ShoppingCart className="w-4 h-4 text-red-400" />
            <span className="hidden sm:inline">{t('cart')}</span>
            <span className="px-1.5 py-0.2 bg-red-600 text-white text-[10px] font-bold rounded-full">
              {cartCount}
            </span>
          </button>

          {/* User & Role Switcher Popover */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-1.5 pl-2 pr-2.5 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg border border-neutral-200 transition-colors"
              title="Switch user perspective for testing"
            >
              <UserIcon className="w-3.5 h-3.5 text-red-600" />
              <span className="hidden md:inline max-w-[100px] truncate">
                {currentUser ? currentUser.name.split(' ')[0] : 'Guest'}
              </span>
              <ChevronDown className="w-3 h-3 text-neutral-400" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-neutral-200 p-2 z-50">
                <div className="px-3 py-2 border-b border-neutral-100">
                  <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                    Testing Role Switcher
                  </div>
                  <div className="text-xs font-medium text-neutral-800 mt-0.5">
                    Currently: <span className="font-bold text-red-600">{currentUser ? currentUser.role.toUpperCase() : 'GUEST'}</span>
                  </div>
                </div>

                <div className="py-1 space-y-1 max-h-72 overflow-y-auto">
                  {roles.map((r) => {
                    const active = (currentUser?.role === r.role) || (!currentUser && r.role === 'guest');
                    return (
                      <button
                        key={r.role}
                        onClick={() => {
                          switchRole(r.role);
                          setRoleMenuOpen(false);
                          if (r.role === 'super_admin' || r.role === 'admin' || r.role === 'manager' || r.role === 'staff') {
                            setActiveView('admin');
                          } else {
                            setActiveView('shop');
                          }
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-start justify-between ${
                          active ? 'bg-red-50 text-red-900 border border-red-200' : 'hover:bg-neutral-50 text-neutral-700'
                        }`}
                      >
                        <div>
                          <div className="font-semibold flex items-center gap-1.5">
                            <span>{r.label}</span>
                            {active && <Check className="w-3.5 h-3.5 text-red-600" />}
                          </div>
                          <div className="text-[10px] text-neutral-400 mt-0.5">{r.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] px-2 text-neutral-500">
                  <button
                    onClick={() => {
                      setActiveView('admin');
                      setRoleMenuOpen(false);
                    }}
                    className="text-red-600 hover:underline font-semibold"
                  >
                    Open Admin
                  </button>
                  <button
                    onClick={() => {
                      setActiveView('customer_portal');
                      setRoleMenuOpen(false);
                    }}
                    className="text-neutral-700 hover:underline font-medium"
                  >
                    My Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Subheader: Category Ribbon & Quick Selector */}
      <div className="bg-neutral-50 border-t border-neutral-200 py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto no-scrollbar gap-4 text-xs">
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setCategoryMenuOpen(!categoryMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-neutral-300 rounded text-neutral-800 font-semibold hover:border-neutral-400 transition-colors shrink-0"
            >
              <Layers className="w-3.5 h-3.5 text-red-600" />
              <span>{t('allCategories')}</span>
              <ChevronDown className="w-3 h-3 text-neutral-400" />
            </button>

            <div className="flex items-center gap-1 shrink-0 overflow-x-auto">
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setActiveView('shop');
                }}
                className={`px-2.5 py-1 rounded text-xs transition-colors shrink-0 ${
                  selectedCategory === 'all'
                    ? 'bg-neutral-900 text-white font-medium'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.slug);
                    setActiveView('shop');
                  }}
                  className={`px-2.5 py-1 rounded text-xs transition-colors shrink-0 whitespace-nowrap ${
                    selectedCategory === cat.slug
                      ? 'bg-neutral-900 text-white font-medium'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
                  }`}
                >
                  {language === 'ne' ? cat.nameNepali : cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3 text-[11px] text-neutral-500 shrink-0 font-medium">
            <span>Kathmandu</span>
            <span aria-hidden="true">·</span>
            <span>Pokhara</span>
            <span aria-hidden="true">·</span>
            <span>Biratnagar</span>
            <span aria-hidden="true">·</span>
            <span>Butwal</span>
            <span aria-hidden="true">·</span>
            <span className="text-red-600 font-semibold">All 77 Districts Covered</span>
          </div>
        </div>
      </div>

      {/* Categories Dropdown Drawer */}
      {categoryMenuOpen && (
        <div className="bg-white border-b border-neutral-200 shadow-xl py-4 px-4 sm:px-6 animate-in fade-in duration-150">
          <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <div key={cat.id} className="space-y-1.5">
                <button
                  onClick={() => {
                    setSelectedCategory(cat.slug);
                    setCategoryMenuOpen(false);
                    setActiveView('shop');
                  }}
                  className="font-bold text-xs text-neutral-900 hover:text-red-600 transition-colors text-left block"
                >
                  {language === 'ne' ? cat.nameNepali : cat.name}
                </button>
                <ul className="space-y-1 text-[11px] text-neutral-500">
                  {cat.subcategories.map((sub) => (
                    <li key={sub.id}>
                      <button
                        onClick={() => {
                          setSelectedCategory(cat.slug);
                          setSearchQuery(sub.name);
                          setCategoryMenuOpen(false);
                          setActiveView('shop');
                        }}
                        className="hover:text-neutral-900 transition-colors text-left"
                      >
                        {sub.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
