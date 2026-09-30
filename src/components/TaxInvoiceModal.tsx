import React from 'react';
import { useApp } from '../context/AppContext';
import { formatNPR } from '../data/nepalData';
import { X, Printer, Download, CheckCircle2, ShieldCheck } from 'lucide-react';

export const TaxInvoiceModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    selectedOrderForInvoice,
    showToast,
  } = useApp();

  if (activeModal !== 'invoice' || !selectedOrderForInvoice) {
    return null;
  }

  const order = selectedOrderForInvoice;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    showToast('Printing or saving PDF format directly from your browser print dialog');
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-neutral-300 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Action Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-neutral-200 bg-neutral-100/70 print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-red-600" />
            <span className="text-xs font-bold text-neutral-800">
              Government of Nepal Inland Revenue Dept. Standard Tax Invoice
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-800 rounded-lg text-xs font-semibold"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save PDF</span>
            </button>

            <button
              onClick={() => setActiveModal(null)}
              className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-lg hover:bg-neutral-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Invoice Body */}
        <div className="p-8 overflow-y-auto flex-1 text-xs text-neutral-800 font-sans print:p-0 print:m-0" id="tax-invoice-printable">
          {/* Header & Seller PAN */}
          <div className="flex justify-between items-start pb-6 border-b-2 border-neutral-900">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-red-600 flex items-center justify-center text-white font-extrabold text-sm">
                  SB
                </div>
                <div>
                  <h1 className="text-xl font-extrabold text-neutral-900 tracking-tight">Sajilo Bazar E-Commerce Pvt. Ltd.</h1>
                  <p className="text-[11px] text-neutral-500">Tripureshwor-11, Kathmandu, Bagmati Province, Nepal</p>
                </div>
              </div>
              <div className="mt-2 text-[11px] space-y-0.5">
                <p>Phone: +977-1-4200000 / +977-9841234567</p>
                <p>Email: billing@sajilobazar.com.np · Web: https://sajilobazar.com.np</p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block bg-neutral-900 text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded uppercase tracking-wider mb-1">
                Official Tax Invoice
              </span>
              <div className="text-[11px] font-bold text-neutral-900 mt-1">
                PAN No: <span className="font-mono text-base text-red-600 font-extrabold">609823411</span>
              </div>
              <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
                Invoice No: INV-2026-{order.orderNumber.replace('SB-2026-', '')}
              </div>
              <div className="text-[11px] text-neutral-500 font-mono">
                Date: {new Date(order.createdAt).toLocaleDateString()} (NPT)
              </div>
            </div>
          </div>

          {/* Customer & Shipping Section */}
          <div className="grid grid-cols-2 gap-6 py-5 border-b border-neutral-200">
            <div>
              <h3 className="font-bold text-neutral-900 uppercase tracking-wider text-[11px] mb-1">
                Billed / Shipped To:
              </h3>
              <p className="font-semibold text-neutral-900">{order.customerName}</p>
              <p className="text-neutral-600">Mobile: {order.customerPhone}</p>
              <p className="text-neutral-600">{order.shippingAddress.tole}, {order.shippingAddress.ward}</p>
              <p className="text-neutral-600">{order.shippingAddress.municipality}, {order.shippingAddress.district}</p>
              <p className="text-neutral-600 font-medium">{order.shippingAddress.province}, Nepal</p>
            </div>

            <div className="text-right">
              <h3 className="font-bold text-neutral-900 uppercase tracking-wider text-[11px] mb-1">
                Order & Payment Info:
              </h3>
              <p className="font-mono font-bold text-neutral-900">Order: {order.orderNumber}</p>
              <p className="text-neutral-600">Payment Gateway: <strong className="uppercase">{order.payment.method}</strong></p>
              <p className="text-neutral-600 font-mono text-[11px]">Txn ID: {order.payment.transactionId || 'COD-PENDING'}</p>
              <p className="text-neutral-600">
                Payment Status: <span className="font-bold text-emerald-700 uppercase">{order.payment.status}</span>
              </p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="mt-5">
            <table className="w-full text-left border-collapse border border-neutral-300">
              <thead>
                <tr className="bg-neutral-100 text-neutral-800 text-[11px] uppercase font-bold border-b border-neutral-300">
                  <th className="py-2.5 px-3 border-r border-neutral-300 w-12 text-center">S.N.</th>
                  <th className="py-2.5 px-3 border-r border-neutral-300">Description of Goods</th>
                  <th className="py-2.5 px-3 border-r border-neutral-300 w-24 text-center">HSN/SKU</th>
                  <th className="py-2.5 px-3 border-r border-neutral-300 w-16 text-center">Qty</th>
                  <th className="py-2.5 px-3 border-r border-neutral-300 w-24 text-right">Rate (NPR)</th>
                  <th className="py-2.5 px-3 w-28 text-right">Taxable Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {order.items.map((item, idx) => (
                  <tr key={item.productId} className="text-neutral-700">
                    <td className="py-2 px-3 border-r border-neutral-300 text-center font-mono">{idx + 1}</td>
                    <td className="py-2 px-3 border-r border-neutral-300 font-medium">
                      {item.productName}
                      {item.selectedVariants && (
                        <div className="text-[10px] text-neutral-400">
                          {Object.entries(item.selectedVariants).map(([k, v]) => `${k}: ${v}`).join(' | ')}
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-3 border-r border-neutral-300 text-center font-mono text-[10px]">{item.sku}</td>
                    <td className="py-2 px-3 border-r border-neutral-300 text-center font-mono">{item.quantity}</td>
                    <td className="py-2 px-3 border-r border-neutral-300 text-right font-mono">{formatNPR(item.unitPrice)}</td>
                    <td className="py-2 px-3 text-right font-mono font-semibold">{formatNPR(item.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="mt-5 flex justify-end">
            <div className="w-72 space-y-1.5 border border-neutral-300 p-3 bg-neutral-50/50 rounded-lg text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Sub-Total:</span>
                <span className="font-mono font-medium">{formatNPR(order.subtotal)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Festival Discount:</span>
                  <span className="font-mono font-medium">-{formatNPR(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-600">
                <span>Delivery & Handling:</span>
                <span className="font-mono font-medium">{formatNPR(order.deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>13% VAT (Nepal Value Added Tax):</span>
                <span className="font-mono font-medium">{formatNPR(order.taxAmount)}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-neutral-900 pt-2 border-t border-neutral-300">
                <span>Total Amount:</span>
                <span className="font-mono text-red-600 font-extrabold">{formatNPR(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Footer Terms & Signatures */}
          <div className="mt-10 pt-4 border-t border-neutral-200 flex justify-between items-end text-[10px] text-neutral-500">
            <div>
              <p>• Goods once sold can be returned or exchanged within 7 days in original condition.</p>
              <p>• This is a computer-generated tax invoice verified under Nepal Inland Revenue rules.</p>
              <p>• Thank you for shopping with Sajilo Bazar - Nepal Ko Sajilo Online Bazar.</p>
            </div>

            <div className="text-center">
              <div className="w-36 border-b border-neutral-400 mb-1" />
              <p className="font-bold text-neutral-700">Authorized Signature</p>
              <p className="text-[9px]">Sajilo Bazar Pvt. Ltd.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
