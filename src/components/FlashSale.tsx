import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ProductCard } from './ProductCard';
import { Zap, Clock } from 'lucide-react';

export const FlashSale: React.FC = () => {
  const { products, language } = useApp();
  const flashProducts = products.filter((p) => p.isFlashSale);

  const [hours, setHours] = useState(6);
  const [minutes, setMinutes] = useState(38);
  const [seconds, setSeconds] = useState(24);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((s) => {
        if (s > 0) return s - 1;
        setMinutes((m) => {
          if (m > 0) return m - 1;
          setHours((h) => (h > 0 ? h - 1 : 24));
          return 59;
        });
        return 59;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (flashProducts.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 my-10">
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500 text-white shadow-md animate-pulse">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
                <span>{language === 'ne' ? 'धमाका फ्ल्यास सेल' : 'Flash Sale Deals'}</span>
              </h2>
              <p className="text-xs text-neutral-600 mt-0.5">
                {language === 'ne' ? 'सिमित स्टक र समयका लागि मात्र विशेष छुट' : 'Limited quantities available at special festival prices'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto bg-white border border-amber-400/30 rounded-xl px-4 py-2 shadow-xs">
            <Clock className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-semibold text-neutral-600">Ends In:</span>
            <div className="flex items-center gap-1 font-mono font-bold text-sm text-neutral-900">
              <span className="bg-neutral-900 text-white px-2 py-0.5 rounded text-xs">
                {String(hours).padStart(2, '0')}
              </span>
              <span>:</span>
              <span className="bg-neutral-900 text-white px-2 py-0.5 rounded text-xs">
                {String(minutes).padStart(2, '0')}
              </span>
              <span>:</span>
              <span className="bg-red-600 text-white px-2 py-0.5 rounded text-xs animate-pulse">
                {String(seconds).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {flashProducts.slice(0, 4).map((product) => (
            <div key={product.id} className="flex flex-col">
              <ProductCard product={product} />
              {/* Flash Sale Stock Bar */}
              <div className="mt-2 px-1">
                <div className="flex items-center justify-between text-[11px] text-neutral-600 mb-1">
                  <span>Available: <strong className="text-neutral-900">{product.stock} units</strong></span>
                  <span className="text-amber-700 font-bold">Fast Selling</span>
                </div>
                <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, Math.max(25, 100 - product.stock * 2))}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
