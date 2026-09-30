import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatNPR } from '../data/nepalData';
import { Product, Order, DeliveryStatus, Coupon, Campaign, SupportTicket, AuditLog, User, UserRole } from '../types';
import { INITIAL_USERS, INITIAL_AUDIT_LOGS, INITIAL_SUPPORT_TICKETS, INITIAL_COUPONS } from '../data/mockDatabase';
import { ProductImageManager } from './ProductImageManager';
import {
  TrendingUp,
  Package,
  ShoppingBag,
  AlertTriangle,
  FileDown,
  Plus,
  Edit,
  Trash2,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  Clock,
  Truck,
  Users,
  Tag,
  Calendar,
  MessageSquare,
  History,
  Settings,
  RefreshCw,
  X,
  UserPlus,
  UserCheck,
  Key,
  Lock,
  Search,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    products,
    reloadProducts,
    orders,
    reloadOrders,
    currentUser,
    setSelectedOrderForInvoice,
    setActiveModal,
    showToast,
    language,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'products' | 'orders' | 'inventory' | 'staff' | 'campaigns' | 'coupons' | 'tickets' | 'audit' | 'settings'
  >('overview');

  // Staff & Role Management State (Super Admin)
  const [staffList, setStaffList] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('sb_staff_users');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_USERS;
  });
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<User | null>(null);
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffRole, setStaffRole] = useState<UserRole>('staff');
  const [staffStatus, setStaffStatus] = useState<'active' | 'suspended'>('active');
  const [staffSearchQuery, setStaffSearchQuery] = useState('');

  // Analytics State
  const [analytics, setAnalytics] = useState<{
    totalSales: number;
    todaySales: number;
    totalOrdersCount: number;
    completedOrders: number;
    pendingOrders: number;
    paymentBreakdown: Record<string, number>;
    lowStockCount: number;
  }>({
    totalSales: 0,
    todaySales: 0,
    totalOrdersCount: 0,
    completedOrders: 0,
    pendingOrders: 0,
    paymentBreakdown: {},
    lowStockCount: 0,
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [couponsList, setCouponsList] = useState<Coupon[]>([]);

  // Add/Edit Product Modal State
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodNameNepali, setProdNameNepali] = useState('');
  const [prodCategory, setProdCategory] = useState('Local Nepali Products');
  const [prodBrand, setProdBrand] = useState('Chyangra Nepal');
  const [prodPrice, setProdPrice] = useState('5000');
  const [prodDiscountPrice, setProdDiscountPrice] = useState('4200');
  const [prodStock, setProdStock] = useState('20');
  const [prodImage, setProdImage] = useState('./images/product_nepal_pashmina_1790777676916.jpg');
  const [prodImages, setProdImages] = useState<string[]>(['./images/product_nepal_pashmina_1790777676916.jpg']);
  const [prodImageAlt, setProdImageAlt] = useState('');
  const [prodImageSource, setProdImageSource] = useState('Official Brand Press');
  const [prodDesc, setProdDesc] = useState('');
  const [prodDistrict, setProdDistrict] = useState('Kathmandu');
  const [isLocal, setIsLocal] = useState(true);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Order Status Update Modal State
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<DeliveryStatus>('processing');
  const [courierProvider, setCourierProvider] = useState('Pathao Express Nepal');
  const [trackingCode, setTrackingCode] = useState('PTH-NP-99281');
  const [courierPhone, setCourierPhone] = useState('+977 9801234567');
  const [statusNote, setStatusNote] = useState('');

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/admin/analytics');
      const data = await res.json();
      if (data.success) {
        setAnalytics(data.data);
      }
    } catch {
      // Fallback from client state
      const total = orders.reduce((sum, o) => sum + o.totalAmount, 0);
      setAnalytics({
        totalSales: total,
        todaySales: Math.round(total * 0.4),
        totalOrdersCount: orders.length,
        completedOrders: orders.filter((o) => o.deliveryStatus === 'delivered').length,
        pendingOrders: orders.filter((o) => o.deliveryStatus !== 'delivered').length,
        paymentBreakdown: { esewa: 1, khalti: 0, fonepay: 0, cod: 1 },
        lowStockCount: products.filter((p) => p.stock <= p.lowStockThreshold).length,
      });
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await fetch('/api/admin/staff');
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setStaffList(data.data);
          localStorage.setItem('sb_staff_users', JSON.stringify(data.data));
          return;
        }
      }
    } catch {
      // Fallback to local storage or mock
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/admin/audit-logs');
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setAuditLogs(data.data);
          return;
        }
      }
    } catch {
      // Fallback
    }
    setAuditLogs(INITIAL_AUDIT_LOGS);
  };

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/support/tickets');
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setTickets(data.data);
          return;
        }
      }
    } catch {
      // Fallback
    }
    setTickets(INITIAL_SUPPORT_TICKETS);
  };

  const fetchCoupons = async () => {
    try {
      const res = await fetch('/api/coupons');
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setCouponsList(data.data);
          return;
        }
      }
    } catch {
      // Fallback
    }
    setCouponsList(INITIAL_COUPONS);
  };

  useEffect(() => {
    fetchAnalytics();
    fetchStaff();
    fetchAuditLogs();
    fetchTickets();
    fetchCoupons();
  }, [orders, products]);

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser?.role !== 'super_admin') {
      showToast('Permission Denied: Only Super Admin can change staff details or roles');
      return;
    }

    if (!staffName.trim() || !staffEmail.trim()) {
      showToast('Staff name and email are required');
      return;
    }

    if (editingStaff) {
      const updatedUser: User = {
        ...editingStaff,
        name: staffName.trim(),
        email: staffEmail.trim(),
        phone: staffPhone.trim() || '+977 9800000000',
        role: staffRole,
        status: staffStatus,
      };

      try {
        await fetch(`/api/admin/staff/${editingStaff.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedUser),
        });
      } catch {
        // Static mode
      }

      const updatedList = staffList.map((s) => (s.id === editingStaff.id ? updatedUser : s));
      setStaffList(updatedList);
      localStorage.setItem('sb_staff_users', JSON.stringify(updatedList));

      const newLog: AuditLog = {
        id: `log-${Date.now()}`,
        staffId: currentUser.id,
        staffName: currentUser.name,
        staffRole: 'super_admin',
        action: 'UPDATE_STAFF_DETAILS',
        details: `Super Admin changed staff name to "${updatedUser.name}" and assigned role "${updatedUser.role}"`,
        timestamp: new Date().toISOString(),
      };
      setAuditLogs((prev) => [newLog, ...prev]);

      showToast(`Updated staff "${staffName}" with role "${staffRole}"`);
    } else {
      const newStaff: User = {
        id: `usr-${Date.now()}`,
        name: staffName.trim(),
        email: staffEmail.trim(),
        phone: staffPhone.trim() || '+977 9800000000',
        role: staffRole,
        status: staffStatus,
        createdAt: new Date().toISOString(),
      };

      try {
        await fetch('/api/admin/staff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newStaff),
        });
      } catch {
        // Static mode
      }

      const updatedList = [newStaff, ...staffList];
      setStaffList(updatedList);
      localStorage.setItem('sb_staff_users', JSON.stringify(updatedList));

      const newLog: AuditLog = {
        id: `log-${Date.now()}`,
        staffId: currentUser.id,
        staffName: currentUser.name,
        staffRole: 'super_admin',
        action: 'CREATE_STAFF_MEMBER',
        details: `Super Admin created new staff member "${newStaff.name}" (${newStaff.email}) with role "${newStaff.role}"`,
        timestamp: new Date().toISOString(),
      };
      setAuditLogs((prev) => [newLog, ...prev]);

      showToast(`Created new staff "${staffName}" as ${staffRole}`);
    }

    setStaffModalOpen(false);
    setEditingStaff(null);
  };

  const handleDeleteStaff = async (staffId: string, name: string) => {
    if (currentUser?.role !== 'super_admin') {
      showToast('Permission Denied: Only Super Admin can remove staff members');
      return;
    }
    if (staffId === 'usr-superadmin') {
      showToast('Cannot delete primary Super Admin account');
      return;
    }
    if (!confirm(`Are you sure you want to remove staff member "${name}"?`)) {
      return;
    }

    try {
      await fetch(`/api/admin/staff/${staffId}`, { method: 'DELETE' });
    } catch {
      // Static mode
    }

    const updatedList = staffList.filter((s) => s.id !== staffId);
    setStaffList(updatedList);
    localStorage.setItem('sb_staff_users', JSON.stringify(updatedList));

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      staffId: currentUser.id,
      staffName: currentUser.name,
      staffRole: 'super_admin',
      action: 'DELETE_STAFF_MEMBER',
      details: `Super Admin removed staff member "${name}"`,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    showToast(`Staff member "${name}" removed`);
  };

  // AI Description & Copy Generator for Nepali E-Commerce
  const handleGenerateAIDescription = async () => {
    if (!prodName.trim()) {
      showToast('Please enter a product name first');
      return;
    }
    setIsGeneratingAI(true);
    try {
      const res = await fetch('/api/ai/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: prodName,
          category: prodCategory,
          brand: prodBrand,
          features: `Authentic Nepali quality, origins in ${prodDistrict}, standard delivery across all 7 provinces`,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setProdDesc(data.data.description);
        if (data.data.descriptionNepali) {
          setProdNameNepali(prodName); // Or keep
        }
        showToast('Generated description using Gemini 3.8 Flash!');
      } else {
        setProdDesc(`Handcrafted premium ${prodName} by ${prodBrand}. Certified genuine quality with 1-year brand warranty. Fast delivery across Nepal.`);
      }
    } catch {
      setProdDesc(`Authentic ${prodName} designed for Nepali homes. Certified original item with fast cash-on-delivery across Nepal.`);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: prodName,
      nameNepali: prodNameNepali,
      category: prodCategory,
      categorySlug: prodCategory.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      brand: prodBrand,
      price: Number(prodPrice),
      discountPrice: prodDiscountPrice ? Number(prodDiscountPrice) : undefined,
      stock: Number(prodStock),
      lowStockThreshold: 5,
      description: prodDesc || `Premium ${prodName} in Nepal`,
      featuredImage: prodImage,
      images: prodImages.length > 0 ? prodImages : [prodImage],
      imageAlt: prodImageAlt,
      imageSource: prodImageSource,
      originDistrict: prodDistrict,
      isLocalNepaliProduct: isLocal,
      specifications: {
        'Origin': `${prodDistrict}, Nepal`,
        'Authenticity': '100% Guaranteed',
      },
      warranty: '1 Year Brand Warranty in Nepal',
      returnPolicy: '7 Days Return',
      deliveryDays: 2,
      tags: ['nepal', 'marketplace', prodBrand.toLowerCase()],
      staffId: currentUser?.id || 'usr-admin',
      staffName: currentUser?.name || 'Admin',
      staffRole: currentUser?.role || 'admin',
    };

    try {
      if (editingProduct) {
        await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        showToast(`Updated product "${prodName}"`);
      } else {
        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        showToast(`Added product "${prodName}"`);
      }
      await reloadProducts();
      setProductModalOpen(false);
      setEditingProduct(null);
    } catch {
      showToast('Error saving product');
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name}?`)) return;
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      await reloadProducts();
      showToast(`Removed product ${name}`);
    } catch {
      showToast('Failed to delete product');
    }
  };

  const handleUpdateOrderStatus = async () => {
    if (!selectedOrder) return;
    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          note: statusNote || `Status updated to ${newStatus} by ${currentUser?.name}`,
          staffName: currentUser?.name || 'Staff User',
          staffId: currentUser?.id || 'usr-staff',
          courierProvider,
          trackingNumber: trackingCode,
          courierPhone,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Order ${selectedOrder.orderNumber} updated to ${newStatus}`);
        await reloadOrders();
        setOrderModalOpen(false);
      }
    } catch {
      showToast('Error updating status');
    }
  };

  const handleStockAdjustment = async (p: Product, delta: number) => {
    const newStock = Math.max(0, p.stock + delta);
    try {
      await fetch(`/api/products/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stock: newStock,
          staffName: currentUser?.name || 'Admin',
        }),
      });
      await reloadProducts();
      showToast(`Stock updated: ${p.name} -> ${newStock} units`);
    } catch {
      showToast('Failed to adjust stock');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 my-8 space-y-6">
      {/* Top Banner with Staff Context */}
      <div className="bg-neutral-900 text-white rounded-2xl p-6 shadow-md border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-red-500 font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Sajilo Bazar Administration & Merchant Portal</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white mt-1">
            Store Management Hub
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Logged in as: <strong className="text-white">{currentUser?.name}</strong> · Role: <span className="text-red-400 uppercase font-bold">{currentUser?.role}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/api/admin/export/orders.csv"
            download="sajilo_bazar_orders.csv"
            className="flex items-center gap-1.5 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-xl border border-neutral-700 transition-colors shadow-xs"
          >
            <FileDown className="w-3.5 h-3.5 text-red-400" />
            <span>Export CSV</span>
          </a>

          <button
            onClick={() => {
              setEditingProduct(null);
              setProdName('');
              setProdNameNepali('');
              setProdPrice('4500');
              setProdDiscountPrice('3800');
              setProdStock('25');
              setProdDesc('');
              setProdImage('./images/product_nepal_pashmina_1790777676916.jpg');
              setProdImages(['./images/product_nepal_pashmina_1790777676916.jpg']);
              setProdImageAlt('');
              setProdImageSource('');
              setProductModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-neutral-200 pb-2 no-scrollbar text-xs font-semibold text-neutral-600">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'overview' ? 'bg-neutral-900 text-white' : 'hover:bg-neutral-100 text-neutral-700'
          }`}
        >
          Overview & KPI
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'products' ? 'bg-neutral-900 text-white' : 'hover:bg-neutral-100 text-neutral-700'
          }`}
        >
          Products ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'orders' ? 'bg-neutral-900 text-white' : 'hover:bg-neutral-100 text-neutral-700'
          }`}
        >
          Orders & Delivery ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'inventory' ? 'bg-neutral-900 text-white' : 'hover:bg-neutral-100 text-neutral-700'
          }`}
        >
          Inventory Control
        </button>
        <button
          onClick={() => setActiveTab('staff')}
          className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'staff' ? 'bg-neutral-900 text-white' : 'hover:bg-neutral-100 text-neutral-700'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Staff & Roles ({staffList.length})</span>
          {currentUser?.role === 'super_admin' && (
            <span className="text-[9px] bg-red-600 text-white px-1.5 py-0.5 rounded font-mono font-bold uppercase">
              Super Admin
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('coupons')}
          className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'coupons' ? 'bg-neutral-900 text-white' : 'hover:bg-neutral-100 text-neutral-700'
          }`}
        >
          Coupons & Offers
        </button>
        <button
          onClick={() => setActiveTab('tickets')}
          className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'tickets' ? 'bg-neutral-900 text-white' : 'hover:bg-neutral-100 text-neutral-700'
          }`}
        >
          Support Tickets ({tickets.length})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'audit' ? 'bg-neutral-900 text-white' : 'hover:bg-neutral-100 text-neutral-700'
          }`}
        >
          Audit Logs
        </button>
      </div>

      {/* TAB 1: OVERVIEW & KPI */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Summary Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-xs">
              <div className="text-[11px] font-bold text-neutral-400 uppercase">Total Sales</div>
              <div className="text-2xl font-black text-neutral-900 font-mono mt-1">
                {formatNPR(analytics.totalSales)}
              </div>
              <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-semibold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+18.4% during Dashain Festival</span>
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-xs">
              <div className="text-[11px] font-bold text-neutral-400 uppercase">Today's Revenue</div>
              <div className="text-2xl font-black text-neutral-900 font-mono mt-1">
                {formatNPR(analytics.todaySales)}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">
                From Kathmandu, Pokhara & Chitwan
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-xs">
              <div className="text-[11px] font-bold text-neutral-400 uppercase">Total Orders</div>
              <div className="text-2xl font-black text-neutral-900 font-mono mt-1">
                {analytics.totalOrdersCount}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">
                {analytics.pendingOrders} pending fulfillment
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-xs">
              <div className="text-[11px] font-bold text-neutral-400 uppercase">Low Stock Alerts</div>
              <div className="text-2xl font-black text-amber-600 font-mono mt-1">
                {analytics.lowStockCount}
              </div>
              <div className="text-[11px] text-amber-700 mt-1 font-semibold">
                Requires warehouse replenishment
              </div>
            </div>
          </div>

          {/* Payment Method Breakdown & Province Fulfillment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-white rounded-xl border border-neutral-200 space-y-3">
              <h3 className="font-bold text-xs text-neutral-900 uppercase tracking-wider">
                Nepal Payment Method Distribution
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-700">eSewa Mobile Wallet</span>
                  <span className="font-mono font-bold text-emerald-600">45%</span>
                </div>
                <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full w-[45%]" />
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-700">Cash on Delivery (All Nepal)</span>
                  <span className="font-mono font-bold text-neutral-800">30%</span>
                </div>
                <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-neutral-800 h-full w-[30%]" />
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-700">Khalti Wallet / Fonepay QR</span>
                  <span className="font-mono font-bold text-purple-600">25%</span>
                </div>
                <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-600 h-full w-[25%]" />
                </div>
              </div>
            </div>

            <div className="p-5 bg-white rounded-xl border border-neutral-200 space-y-3">
              <h3 className="font-bold text-xs text-neutral-900 uppercase tracking-wider">
                Province Logistics Performance
              </h3>
              <div className="space-y-2 text-xs text-neutral-600">
                <div className="flex justify-between py-1 border-b border-neutral-100">
                  <span>Bagmati Province (Valley & Chitwan)</span>
                  <strong className="text-neutral-900 font-mono">1.1 Days Avg · 99% SLA</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-100">
                  <span>Gandaki Province (Pokhara Hub)</span>
                  <strong className="text-neutral-900 font-mono">2.2 Days Avg · 96% SLA</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-100">
                  <span>Koshi & Lumbini Provinces</span>
                  <strong className="text-neutral-900 font-mono">2.8 Days Avg · 94% SLA</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span>Karnali & Sudurpashchim</span>
                  <strong className="text-neutral-900 font-mono">4.5 Days Avg · 91% SLA</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/60">
            <div className="text-xs font-bold text-neutral-900">
              Marketplace Product Catalog ({products.length} Items)
            </div>
            <button
              onClick={() => {
                setEditingProduct(null);
                setProdName('');
                setProdPrice('3500');
                setProdStock('20');
                setProdImage('./images/product_nepal_pashmina_1790777676916.jpg');
                setProdImages(['./images/product_nepal_pashmina_1790777676916.jpg']);
                setProdImageAlt('');
                setProdImageSource('');
                setProductModalOpen(true);
              }}
              className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700"
            >
              + New Product
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-neutral-100 text-neutral-700 uppercase font-semibold text-[11px] border-b border-neutral-200">
                <tr>
                  <th className="py-2.5 px-4">Item</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">Brand</th>
                  <th className="py-2.5 px-4 text-right">Price (NPR)</th>
                  <th className="py-2.5 px-4 text-center">Stock</th>
                  <th className="py-2.5 px-4 text-center">Origin</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-50/70">
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={p.featuredImage}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover bg-neutral-100 border border-neutral-200 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="font-semibold text-neutral-900 line-clamp-1">{p.name}</div>
                          <div className="text-[10px] text-neutral-400 font-mono">SKU: {p.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-neutral-600">{p.category}</td>
                    <td className="py-2.5 px-4 font-medium text-neutral-900">{p.brand}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-neutral-900">
                      {formatNPR(p.discountPrice || p.price)}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded font-mono font-bold ${
                        p.stock <= p.lowStockThreshold ? 'bg-amber-100 text-amber-800' : 'bg-neutral-100 text-neutral-700'
                      }`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center text-neutral-500">
                      {p.originDistrict || 'Nepal'}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setEditingProduct(p);
                            setProdName(p.name);
                            setProdNameNepali(p.nameNepali || '');
                            setProdCategory(p.category);
                            setProdBrand(p.brand);
                            setProdPrice(String(p.price));
                            setProdDiscountPrice(p.discountPrice ? String(p.discountPrice) : '');
                            setProdStock(String(p.stock));
                            setProdImage(p.featuredImage);
                            setProdImages(p.images && p.images.length > 0 ? p.images : [p.featuredImage]);
                            setProdImageAlt(p.imageAlt || '');
                            setProdImageSource(p.imageSource || 'Original product photo');
                            setProdDesc(p.description);
                            setProdDistrict(p.originDistrict || 'Kathmandu');
                            setIsLocal(!!p.isLocalNepaliProduct);
                            setProductModalOpen(true);
                          }}
                          className="p-1 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          className="p-1 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/60">
            <div className="text-xs font-bold text-neutral-900">
              Orders & Dispatch Pipeline ({orders.length})
            </div>
            <div className="text-xs text-neutral-500">
              Click status to update courier tracking & fulfillment timeline
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-neutral-100 text-neutral-700 uppercase font-semibold text-[11px] border-b border-neutral-200">
                <tr>
                  <th className="py-2.5 px-4">Order No</th>
                  <th className="py-2.5 px-4">Customer</th>
                  <th className="py-2.5 px-4">Destination</th>
                  <th className="py-2.5 px-4">Payment</th>
                  <th className="py-2.5 px-4 text-right">Amount</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-neutral-50/70">
                    <td className="py-3 px-4 font-mono font-bold text-neutral-900">
                      {ord.orderNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-neutral-900">{ord.customerName}</div>
                      <div className="text-[11px] text-neutral-500">{ord.customerPhone}</div>
                    </td>
                    <td className="py-3 px-4 text-neutral-600">
                      <div>{ord.shippingAddress.district}</div>
                      <div className="text-[10px] text-neutral-400">{ord.shippingAddress.province.split(' ')[0]}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold uppercase text-[11px]">{ord.payment.method}</span>
                      <div className="text-[10px] text-neutral-400">{ord.payment.status}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-neutral-900">
                      {formatNPR(ord.totalAmount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          setSelectedOrder(ord);
                          setNewStatus(ord.deliveryStatus);
                          setCourierProvider(ord.courierInfo?.provider || 'Pathao Express Nepal');
                          setTrackingCode(ord.courierInfo?.trackingNumber || 'PTH-NP-99281');
                          setCourierPhone(ord.courierInfo?.courierPhone || '+977 9801234567');
                          setStatusNote('');
                          setOrderModalOpen(true);
                        }}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase transition-colors ${
                          ord.deliveryStatus === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.deliveryStatus === 'out_for_delivery'
                            ? 'bg-red-100 text-red-800'
                            : ord.deliveryStatus === 'dispatched'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200'
                        }`}
                      >
                        {ord.deliveryStatus.replace(/_/g, ' ')} ▾
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedOrderForInvoice(ord);
                          setActiveModal('invoice');
                        }}
                        className="px-2.5 py-1 bg-white border border-neutral-300 hover:border-neutral-400 rounded text-neutral-700 font-semibold text-[11px]"
                      >
                        VAT Invoice
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: INVENTORY CONTROL */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Warehouse Inventory & Stock Adjustments</h3>
              <p className="text-xs text-neutral-500">Live quantity tracking with automatic reduction after order</p>
            </div>
            <span className="text-xs text-neutral-400">Kathmandu Central Fulfillment</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {products.map((p) => (
              <div key={p.id} className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono text-neutral-400 text-[10px]">{p.sku}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      p.stock <= p.lowStockThreshold ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {p.stock <= p.lowStockThreshold ? 'LOW STOCK' : 'HEALTHY'}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-neutral-900 line-clamp-1">{p.name}</h4>
                  <div className="text-xs text-neutral-500 mt-1 font-mono">
                    Current: <strong className="text-neutral-900 text-sm">{p.stock} units</strong>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-neutral-200 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-neutral-500">Quick Adjust:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleStockAdjustment(p, -5)}
                      className="px-2 py-1 bg-white border border-neutral-300 rounded font-bold hover:bg-neutral-100"
                    >
                      -5
                    </button>
                    <button
                      onClick={() => handleStockAdjustment(p, -1)}
                      className="px-2 py-1 bg-white border border-neutral-300 rounded font-bold hover:bg-neutral-100"
                    >
                      -1
                    </button>
                    <button
                      onClick={() => handleStockAdjustment(p, 5)}
                      className="px-2 py-1 bg-neutral-900 text-white rounded font-bold hover:bg-neutral-800"
                    >
                      +5
                    </button>
                    <button
                      onClick={() => handleStockAdjustment(p, 20)}
                      className="px-2 py-1 bg-red-600 text-white rounded font-bold hover:bg-red-700"
                    >
                      +20
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: COUPONS */}
      {activeTab === 'coupons' && (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-900">Active Festival Coupons & Promo Codes</h3>
            <span className="text-xs text-neutral-500">Automatic validation at checkout</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {couponsList.map((coup) => (
              <div key={coup.id} className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-800 font-mono font-extrabold text-xs rounded">
                    {coup.code}
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                    ACTIVE
                  </span>
                </div>
                <p className="text-xs text-neutral-700 font-medium">{coup.description}</p>
                <div className="text-[11px] text-neutral-500 pt-1 border-t border-neutral-200 space-y-0.5 font-mono">
                  <div>Min Order: {formatNPR(coup.minOrderAmount)}</div>
                  <div>Times Used: {coup.timesUsed} / {coup.usageLimit}</div>
                  <div>Valid until: {coup.endDate}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: SUPPORT TICKETS */}
      {activeTab === 'tickets' && (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-900">Customer Support Inquiries & Helpdesk</h3>
            <span className="text-xs text-neutral-500">Fast 2-hour response guarantee in Nepal</span>
          </div>

          <div className="space-y-3">
            {tickets.map((tkt) => (
              <div key={tkt.id} className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-neutral-900">{tkt.ticketNumber}</span>
                    <span className="text-neutral-400">·</span>
                    <span className="font-semibold text-neutral-800">{tkt.customerName} ({tkt.customerPhone})</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                    tkt.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {tkt.status}
                  </span>
                </div>

                <div className="font-bold text-neutral-900 text-xs">{tkt.subject}</div>

                <div className="p-2.5 bg-white rounded border border-neutral-200 space-y-2">
                  {tkt.messages.map((m) => (
                    <div key={m.id} className="text-xs">
                      <strong className={m.sender === 'staff' ? 'text-red-600' : 'text-neutral-900'}>
                        {m.senderName}:
                      </strong>{' '}
                      <span className="text-neutral-700">{m.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-900">Administrative Security & Change Audit Logs</h3>
            <span className="text-xs text-neutral-500">Immutable trace for Super Admin & Compliance</span>
          </div>

          <div className="divide-y divide-neutral-200 text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-3 flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-neutral-900">{log.action}</span>
                    <span className="text-[10px] bg-neutral-100 text-neutral-600 font-mono px-1.5 py-0.5 rounded">
                      {log.staffName} ({log.staffRole})
                    </span>
                  </div>
                  <p className="text-neutral-600">{log.details}</p>
                </div>
                <div className="text-right text-[11px] text-neutral-400 font-mono shrink-0">
                  <div>{new Date(log.timestamp).toLocaleDateString()}</div>
                  <div>{new Date(log.timestamp).toLocaleTimeString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: STAFF & ROLES (SUPER ADMIN CONSOLE) */}
      {activeTab === 'staff' && (
        <div className="space-y-4">
          {/* Permission / Authorization Status Banner */}
          {currentUser?.role === 'super_admin' ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3 text-emerald-900 shadow-xs">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs text-emerald-950 flex items-center gap-2">
                  <span>Super Admin Privilege Active</span>
                  <span className="bg-emerald-200 text-emerald-900 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                    Full Control
                  </span>
                </h4>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  You have full authority to change staff names, create new staff members, and assign roles. All modifications are permanently recorded in the Audit Trail.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-amber-900 shadow-xs">
              <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs text-amber-950 flex items-center gap-2">
                  <span>Read-Only Mode ({currentUser?.role})</span>
                  <span className="bg-amber-200 text-amber-900 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                    Super Admin Required
                  </span>
                </h4>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Viewing staff profiles in read-only mode. Use the <strong>Role Switcher</strong> in the top navigation bar to switch to <strong>Super Admin</strong> to rename staff or create new staff and roles.
                </p>
              </div>
            </div>
          )}

          {/* Action & Search Bar */}
          <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3" />
              <input
                type="text"
                value={staffSearchQuery}
                onChange={(e) => setStaffSearchQuery(e.target.value)}
                placeholder="Search staff by name, email, or role..."
                className="w-full pl-8 pr-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs"
              />
            </div>

            <button
              onClick={() => {
                if (currentUser?.role !== 'super_admin') {
                  showToast('Super Admin role required to create new staff');
                  return;
                }
                setEditingStaff(null);
                setStaffName('');
                setStaffEmail('');
                setStaffPhone('+977 98');
                setStaffRole('staff');
                setStaffStatus('active');
                setStaffModalOpen(true);
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create New Staff Member</span>
            </button>
          </div>

          {/* Staff Table */}
          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/60">
              <div className="text-xs font-bold text-neutral-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-neutral-600" />
                <span>Team & Staff Directory ({staffList.length} Accounts)</span>
              </div>
              <span className="text-[11px] text-neutral-500">
                Sorted by administrative hierarchy
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-neutral-100 text-neutral-700 uppercase font-semibold text-[11px] border-b border-neutral-200">
                  <tr>
                    <th className="py-2.5 px-4">Staff Member</th>
                    <th className="py-2.5 px-4">Assigned Role</th>
                    <th className="py-2.5 px-4">Contact (Email & Phone)</th>
                    <th className="py-2.5 px-4 text-center">Status</th>
                    <th className="py-2.5 px-4 text-center">Joined Date</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {staffList
                    .filter((s) => {
                      if (!staffSearchQuery.trim()) return true;
                      const q = staffSearchQuery.toLowerCase();
                      return (
                        s.name.toLowerCase().includes(q) ||
                        s.email.toLowerCase().includes(q) ||
                        s.role.toLowerCase().includes(q)
                      );
                    })
                    .map((s) => {
                      return (
                        <tr key={s.id} className="hover:bg-neutral-50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              {s.avatar ? (
                                <img
                                  src={s.avatar}
                                  alt={s.name}
                                  className="w-9 h-9 rounded-full object-cover border border-neutral-200 shadow-xs"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-neutral-900 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                                  {s.name.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                                  <span>{s.name}</span>
                                  {s.id === currentUser?.id && (
                                    <span className="text-[9px] bg-neutral-200 text-neutral-700 px-1.5 py-0.5 rounded font-mono">
                                      You
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-neutral-400 font-mono">{s.id}</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                s.role === 'super_admin'
                                  ? 'bg-red-100 text-red-700 border border-red-200'
                                  : s.role === 'admin'
                                  ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                  : s.role === 'manager'
                                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                  : s.role === 'staff'
                                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                  : 'bg-amber-100 text-amber-700 border border-amber-200'
                              }`}
                            >
                              <Key className="w-3 h-3" />
                              {s.role.replace('_', ' ')}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-medium text-neutral-800">{s.email}</div>
                            <div className="text-[11px] text-neutral-400 font-mono">{s.phone}</div>
                          </td>

                          <td className="py-3 px-4 text-center">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                s.status === 'suspended'
                                  ? 'bg-neutral-200 text-neutral-600'
                                  : 'bg-emerald-100 text-emerald-700'
                              }`}
                            >
                              {s.status === 'suspended' ? 'Suspended' : 'Active'}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-center text-neutral-500 font-mono text-[11px]">
                            {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '2026-01-01'}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  if (currentUser?.role !== 'super_admin') {
                                    showToast('Super Admin role required to edit staff');
                                    return;
                                  }
                                  setEditingStaff(s);
                                  setStaffName(s.name);
                                  setStaffEmail(s.email);
                                  setStaffPhone(s.phone);
                                  setStaffRole(s.role);
                                  setStaffStatus(s.status || 'active');
                                  setStaffModalOpen(true);
                                }}
                                className="flex items-center gap-1 px-2.5 py-1 text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded font-semibold text-[11px] transition-colors"
                                title="Change name or role"
                              >
                                <Edit className="w-3 h-3" />
                                <span>Edit Name & Role</span>
                              </button>

                              {s.id !== 'usr-superadmin' && (
                                <button
                                  onClick={() => handleDeleteStaff(s.id, s.name)}
                                  disabled={currentUser?.role !== 'super_admin'}
                                  className="p-1 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-40"
                                  title="Delete staff"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT PRODUCT */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 max-w-xl w-full p-6 space-y-4 my-auto max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h3 className="text-base font-bold text-neutral-900">
                {editingProduct ? 'Edit Product' : 'Add New Product to Sajilo Bazar'}
              </h3>
              <button
                onClick={() => setProductModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3">
              <div>
                <label className="font-semibold block mb-1">Product Name (English) *</label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="e.g. Pure Himalayan Pashmina Shawl"
                  className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Product Name (नेपाली) Optional</label>
                <input
                  type="text"
                  value={prodNameNepali}
                  onChange={(e) => setProdNameNepali(e.target.value)}
                  placeholder="e.g. शुद्ध हिमालयन पश्मिना"
                  className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Category *</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs"
                  >
                    <option value="Local Nepali Products">Local Nepali Products</option>
                    <option value="Electronics & Mobiles">Electronics & Mobiles</option>
                    <option value="Fashion & Men's/Women's">Fashion & Apparel</option>
                    <option value="Shoes & Footwear">Shoes & Footwear</option>
                    <option value="Home & Kitchen">Home & Kitchen</option>
                    <option value="Grocery & Spices">Grocery & Spices</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={prodBrand}
                    onChange={(e) => setProdBrand(e.target.value)}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Price (NPR) *</label>
                  <input
                    type="number"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded-lg font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Discount Price (NPR)</label>
                  <input
                    type="number"
                    value={prodDiscountPrice}
                    onChange={(e) => setProdDiscountPrice(e.target.value)}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded-lg font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Stock Qty *</label>
                  <input
                    type="number"
                    required
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value)}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded-lg font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Origin District in Nepal</label>
                  <input
                    type="text"
                    value={prodDistrict}
                    onChange={(e) => setProdDistrict(e.target.value)}
                    placeholder="e.g. Ilam, Mustang, Palpa"
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs"
                  />
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="isLocal"
                    checked={isLocal}
                    onChange={(e) => setIsLocal(e.target.checked)}
                    className="w-4 h-4 accent-red-600 rounded"
                  />
                  <label htmlFor="isLocal" className="font-semibold text-neutral-800">
                    Authentic Nepali Product (स्वदेशी)
                  </label>
                </div>
              </div>

              {/* Multi-source Product Image Manager (Upload, Link, Google Search) */}
              <ProductImageManager
                featuredImage={prodImage}
                images={prodImages}
                imageAlt={prodImageAlt}
                imageSource={prodImageSource}
                productName={prodName}
                category={prodCategory}
                brand={prodBrand}
                onChange={({ featuredImage, images, imageAlt, imageSource }) => {
                  setProdImage(featuredImage);
                  setProdImages(images);
                  setProdImageAlt(imageAlt);
                  setProdImageSource(imageSource);
                }}
              />

              {/* AI Description Generator Button */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold">Description & Specifications</label>
                  <button
                    type="button"
                    onClick={handleGenerateAIDescription}
                    disabled={isGeneratingAI}
                    className="flex items-center gap-1 text-[11px] text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2.5 py-0.5 rounded font-bold"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isGeneratingAI ? 'Generating Copy...' : 'AI Auto-Generate Copy'}</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  placeholder="Compelling product details, material, and warranty..."
                  className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs"
                />
              </div>

              <div className="pt-3 border-t border-neutral-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2 border border-neutral-300 rounded-lg font-semibold hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: UPDATE ORDER STATUS */}
      {orderModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 max-w-md w-full p-6 space-y-4 my-auto text-xs">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-neutral-900">Update Order Status</h3>
                <p className="text-[11px] text-neutral-500 font-mono">{selectedOrder.orderNumber}</p>
              </div>
              <button
                onClick={() => setOrderModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-semibold block mb-1">New Delivery Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as DeliveryStatus)}
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg font-bold uppercase text-xs"
                >
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing (Central Hub)</option>
                  <option value="packed">Packed</option>
                  <option value="dispatched">Dispatched</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered (Completed)</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="returned">Returned</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Assigned Courier Provider</label>
                <input
                  type="text"
                  value={courierProvider}
                  onChange={(e) => setCourierProvider(e.target.value)}
                  className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Tracking Code</label>
                  <input
                    type="text"
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded-lg font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Rider Mobile</label>
                  <input
                    type="text"
                    value={courierPhone}
                    onChange={(e) => setCourierPhone(e.target.value)}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded-lg font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Status Timeline Note</label>
                <input
                  type="text"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Package dispatched from Kathmandu hub"
                  className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-200 flex justify-end gap-2">
              <button
                onClick={() => setOrderModalOpen(false)}
                className="px-4 py-2 border border-neutral-300 rounded-lg font-semibold hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateOrderStatus}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE / EDIT STAFF MEMBER */}
      {staffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 max-w-lg w-full p-6 space-y-4 my-auto text-xs">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-red-100 text-red-600">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    {editingStaff ? 'Change Staff Name & Role' : 'Create New Staff & Assign Role'}
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Super Admin Console · Sajilo Bazar Staff Management
                  </p>
                </div>
              </div>
              <button
                onClick={() => setStaffModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="space-y-4">
              <div>
                <label className="font-semibold block mb-1 text-neutral-700">
                  Staff Full Name * (Changeable by Super Admin)
                </label>
                <input
                  type="text"
                  required
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  placeholder="e.g. Ram Bahadur Gurung"
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-neutral-700">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={staffEmail}
                    onChange={(e) => setStaffEmail(e.target.value)}
                    placeholder="staff@sajilobazar.com"
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-xs focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-neutral-700">Phone Number</label>
                  <input
                    type="text"
                    value={staffPhone}
                    onChange={(e) => setStaffPhone(e.target.value)}
                    placeholder="+977 98xxxxxxxx"
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-neutral-700">
                  Assign Staff Role *
                </label>
                <select
                  value={staffRole}
                  onChange={(e) => setStaffRole(e.target.value as UserRole)}
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                >
                  <option value="super_admin">Super Admin (Full system owner & access control)</option>
                  <option value="admin">Store Admin (Catalog, orders, coupons, financial reports)</option>
                  <option value="manager">Store Manager (Inventory control, delivery logistics)</option>
                  <option value="staff">Operations Staff (Order status updates, dispatch fulfillment)</option>
                  <option value="vendor">Artisan Vendor (Vendor merchant portal)</option>
                </select>
                <p className="text-[10px] text-neutral-400 mt-1">
                  Roles automatically determine permissions across marketplace modules.
                </p>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-neutral-700">Account Status</label>
                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="staffStatus"
                      checked={staffStatus === 'active'}
                      onChange={() => setStaffStatus('active')}
                      className="accent-red-600"
                    />
                    <span className="font-semibold text-emerald-700">Active (Authorized)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="staffStatus"
                      checked={staffStatus === 'suspended'}
                      onChange={() => setStaffStatus('suspended')}
                      className="accent-red-600"
                    />
                    <span className="font-semibold text-neutral-500">Suspended</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setStaffModalOpen(false)}
                  className="px-4 py-2 border border-neutral-300 hover:bg-neutral-100 rounded-lg font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs shadow-xs transition-colors"
                >
                  {editingStaff ? 'Save Name & Role Changes' : 'Create Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
