/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Navbar } from './components/Navbar';
import { FestivalBanner } from './components/FestivalBanner';
import { FlashSale } from './components/FlashSale';
import { CategoryShowcase } from './components/CategoryShowcase';
import { ProductGrid } from './components/ProductGrid';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderTrackingView } from './components/OrderTrackingView';
import { TaxInvoiceModal } from './components/TaxInvoiceModal';
import { ProductComparisonModal } from './components/ProductComparisonModal';
import { AdminDashboard } from './components/AdminDashboard';
import { CustomerPortal } from './components/CustomerPortal';
import { AIShoppingAssistant } from './components/AIShoppingAssistant';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Footer } from './components/Footer';

const AppContent: React.FC = () => {
  const { activeView } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900">
      <Navbar />

      <main className="flex-1">
        {activeView === 'shop' && (
          <>
            <FestivalBanner />
            <FlashSale />
            <CategoryShowcase />
            <ProductGrid />
          </>
        )}

        {activeView === 'admin' && <AdminDashboard />}

        {activeView === 'customer_portal' && <CustomerPortal />}

        {activeView === 'tracking' && <OrderTrackingView />}
      </main>

      {/* Global Modals & Drawers */}
      <ProductDetailModal />
      <CartDrawer />
      <CheckoutModal />
      <TaxInvoiceModal />
      <ProductComparisonModal />

      {/* Utilities */}
      <AIShoppingAssistant />
      <OfflineIndicator />

      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}
