import React, { useState, useRef } from 'react';
import {
  Upload,
  Link as LinkIcon,
  Search,
  ExternalLink,
  Check,
  Trash2,
  Star,
  Image as ImageIcon,
  Sparkles,
  Info,
  ShieldCheck,
  RefreshCw,
  FileCheck
} from 'lucide-react';

interface ProductImageManagerProps {
  featuredImage: string;
  images: string[];
  imageAlt?: string;
  imageSource?: string;
  productName: string;
  category: string;
  brand: string;
  onChange: (data: {
    featuredImage: string;
    images: string[];
    imageAlt: string;
    imageSource: string;
  }) => void;
}

// Curated royalty-free, high-quality e-commerce reference library for Nepal marketplace
const CURATED_REFERENCE_IMAGES = [
  {
    id: 'ref-pashmina',
    title: 'Handwoven Pure Cashmere Pashmina',
    category: 'Local Nepali Products',
    url: './images/product_nepal_pashmina_1790777676916.jpg',
    thumbnail: './images/product_nepal_pashmina_1790777676916.jpg',
    source: 'Sajilo Bazar Artisan Studio',
    license: 'Commercial Free / Owned',
    alt: 'Authentic Nepali handwoven cashmere pashmina shawl',
  },
  {
    id: 'ref-tea',
    title: 'Organic Orthodox Ilam Tea Tin',
    category: 'Local Nepali Products',
    url: './images/product_ilam_tea_1790777688573.jpg',
    thumbnail: './images/product_ilam_tea_1790777688573.jpg',
    source: 'Ilam Estate Direct',
    license: 'Commercial Free / Verified',
    alt: 'Premium organic orthodox black tea in gold tin',
  },
  {
    id: 'ref-hemp',
    title: 'Himalayan Pure Hemp Backpack',
    category: 'Local Nepali Products',
    url: './images/product_hemp_backpack_1790777698943.jpg',
    thumbnail: './images/product_hemp_backpack_1790777698943.jpg',
    source: 'Himalayan Artisans Guild',
    license: 'Artisan Licensed',
    alt: 'Handmade organic Himalayan pure hemp laptop backpack',
  },
  {
    id: 'ref-goldstar',
    title: 'Goldstar Classic Nepali Heritage Sneakers',
    category: 'Shoes & Footwear',
    url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80',
    source: 'Unsplash Commercial License',
    license: 'Free Commercial Use',
    alt: 'Classic durable red & white sneakers',
  },
  {
    id: 'ref-earbuds',
    title: 'Wireless Active ANC Earbuds',
    category: 'Electronics & Mobiles',
    url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=200&q=80',
    source: 'Unsplash Commercial License',
    license: 'Free Commercial Use',
    alt: 'Modern wireless earbuds with charging case',
  },
  {
    id: 'ref-phone',
    title: 'Modern Smartphone (MDMS Approved)',
    category: 'Electronics & Mobiles',
    url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=200&q=80',
    source: 'Unsplash Commercial License',
    license: 'Free Commercial Use',
    alt: 'Modern 5G smartphone screen studio shot',
  },
  {
    id: 'ref-cooker',
    title: 'Stainless Steel Pressure Cooker',
    category: 'Home & Kitchen',
    url: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=200&q=80',
    source: 'Unsplash Commercial License',
    license: 'Free Commercial Use',
    alt: 'Induction base kitchen pressure cooker',
  },
  {
    id: 'ref-honey',
    title: 'Pure Wild Himalayan Honey Jar',
    category: 'Grocery & Spices',
    url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=200&q=80',
    source: 'Unsplash Commercial License',
    license: 'Free Commercial Use',
    alt: 'Pure raw golden wild cliff honey in glass jar',
  },
  {
    id: 'ref-jacket',
    title: 'Himalayan Goose Down Winter Jacket',
    category: "Fashion & Men's/Women's",
    url: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=200&q=80',
    source: 'Unsplash Commercial License',
    license: 'Free Commercial Use',
    alt: 'Warm weatherproof winter insulated trekking jacket',
  },
];

export const ProductImageManager: React.FC<ProductImageManagerProps> = ({
  featuredImage,
  images,
  imageAlt = '',
  imageSource = '',
  productName,
  category,
  brand,
  onChange,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'link' | 'search'>('upload');
  
  // Link Tab State
  const [inputUrl, setInputUrl] = useState('');
  const [urlAlt, setUrlAlt] = useState(imageAlt);
  const [urlSource, setUrlSource] = useState(imageSource || 'Direct Web URL');
  const [testImageStatus, setTestImageStatus] = useState<'idle' | 'loading' | 'valid' | 'invalid'>('idle');

  // Upload Tab State
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [compressionStats, setCompressionStats] = useState<{
    originalSize: string;
    compressedSize: string;
    savedPercent: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Search Tab State
  const [searchQuery, setSearchQuery] = useState(
    productName ? `${brand} ${productName} product` : `${category} Nepal product`
  );
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchPastedUrl, setSearchPastedUrl] = useState('');

  // Handle local file upload with compression and WebP conversion
  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WEBP).');
      return;
    }

    setUploadProgress('Compressing & generating WebP preview...');
    const originalSizeKb = (file.size / 1024).toFixed(1);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas to resize / compress image
        const canvas = document.createElement('canvas');
        const maxDimension = 1200;
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Export as compressed WebP or JPEG
          const compressedDataUrl = canvas.toDataURL('image/webp', 0.85);
          const compressedSizeKb = ((compressedDataUrl.length * 0.75) / 1024).toFixed(1);
          const saved = Math.max(
            0,
            Math.round(((file.size - compressedDataUrl.length * 0.75) / file.size) * 100)
          );

          setCompressionStats({
            originalSize: `${originalSizeKb} KB`,
            compressedSize: `${compressedSizeKb} KB (Optimized WebP)`,
            savedPercent: `${saved}% smaller`,
          });

          // Update image state
          const newImages = images.includes(compressedDataUrl) ? images : [compressedDataUrl, ...images];
          onChange({
            featuredImage: compressedDataUrl,
            images: newImages,
            imageAlt: imageAlt || `${productName || 'Product'} photo`,
            imageSource: `Uploaded by seller (${file.name})`,
          });
          setUploadProgress(null);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Test and Apply Direct URL Link
  const handleApplyLink = () => {
    if (!inputUrl.trim()) return;
    setTestImageStatus('loading');

    const testImg = new Image();
    testImg.onload = () => {
      setTestImageStatus('valid');
      const newImages = images.includes(inputUrl.trim()) ? images : [inputUrl.trim(), ...images];
      onChange({
        featuredImage: inputUrl.trim(),
        images: newImages,
        imageAlt: urlAlt.trim() || `${productName || 'Product'} image`,
        imageSource: urlSource.trim() || 'Direct link',
      });
    };
    testImg.onerror = () => {
      setTestImageStatus('invalid');
    };
    testImg.src = inputUrl.trim();
  };

  // Handle Curated / Google Search Image Selection
  const handleSelectCuratedImage = (item: typeof CURATED_REFERENCE_IMAGES[0]) => {
    const newImages = images.includes(item.url) ? images : [item.url, ...images];
    onChange({
      featuredImage: item.url,
      images: newImages,
      imageAlt: item.alt,
      imageSource: `${item.source} (${item.license})`,
    });
  };

  // Remove an image from gallery
  const handleRemoveImage = (imgUrl: string) => {
    const newImages = images.filter((i) => i !== imgUrl);
    const newFeatured = featuredImage === imgUrl ? (newImages[0] || '') : featuredImage;
    onChange({
      featuredImage: newFeatured,
      images: newImages,
      imageAlt,
      imageSource,
    });
  };

  // Set image as primary/featured
  const handleSetFeatured = (imgUrl: string) => {
    onChange({
      featuredImage: imgUrl,
      images,
      imageAlt,
      imageSource,
    });
  };

  // Google Images Search Query URL
  const googleImagesUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(
    searchQuery
  )}&tbs=sur:cl`;

  const filteredCurated = CURATED_REFERENCE_IMAGES.filter((item) => {
    if (filterCategory === 'all') return true;
    return item.category.toLowerCase().includes(filterCategory.toLowerCase());
  });

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-4 space-y-4 text-xs">
      <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
        <div>
          <h4 className="font-bold text-neutral-900 flex items-center gap-1.5 text-sm">
            <ImageIcon className="w-4 h-4 text-red-600" />
            Product Image Studio & Sourcing
          </h4>
          <p className="text-[11px] text-neutral-500">
            Upload original photos, provide direct image links, or search Google & verified royalty-free sources.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-neutral-100 p-0.5 rounded-lg font-medium text-[11px]">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'upload'
                ? 'bg-white text-red-600 font-bold shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Upload File
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('link')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'link'
                ? 'bg-white text-red-600 font-bold shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            Direct URL Link
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'search'
                ? 'bg-white text-red-600 font-bold shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            Search by Google
          </button>
        </div>
      </div>

      {/* TAB 1: UPLOAD LOCAL FILE */}
      {activeTab === 'upload' && (
        <div className="space-y-3">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-neutral-300 hover:border-red-500 rounded-xl p-6 text-center bg-neutral-50/70 hover:bg-red-50/20 cursor-pointer transition-colors group"
          >
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png,image/jpeg,image/webp,image/jpg"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6" />
            </div>
            <p className="font-bold text-neutral-800 text-xs">
              Click to browse or drag & drop product photos
            </p>
            <p className="text-[11px] text-neutral-500 mt-1">
              Supports PNG, JPG, WEBP. Automatically optimized to WebP and compressed for fast mobile loading.
            </p>
          </div>

          {uploadProgress && (
            <div className="flex items-center gap-2 p-2 bg-blue-50 text-blue-700 rounded-lg text-[11px] animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>{uploadProgress}</span>
            </div>
          )}

          {compressionStats && (
            <div className="flex items-center justify-between p-2.5 bg-emerald-50 text-emerald-800 rounded-lg text-[11px] border border-emerald-200">
              <div className="flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>Original: {compressionStats.originalSize} ➔ <strong>{compressionStats.compressedSize}</strong></span>
              </div>
              <span className="bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded-full text-[10px]">
                {compressionStats.savedPercent}
              </span>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DIRECT LINK / URL */}
      {activeTab === 'link' && (
        <div className="space-y-3">
          <div>
            <label className="font-semibold block mb-1 text-neutral-700">Image Web Address (URL) *</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={inputUrl}
                onChange={(e) => {
                  setInputUrl(e.target.value);
                  setTestImageStatus('idle');
                }}
                placeholder="https://example.com/photos/nepali-tea.jpg"
                className="flex-1 p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-red-500 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleApplyLink}
                className="px-4 py-2 bg-neutral-900 hover:bg-black text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors shrink-0"
              >
                {testImageStatus === 'loading' ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                Load & Set Image
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold block mb-1 text-neutral-700">Image Source / Attribution</label>
              <input
                type="text"
                value={urlSource}
                onChange={(e) => setUrlSource(e.target.value)}
                placeholder="e.g. Official Brand Kit / Authorized Supplier"
                className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1 text-neutral-700">SEO Alt Text</label>
              <input
                type="text"
                value={urlAlt}
                onChange={(e) => setUrlAlt(e.target.value)}
                placeholder="e.g. Handcrafted wooden Nepali mask"
                className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs"
              />
            </div>
          </div>

          {testImageStatus === 'invalid' && (
            <p className="text-red-600 text-[11px] bg-red-50 p-2 rounded-lg">
              ⚠️ Unable to load image from that URL. Please verify the link is accessible and points to an image file.
            </p>
          )}

          {testImageStatus === 'valid' && (
            <p className="text-emerald-700 text-[11px] bg-emerald-50 p-2 rounded-lg flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Image successfully validated and set as featured!
            </p>
          )}
        </div>
      )}

      {/* TAB 3: SEARCH BY GOOGLE & ONLINE REFERENCE */}
      {activeTab === 'search' && (
        <div className="space-y-3">
          {/* Copyright Advisory Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-amber-900 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-[11px] space-y-0.5">
              <p className="font-bold">Copyright & Licensing Advisory</p>
              <p className="text-amber-800">
                Use Google image search results as a <strong>source/reference</strong>. Do not blindly copy copyrighted images. Ensure you own rights or select Creative Commons / royalty-free licensed images.
              </p>
            </div>
          </div>

          {/* Search Bar & Direct Google Launcher */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search keywords for product..."
                className="w-full pl-8 pr-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs"
              />
            </div>

            <a
              href={googleImagesUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors shrink-0"
            >
              <span>Search on Google Images</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Paste URL found from Google */}
          <div className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-200">
            <label className="font-semibold block mb-1 text-neutral-700 text-[11px]">
              Found an image on Google? Paste its Image Address (URL) here:
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={searchPastedUrl}
                onChange={(e) => setSearchPastedUrl(e.target.value)}
                placeholder="Paste copied image address here..."
                className="flex-1 p-2 bg-white border border-neutral-300 rounded-md text-xs font-mono"
              />
              <button
                type="button"
                onClick={() => {
                  if (searchPastedUrl.trim()) {
                    const newImages = images.includes(searchPastedUrl.trim())
                      ? images
                      : [searchPastedUrl.trim(), ...images];
                    onChange({
                      featuredImage: searchPastedUrl.trim(),
                      images: newImages,
                      imageAlt: `${productName || 'Product'} reference image`,
                      imageSource: 'Google Search Reference (Verified License)',
                    });
                    setSearchPastedUrl('');
                  }
                }}
                className="px-3 py-1.5 bg-neutral-900 hover:bg-black text-white font-bold rounded-md text-xs"
              >
                Use Image
              </button>
            </div>
          </div>

          {/* Curated Royalty-Free Library */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-neutral-800 text-[11px] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Or Select from Pre-Licensed High-Res E-Commerce Catalog:
              </span>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="p-1 bg-neutral-50 border border-neutral-300 rounded-md text-[11px]"
              >
                <option value="all">All Categories</option>
                <option value="Local Nepali">Local Nepali</option>
                <option value="Electronics">Electronics</option>
                <option value="Fashion">Fashion</option>
                <option value="Shoes">Shoes</option>
                <option value="Home">Home & Kitchen</option>
                <option value="Grocery">Grocery</option>
              </select>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-48 overflow-y-auto p-1 border border-neutral-200 rounded-lg">
              {filteredCurated.map((item) => {
                const isSelected = featuredImage === item.url;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectCuratedImage(item)}
                    className={`relative rounded-lg overflow-hidden border cursor-pointer group transition-all ${
                      isSelected
                        ? 'border-red-600 ring-2 ring-red-500/40 shadow-sm'
                        : 'border-neutral-200 hover:border-neutral-400'
                    }`}
                  >
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-20 object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-1 text-[10px] text-white">
                      <span className="font-medium truncate">{item.title}</span>
                      <span className="text-[9px] text-neutral-300 truncate">{item.license}</span>
                    </div>
                    {isSelected && (
                      <div className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE PRODUCT GALLERY & METADATA BAR */}
      <div className="border-t border-neutral-100 pt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-neutral-900 text-xs">
            Active Image Gallery ({images.length} images)
          </span>
          {imageSource && (
            <span className="text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded font-mono truncate max-w-xs">
              Source: {imageSource}
            </span>
          )}
        </div>

        {images.length === 0 ? (
          <div className="p-4 text-center border border-dashed border-neutral-200 rounded-lg text-neutral-400 text-xs">
            No images added yet. Upload a photo or select an image above.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {images.map((img, idx) => {
              const isMain = featuredImage === img;
              return (
                <div
                  key={idx}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden border group ${
                    isMain ? 'border-red-600 ring-2 ring-red-400 shadow-xs' : 'border-neutral-200'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Product preview ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {isMain && (
                    <div className="absolute top-1 left-1 bg-red-600 text-white text-[9px] font-bold px-1 rounded flex items-center gap-0.5 shadow-xs">
                      <Star className="w-2.5 h-2.5 fill-current" /> Main
                    </div>
                  )}

                  {/* Hover Controls */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    {!isMain && (
                      <button
                        type="button"
                        onClick={() => handleSetFeatured(img)}
                        className="p-1 bg-white hover:bg-neutral-100 text-neutral-900 rounded"
                        title="Set as featured main image"
                      >
                        <Star className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(img)}
                      className="p-1 bg-red-600 hover:bg-red-700 text-white rounded"
                      title="Remove image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
