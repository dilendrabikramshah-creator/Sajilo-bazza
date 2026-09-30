export type UserRole = 'super_admin' | 'admin' | 'manager' | 'staff' | 'vendor' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  twoFactorEnabled?: boolean;
  createdAt: string;
  loyaltyPoints?: number;
  vendorInfo?: {
    storeName: string;
    panNumber: string;
    approved: boolean;
    commissionRate: number;
  };
}

export interface PermissionMatrix {
  canViewOrders: boolean;
  canUpdateOrderStatus: boolean;
  canManageInventory: boolean;
  canEditProducts: boolean;
  canViewCustomers: boolean;
  canProcessReturns: boolean;
  canManageCoupons: boolean;
  canManageCampaigns: boolean;
  canViewFinancialReports: boolean;
  canManagePaymentSettings: boolean;
  canManageSecurity: boolean;
}

export interface ProductVariant {
  id: string;
  name: string; // e.g. "Size", "Storage", "Color"
  options: {
    label: string; // "Large", "256GB", "Midnight Black"
    priceModifier: number; // in NPR
    stock: number;
    sku: string;
  }[];
}

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number; // 1 to 5
  title: string;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
  helpfulCount: number;
  images?: string[];
  status: 'approved' | 'pending' | 'rejected';
}

export interface Product {
  id: string;
  name: string;
  nameNepali?: string;
  slug: string;
  sku: string;
  category: string;
  categorySlug: string;
  subcategory?: string;
  brand: string;
  sellerId?: string;
  sellerName?: string;
  price: number; // Regular price in NPR
  discountPrice?: number; // Discounted price in NPR
  stock: number;
  lowStockThreshold: number;
  description: string;
  descriptionNepali?: string;
  specifications: Record<string, string>;
  images: string[];
  featuredImage: string;
  imageAlt?: string;
  imageSource?: string;
  videoUrl?: string;
  variants?: ProductVariant[];
  tags: string[];
  isFeatured?: boolean;
  isFlashSale?: boolean;
  flashSaleEndsAt?: string;
  flashSaleDiscountPercent?: number;
  isLocalNepaliProduct?: boolean;
  originDistrict?: string; // e.g. "Ilam", "Mustang", "Palpa"
  warranty: string;
  returnPolicy: string;
  deliveryDays: number;
  rating: number;
  reviewCount: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  status: 'active' | 'draft' | 'archived';
}

export interface Category {
  id: string;
  name: string;
  nameNepali: string;
  slug: string;
  icon: string;
  subcategories: { id: string; name: string; slug: string }[];
  featured?: boolean;
  image?: string;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  selectedVariants?: Record<string, string>; // e.g. { "Size": "XL", "Color": "Navy" }
  unitPrice: number; // calculated with variant modifier
}

export interface DeliveryAddress {
  id?: string;
  fullName: string;
  phone: string;
  province: string;
  district: string;
  municipality: string;
  ward: string;
  tole: string;
  landmark?: string;
  isDefault?: boolean;
  deliveryNotes?: string;
}

export type PaymentMethodType = 'esewa' | 'khalti' | 'fonepay' | 'cod' | 'bank_transfer';
export type PaymentStatus = 'pending' | 'verified' | 'failed' | 'refunded';

export interface PaymentDetails {
  method: PaymentMethodType;
  status: PaymentStatus;
  transactionId?: string;
  referenceId?: string;
  verifiedAt?: string;
  amount: number;
  gatewayFee?: number;
  rawGatewayResponse?: Record<string, unknown>;
}

export type DeliveryStatus = 
  | 'order_placed'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'dispatched'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'returned'
  | 'refunded'
  | 'failed_delivery';

export interface OrderTimelineEvent {
  status: DeliveryStatus;
  timestamp: string;
  note: string;
  location?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  selectedVariants?: Record<string, string>;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. "SB-2026-000123"
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  shippingAddress: DeliveryAddress;
  deliveryType: 'standard' | 'express' | 'pickup';
  deliveryFee: number;
  subtotal: number;
  couponCode?: string;
  discountAmount: number;
  taxVatRate: number; // 0.13 for 13% VAT
  taxAmount: number;
  totalAmount: number;
  payment: PaymentDetails;
  deliveryStatus: DeliveryStatus;
  timeline: OrderTimelineEvent[];
  courierInfo?: {
    provider: string; // e.g. "Nepal Post", "Pathao Express", "Sundar Delivery"
    trackingNumber: string;
    courierPhone: string;
  };
  estimatedDeliveryDate: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed_npr';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  timesUsed: number;
  perUserLimit: number;
  categoryRestriction?: string;
  firstOrderOnly?: boolean;
  isActive: boolean;
}

export interface Campaign {
  id: string;
  title: string;
  titleNepali: string;
  tagline: string;
  festivalType: 'dashain' | 'tihar' | 'teej' | 'holi' | 'new_year' | 'seasonal';
  bannerImage: string;
  startDate: string;
  endDate: string;
  discountHighlight: string;
  couponCode?: string;
  isActive: boolean;
  featuredCategorySlug?: string;
}

export interface AuditLog {
  id: string;
  staffId: string;
  staffName: string;
  staffRole: string;
  action: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderNumber?: string;
  subject: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  messages: {
    id: string;
    sender: 'customer' | 'staff';
    senderName: string;
    text: string;
    timestamp: string;
  }[];
}

export interface DeliveryZoneRule {
  province: string;
  standardFee: number;
  expressFee: number;
  freeDeliveryThreshold: number;
  estimatedDays: string;
}

export interface TaxConfig {
  vatPercentage: number;
  taxInclusive: boolean;
  panNumber: string;
  businessName: string;
  businessAddress: string;
}
