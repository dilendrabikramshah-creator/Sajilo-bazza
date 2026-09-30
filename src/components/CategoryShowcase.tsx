import React from 'react';
import { useApp } from '../context/AppContext';
import { Flag, Smartphone, Shirt, Footprints, Home, ShoppingBag, Sparkles } from 'lucide-react';

export const CategoryShowcase: React.FC = () => {
  const { categories, language, setSelectedCategory, selectedCategory, setActiveView } = useApp();

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'local-nepali':
        return <Flag className="w-5 h-5 text-red-600" />;
      case 'electronics-mobiles':
        return <Smartphone className="w-5 h-5 text-blue-600" />;
      case 'fashion':
        return <Shirt className="w-5 h-5 text-purple-600" />;
      case 'shoes-footwear':
        return <Footprints className="w-5 h-5 text-emerald-600" />;
      case 'home-kitchen':
        return <Home className="w-5 h-5 text-amber-600" />;
      default:
        return <ShoppingBag className="w-5 h-5 text-teal-600" />;
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 my-10">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
            {language === 'ne' ? 'प्रमुख विधा तथा वर्गहरू' : 'Popular Categories'}
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            {language === 'ne' ? 'तपाईंलाई आवश्यक सामान सहजै खोज्नुहोस्' : 'Browse Nepal’s favorite categories and local specialties'}
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedCategory('all');
            setActiveView('shop');
          }}
          className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1"
        >
          <span>View All</span>
          <span>→</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.slug;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.slug);
                setActiveView('shop');
              }}
              className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between group ${
                isSelected
                  ? 'bg-neutral-900 text-white border-neutral-900 shadow-md'
                  : 'bg-white text-neutral-800 border-neutral-200/80 hover:border-neutral-300 hover:shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`p-2.5 rounded-lg transition-colors ${
                    isSelected ? 'bg-white/10' : 'bg-neutral-100 group-hover:bg-neutral-200/70'
                  }`}
                >
                  {getCategoryIcon(cat.slug)}
                </div>
                {cat.slug === 'local-nepali' && (
                  <Sparkles className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                )}
              </div>

              <div>
                <h3 className={`font-bold text-xs line-clamp-1 ${isSelected ? 'text-white' : 'text-neutral-900'}`}>
                  {language === 'ne' ? cat.nameNepali : cat.name}
                </h3>
                <p className={`text-[10px] mt-0.5 line-clamp-1 ${isSelected ? 'text-neutral-300' : 'text-neutral-400'}`}>
                  {cat.subcategories.map((s) => s.name).slice(0, 2).join(', ')}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
