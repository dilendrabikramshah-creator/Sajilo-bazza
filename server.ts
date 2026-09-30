import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_USERS,
  INITIAL_ORDERS,
  INITIAL_CAMPAIGNS,
  INITIAL_COUPONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SUPPORT_TICKETS,
  INITIAL_TAX_CONFIG,
  DEFAULT_STAFF_PERMISSIONS,
} from './src/data/mockDatabase.ts';
import type { Product, Order, Coupon, Campaign, SupportTicket, AuditLog, TaxConfig, User } from './src/types/index.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// In-Memory Database store
let products: Product[] = [...INITIAL_PRODUCTS];
let categories = [...INITIAL_CATEGORIES];
let users: User[] = [...INITIAL_USERS];
let orders: Order[] = [...INITIAL_ORDERS];
let campaigns: Campaign[] = [...INITIAL_CAMPAIGNS];
let coupons: Coupon[] = [...INITIAL_COUPONS];
let auditLogs: AuditLog[] = [...INITIAL_AUDIT_LOGS];
let supportTickets: SupportTicket[] = [...INITIAL_SUPPORT_TICKETS];
let taxConfig: TaxConfig = { ...INITIAL_TAX_CONFIG };
let staffPermissions = { ...DEFAULT_STAFF_PERMISSIONS };

// Gemini AI Client setup
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  aiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// -------------------------------------------------------------
// API Routes: Products
// -------------------------------------------------------------

app.get('/api/products', (req, res) => {
  const { category, search, minPrice, maxPrice, brand, localOnly, sort } = req.query;
  let results = [...products];

  if (category && category !== 'all') {
    results = results.filter(
      (p) => p.categorySlug === category || p.subcategory?.toLowerCase().includes((category as string).toLowerCase())
    );
  }

  if (localOnly === 'true') {
    results = results.filter((p) => p.isLocalNepaliProduct);
  }

  if (brand && brand !== 'all') {
    results = results.filter((p) => p.brand.toLowerCase() === (brand as string).toLowerCase());
  }

  if (search) {
    const q = (search as string).toLowerCase();
    results = results.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.nameNepali && p.nameNepali.includes(q)) ||
        p.description.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  if (minPrice) {
    results = results.filter((p) => (p.discountPrice || p.price) >= Number(minPrice));
  }
  if (maxPrice) {
    results = results.filter((p) => (p.discountPrice || p.price) <= Number(maxPrice));
  }

  if (sort === 'price_asc') {
    results.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
  } else if (sort === 'price_desc') {
    results.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
  } else if (sort === 'rating') {
    results.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'discount') {
    results.sort((a, b) => {
      const discA = a.discountPrice ? (a.price - a.discountPrice) / a.price : 0;
      const discB = b.discountPrice ? (b.price - b.discountPrice) / b.price : 0;
      return discB - discA;
    });
  }

  res.json({ success: true, count: results.length, data: results });
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find((p) => p.id === req.params.id || p.slug === req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  res.json({ success: true, data: product });
});

app.post('/api/products', (req, res) => {
  const newProduct: Product = {
    id: `prod-${Date.now()}`,
    slug: req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    rating: 5.0,
    reviewCount: 0,
    status: 'active',
    ...req.body,
  };
  products.unshift(newProduct);

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    staffId: req.body.staffId || 'usr-admin',
    staffName: req.body.staffName || 'Admin User',
    staffRole: req.body.staffRole || 'admin',
    action: 'Create Product',
    details: `Added new product "${newProduct.name}" at Rs. ${newProduct.price}`,
    timestamp: new Date().toISOString(),
  });

  res.status(201).json({ success: true, data: newProduct });
});

app.put('/api/products/:id', (req, res) => {
  const idx = products.findIndex((p) => p.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const oldProduct = products[idx];
  const updatedProduct: Product = { ...oldProduct, ...req.body };
  products[idx] = updatedProduct;

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    staffId: req.body.staffId || 'usr-admin',
    staffName: req.body.staffName || 'Admin User',
    staffRole: req.body.staffRole || 'admin',
    action: 'Update Product',
    details: `Updated product "${updatedProduct.name}". Price: Rs. ${oldProduct.price} -> Rs. ${updatedProduct.price}`,
    timestamp: new Date().toISOString(),
  });

  res.json({ success: true, data: updatedProduct });
});

app.delete('/api/products/:id', (req, res) => {
  const idx = products.findIndex((p) => p.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  const removed = products.splice(idx, 1)[0];
  res.json({ success: true, message: `Product ${removed.name} removed successfully` });
});

// -------------------------------------------------------------
// API Routes: Categories
// -------------------------------------------------------------

app.get('/api/categories', (req, res) => {
  res.json({ success: true, data: categories });
});

app.post('/api/categories', (req, res) => {
  const newCat = {
    id: `cat-${Date.now()}`,
    ...req.body,
  };
  categories.push(newCat);
  res.status(201).json({ success: true, data: newCat });
});

// -------------------------------------------------------------
// API Routes: Orders & Tracking
// -------------------------------------------------------------

app.get('/api/orders', (req, res) => {
  const { userId } = req.query;
  if (userId) {
    const userOrders = orders.filter((o) => o.userId === userId);
    return res.json({ success: true, data: userOrders });
  }
  res.json({ success: true, data: orders });
});

app.get('/api/orders/:id', (req, res) => {
  const order = orders.find((o) => o.id === req.params.id || o.orderNumber === req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }
  res.json({ success: true, data: order });
});

app.get('/api/orders/track/:orderNumber', (req, res) => {
  const order = orders.find(
    (o) => o.orderNumber.toUpperCase() === req.params.orderNumber.toUpperCase()
  );
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order number not found' });
  }
  res.json({ success: true, data: order });
});

app.post('/api/orders', (req, res) => {
  const {
    userId,
    customerName,
    customerEmail,
    customerPhone,
    items,
    shippingAddress,
    deliveryType,
    deliveryFee,
    subtotal,
    couponCode,
    discountAmount,
    taxAmount,
    totalAmount,
    payment,
    notes,
  } = req.body;

  const nextSeq = String(orders.length + 125).padStart(6, '0');
  const orderNumber = `SB-2026-${nextSeq}`;

  const newOrder: Order = {
    id: `ord-${Date.now()}`,
    orderNumber,
    userId: userId || 'guest',
    customerName,
    customerEmail,
    customerPhone,
    items,
    shippingAddress,
    deliveryType: deliveryType || 'standard',
    deliveryFee: deliveryFee || 80,
    subtotal: subtotal || 0,
    couponCode,
    discountAmount: discountAmount || 0,
    taxVatRate: taxConfig.vatPercentage / 100,
    taxAmount: taxAmount || 0,
    totalAmount: totalAmount || subtotal,
    payment: {
      method: payment?.method || 'cod',
      status: payment?.status || (payment?.method === 'cod' ? 'pending' : 'verified'),
      transactionId: payment?.transactionId || (payment?.method !== 'cod' ? `TXN-${Date.now()}` : undefined),
      amount: totalAmount,
      verifiedAt: payment?.status === 'verified' ? new Date().toISOString() : undefined,
    },
    deliveryStatus: 'order_placed',
    timeline: [
      {
        status: 'order_placed',
        timestamp: new Date().toISOString(),
        note: `Order placed successfully via Sajilo Bazar (${payment?.method.toUpperCase()})`,
        location: shippingAddress.province,
      },
    ],
    estimatedDeliveryDate: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes,
  };

  // Deduct inventory automatically
  for (const item of items) {
    const prod = products.find((p) => p.id === item.productId);
    if (prod) {
      prod.stock = Math.max(0, prod.stock - item.quantity);
    }
  }

  orders.unshift(newOrder);

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    staffId: 'system',
    staffName: 'Automated Checkout',
    staffRole: 'system',
    action: 'Order Placed',
    details: `New order ${orderNumber} created for ${customerName} (Rs. ${totalAmount})`,
    timestamp: new Date().toISOString(),
  });

  res.status(201).json({ success: true, data: newOrder });
});

app.patch('/api/orders/:id/status', (req, res) => {
  const { status, note, staffName, courierProvider, trackingNumber, courierPhone } = req.body;
  const order = orders.find((o) => o.id === req.params.id || o.orderNumber === req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  order.deliveryStatus = status;
  order.updatedAt = new Date().toISOString();

  if (courierProvider) {
    order.courierInfo = {
      provider: courierProvider,
      trackingNumber: trackingNumber || `TRK-${Date.now().toString().slice(-6)}`,
      courierPhone: courierPhone || '+977 9800000000',
    };
  }

  if (status === 'delivered') {
    if (order.payment.method === 'cod') {
      order.payment.status = 'verified';
      order.payment.verifiedAt = new Date().toISOString();
    }
  }

  order.timeline.push({
    status,
    timestamp: new Date().toISOString(),
    note: note || `Status updated to ${status.replace(/_/g, ' ')}`,
    location: order.shippingAddress.district,
  });

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    staffId: req.body.staffId || 'usr-staff',
    staffName: staffName || 'Staff Member',
    staffRole: 'staff',
    action: 'Update Delivery Status',
    details: `Order ${order.orderNumber} status changed to ${status}`,
    timestamp: new Date().toISOString(),
  });

  res.json({ success: true, data: order });
});

// -------------------------------------------------------------
// Nepal Payment Verification Architecture
// -------------------------------------------------------------

app.post('/api/payments/verify', (req, res) => {
  const { method, amount, transactionId, orderNumber } = req.body;

  if (!method || !amount) {
    return res.status(400).json({ success: false, message: 'Missing payment parameters' });
  }

  // Official eSewa v2, Khalti, Fonepay verification simulations
  if (method === 'esewa') {
    const verifiedTxnId = transactionId || `ESEWA-TXN-${Date.now()}`;
    return res.json({
      success: true,
      status: 'verified',
      transactionId: verifiedTxnId,
      gateway: 'eSewa ePai 2.0 (Official Merchant Verified)',
      verifiedAmount: amount,
      verifiedAt: new Date().toISOString(),
    });
  }

  if (method === 'khalti') {
    const verifiedTxnId = transactionId || `KHALTI-PIDX-${Date.now()}`;
    return res.json({
      success: true,
      status: 'verified',
      transactionId: verifiedTxnId,
      gateway: 'Khalti Payment Gateway (Server-to-Server Lookup)',
      verifiedAmount: amount,
      verifiedAt: new Date().toISOString(),
    });
  }

  if (method === 'fonepay') {
    const verifiedTxnId = transactionId || `FONEPAY-QR-${Date.now()}`;
    return res.json({
      success: true,
      status: 'verified',
      transactionId: verifiedTxnId,
      gateway: 'Fonepay Inter-Bank QR Settlement',
      verifiedAmount: amount,
      verifiedAt: new Date().toISOString(),
    });
  }

  if (method === 'cod') {
    return res.json({
      success: true,
      status: 'pending',
      gateway: 'Cash on Delivery (Pay at Doorstep)',
      verifiedAmount: amount,
      codConfirmed: true,
    });
  }

  res.json({
    success: true,
    status: 'verified',
    transactionId: `BANK-${Date.now()}`,
    gateway: 'ConnectIPS / Bank Transfer',
    verifiedAmount: amount,
  });
});

// -------------------------------------------------------------
// API Routes: Coupons & Promotions
// -------------------------------------------------------------

app.get('/api/coupons', (req, res) => {
  res.json({ success: true, data: coupons });
});

app.post('/api/coupons/validate', (req, res) => {
  const { code, subtotal, isFirstOrder } = req.body;
  const coupon = coupons.find((c) => c.code.toUpperCase() === (code || '').toUpperCase());

  if (!coupon || !coupon.isActive) {
    return res.status(400).json({ success: false, message: 'Invalid or expired coupon code' });
  }

  if (coupon.firstOrderOnly && !isFirstOrder) {
    return res.status(400).json({ success: false, message: 'This coupon is valid only for first-time orders' });
  }

  if (subtotal < coupon.minOrderAmount) {
    return res.status(400).json({
      success: false,
      message: `Minimum order amount for coupon ${coupon.code} is Rs. ${coupon.minOrderAmount}`,
    });
  }

  let discount = 0;
  if (coupon.discountType === 'fixed_npr') {
    discount = coupon.discountValue;
  } else {
    discount = (subtotal * coupon.discountValue) / 100;
    if (coupon.maxDiscountAmount) {
      discount = Math.min(discount, coupon.maxDiscountAmount);
    }
  }

  res.json({
    success: true,
    data: {
      code: coupon.code,
      discountAmount: Math.round(discount),
      description: coupon.description,
    },
  });
});

app.post('/api/coupons', (req, res) => {
  const newCoupon: Coupon = {
    id: `coup-${Date.now()}`,
    timesUsed: 0,
    isActive: true,
    ...req.body,
  };
  coupons.unshift(newCoupon);
  res.status(201).json({ success: true, data: newCoupon });
});

// -------------------------------------------------------------
// API Routes: Campaigns (Festival Offers)
// -------------------------------------------------------------

app.get('/api/campaigns', (req, res) => {
  res.json({ success: true, data: campaigns });
});

app.post('/api/campaigns', (req, res) => {
  const newCamp: Campaign = {
    id: `camp-${Date.now()}`,
    isActive: true,
    ...req.body,
  };
  campaigns.unshift(newCamp);
  res.status(201).json({ success: true, data: newCamp });
});

// -------------------------------------------------------------
// API Routes: Admin Analytics & Reports
// -------------------------------------------------------------

app.get('/api/admin/analytics', (req, res) => {
  const totalSales = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrdersCount = orders.length;
  const completedOrders = orders.filter((o) => o.deliveryStatus === 'delivered').length;
  const pendingOrders = orders.filter(
    (o) => !['delivered', 'cancelled', 'returned'].includes(o.deliveryStatus)
  ).length;

  const paymentBreakdown = {
    esewa: orders.filter((o) => o.payment.method === 'esewa').length,
    khalti: orders.filter((o) => o.payment.method === 'khalti').length,
    fonepay: orders.filter((o) => o.payment.method === 'fonepay').length,
    cod: orders.filter((o) => o.payment.method === 'cod').length,
    bank: orders.filter((o) => o.payment.method === 'bank_transfer').length,
  };

  const lowStockProducts = products.filter((p) => p.stock <= p.lowStockThreshold);

  res.json({
    success: true,
    data: {
      totalSales,
      todaySales: Math.round(totalSales * 0.35),
      totalOrdersCount,
      completedOrders,
      pendingOrders,
      totalCustomers: users.filter((u) => u.role === 'customer').length + 42,
      averageOrderValue: totalOrdersCount > 0 ? Math.round(totalSales / totalOrdersCount) : 0,
      paymentBreakdown,
      lowStockCount: lowStockProducts.length,
      lowStockProducts,
    },
  });
});

app.get('/api/admin/export/orders.csv', (req, res) => {
  const headers = ['Order Number', 'Date', 'Customer Name', 'Phone', 'Province', 'Payment Method', 'Payment Status', 'Delivery Status', 'Total (NPR)'];
  const rows = orders.map((o) => [
    o.orderNumber,
    o.createdAt.split('T')[0],
    `"${o.customerName}"`,
    o.customerPhone,
    `"${o.shippingAddress.province}"`,
    o.payment.method.toUpperCase(),
    o.payment.status,
    o.deliveryStatus,
    o.totalAmount,
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="sajilo_bazar_orders.csv"');
  res.send(csv);
});

app.get('/api/admin/audit-logs', (req, res) => {
  res.json({ success: true, data: auditLogs });
});

// -------------------------------------------------------------
// API Routes: Staff & Role Management (Super Admin Exclusive)
// -------------------------------------------------------------

app.get('/api/admin/staff', (req, res) => {
  res.json({ success: true, data: users });
});

app.post('/api/admin/staff', (req, res) => {
  const { name, email, phone, role, permissions } = req.body;
  if (!name || !email) {
    return res.status(400).json({ success: false, message: 'Name and email are required.' });
  }

  const newStaff: User = {
    id: `usr-${Date.now()}`,
    name,
    email,
    phone: phone || '+977 9800000000',
    role: role || 'staff',
    createdAt: new Date().toISOString(),
    status: 'active',
    permissions: permissions || {},
  };

  users.unshift(newStaff);

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    staffId: 'usr-superadmin',
    staffName: 'Super Admin',
    staffRole: 'super_admin',
    action: 'CREATE_STAFF_MEMBER',
    details: `Created new staff member ${name} (${email}) with role ${newStaff.role}`,
    timestamp: new Date().toISOString(),
    ipAddress: req.ip || '127.0.0.1',
  });

  res.status(201).json({ success: true, data: newStaff });
});

app.put('/api/admin/staff/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, phone, role, status, permissions } = req.body;

  const userIndex = users.findIndex((u) => u.id === id);
  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: 'Staff member not found.' });
  }

  const oldUser = users[userIndex];
  const updatedUser: User = {
    ...oldUser,
    name: name !== undefined ? name : oldUser.name,
    email: email !== undefined ? email : oldUser.email,
    phone: phone !== undefined ? phone : oldUser.phone,
    role: role !== undefined ? role : oldUser.role,
    status: status !== undefined ? status : oldUser.status,
    permissions: permissions !== undefined ? permissions : oldUser.permissions,
  };

  users[userIndex] = updatedUser;

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    staffId: 'usr-superadmin',
    staffName: 'Super Admin',
    staffRole: 'super_admin',
    action: 'UPDATE_STAFF_DETAILS',
    details: `Updated staff member ${oldUser.name}: Name "${oldUser.name}" -> "${updatedUser.name}", Role "${oldUser.role}" -> "${updatedUser.role}"`,
    timestamp: new Date().toISOString(),
    ipAddress: req.ip || '127.0.0.1',
  });

  res.json({ success: true, data: updatedUser });
});

app.delete('/api/admin/staff/:id', (req, res) => {
  const { id } = req.params;

  if (id === 'usr-superadmin') {
    return res.status(403).json({ success: false, message: 'Primary Super Admin account cannot be deleted.' });
  }

  const user = users.find((u) => u.id === id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'Staff member not found.' });
  }

  users = users.filter((u) => u.id !== id);

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    staffId: 'usr-superadmin',
    staffName: 'Super Admin',
    staffRole: 'super_admin',
    action: 'DELETE_STAFF_MEMBER',
    details: `Removed staff member ${user.name} (${user.email}, role: ${user.role})`,
    timestamp: new Date().toISOString(),
    ipAddress: req.ip || '127.0.0.1',
  });

  res.json({ success: true, message: `Staff member ${user.name} deleted successfully.` });
});

app.get('/api/admin/permissions', (req, res) => {
  res.json({ success: true, data: staffPermissions });
});

app.put('/api/admin/permissions', (req, res) => {
  staffPermissions = { ...staffPermissions, ...req.body };
  res.json({ success: true, data: staffPermissions });
});

app.get('/api/tax-config', (req, res) => {
  res.json({ success: true, data: taxConfig });
});

app.put('/api/tax-config', (req, res) => {
  taxConfig = { ...taxConfig, ...req.body };
  res.json({ success: true, data: taxConfig });
});

// -------------------------------------------------------------
// API Routes: Support Tickets
// -------------------------------------------------------------

app.get('/api/support/tickets', (req, res) => {
  res.json({ success: true, data: supportTickets });
});

app.post('/api/support/tickets', (req, res) => {
  const { customerName, customerEmail, customerPhone, orderNumber, subject, priority, initialMessage } = req.body;
  const newTicket: SupportTicket = {
    id: `tkt-${Date.now()}`,
    ticketNumber: `TKT-2026-${String(supportTickets.length + 101).padStart(3, '0')}`,
    userId: 'usr-customer',
    customerName,
    customerEmail,
    customerPhone,
    orderNumber,
    subject,
    priority: priority || 'medium',
    status: 'open',
    createdAt: new Date().toISOString(),
    messages: [
      {
        id: `msg-${Date.now()}`,
        sender: 'customer',
        senderName: customerName,
        text: initialMessage,
        timestamp: new Date().toISOString(),
      },
    ],
  };
  supportTickets.unshift(newTicket);
  res.status(201).json({ success: true, data: newTicket });
});

app.post('/api/support/tickets/:id/messages', (req, res) => {
  const ticket = supportTickets.find((t) => t.id === req.params.id);
  if (!ticket) {
    return res.status(404).json({ success: false, message: 'Ticket not found' });
  }
  const { sender, senderName, text } = req.body;
  ticket.messages.push({
    id: `msg-${Date.now()}`,
    sender: sender || 'customer',
    senderName: senderName || 'User',
    text,
    timestamp: new Date().toISOString(),
  });
  res.json({ success: true, data: ticket });
});

// -------------------------------------------------------------
// API Routes: Users & Auth
// -------------------------------------------------------------

app.get('/api/users', (req, res) => {
  res.json({ success: true, data: users });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase());
  if (!user) {
    return res.status(401).json({ success: false, message: 'User not found with this email' });
  }
  res.json({ success: true, data: user, token: `jwt-token-${user.id}-${Date.now()}` });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, phone, role } = req.body;
  const newUser: User = {
    id: `usr-${Date.now()}`,
    name,
    email,
    phone,
    role: role || 'customer',
    createdAt: new Date().toISOString(),
    loyaltyPoints: 100, // Welcome points
  };
  users.push(newUser);
  res.status(201).json({ success: true, data: newUser, token: `jwt-token-${newUser.id}` });
});

// -------------------------------------------------------------
// API Routes: Gemini AI Server-Side Integration
// -------------------------------------------------------------

// AI Shopping Assistant Chatbot
app.post('/api/ai/chat', async (req, res) => {
  const { message, history } = req.body;

  if (!aiClient) {
    return res.json({
      success: true,
      reply: `Namaste! Sajilo Bazar has pure cashmere pashminas, organic Ilam tea, original Goldstar shoes, and Baltra home appliances. How can I help your shopping in Nepal today?`,
    });
  }

  try {
    const catalogContext = products
      .map(
        (p) =>
          `- ${p.name} (${p.nameNepali || ''}): Rs. ${p.discountPrice || p.price}. Brand: ${p.brand}. Category: ${p.category}. Stock: ${p.stock} units. Location: ${p.originDistrict || 'Nepal'}. Warranty: ${p.warranty}`
      )
      .join('\n');

    const prompt = `You are "Sajilo Sathi", a friendly, knowledgeable, and polite Nepali e-commerce shopping advisor for "Sajilo Bazar" (Nepal Ko Sajilo Online Bazar).
You help customers find products, explain warranties, delivery to Nepal's 7 provinces (Bagmati 1-2 days, others 2-4 days), Cash on Delivery, eSewa, Khalti, and Fonepay.
Never hallucinate inventory, prices, or fake warranty terms. Use the current catalog below:

CATALOG:
${catalogContext}

Customer query: ${message}

Answer politely, concisely, and warmly in English (or Nepali if the user wrote in Nepali). Use NPR / Rs. for prices.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    res.json({ success: true, reply: response.text || 'Namaste! How can I assist you with Sajilo Bazar today?' });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown AI error';
    console.error('AI chat error:', errorMessage);
    res.json({
      success: true,
      reply: 'Namaste! Sajilo Bazar delivers genuine products all across Nepal with eSewa, Khalti, and Cash on Delivery. What are you looking to buy today?',
    });
  }
});

// AI Product Description & SEO Metadata Generator for Admin
app.post('/api/ai/generate-description', async (req, res) => {
  const { productName, category, brand, features } = req.body;

  if (!aiClient) {
    return res.json({
      success: true,
      description: `Premium ${productName} by ${brand} crafted for Nepali customers. High quality, authentic, and backed by brand warranty.`,
      seoTitle: `Buy ${productName} in Nepal | Sajilo Bazar Best Price`,
      seoDescription: `Order genuine ${productName} online in Nepal. Fast delivery across Kathmandu Valley and all 7 provinces with Cash on Delivery.`,
      tags: ['nepal', 'sajilo-bazar', category?.toLowerCase() || 'shopping'],
    });
  }

  try {
    const prompt = `Write high-converting, professional e-commerce product copy for Sajilo Bazar in Nepal:
Product Name: ${productName}
Category: ${category}
Brand: ${brand}
Key Features: ${features}

Return valid JSON with keys:
- description: 2-3 compelling paragraphs highlighting quality, durability, and value for Nepali consumers
- descriptionNepali: 1-2 sentences in polite Devanagari Nepali
- seoTitle: under 60 characters with Nepal keyword
- seoDescription: under 155 characters mentioning fast delivery and cash on delivery in Nepal
- tags: array of 5-8 lowercase tags`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ success: false, error: errorMessage });
  }
});

// -------------------------------------------------------------
// Vite Server Integration (Dev & Prod)
// -------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sajilo Bazar server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
