import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatNPR, NEPAL_PROVINCES, DEFAULT_DELIVERY_ZONES, validateNepaliPhone } from '../data/nepalData';
import { PaymentMethodType } from '../types';
import {
  X,
  CheckCircle2,
  Truck,
  CreditCard,
  QrCode,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  FileText,
  AlertCircle,
  Copy,
} from 'lucide-react';

export const CheckoutModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    cart,
    cartSubtotal,
    clearCart,
    currentUser,
    reloadOrders,
    setTrackingOrderNumber,
    setSelectedOrderForInvoice,
    setActiveView,
    showToast,
  } = useApp();

  // Multi-step state: 1 (Address) -> 2 (Delivery) -> 3 (Payment) -> 4 (Review) -> 5 (Success)
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Step 1: Address form
  const [fullName, setFullName] = useState(currentUser?.name || 'Bikash Shrestha');
  const [phone, setPhone] = useState(currentUser?.phone || '+977 9841234567');
  const [selectedProvinceId, setSelectedProvinceId] = useState('bagmati');
  const [selectedDistrict, setSelectedDistrict] = useState('Kathmandu');
  const [selectedMunicipality, setSelectedMunicipality] = useState('Kathmandu Metropolitan City');
  const [ward, setWard] = useState('Ward 4');
  const [tole, setTole] = useState('Baluwatar');
  const [landmark, setLandmark] = useState('Near Prime Minister Residence Gate');
  const [deliveryNotes, setDeliveryNotes] = useState('Call before arriving');
  const [addressError, setAddressError] = useState('');

  // Step 2: Delivery Option
  const [deliveryType, setDeliveryType] = useState<'standard' | 'express' | 'pickup'>('standard');

  // Step 3: Payment Method
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('esewa');
  const [esewaMobile, setEsewaMobile] = useState('9841000000');
  const [esewaMpin, setEsewaMpin] = useState('1234');
  const [khaltiMobile, setKhaltiMobile] = useState('9851000000');
  const [khaltiMpin, setKhaltiMpin] = useState('4321');
  const [codOtp, setCodOtp] = useState('8842');
  const [codVerified, setCodVerified] = useState(true);

  // Step 5: Created Order Reference
  const [createdOrderNumber, setCreatedOrderNumber] = useState('');
  const [createdOrderId, setCreatedOrderId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (activeModal !== 'checkout') return null;

  const currentProvince = NEPAL_PROVINCES.find((p) => p.id === selectedProvinceId) || NEPAL_PROVINCES[0];
  const currentDistricts = currentProvince.districts;
  const currentDistrictObj = currentDistricts.find((d) => d.name === selectedDistrict) || currentDistricts[0];
  const currentMunicipalities = currentDistrictObj?.municipalities || [];

  const deliveryRule =
    DEFAULT_DELIVERY_ZONES.find((z) => z.province.includes(currentProvince.name)) ||
    DEFAULT_DELIVERY_ZONES[0];

  let deliveryFee = deliveryRule.standardFee;
  if (deliveryType === 'express') deliveryFee = deliveryRule.expressFee;
  if (deliveryType === 'pickup') deliveryFee = 0;
  if (cartSubtotal >= deliveryRule.freeDeliveryThreshold && deliveryType === 'standard') {
    deliveryFee = 0;
  }

  const discountAmount = Math.round(cartSubtotal * 0.15); // Dashain discount applied
  const taxableSubtotal = Math.max(0, cartSubtotal - discountAmount);
  const vatAmount = Math.round(taxableSubtotal * 0.13); // Nepal 13% VAT
  const grandTotal = taxableSubtotal + vatAmount + deliveryFee;

  const handleNextFromAddress = () => {
    setAddressError('');
    if (!fullName.trim()) {
      setAddressError('Please enter your full name');
      return;
    }
    const phoneCheck = validateNepaliPhone(phone);
    if (!phoneCheck.isValid) {
      setAddressError(phoneCheck.error || 'Invalid Nepali mobile number');
      return;
    }
    if (!tole.trim()) {
      setAddressError('Please enter your Tole / Street address');
      return;
    }
    setStep(2);
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    try {
      // 1. Verify Payment server-side
      const paymentRes = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: paymentMethod,
          amount: grandTotal,
          transactionId: `${paymentMethod.toUpperCase()}-TXN-${Date.now()}`,
        }),
      });
      const paymentData = await paymentRes.json();

      // 2. Submit Order to API
      const orderPayload = {
        userId: currentUser?.id || 'guest-user',
        customerName: fullName,
        customerEmail: currentUser?.email || 'customer@sajilobazar.com',
        customerPhone: phone,
        items: cart.map((item) => ({
          productId: item.productId,
          productName: item.product.name,
          productImage: item.product.featuredImage,
          sku: item.product.sku,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.unitPrice * item.quantity,
          selectedVariants: item.selectedVariants,
        })),
        shippingAddress: {
          fullName,
          phone,
          province: currentProvince.name,
          district: selectedDistrict,
          municipality: selectedMunicipality,
          ward,
          tole,
          landmark,
          deliveryNotes,
        },
        deliveryType,
        deliveryFee,
        subtotal: cartSubtotal,
        couponCode: 'DASHAIN2026',
        discountAmount,
        taxAmount: vatAmount,
        totalAmount: grandTotal,
        payment: {
          method: paymentMethod,
          status: paymentMethod === 'cod' ? 'pending' : 'verified',
          transactionId: paymentData.transactionId || `TXN-${Date.now()}`,
          amount: grandTotal,
        },
        notes: deliveryNotes,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });
      const orderResult = await res.json();

      if (orderResult.success) {
        setCreatedOrderNumber(orderResult.data.orderNumber);
        setCreatedOrderId(orderResult.data.id);
        clearCart();
        await reloadOrders();
        setStep(5);
        showToast(`Order ${orderResult.data.orderNumber} placed successfully!`);
      }
    } catch (e) {
      console.error(e);
      showToast('Error placing order. Please check inputs.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTrackCreatedOrder = () => {
    setTrackingOrderNumber(createdOrderNumber);
    setActiveModal(null);
    setActiveView('tracking');
  };

  const handlePrintCreatedOrderInvoice = async () => {
    try {
      const res = await fetch(`/api/orders/${createdOrderId}`);
      const data = await res.json();
      if (data.success) {
        setSelectedOrderForInvoice(data.data);
        setActiveModal('invoice');
      }
    } catch {
      setActiveModal(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50/70">
          <div>
            <h2 className="text-base font-bold text-neutral-900">
              {step === 5 ? 'Order Confirmed!' : 'Sajilo Bazar Checkout'}
            </h2>
            <div className="text-[11px] text-neutral-500">
              Step {step} of 4 · Secure Nepali E-Commerce Gateway
            </div>
          </div>

          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-lg hover:bg-neutral-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress Bar */}
        {step < 5 && (
          <div className="grid grid-cols-4 border-b border-neutral-200 text-center text-xs font-semibold">
            <div className={`py-2 border-b-2 ${step >= 1 ? 'border-red-600 text-red-600' : 'border-transparent text-neutral-400'}`}>
              1. Address
            </div>
            <div className={`py-2 border-b-2 ${step >= 2 ? 'border-red-600 text-red-600' : 'border-transparent text-neutral-400'}`}>
              2. Delivery
            </div>
            <div className={`py-2 border-b-2 ${step >= 3 ? 'border-red-600 text-red-600' : 'border-transparent text-neutral-400'}`}>
              3. Payment
            </div>
            <div className={`py-2 border-b-2 ${step >= 4 ? 'border-red-600 text-red-600' : 'border-transparent text-neutral-400'}`}>
              4. Review
            </div>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* STEP 1: Address */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                Nepal Delivery Address
              </div>

              {addressError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{addressError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Bikash Shrestha"
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Nepali Mobile Number *</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+977 98XXXXXXXX"
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500 font-medium font-mono"
                  />
                </div>
              </div>

              {/* Province, District & Municipality Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Province *</label>
                  <select
                    value={selectedProvinceId}
                    onChange={(e) => {
                      setSelectedProvinceId(e.target.value);
                      const prov = NEPAL_PROVINCES.find((p) => p.id === e.target.value);
                      if (prov && prov.districts[0]) {
                        setSelectedDistrict(prov.districts[0].name);
                        setSelectedMunicipality(prov.districts[0].municipalities[0] || '');
                      }
                    }}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg font-medium"
                  >
                    {NEPAL_PROVINCES.map((prov) => (
                      <option key={prov.id} value={prov.id}>
                        {prov.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">District *</label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => {
                      setSelectedDistrict(e.target.value);
                      const dist = currentDistricts.find((d) => d.name === e.target.value);
                      if (dist && dist.municipalities[0]) {
                        setSelectedMunicipality(dist.municipalities[0]);
                      }
                    }}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg font-medium"
                  >
                    {currentDistricts.map((d) => (
                      <option key={d.name} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Municipality / City *</label>
                  <select
                    value={selectedMunicipality}
                    onChange={(e) => setSelectedMunicipality(e.target.value)}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg font-medium"
                  >
                    {currentMunicipalities.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Ward, Tole, Landmark */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Ward No. *</label>
                  <input
                    type="text"
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    placeholder="Ward 4"
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Tole / Street *</label>
                  <input
                    type="text"
                    value={tole}
                    onChange={(e) => setTole(e.target.value)}
                    placeholder="e.g. Baluwatar Chowk"
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Nearby Landmark</label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="Near Nepal Bank ATM"
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 font-semibold mb-1 text-xs">
                  Delivery Instructions (Optional)
                </label>
                <input
                  type="text"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="e.g. Call before coming, leave at reception"
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-xs"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleNextFromAddress}
                  className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  <span>Continue to Delivery</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Delivery Option */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                Select Shipping Option ({currentProvince.name})
              </div>

              <div className="space-y-3">
                <label
                  onClick={() => setDeliveryType('standard')}
                  className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    deliveryType === 'standard' ? 'border-red-600 bg-red-50/30 ring-1 ring-red-500' : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Truck className="w-5 h-5 text-neutral-700" />
                    <div>
                      <div className="font-bold text-neutral-900 text-xs">Standard Doorstep Delivery</div>
                      <div className="text-[11px] text-neutral-500">{deliveryRule.estimatedDays} across {selectedDistrict}</div>
                    </div>
                  </div>
                  <div className="font-mono font-bold text-xs text-neutral-900">
                    {deliveryFee === 0 ? <span className="text-emerald-600 font-bold uppercase">FREE</span> : formatNPR(deliveryRule.standardFee)}
                  </div>
                </label>

                <label
                  onClick={() => setDeliveryType('express')}
                  className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    deliveryType === 'express' ? 'border-red-600 bg-red-50/30 ring-1 ring-red-500' : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Truck className="w-5 h-5 text-red-600" />
                    <div>
                      <div className="font-bold text-neutral-900 text-xs">Express Priority Delivery (24 Hours)</div>
                      <div className="text-[11px] text-neutral-500">Same-day dispatch via Pathao Cargo</div>
                    </div>
                  </div>
                  <div className="font-mono font-bold text-xs text-neutral-900">
                    {formatNPR(deliveryRule.expressFee)}
                  </div>
                </label>

                <label
                  onClick={() => setDeliveryType('pickup')}
                  className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    deliveryType === 'pickup' ? 'border-red-600 bg-red-50/30 ring-1 ring-red-500' : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Truck className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-bold text-neutral-900 text-xs">Sajilo Hub Self-Pickup</div>
                      <div className="text-[11px] text-neutral-500">Collect from Tripureshwor Hub, Kathmandu</div>
                    </div>
                  </div>
                  <div className="font-mono font-bold text-xs text-emerald-600 uppercase">
                    Free
                  </div>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Address</span>
                </button>

                <button
                  onClick={() => setStep(3)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  <span>Continue to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Nepal Payment Method */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                Select Nepal Payment Option (Total: {formatNPR(grandTotal)})
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* eSewa */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('esewa')}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                    paymentMethod === 'esewa' ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20' : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                    e
                  </div>
                  <span className="text-xs font-bold text-neutral-900">eSewa</span>
                  <span className="text-[10px] text-neutral-500">Instant Pay</span>
                </button>

                {/* Khalti */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('khalti')}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                    paymentMethod === 'khalti' ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-500/20' : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-600 text-white font-black text-xs flex items-center justify-center">
                    K
                  </div>
                  <span className="text-xs font-bold text-neutral-900">Khalti</span>
                  <span className="text-[10px] text-neutral-500">Wallet / Card</span>
                </button>

                {/* Fonepay */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('fonepay')}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                    paymentMethod === 'fonepay' ? 'border-red-500 bg-red-50 ring-2 ring-red-500/20' : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <QrCode className="w-8 h-8 text-red-600" />
                  <span className="text-xs font-bold text-neutral-900">Fonepay</span>
                  <span className="text-[10px] text-neutral-500">Scan QR</span>
                </button>

                {/* Cash on Delivery */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                    paymentMethod === 'cod' ? 'border-neutral-900 bg-neutral-100 ring-2 ring-neutral-900/20' : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <Truck className="w-8 h-8 text-neutral-800" />
                  <span className="text-xs font-bold text-neutral-900">COD</span>
                  <span className="text-[10px] text-neutral-500">Cash on Delivery</span>
                </button>
              </div>

              {/* Payment Details Container */}
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-xs">
                {paymentMethod === 'esewa' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 font-bold text-emerald-800">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Official eSewa ePai 2.0 Integration</span>
                    </div>
                    <p className="text-[11px] text-neutral-600">
                      Test simulation credentials pre-filled. Server validates transaction with HMAC signature.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-neutral-700 block mb-1">eSewa ID</label>
                        <input
                          type="text"
                          value={esewaMobile}
                          onChange={(e) => setEsewaMobile(e.target.value)}
                          className="w-full p-2 bg-white border border-neutral-300 rounded font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-neutral-700 block mb-1">eSewa MPIN</label>
                        <input
                          type="password"
                          value={esewaMpin}
                          onChange={(e) => setEsewaMpin(e.target.value)}
                          className="w-full p-2 bg-white border border-neutral-300 rounded font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'khalti' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 font-bold text-purple-800">
                      <ShieldCheck className="w-4 h-4 text-purple-600" />
                      <span>Khalti Digital Wallet Verification</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-neutral-700 block mb-1">Khalti Mobile</label>
                        <input
                          type="text"
                          value={khaltiMobile}
                          onChange={(e) => setKhaltiMobile(e.target.value)}
                          className="w-full p-2 bg-white border border-neutral-300 rounded font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-neutral-700 block mb-1">MPIN</label>
                        <input
                          type="password"
                          value={khaltiMpin}
                          onChange={(e) => setKhaltiMpin(e.target.value)}
                          className="w-full p-2 bg-white border border-neutral-300 rounded font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'fonepay' && (
                  <div className="space-y-3 text-center">
                    <div className="text-xs font-bold text-neutral-800">Scan to Pay with Any Nepali Mobile Banking App</div>
                    <div className="w-32 h-32 bg-white border border-neutral-300 rounded-xl p-2 mx-auto flex items-center justify-center">
                      <QrCode className="w-24 h-24 text-neutral-900" />
                    </div>
                    <div className="text-[11px] text-neutral-500 font-mono">
                      Pay <strong className="text-neutral-900">{formatNPR(grandTotal)}</strong> to Merchant "Sajilo Bazar Pvt Ltd"
                    </div>
                  </div>
                )}

                {paymentMethod === 'cod' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 font-bold text-neutral-900">
                      <Truck className="w-4 h-4 text-neutral-700" />
                      <span>Cash on Delivery Verification</span>
                    </div>
                    <p className="text-[11px] text-neutral-600">
                      Pay <strong className="text-neutral-900 font-mono">{formatNPR(grandTotal)}</strong> in cash when our rider delivers your package to {selectedDistrict}.
                    </p>
                    <div className="flex items-center gap-2 text-xs bg-emerald-50 text-emerald-800 p-2 rounded border border-emerald-200">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Phone verification pre-verified (+977 9841234567)</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Delivery</span>
                </button>

                <button
                  onClick={() => setStep(4)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  <span>Review Order</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Review & Place Order */}
          {step === 4 && (
            <div className="space-y-4 text-xs">
              <div className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                Review Order Details
              </div>

              {/* Address & Delivery Summary Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <div>
                  <div className="font-bold text-neutral-900 mb-0.5">Shipping Address:</div>
                  <div className="text-neutral-600">{fullName} ({phone})</div>
                  <div className="text-neutral-600">{tole}, {ward}, {selectedMunicipality}</div>
                  <div className="text-neutral-600">{selectedDistrict}, {currentProvince.name}</div>
                </div>

                <div>
                  <div className="font-bold text-neutral-900 mb-0.5">Delivery & Payment:</div>
                  <div className="text-neutral-600">Method: {deliveryType.toUpperCase()} ({deliveryRule.estimatedDays})</div>
                  <div className="text-neutral-600">Payment: <strong className="text-red-600 uppercase">{paymentMethod}</strong></div>
                  <div className="text-neutral-600">PAN Bill: Registered Tax Invoice</div>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-neutral-200 rounded-xl overflow-hidden">
                <div className="bg-neutral-100 px-3 py-2 font-bold text-neutral-700 text-[11px] grid grid-cols-6">
                  <span className="col-span-3">Item</span>
                  <span className="text-center">Qty</span>
                  <span className="text-right">Rate</span>
                  <span className="text-right">Total</span>
                </div>
                <div className="divide-y divide-neutral-100 max-h-40 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.productId} className="px-3 py-2 text-xs grid grid-cols-6 items-center">
                      <div className="col-span-3 line-clamp-1 font-medium text-neutral-800">
                        {item.product.name}
                      </div>
                      <div className="text-center font-mono">{item.quantity}</div>
                      <div className="text-right font-mono">{formatNPR(item.unitPrice)}</div>
                      <div className="text-right font-mono font-bold">{formatNPR(item.unitPrice * item.quantity)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals Breakdown */}
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1.5">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal:</span>
                  <span className="font-mono">{formatNPR(cartSubtotal)}</span>
                </div>
                <div className="flex justify-between text-emerald-600">
                  <span>Festival Discount (DASHAIN2026):</span>
                  <span className="font-mono">-{formatNPR(discountAmount)}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Delivery Charge:</span>
                  <span className="font-mono">
                    {deliveryFee === 0 ? <strong className="text-emerald-600 uppercase">FREE</strong> : formatNPR(deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>13% Nepal VAT (Inland Revenue Dept):</span>
                  <span className="font-mono">{formatNPR(vatAmount)}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-neutral-900 pt-2 border-t border-neutral-200">
                  <span>Grand Total (NPR):</span>
                  <span className="text-red-600 font-mono text-base">{formatNPR(grandTotal)}</span>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  onClick={() => setStep(3)}
                  disabled={isProcessing}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Payment</span>
                </button>

                <button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-8 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
                >
                  {isProcessing ? (
                    <span>Verifying & Placing Order...</span>
                  ) : (
                    <>
                      <span>Confirm & Place Order</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Order Confirmed Success */}
          {step === 5 && (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-xl font-black text-neutral-900">
                  Dhanyabad! Your Order is Placed.
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  We have sent an SMS & Email confirmation with your tracking details.
                </p>
              </div>

              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl inline-block max-w-sm w-full mx-auto">
                <div className="text-[11px] text-neutral-400 uppercase font-semibold">Order Reference Number</div>
                <div className="text-lg font-black text-neutral-900 font-mono tracking-wider mt-1">
                  {createdOrderNumber}
                </div>
                <div className="text-xs text-neutral-500 mt-1">
                  Delivery to: <strong>{selectedDistrict}, Nepal</strong>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                <button
                  onClick={handleTrackCreatedOrder}
                  className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Truck className="w-4 h-4" />
                  <span>Live Track Order</span>
                </button>

                <button
                  onClick={handlePrintCreatedOrderInvoice}
                  className="px-5 py-2.5 bg-white border border-neutral-300 hover:border-neutral-400 text-neutral-800 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4 text-red-600" />
                  <span>Official VAT Invoice</span>
                </button>

                <button
                  onClick={() => {
                    setActiveModal(null);
                    setActiveView('shop');
                  }}
                  className="px-5 py-2.5 text-xs text-neutral-500 hover:text-neutral-900 font-semibold"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
