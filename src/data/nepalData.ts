import { DeliveryZoneRule } from '../types';

export interface ProvinceData {
  id: string;
  name: string;
  nameNepali: string;
  districts: {
    name: string;
    municipalities: string[];
  }[];
}

export const NEPAL_PROVINCES: ProvinceData[] = [
  {
    id: 'bagmati',
    name: 'Bagmati Province',
    nameNepali: 'बागमती प्रदेश',
    districts: [
      {
        name: 'Kathmandu',
        municipalities: [
          'Kathmandu Metropolitan City',
          'Budhanilkantha Municipality',
          'Tarakeshwar Municipality',
          'Kirtipur Municipality',
          'Tokha Municipality',
          'Chandragiri Municipality',
          'Nagarjun Municipality',
          'Gokarneshwar Municipality',
        ],
      },
      {
        name: 'Lalitpur',
        municipalities: [
          'Lalitpur Metropolitan City',
          'Mahalaxmi Municipality',
          'Godawari Municipality',
        ],
      },
      {
        name: 'Bhaktapur',
        municipalities: [
          'Bhaktapur Municipality',
          'Madhyapur Thimi Municipality',
          'Suryabinayak Municipality',
          'Changunarayan Municipality',
        ],
      },
      {
        name: 'Chitwan',
        municipalities: [
          'Bharatpur Metropolitan City',
          'Ratnanagar Municipality',
          'Khairahani Municipality',
          'Madi Municipality',
        ],
      },
      {
        name: 'Kavrepalanchok',
        municipalities: [
          'Dhulikhel Municipality',
          'Banepa Municipality',
          'Panauti Municipality',
        ],
      },
      {
        name: 'Makwanpur',
        municipalities: ['Hetauda Sub-Metropolitan City', 'Thaha Municipality'],
      },
    ],
  },
  {
    id: 'gandaki',
    name: 'Gandaki Province',
    nameNepali: 'गण्डकी प्रदेश',
    districts: [
      {
        name: 'Kaski',
        municipalities: ['Pokhara Metropolitan City', 'Annapurna Rural Municipality'],
      },
      {
        name: 'Tanahun',
        municipalities: ['Byas Municipality', 'Shuklagandaki Municipality', 'Bhanu Municipality'],
      },
      {
        name: 'Mustang',
        municipalities: ['Gharapjhong Rural Municipality', 'Baragung Muktichhetra'],
      },
      {
        name: 'Lamjung',
        municipalities: ['Besisahar Municipality', 'Sundarbazar Municipality'],
      },
      {
        name: 'Syangja',
        municipalities: ['Putalibazar Municipality', 'Waling Municipality'],
      },
    ],
  },
  {
    id: 'koshi',
    name: 'Koshi Province',
    nameNepali: 'कोशी प्रदेश',
    districts: [
      {
        name: 'Morang',
        municipalities: ['Biratnagar Metropolitan City', 'Sundar Haraicha Municipality', 'Belbari Municipality'],
      },
      {
        name: 'Jhapa',
        municipalities: ['Birtamod Municipality', 'Damak Municipality', 'Mechinagar Municipality', 'Bhadrapur Municipality'],
      },
      {
        name: 'Sunsari',
        municipalities: ['Dharan Sub-Metropolitan City', 'Itahari Sub-Metropolitan City', 'Inaruwa Municipality'],
      },
      {
        name: 'Ilam',
        municipalities: ['Ilam Municipality', 'Suryodaya Municipality', 'Deumai Municipality'],
      },
    ],
  },
  {
    id: 'madhesh',
    name: 'Madhesh Province',
    nameNepali: 'मधेश प्रदेश',
    districts: [
      {
        name: 'Parsa',
        municipalities: ['Birgunj Metropolitan City', 'Pokhariya Municipality'],
      },
      {
        name: 'Dhanusha',
        municipalities: ['Janakpurdham Sub-Metropolitan City', 'Mithila Municipality', 'Shahidnagar Municipality'],
      },
      {
        name: 'Bara',
        municipalities: ['Kalaiya Sub-Metropolitan City', 'Jeetpur Simara Sub-Metropolitan City'],
      },
      {
        name: 'Sarlahi',
        municipalities: ['Malangwa Municipality', 'Lalgadh', 'Harion Municipality'],
      },
    ],
  },
  {
    id: 'lumbini',
    name: 'Lumbini Province',
    nameNepali: 'लुम्बिनी प्रदेश',
    districts: [
      {
        name: 'Rupandehi',
        municipalities: ['Butwal Sub-Metropolitan City', 'Siddharthanagar (Bhairahawa) Municipality', 'Tilottama Municipality'],
      },
      {
        name: 'Banke',
        municipalities: ['Nepalgunj Sub-Metropolitan City', 'Kohalpur Municipality'],
      },
      {
        name: 'Dang',
        municipalities: ['Ghorahi Sub-Metropolitan City', 'Tulsipur Sub-Metropolitan City', 'Lamahi Municipality'],
      },
      {
        name: 'Palpa',
        municipalities: ['Tansen Municipality', 'Rampur Municipality'],
      },
    ],
  },
  {
    id: 'karnali',
    name: 'Karnali Province',
    nameNepali: 'कर्णाली प्रदेश',
    districts: [
      {
        name: 'Surkhet',
        municipalities: ['Birendranagar Municipality', 'Bheriganga Municipality', 'Gurbhakot Municipality'],
      },
      {
        name: 'Jumla',
        municipalities: ['Chandannath Municipality', 'Tatopani Rural Municipality'],
      },
      {
        name: 'Dailekh',
        municipalities: ['Narayan Municipality', 'Dullu Municipality'],
      },
    ],
  },
  {
    id: 'sudurpashchim',
    name: 'Sudurpashchim Province',
    nameNepali: 'सुदूरपश्चिम प्रदेश',
    districts: [
      {
        name: 'Kailali',
        municipalities: ['Dhangadhi Sub-Metropolitan City', 'Tikapur Municipality', 'Godawari Municipality', 'Lamki Chuha Municipality'],
      },
      {
        name: 'Kanchanpur',
        municipalities: ['Bhimdatta (Mahendranagar) Municipality', 'Bedkot Municipality', 'Shuklaphanta Municipality'],
      },
      {
        name: 'Dadeldhura',
        municipalities: ['Amargadhi Municipality', 'Parshuram Municipality'],
      },
    ],
  },
];

export const DEFAULT_DELIVERY_ZONES: DeliveryZoneRule[] = [
  {
    province: 'Bagmati Province',
    standardFee: 80,
    expressFee: 150,
    freeDeliveryThreshold: 2000,
    estimatedDays: '1 - 2 Days (Valley 24h)',
  },
  {
    province: 'Gandaki Province',
    standardFee: 120,
    expressFee: 220,
    freeDeliveryThreshold: 3000,
    estimatedDays: '2 - 3 Days',
  },
  {
    province: 'Koshi Province',
    standardFee: 140,
    expressFee: 250,
    freeDeliveryThreshold: 3500,
    estimatedDays: '2 - 4 Days',
  },
  {
    province: 'Madhesh Province',
    standardFee: 130,
    expressFee: 240,
    freeDeliveryThreshold: 3500,
    estimatedDays: '2 - 3 Days',
  },
  {
    province: 'Lumbini Province',
    standardFee: 130,
    expressFee: 240,
    freeDeliveryThreshold: 3500,
    estimatedDays: '2 - 4 Days',
  },
  {
    province: 'Karnali Province',
    standardFee: 180,
    expressFee: 320,
    freeDeliveryThreshold: 4500,
    estimatedDays: '4 - 6 Days',
  },
  {
    province: 'Sudurpashchim Province',
    standardFee: 180,
    expressFee: 320,
    freeDeliveryThreshold: 4500,
    estimatedDays: '4 - 6 Days',
  },
];

/**
 * Format NPR with Nepalese comma separators (e.g. 1,25,000 for lakhs)
 */
export function formatNPR(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return 'Rs. 0';
  }
  const rounded = Math.round(amount);
  const isNegative = rounded < 0;
  const absStr = Math.abs(rounded).toString();

  // If number has <= 3 digits, standard format
  if (absStr.length <= 3) {
    return `${isNegative ? '-' : ''}Rs. ${absStr}`;
  }

  // Nepali numbering: last 3 digits, then pairs of 2 digits
  const lastThree = absStr.substring(absStr.length - 3);
  const otherDigits = absStr.substring(0, absStr.length - 3);
  const formattedOthers = otherDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ',');

  return `${isNegative ? '-' : ''}Rs. ${formattedOthers},${lastThree}`;
}

/**
 * Validates Nepali mobile phone numbers:
 * Starts with +977 or 98 / 97, 10 digits
 */
export function validateNepaliPhone(phone: string): { isValid: boolean; normalized: string; error?: string } {
  const clean = phone.replace(/[\s\-()]/g, '');
  
  let digits = clean;
  if (clean.startsWith('+977')) {
    digits = clean.substring(4);
  } else if (clean.startsWith('977')) {
    digits = clean.substring(3);
  } else if (clean.startsWith('0')) {
    digits = clean.substring(1);
  }

  if (!/^(98|97)\d{8}$/.test(digits)) {
    return {
      isValid: false,
      normalized: clean,
      error: 'Please enter a valid 10-digit Nepali mobile number (starting with 98 or 97)',
    };
  }

  return {
    isValid: true,
    normalized: `+977 ${digits.substring(0, 2)} ${digits.substring(2, 6)} ${digits.substring(6)}`,
  };
}

/**
 * Bilingual translations dictionary (English & Nepali)
 */
export const TRANSLATIONS = {
  en: {
    siteName: 'Sajilo Bazar',
    tagline: 'Nepal Ko Sajilo Online Bazar',
    searchPlaceholder: 'Search products, electronics, pashmina, tea, goldstar...',
    categories: 'Categories',
    allCategories: 'All Categories',
    deals: 'Deals of the Day',
    flashSale: 'Flash Sale',
    localNepali: 'Nepali Products',
    newArrivals: 'New Arrivals',
    bestSellers: 'Best Sellers',
    cart: 'Cart',
    wishlist: 'Wishlist',
    login: 'Login',
    register: 'Register',
    myAccount: 'My Account',
    adminDashboard: 'Admin Portal',
    logout: 'Logout',
    nepalTime: 'Nepal Time (NPT)',
    freeDeliveryNote: 'Free delivery on orders over Rs. 2,000 in Bagmati!',
    whyShopTitle: 'Why Shop With Sajilo Bazar?',
    codAvailable: 'Cash on Delivery Available Across Nepal',
    genuineGuarantee: '100% Genuine & MDMS Certified',
    esewaKhalti: 'Instant eSewa, Khalti & Fonepay Checkout',
    easyReturn: '7 Days Hassle-Free Returns',
    quickAdd: 'Add to Cart',
    buyNow: 'Buy Now',
    inStock: 'In Stock',
    lowStock: 'Low Stock',
    outOfStock: 'Out of Stock',
    specs: 'Specifications',
    warranty: 'Warranty',
    customerReviews: 'Customer Reviews',
    verifiedBuyer: 'Verified Nepali Buyer',
    checkout: 'Proceed to Checkout',
    trackOrder: 'Track Order',
    orderNumberPlaceholder: 'Enter order number (e.g. SB-2026-000123)',
    language: 'English',
  },
  ne: {
    siteName: 'सजिलो बजार',
    tagline: 'नेपालको सजिलो अनलाइन बजार',
    searchPlaceholder: 'सामान खोज्नुहोस्: मोबाइल, पश्मिना, चिया, गोल्डस्टार...',
    categories: 'वर्गहरू',
    allCategories: 'सबै वर्गहरू',
    deals: 'आजका विशेष अफरहरू',
    flashSale: 'फ्ल्यास सेल (छुट)',
    localNepali: 'स्वदेशी नेपाली उत्पादनहरू',
    newArrivals: 'नयाँ सामानहरू',
    bestSellers: 'धेरै रुचाइएका सामानहरू',
    cart: 'झोला (कार्ट)',
    wishlist: 'इच्छा सूची',
    login: 'लगइन',
    register: 'दर्ता हुनुहोस्',
    myAccount: 'मेरो खाता',
    adminDashboard: 'एडमिन पोर्टल',
    logout: 'लगआउट',
    nepalTime: 'नेपाल समय',
    freeDeliveryNote: 'बागमती प्रदेशमा रु २,००० भन्दा माथिको अर्डरमा नि:शुल्क डेलिभरी!',
    whyShopTitle: 'सजिलो बजार किन रोज्ने?',
    codAvailable: 'नेपालभर क्यास अन डेलिभरी (COD) सुविधा',
    genuineGuarantee: '१००% सक्कली र MDMS दर्ता भएका सामान',
    esewaKhalti: 'ई-सेवा, खल्ती र फोनपे मार्फत तत्काल भुक्तानी',
    easyReturn: '७ दिनभित्र सजिलै सामान फिर्ता वा साट्न सकिने',
    quickAdd: 'झोलामा हाल्नुहोस्',
    buyNow: 'अहिले किन्नुहोस्',
    inStock: 'उपलब्ध छ',
    lowStock: 'थोरै मात्र बाँकी',
    outOfStock: 'सकिएको छ',
    specs: 'विशेषताहरू',
    warranty: 'वारेन्टी',
    customerReviews: 'ग्राहकका प्रतिक्रियाहरू',
    verifiedBuyer: 'प्रमाणित नेपाली खरिदकर्ता',
    checkout: 'अर्डर गर्न अगाडि बढ्नुहोस्',
    trackOrder: 'अर्डर ट्र्याक गर्नुहोस्',
    orderNumberPlaceholder: 'अर्डर नम्बर राख्नुहोस् (जस्तै: SB-2026-000123)',
    language: 'नेपाली',
  },
};
