import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Category, User, Order, CartItem, UserRole } from '../types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_USERS, INITIAL_ORDERS } from '../data/mockDatabase';
import { TRANSLATIONS } from '../data/nepalData';

interface AppContextType {
  language: 'en' | 'ne';
  setLanguage: (lang: 'en' | 'ne') => void;
  t: (key: keyof typeof TRANSLATIONS.en) => string;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  switchRole: (role: UserRole | 'guest') => void;
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, selectedVariants?: Record<string, string>) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  compareList: Product[];
  addToCompare: (product: Product) => boolean;
  removeFromCompare: (productId: string) => void;
  isInCompare: (productId: string) => boolean;
  clearCompare: () => void;
  recentlyViewed: Product[];
  addRecentlyViewed: (product: Product) => void;
  clearRecentlyViewed: () => void;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  categories: Category[];
  orders: Order[];
  reloadOrders: () => Promise<void>;
  reloadProducts: () => Promise<void>;
  activeView: 'shop' | 'admin' | 'customer_portal' | 'tracking';
  setActiveView: (view: 'shop' | 'admin' | 'customer_portal' | 'tracking') => void;
  activeModal: 'checkout' | 'product_detail' | 'compare' | 'tracking' | 'invoice' | 'pwa_guide' | 'auth' | null;
  setActiveModal: (modal: 'checkout' | 'product_detail' | 'compare' | 'tracking' | 'invoice' | 'pwa_guide' | 'auth' | null) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  selectedOrderForInvoice: Order | null;
  setSelectedOrderForInvoice: (order: Order | null) => void;
  trackingOrderNumber: string;
  setTrackingOrderNumber: (num: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<'en' | 'ne'>('en');
  const [currentUser, setCurrentUser] = useState<User | null>(INITIAL_USERS[0]); // Default to Super Admin for quick access
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('sb_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sb_wishlist');
      return saved ? JSON.parse(saved) : ['prod-01', 'prod-04'];
    } catch {
      return ['prod-01', 'prod-04'];
    }
  });
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeView, setActiveView] = useState<'shop' | 'admin' | 'customer_portal' | 'tracking'>('shop');
  const [activeModal, setActiveModal] = useState<'checkout' | 'product_detail' | 'compare' | 'tracking' | 'invoice' | 'pwa_guide' | 'auth' | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);
  const [trackingOrderNumber, setTrackingOrderNumber] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sb_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Sync wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sb_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist]);

  // Load language preference
  useEffect(() => {
    const savedLang = localStorage.getItem('sb_lang') as 'en' | 'ne';
    if (savedLang) setLanguageState(savedLang);
  }, []);

  const setLanguage = (lang: 'en' | 'ne') => {
    setLanguageState(lang);
    localStorage.setItem('sb_lang', lang);
  };

  const t = (key: keyof typeof TRANSLATIONS.en): string => {
    return TRANSLATIONS[language][key] || TRANSLATIONS.en[key] || '';
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const reloadProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (err) {
      console.error('Failed to load products from server:', err);
    }
  };

  const reloadOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (err) {
      console.error('Failed to load orders from server:', err);
    }
  };

  useEffect(() => {
    reloadProducts();
    reloadOrders();
  }, []);

  const switchRole = (role: UserRole | 'guest') => {
    if (role === 'guest') {
      setCurrentUser(null);
      showToast('Switched to Guest Mode');
      return;
    }
    const userMatch = INITIAL_USERS.find((u) => u.role === role);
    if (userMatch) {
      setCurrentUser(userMatch);
      showToast(`Switched user role to ${role.toUpperCase()}: ${userMatch.name}`);
    }
  };

  const addToCart = (product: Product, quantity = 1, selectedVariants?: Record<string, string>) => {
    setCart((prev) => {
      // Calculate unit price with variants if any
      let unitPrice = product.discountPrice || product.price;
      if (selectedVariants && product.variants) {
        for (const variant of product.variants) {
          const selectedOptionLabel = selectedVariants[variant.name];
          if (selectedOptionLabel) {
            const opt = variant.options.find((o) => o.label === selectedOptionLabel);
            if (opt && opt.priceModifier) {
              unitPrice += opt.priceModifier;
            }
          }
        }
      }

      const existingIndex = prev.findIndex((item) => {
        if (item.productId !== product.id) return false;
        if (!selectedVariants && !item.selectedVariants) return true;
        return JSON.stringify(item.selectedVariants) === JSON.stringify(selectedVariants);
      });

      if (existingIndex > -1) {
        const next = [...prev];
        const newQty = Math.min(product.stock, next[existingIndex].quantity + quantity);
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: newQty,
        };
        return next;
      }

      return [
        ...prev,
        {
          productId: product.id,
          product,
          quantity: Math.min(product.stock, quantity),
          selectedVariants,
          unitPrice,
        },
      ];
    });

    showToast(`${product.name} added to cart`);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const updateCartQuantity = (productId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          const validQty = Math.min(item.product.stock, qty);
          return { ...item, quantity: validQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      if (prev.includes(productId)) {
        showToast('Removed from wishlist');
        return prev.filter((id) => id !== productId);
      } else {
        showToast('Saved to wishlist');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const addToCompare = (product: Product) => {
    if (compareList.length >= 4) {
      showToast('You can compare up to 4 products at a time');
      return false;
    }
    if (compareList.some((p) => p.id === product.id)) {
      showToast('Product already in comparison');
      return false;
    }
    setCompareList((prev) => [...prev, product]);
    showToast(`Added ${product.name} to comparison`);
    return true;
  };

  const removeFromCompare = (productId: string) => {
    setCompareList((prev) => prev.filter((p) => p.id !== productId));
  };

  const isInCompare = (productId: string) => compareList.some((p) => p.id === productId);

  const clearCompare = () => {
    setCompareList([]);
  };

  const addRecentlyViewed = (product: Product) => {
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((p) => p.id !== product.id);
      return [product, ...filtered].slice(0, 8);
    });
  };

  const clearRecentlyViewed = () => {
    setRecentlyViewed([]);
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t,
        currentUser,
        setCurrentUser,
        switchRole,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        cartOpen,
        setCartOpen,
        wishlist,
        toggleWishlist,
        isInWishlist,
        compareList,
        addToCompare,
        removeFromCompare,
        isInCompare,
        clearCompare,
        recentlyViewed,
        addRecentlyViewed,
        clearRecentlyViewed,
        products,
        setProducts,
        categories,
        orders,
        reloadOrders,
        reloadProducts,
        activeView,
        setActiveView,
        activeModal,
        setActiveModal,
        selectedProduct,
        setSelectedProduct,
        selectedOrderForInvoice,
        setSelectedOrderForInvoice,
        trackingOrderNumber,
        setTrackingOrderNumber,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        toastMessage,
        showToast,
      }}
    >
      {children}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white text-xs px-4 py-3 rounded-lg shadow-xl border border-neutral-700 flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
