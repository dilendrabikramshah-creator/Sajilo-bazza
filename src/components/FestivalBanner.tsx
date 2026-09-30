import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, ArrowRight, ShieldCheck, Truck, RotateCcw, Copy, Check, CreditCard } from 'lucide-react';

export const FestivalBanner: React.FC = () => {
  const { language, setSelectedCategory, setActiveView, showToast } = useApp();
  const [copied, setCopied] = useState(false);

  // Festival Countdown to Dashain 2026
  const [timeLeft, setTimeLeft] = useState({
    days: 14,
    hours: 8,
    minutes: 42,
    seconds: 15,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopyCoupon = () => {
    navigator.clipboard.writeText('DASHAIN2026');
    setCopied(true);
    showToast('Coupon DASHAIN2026 copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section className="relative overflow-hidden bg-neutral-900 text-white rounded-2xl mx-4 sm:mx-6 lg:mx-auto max-w-7xl my-6 shadow-xl border border-neutral-800">
      {/* Background Hero Image with measured scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src="./images/hero_festival_banner_1790777663954.jpg"
          alt="Nepali Dashain and Tihar Festival Bazar"
          className="w-full h-full object-cover object-center opacity-40 mix-blend-luminosity scale-105 transition-transform duration-1000"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-900/90 to-transparent" />
      </div>

      <div className="relative z-10 px-6 py-10 sm:px-12 sm:py-16 lg:py-20 max-w-3xl">
        {/* Festive Kicker */}
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-3 tracking-wide uppercase">
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
          <span>{language === 'ne' ? 'बडा दसैं तथा तिहार विशेष महाअफर २०८३' : 'Dashain & Tihar Grand Festival 2026'}</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white text-balance leading-tight">
          {language === 'ne' ? (
            <>
              नेपालकै भरपर्दो अनलाइन बजार, <br />
              <span className="text-red-500">५०% सम्मको भारी छुट</span> घरमै डेलिभरी!
            </>
          ) : (
            <>
              Nepal’s Premier Online Bazar. <br />
              <span className="text-red-500">Up to 50% Off</span> Delivered to Your Door.
            </>
          )}
        </h1>

        <p className="mt-3 text-sm sm:text-base text-neutral-300 max-w-xl leading-relaxed">
          {language === 'ne'
            ? 'शुद्ध च्याङ्ग्रा पश्मिना, इलामको अर्गानिक चिया, सक्कली गोल्डस्टार जुत्ता र आधिकारिक ग्याजेटहरू अब ई-सेवा, खल्ती, फोनपे वा क्यास अन डेलिभरीमा उपलब्ध।'
            : 'Shop authentic Himalayan Cashmere, organic Ilam teas, original Goldstar sneakers, and MDMS-certified electronics. Doorstep delivery across all 7 provinces.'}
        </p>

        {/* Live Countdown & Coupon Code Box */}
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 bg-neutral-900/80 backdrop-blur-md border border-neutral-700/80 rounded-xl px-4 py-2 text-center">
            <div>
              <div className="text-lg font-black text-white font-mono tabular-nums leading-none">
                {String(timeLeft.days).padStart(2, '0')}
              </div>
              <div className="text-[10px] text-neutral-400 uppercase mt-0.5">Days</div>
            </div>
            <span className="text-neutral-500 font-mono">:</span>
            <div>
              <div className="text-lg font-black text-white font-mono tabular-nums leading-none">
                {String(timeLeft.hours).padStart(2, '0')}
              </div>
              <div className="text-[10px] text-neutral-400 uppercase mt-0.5">Hours</div>
            </div>
            <span className="text-neutral-500 font-mono">:</span>
            <div>
              <div className="text-lg font-black text-white font-mono tabular-nums leading-none">
                {String(timeLeft.minutes).padStart(2, '0')}
              </div>
              <div className="text-[10px] text-neutral-400 uppercase mt-0.5">Mins</div>
            </div>
            <span className="text-neutral-500 font-mono">:</span>
            <div>
              <div className="text-lg font-black text-red-500 font-mono tabular-nums leading-none">
                {String(timeLeft.seconds).padStart(2, '0')}
              </div>
              <div className="text-[10px] text-neutral-400 uppercase mt-0.5">Secs</div>
            </div>
          </div>

          {/* Coupon Code Pill */}
          <button
            onClick={handleCopyCoupon}
            className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 hover:border-amber-400 rounded-xl px-4 py-2 transition-all group"
            title="Click to copy coupon code"
          >
            <div className="text-left">
              <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Festival Coupon</div>
              <div className="text-sm font-extrabold text-white tracking-widest font-mono">DASHAIN2026</div>
            </div>
            <div className="p-1 rounded bg-amber-500/20 text-amber-300 group-hover:text-white transition-colors">
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </div>
          </button>
        </div>

        {/* Call to Actions */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              setSelectedCategory('local-nepali');
              setActiveView('shop');
            }}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-lg hover:shadow-red-600/30"
          >
            <span>{language === 'ne' ? 'स्वदेशी उत्पादनहरू हेर्नुहोस्' : 'Explore Nepali Specials'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setSelectedCategory('electronics-mobiles');
              setActiveView('shop');
            }}
            className="px-5 py-3 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all backdrop-blur-xs"
          >
            {language === 'ne' ? 'इलेक्ट्रोनिक्स अफर' : 'Mobiles & Electronics'}
          </button>
        </div>
      </div>

      {/* Trust Pillars Ribbon */}
      <div className="relative z-10 border-t border-neutral-800 bg-neutral-950/80 backdrop-blur-md px-6 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-neutral-300 text-xs">
          <div className="flex items-center gap-2.5">
            <Truck className="w-4 h-4 text-red-500 shrink-0" />
            <div>
              <div className="font-bold text-white">Cash on Delivery</div>
              <div className="text-[11px] text-neutral-400">All 77 districts across Nepal</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <div className="font-bold text-white">100% Genuine</div>
              <div className="text-[11px] text-neutral-400">MDMS & brand warranty</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <CreditCard className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <div className="font-bold text-white">eSewa & Khalti</div>
              <div className="text-[11px] text-neutral-400">Instant digital checkout</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <RotateCcw className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <div className="font-bold text-white">7-Day Easy Return</div>
              <div className="text-[11px] text-neutral-400">Hassle-free replacement</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
