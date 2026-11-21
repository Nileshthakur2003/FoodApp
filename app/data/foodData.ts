// app/data/foodData.ts

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  isVeg: boolean;
  calories?: string;
  portionGrams?: string;
  healthHighlight: string;
  rating: number;
}

export interface HygieneAudit {
  score: number; // e.g. 97
  grade: 'A+' | 'A' | 'B+';
  oilQuality: {
    polarCompound: string; // e.g. "7.8% (Fresh)"
    oilType: string; // e.g. "Cold-Pressed Mustard Oil"
    reuseLimit: string;
  };
  waterQuality: {
    type: string; // e.g. "Certified RO Water"
    mineralTestDate: string;
  };
  kitchenSanitation: {
    glovesAndCaps: boolean;
    fssaiLicense: string;
    pestControlAudit: string;
  };
  valueIndex: {
    portionScore: number;
    priceToQualityRatio: string;
  };
}

export interface FivePillars {
  sanitation: {
    score: number;
    grade: 'A+' | 'A' | 'B+';
    polarCompound: string;
    waterTds: string;
    glovesWorn: boolean;
    fssaiLicense: string;
    highlights: string[];
  };
  quantity: {
    score: number;
    avgPortionGrams: string;
    hungerFill: string;
    gramsPerRupee: string;
    highlight: string;
  };
  quality: {
    score: number;
    fatSource: string;
    spiceSource: string;
    noColors: boolean;
    purityBadge: string;
  };
  process: {
    method: string;
    cookware: string;
    oilCycle: string;
    freshnessInterval: string;
  };
  price: {
    score: number;
    tier: '₹' | '₹₹' | '₹₹₹';
    priceForTwo: number;
    valueVerdict: string;
    marketComparison: string;
  };
}

export interface DistanceAnalysis {
  distanceKm: number;
  walkingMins: number;
  rickshawMins: number;
  cyclingMins: number;
  routeTip: string;
}

export interface Restaurant {
  id: string;
  name: string;
  locality: string;
  address: string;
  distance: string;
  category: 'Street Food' | 'Regional Bihari' | 'Pure Veg' | 'Mughlai & Grill' | 'Cafe & Bakery' | 'Healthy & Bowls';
  emoji: string;
  image: string;
  priceForTwo: number;
  hygiene: HygieneAudit;
  authenticityRating: number;
  verifiedBadge: string;
  specialty: string;
  description: string;
  openingHours: string;
  lat: number;
  lng: number;
  mapX: number;
  mapY: number;
  fivePillars: FivePillars;
  distanceAnalysis: DistanceAnalysis;
  menu: MenuItem[];
}

export function calculateSpatialDistance(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number
): {
  distanceKm: number;
  walkingMins: number;
  rickshawMins: number;
  cyclingMins: number;
} {
  // Approximate Katihar bounding box: 100% map spans ~4.5 km width and ~3.8 km height
  const dx = (toX - fromX) * 0.045;
  const dy = (toY - fromY) * 0.038;
  const rawDist = Math.hypot(dx, dy);
  const distanceKm = Math.max(0.2, Math.round(rawDist * 10) / 10);
  const walkingMins = Math.max(3, Math.round((distanceKm / 4.8) * 60));
  const rickshawMins = Math.max(2, Math.round((distanceKm / 18) * 60));
  const cyclingMins = Math.max(2, Math.round((distanceKm / 12) * 60));

  return { distanceKm, walkingMins, rickshawMins, cyclingMins };
}

export interface Locality {
  id: string;
  name: string;
  landmark: string;
  distanceKm: number;
  famousFor: string;
  lat: number;
  lng: number;
  mapX: number; // percentage (0 - 100)
  mapY: number; // percentage (0 - 100)
  vettedStallsCount: number;
}

export interface UserProfile {
  name: string;
  phone: string;
  passType: 'CITIZEN PASS' | 'GOLD CITIZEN' | 'HEALTH ADVOCATE';
  cleanFoodScore: number;
  walletBalance: number;
  verified: boolean;
  upiId?: string;
  joinedDate: string;
}

export const DEFAULT_USER: UserProfile = {
  name: 'Nilesh Kumar',
  phone: '+91 98765 43210',
  passType: 'CITIZEN PASS',
  cleanFoodScore: 98,
  walletBalance: 124.0,
  verified: true,
  upiId: 'nilesh@okhdfcbank',
  joinedDate: 'Oct 2026',
};

export const KATIHAR_LOCALITIES: Locality[] = [
  {
    id: 'mirchaibari',
    name: 'Mirchaibari',
    landmark: 'Near City Stadium',
    distanceKm: 1.2,
    famousFor: 'Modern dining & cafes',
    lat: 25.552,
    lng: 87.568,
    mapX: 46,
    mapY: 26,
    vettedStallsCount: 8,
  },
  {
    id: 'mg-road',
    name: 'MG Road',
    landmark: 'Commercial Hub',
    distanceKm: 0.8,
    famousFor: 'Handi litti & kebab grills',
    lat: 25.543,
    lng: 87.571,
    mapX: 52,
    mapY: 48,
    vettedStallsCount: 12,
  },
  {
    id: 'bara-bazar',
    name: 'Bara Bazar',
    landmark: 'Historic Market',
    distanceKm: 0.4,
    famousFor: 'Desi ghee jalebi & satvik thalis',
    lat: 25.538,
    lng: 87.564,
    mapX: 42,
    mapY: 60,
    vettedStallsCount: 15,
  },
  {
    id: 'railway-colony',
    name: 'Railway Colony',
    landmark: 'Junction Area',
    distanceKm: 1.5,
    famousFor: 'Artisan bakery & burgers',
    lat: 25.558,
    lng: 87.58,
    mapX: 74,
    mapY: 22,
    vettedStallsCount: 6,
  },
  {
    id: 'amlatola',
    name: 'Amlatola',
    landmark: 'Ganesh Mandir Chowk',
    distanceKm: 0.6,
    famousFor: 'Mineral water puchka & chaat',
    lat: 25.54,
    lng: 87.575,
    mapX: 64,
    mapY: 54,
    vettedStallsCount: 9,
  },
  {
    id: 'binodpur',
    name: 'Binodpur',
    landmark: 'College Road',
    distanceKm: 1.9,
    famousFor: 'Organic bowls & detox juices',
    lat: 25.548,
    lng: 87.585,
    mapX: 82,
    mapY: 42,
    vettedStallsCount: 7,
  },
  {
    id: 'driver-tola',
    name: 'Driver Tola',
    landmark: 'Highway Crossing',
    distanceKm: 2.8,
    famousFor: 'Late night clay tandoor',
    lat: 25.525,
    lng: 87.55,
    mapX: 24,
    mapY: 78,
    vettedStallsCount: 4,
  },
  {
    id: 'teja-tola',
    name: 'Teja Tola',
    landmark: 'Old Town Square',
    distanceKm: 1.4,
    famousFor: 'Hing kachori breakfast',
    lat: 25.535,
    lng: 87.555,
    mapX: 30,
    mapY: 64,
    vettedStallsCount: 5,
  },
];

export const RESTAURANTS_DATA: Restaurant[] = [
  {
    id: 'champaran-litti',
    name: 'Champaran Handi & Litti Hub',
    locality: 'MG Road',
    address: 'Opposite City Post Office, MG Road',
    distance: '0.8 km',
    category: 'Regional Bihari',
    emoji: '🥘',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
    priceForTwo: 130,
    lat: 25.543,
    lng: 87.571,
    mapX: 52,
    mapY: 48,
    fivePillars: {
      sanitation: {
        score: 97,
        grade: 'A+',
        polarCompound: '7.8% (Pristine, Limit 25%)',
        waterTds: 'RO TDS 110 (Tested Nov 2026)',
        glovesWorn: true,
        fssaiLicense: 'FSSAI #20422001004921',
        highlights: ['Daily Single-Cycle Oil Discard', 'RO Purified Tumblers', 'Sterilized Steel Thalis'],
      },
      quantity: {
        score: 4.9,
        avgPortionGrams: '350g',
        hungerFill: 'Full Meal (1 Adult)',
        gramsPerRupee: '5.8g / ₹1',
        highlight: 'Heavy sattu litti with unlimited roasted chokha refills',
      },
      quality: {
        score: 98,
        fatSource: 'Cold-Pressed Mustard Oil & Cow Ghee',
        spiceSource: 'Stone-Ground Whole Spices',
        noColors: true,
        purityBadge: 'Zero Palm Oil & Zero MSG Guarantee',
      },
      process: {
        method: 'Slow Woodfired Clay Handi & Charcoal Pit',
        cookware: 'Earthen Ahuna Handi (Single-Use Clay)',
        oilCycle: 'Single-Cycle Guaranteed',
        freshnessInterval: 'Baked fresh every 30 minutes',
      },
      price: {
        score: 4.9,
        tier: '₹',
        priceForTwo: 130,
        valueVerdict: 'Top Street Food Value in Katihar',
        marketComparison: '22% cheaper than commercial dining hubs',
      },
    },
    distanceAnalysis: {
      distanceKm: 0.8,
      walkingMins: 10,
      rickshawMins: 3,
      cyclingMins: 4,
      routeTip: 'Direct 3-minute e-rickshaw ride down MG Road opposite City Post Office',
    },
    hygiene: {
      score: 97,
      grade: 'A+',
      oilQuality: {
        polarCompound: '7.8% (Fresh)',
        oilType: 'Cold-Pressed Mustard Oil',
        reuseLimit: 'Single-Cycle Guaranteed',
      },
      waterQuality: {
        type: 'RO Purified (TDS 110)',
        mineralTestDate: 'Nov 2026 Verified',
      },
      kitchenSanitation: {
        glovesAndCaps: true,
        fssaiLicense: 'FSSAI #20422001004921',
        pestControlAudit: 'Weekly Certified',
      },
      valueIndex: {
        portionScore: 4.9,
        priceToQualityRatio: 'Huge Portions',
      },
    },
    authenticityRating: 5.0,
    verifiedBadge: 'EatRight Gold',
    specialty: 'Woodfired Handi Sattu Litti with Charcoal Roasted Baingan Chokha',
    description: 'Baked over cow-dung charcoal. Zero palm oil or artificial tenderizers.',
    openingHours: '11:00 AM - 10:30 PM',
    menu: [
      {
        id: 'litti-plate',
        name: 'Handi Sattu Litti & Chokha',
        price: 60,
        description: '2 large charcoal-baked littis in cow ghee with baingan chokha & chutney.',
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
        isVeg: true,
        calories: '380 kcal',
        portionGrams: '350g',
        healthHighlight: 'High Fiber, Zero Maida',
        rating: 4.9,
      },
      {
        id: 'champaran-gravy',
        name: 'Clay Pot Ahuna Gravy Bowl',
        price: 130,
        description: 'Slow-cooked in sealed earthen handi with whole garlic pods.',
        image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&auto=format&fit=crop&q=80',
        isVeg: false,
        calories: '420 kcal',
        portionGrams: '400g',
        healthHighlight: 'Slow-cooked in clay',
        rating: 4.8,
      },
      {
        id: 'sattu-sharbhat',
        name: 'Spiced Mint Sattu Sharbhat',
        price: 35,
        description: 'Chilled roasted chana shake with fresh mint & roasted cumin.',
        image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80',
        isVeg: true,
        calories: '140 kcal',
        portionGrams: '300ml',
        healthHighlight: '12g Plant Protein, Cooling',
        rating: 5.0,
      },
    ],
  },
  {
    id: 'annapurna-rasoi',
    name: 'Annapurna Satvik Rasoi & Sweets',
    locality: 'Bara Bazar',
    address: 'Near Old Durga Mandir, Bara Bazar',
    distance: '0.4 km',
    category: 'Pure Veg',
    emoji: '🍛',
    image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800&auto=format&fit=crop&q=80',
    priceForTwo: 160,
    lat: 25.538,
    lng: 87.564,
    mapX: 42,
    mapY: 60,
    fivePillars: {
      sanitation: {
        score: 99,
        grade: 'A+',
        polarCompound: '4.2% (Pristine Dairy)',
        waterTds: 'Triple Stage UV+RO TDS 85',
        glovesWorn: true,
        fssaiLicense: 'FSSAI #10419001000184',
        highlights: ['ISO 22000 Sanitation Audit', 'Steam-Sterilized Kitchen Utensils', 'Pure Cow Ghee Only'],
      },
      quantity: {
        score: 5.0,
        avgPortionGrams: '650g',
        hungerFill: 'Unlimited Refill Feast',
        gramsPerRupee: '5.0g / ₹1',
        highlight: 'Unlimited phulkas, dal & seasonal vegetable refills',
      },
      quality: {
        score: 99,
        fatSource: '100% Certified Dairy Cow Ghee',
        spiceSource: 'Ayurvedic Satvik Whole Spices',
        noColors: true,
        purityBadge: 'No Onion, No Garlic, Pure Desi Ghee',
      },
      process: {
        method: 'Continuous Fresh Steam Cooking & Iron Kadai',
        cookware: 'Heavy Gauge Food-Grade Stainless Steel & Earthen Bowls',
        oilCycle: 'Zero Reheat Policy',
        freshnessInterval: 'Phulkas rolled live per order',
      },
      price: {
        score: 4.8,
        tier: '₹₹',
        priceForTwo: 160,
        valueVerdict: 'Incredible Unlimited Value',
        marketComparison: 'Best unlimited thali value across Bara Bazar',
      },
    },
    distanceAnalysis: {
      distanceKm: 0.4,
      walkingMins: 5,
      rickshawMins: 2,
      cyclingMins: 2,
      routeTip: 'Short 5-minute walk from Bara Bazar Chowk towards Old Durga Mandir',
    },
    hygiene: {
      score: 99,
      grade: 'A+',
      oilQuality: {
        polarCompound: '4.2% (Pristine)',
        oilType: 'Certified Cow Ghee & Groundnut Oil',
        reuseLimit: 'Zero Reheat Policy',
      },
      waterQuality: {
        type: 'Triple Stage UV + RO',
        mineralTestDate: 'Nov 2026 Verified',
      },
      kitchenSanitation: {
        glovesAndCaps: true,
        fssaiLicense: 'FSSAI #10419001000184',
        pestControlAudit: 'Weekly ISO 22000',
      },
      valueIndex: {
        portionScore: 5.0,
        priceToQualityRatio: 'Unlimited Serving',
      },
    },
    authenticityRating: 4.9,
    verifiedBadge: '5-Star Kitchen',
    specialty: 'Unlimited Satvik Mahaprasad Thali & Desi Ghee Jalebi',
    description: 'Hygienic satvik meals cooked in pure dairy ghee and fresh cold-pressed groundnut oil.',
    openingHours: '8:00 AM - 10:00 PM',
    menu: [
      {
        id: 'satvik-thali',
        name: 'Unlimited Satvik Thali',
        price: 130,
        description: 'Whole wheat phulkas, dal tadka, 2 curries, jeera rice & kheer.',
        image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80',
        isVeg: true,
        calories: '560 kcal',
        portionGrams: '650g',
        healthHighlight: 'Zero Heavy Cream, Light',
        rating: 5.0,
      },
      {
        id: 'desi-ghee-jalebi',
        name: 'Desi Ghee Jalebi (250g)',
        price: 75,
        description: 'Crisp spirals fried in pure cow ghee with real saffron.',
        image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80',
        isVeg: true,
        calories: '340 kcal',
        portionGrams: '250g',
        healthHighlight: 'Pure Cow Ghee Only',
        rating: 4.9,
      },
      {
        id: 'hing-kachori',
        name: 'Hing Kachori & Aloo Dum (2 pcs)',
        price: 40,
        description: 'Flaky kachoris stuffed with urad dal and sour-tangy potato curry.',
        image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&auto=format&fit=crop&q=80',
        isVeg: true,
        calories: '290 kcal',
        portionGrams: '220g',
        healthHighlight: 'Single-Use Groundnut Oil',
        rating: 4.7,
      },
    ],
  },
  {
    id: 'gupta-chaat',
    name: 'Gupta Mineral Puchka & Chaat',
    locality: 'Amlatola',
    address: 'Ganesh Mandir Chowk, Amlatola',
    distance: '0.6 km',
    category: 'Street Food',
    emoji: '🥟',
    image: 'https://images.unsplash.com/photo-1625398407796-82650a8c135f?w=800&auto=format&fit=crop&q=80',
    priceForTwo: 70,
    lat: 25.540,
    lng: 87.575,
    mapX: 64,
    mapY: 54,
    fivePillars: {
      sanitation: {
        score: 95,
        grade: 'A',
        polarCompound: '9.1% (Safe Daily Filtered)',
        waterTds: '100% Sealed Mineral Water (TDS 95)',
        glovesWorn: true,
        fssaiLicense: 'FSSAI Street #20421008003112',
        highlights: ['Sealed Bisleri Mineral Water', 'Disposable Food-Grade Gloves', 'UV Sanitized Glass Enclosure'],
      },
      quantity: {
        score: 4.8,
        avgPortionGrams: '280g',
        hungerFill: 'Light Refreshing Snack',
        gramsPerRupee: '7.1g / ₹1',
        highlight: '8 large stuffed puris + 6 distinct mineral water shots',
      },
      quality: {
        score: 96,
        fatSource: 'Daily Fresh Refined Sunflower Oil',
        spiceSource: 'Hand-Ground Roasted Jeera & Hing',
        noColors: true,
        purityBadge: 'Zero Artificial Tartaric Acid',
      },
      process: {
        method: 'Hygienic Cold Mineral Infusion & Shallow Griddle',
        cookware: 'Tempered Glass Prep Island & Leaf Platters',
        oilCycle: 'Fresh batch daily discard',
        freshnessInterval: 'Waters made fresh twice daily',
      },
      price: {
        score: 5.0,
        tier: '₹',
        priceForTwo: 70,
        valueVerdict: 'Pocket Friendly Street Benchmark',
        marketComparison: 'Authentic Katihar street pricing with laboratory water safety',
      },
    },
    distanceAnalysis: {
      distanceKm: 0.6,
      walkingMins: 8,
      rickshawMins: 2,
      cyclingMins: 3,
      routeTip: 'Located at Ganesh Mandir Chowk, Amlatola corner',
    },
    hygiene: {
      score: 95,
      grade: 'A',
      oilQuality: {
        polarCompound: '9.1% (Safe)',
        oilType: 'Refined Sunflower Oil (Daily Filtered)',
        reuseLimit: 'Changed every morning',
      },
      waterQuality: {
        type: '100% Sealed Mineral Water',
        mineralTestDate: 'Daily Batch Check',
      },
      kitchenSanitation: {
        glovesAndCaps: true,
        fssaiLicense: 'FSSAI Street #20421008003112',
        pestControlAudit: 'UV Sterilized Glass Cart',
      },
      valueIndex: {
        portionScore: 4.9,
        priceToQualityRatio: 'Pocket Friendly',
      },
    },
    authenticityRating: 4.8,
    verifiedBadge: 'Street Food Safe',
    specialty: '6-Flavour Mineral Water Puchka & Dahi Papdi Chaat',
    description: '100% hygienic street chaat served with sealed mineral water in food-grade gloves.',
    openingHours: '3:30 PM - 9:30 PM',
    menu: [
      {
        id: 'mineral-puchka',
        name: '6-Flavour Mineral Puchka (8 pcs)',
        price: 35,
        description: 'Crisp whole-wheat puris with 6 mineral waters: Mint, Hing, Lemon, Jeera, Garlic.',
        image: 'https://images.unsplash.com/photo-1625398407796-82650a8c135f?w=600&auto=format&fit=crop&q=80',
        isVeg: true,
        calories: '180 kcal',
        portionGrams: '250g',
        healthHighlight: '100% Sealed Mineral Water',
        rating: 4.9,
      },
      {
        id: 'dahi-papdi-chaat',
        name: 'Dahi Papdi Chaat Bowl',
        price: 50,
        description: 'Fresh curd, crunchy papdis, roasted cumin & pomegranate pearls.',
        image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80',
        isVeg: true,
        calories: '260 kcal',
        portionGrams: '300g',
        healthHighlight: 'Probiotic Curd & Antioxidants',
        rating: 4.8,
      },
      {
        id: 'chhole-tikki',
        name: 'Crispy Aloo Tikki with Chhole',
        price: 45,
        description: 'Shallow-tava grilled cutlet topped with slow-stewed chhole.',
        image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
        isVeg: true,
        calories: '310 kcal',
        portionGrams: '320g',
        healthHighlight: 'Tawa Shallow Grilled',
        rating: 4.7,
      },
    ],
  },
  {
    id: 'royal-biryani',
    name: 'Royal Awadhi Biryani & Kebabs',
    locality: 'Mirchaibari',
    address: 'Besan Chowk, Mirchaibari',
    distance: '1.2 km',
    category: 'Mughlai & Grill',
    emoji: '🍗',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
    priceForTwo: 240,
    lat: 25.531,
    lng: 87.558,
    mapX: 34,
    mapY: 70,
    fivePillars: {
      sanitation: {
        score: 96,
        grade: 'A',
        polarCompound: '8.4% (Fresh Tested)',
        waterTds: 'RO TDS 120',
        glovesWorn: true,
        fssaiLicense: 'FSSAI #10420005001923',
        highlights: ['35% Lower Fat Tested', 'Sealed Dough Clay Handis', 'Monthly Professional Sanitation'],
      },
      quantity: {
        score: 4.8,
        avgPortionGrams: '500g',
        hungerFill: 'Hearty Feast (1-2 persons)',
        gramsPerRupee: '2.8g / ₹1',
        highlight: 'Generous aged basmati rice with whole lean cuts',
      },
      quality: {
        score: 97,
        fatSource: 'Desi Cow Ghee & Cold-Pressed Mustard Oil',
        spiceSource: 'Kashmiri Saffron & Whole Spices',
        noColors: true,
        purityBadge: 'Zero Synthetic Essence & No Vanaspati',
      },
      process: {
        method: 'Slow Steam Dum Pukht (Sealed Dough Rim)',
        cookware: 'Sealed Earthen Clay Handi',
        oilCycle: 'Zero Reused Fat',
        freshnessInterval: 'Each dum handi opened hot on order',
      },
      price: {
        score: 4.7,
        tier: '₹₹',
        priceForTwo: 240,
        valueVerdict: 'Premium Dum Cooking at Fair Rates',
        marketComparison: '30% lower than branded regional biryani chains',
      },
    },
    distanceAnalysis: {
      distanceKm: 1.2,
      walkingMins: 15,
      rickshawMins: 4,
      cyclingMins: 6,
      routeTip: 'Besan Chowk, Mirchaibari link road towards bypass',
    },
    hygiene: {
      score: 96,
      grade: 'A',
      oilQuality: {
        polarCompound: '8.4% (Fresh)',
        oilType: 'Cow Ghee & Cold-Pressed Mustard Oil',
        reuseLimit: 'Zero synthetic vanaspati',
      },
      waterQuality: {
        type: 'RO System (TDS 120)',
        mineralTestDate: 'Nov 2026 Verified',
      },
      kitchenSanitation: {
        glovesAndCaps: true,
        fssaiLicense: 'FSSAI #10420005001923',
        pestControlAudit: 'Monthly Sanitization',
      },
      valueIndex: {
        portionScore: 4.8,
        priceToQualityRatio: 'Generous Cuts',
      },
    },
    authenticityRating: 4.9,
    verifiedBadge: 'Low-Oil Verified',
    specialty: 'Zafrani Dum Pukht Biryani with Steam Cooking',
    description: 'Sealed handi dum cooking. Tested 35% lower fat than typical commercial biryani.',
    openingHours: '12:30 PM - 11:00 PM',
    menu: [
      {
        id: 'zafrani-biryani',
        name: 'Royal Zafrani Handi Dum Biryani',
        price: 180,
        description: 'Aged Basmati rice infused with saffron & organic spices, with cucumber raita.',
        image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=600&auto=format&fit=crop&q=80',
        isVeg: false,
        calories: '510 kcal',
        portionGrams: '500g',
        healthHighlight: 'Dum Steam Cooked, Low Oil',
        rating: 4.9,
      },
      {
        id: 'galouti-kebab',
        name: 'Galouti Kebabs (4 pcs)',
        price: 160,
        description: 'Melt-in-mouth patties pan-seared in desi ghee with roomali roti.',
        image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80',
        isVeg: false,
        calories: '380 kcal',
        portionGrams: '260g',
        healthHighlight: 'Lean Cuts, High Zinc & Iron',
        rating: 4.8,
      },
      {
        id: 'firni-sakora',
        name: 'Clay Sakora Kesar Phirni',
        price: 50,
        description: 'Slow-reduced milk, pistachios & saffron served in earthen sakora.',
        image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=600&auto=format&fit=crop&q=80',
        isVeg: true,
        calories: '210 kcal',
        portionGrams: '180g',
        healthHighlight: 'Unrefined Cane Sugar',
        rating: 4.9,
      },
    ],
  },
  {
    id: 'katihar-roastery',
    name: 'The Katihar Roastery & Cafe',
    locality: 'Railway Colony',
    address: '1st Avenue, Railway Colony',
    distance: '1.5 km',
    category: 'Cafe & Bakery',
    emoji: '☕',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
    priceForTwo: 260,
    lat: 25.552,
    lng: 87.568,
    mapX: 46,
    mapY: 26,
    fivePillars: {
      sanitation: {
        score: 98,
        grade: 'A+',
        polarCompound: '5.1% (Pristine Olive Oil & Butter)',
        waterTds: 'Mineral-Balanced Specialty Water (pH 7.4)',
        glovesWorn: true,
        fssaiLicense: 'FSSAI #10423002000845',
        highlights: ['ISO Certified Micro Bakery', 'Air-Crisped Low Oil Fries', 'Live Open Prep Counter'],
      },
      quantity: {
        score: 4.6,
        avgPortionGrams: '320g',
        hungerFill: 'Satisfying Meal (1 Person)',
        gramsPerRupee: '2.1g / ₹1',
        highlight: 'Dense 24h wild fermented sourdough brioche',
      },
      quality: {
        score: 98,
        fatSource: 'Extra Virgin Olive Oil & Pure Dairy Butter',
        spiceSource: 'Real Madagascar Vanilla & Fresh Herbs',
        noColors: true,
        purityBadge: '100% Naturally Fermented (Gut Friendly)',
      },
      process: {
        method: '24-Hour Wild Sourdough Fermentation & Air Baking',
        cookware: 'Italian Commercial Ovens & Air Fryers',
        oilCycle: 'Zero Hydrogenated Fats',
        freshnessInterval: 'Breads baked fresh twice daily',
      },
      price: {
        score: 4.5,
        tier: '₹₹₹',
        priceForTwo: 260,
        valueVerdict: 'Fair Artisanal Craft Pricing',
        marketComparison: 'Only verified sourdough roastery in Seemanchal',
      },
    },
    distanceAnalysis: {
      distanceKm: 1.5,
      walkingMins: 18,
      rickshawMins: 5,
      cyclingMins: 7,
      routeTip: '1st Avenue, Railway Colony near Junction Officers Club',
    },
    hygiene: {
      score: 98,
      grade: 'A+',
      oilQuality: {
        polarCompound: '5.1% (Pristine)',
        oilType: 'Extra Virgin Olive Oil & Butter',
        reuseLimit: 'Zero hydrogenated oils',
      },
      waterQuality: {
        type: 'Remineralized Specialty Water (pH 7.4)',
        mineralTestDate: 'Nov 2026 Verified',
      },
      kitchenSanitation: {
        glovesAndCaps: true,
        fssaiLicense: 'FSSAI #10423002000845',
        pestControlAudit: 'Weekly Micro-clean',
      },
      valueIndex: {
        portionScore: 4.6,
        priceToQualityRatio: 'Artisanal Breads',
      },
    },
    authenticityRating: 4.7,
    verifiedBadge: 'FSSAI Grade A+',
    specialty: 'Sourdough Brioche Burgers & Single-Origin Cold Brew',
    description: '24-hour slow fermented sourdough buns that eliminate bloating, with freshly roasted coffee.',
    openingHours: '9:00 AM - 10:30 PM',
    menu: [
      {
        id: 'sourdough-burger',
        name: 'Artisan Sourdough Smash Burger',
        price: 150,
        description: 'Fermented sourdough bun, grilled patty, cheddar & tomato relish.',
        image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80',
        isVeg: true,
        calories: '440 kcal',
        portionGrams: '320g',
        healthHighlight: 'Gut-Friendly 24h Sourdough',
        rating: 4.8,
      },
      {
        id: 'masala-fries',
        name: 'Air-Crisped Masala Fries',
        price: 70,
        description: 'Skin-on potato batons tossed in pink salt, air-crisped with minimal oil.',
        image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80',
        isVeg: true,
        calories: '220 kcal',
        portionGrams: '200g',
        healthHighlight: '70% Less Oil (Air Crisped)',
        rating: 4.6,
      },
      {
        id: 'cold-brew',
        name: 'Hazelnut Cold Brew Coffee',
        price: 110,
        description: '18-hour cold steeped Arabica with natural Madagascar vanilla.',
        image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop&q=80',
        isVeg: true,
        calories: '45 kcal',
        portionGrams: '350ml',
        healthHighlight: 'Zero Added Sugar, Antioxidants',
        rating: 4.9,
      },
    ],
  },
  {
    id: 'green-bowl',
    name: 'Green Bowl Health Bar & Juicery',
    locality: 'Binodpur',
    address: 'Opposite Government College, Binodpur',
    distance: '1.9 km',
    category: 'Healthy & Bowls',
    emoji: '🥗',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
    priceForTwo: 180,
    lat: 25.548,
    lng: 87.585,
    mapX: 82,
    mapY: 42,
    fivePillars: {
      sanitation: {
        score: 99,
        grade: 'A+',
        polarCompound: '0.0% (Zero Cooking Oil Kitchen)',
        waterTds: 'Alkaline Ionized Water (pH 8.5)',
        glovesWorn: true,
        fssaiLicense: 'FSSAI #10422004000319',
        highlights: ['Ozone Produce Sanitization', '100% Cold-Pressed Extractor', 'Zero Reheat Kitchen'],
      },
      quantity: {
        score: 4.8,
        avgPortionGrams: '380g',
        hungerFill: 'Nutrient Dense Clean Fuel',
        gramsPerRupee: '4.0g / ₹1',
        highlight: 'Overflowing bowl of sprouted moong, malai paneer & seeds',
      },
      quality: {
        score: 100,
        fatSource: 'Zero Added Oil (Raw & Steamed Whole Foods)',
        spiceSource: 'Rock Salt, Fresh Lime & Organic Herbs',
        noColors: true,
        purityBadge: '100% Unprocessed Whole Nutrition',
      },
      process: {
        method: 'Cold-Masticating Extraction & Ozone Bath',
        cookware: 'Surgical Steel Cold Extractors & Ceramic Bowls',
        oilCycle: 'Strictly Zero Oil Facility',
        freshnessInterval: 'Juices pressed live per serving',
      },
      price: {
        score: 4.7,
        tier: '₹₹',
        priceForTwo: 180,
        valueVerdict: 'High Micronutrient Return',
        marketComparison: 'Direct farm-to-bowl pricing without health markup',
      },
    },
    distanceAnalysis: {
      distanceKm: 1.9,
      walkingMins: 23,
      rickshawMins: 6,
      cyclingMins: 9,
      routeTip: 'Opposite Government College on College Road, Binodpur',
    },
    hygiene: {
      score: 99,
      grade: 'A+',
      oilQuality: {
        polarCompound: '0% (Raw & Steamed)',
        oilType: 'Zero Added Cooking Oil',
        reuseLimit: 'Zero Oil Kitchen',
      },
      waterQuality: {
        type: 'Alkaline Ionized Water (pH 8.5)',
        mineralTestDate: 'Nov 2026 Verified',
      },
      kitchenSanitation: {
        glovesAndCaps: true,
        fssaiLicense: 'FSSAI #10422004000319',
        pestControlAudit: 'Organic Clean Space',
      },
      valueIndex: {
        portionScore: 4.8,
        priceToQualityRatio: 'Nutrient Dense',
      },
    },
    authenticityRating: 4.9,
    verifiedBadge: 'Health Champion',
    specialty: 'High-Protein Sprout Bowls & Cold-Pressed Immunity Elixirs',
    description: 'Designed for fitness and conscious eaters. Ozone-washed produce with zero added oil.',
    openingHours: '7:30 AM - 9:00 PM',
    menu: [
      {
        id: 'sprout-bowl',
        name: 'Superfood Sprouted Moong Bowl',
        price: 95,
        description: 'Sprouted moong, malai paneer, toasted seeds, cucumber & honey-lemon.',
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80',
        isVeg: true,
        calories: '280 kcal',
        portionGrams: '380g',
        healthHighlight: '22g Plant Protein, Low GI',
        rating: 5.0,
      },
      {
        id: 'detox-abc',
        name: 'Cold-Pressed ABC Immunity Elixir',
        price: 80,
        description: 'Cold-extracted Apple, Beetroot, Carrot, ginger & lemon. Zero added water.',
        image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&auto=format&fit=crop&q=80',
        isVeg: true,
        calories: '110 kcal',
        portionGrams: '300ml',
        healthHighlight: '100% Raw Bio-Available Vitamins',
        rating: 4.9,
      },
      {
        id: 'greek-parfait',
        name: 'Wild Berry Greek Yogurt Parfait',
        price: 110,
        description: 'Hung creamy probiotic curd with walnuts, chia seeds & organic berries.',
        image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&auto=format&fit=crop&q=80',
        isVeg: true,
        calories: '240 kcal',
        portionGrams: '250g',
        healthHighlight: 'Live Gut Probiotics',
        rating: 4.8,
      },
    ],
  },
];

// ============================================================================
// BILL REVIEW & CASHBACK WORKFLOW DATA MODELS & POLICY
// ============================================================================

export interface BillReviewSubmission {
  id: string;
  restaurantId: string;
  restaurantName: string;
  locality: string;
  billNumber: string;
  billDate: string;
  billAmount: number;
  cashbackEarned: number;
  cashbackPercentage: number;
  ratings: {
    oilFreshness: number; // 1 to 5
    cleanWater: number; // 1 to 5
    stallHygiene: number; // 1 to 5
    tasteAndValue: number; // 1 to 5
  };
  tags: string[];
  userReviewText?: string;
  status: 'approved' | 'under_review' | 'rejected';
  submittedAt: string;
  payoutMethod: 'UPI' | 'EatRight Wallet';
  payoutRecipient: string;
  receiptImage?: string;
}

export interface CashbackPolicyRule {
  id: string;
  title: string;
  badge: string;
  rateHighlight: string;
  summary: string;
  details: string[];
}

export const CASHBACK_POLICY_RULES: CashbackPolicyRule[] = [
  {
    id: 'receipt-eligibility',
    title: '1. Slip & Invoice Eligibility',
    badge: 'Valid Slips',
    rateHighlight: 'Min Bill: ₹50',
    summary: 'Printed vendor receipts or digital UPI merchant transaction slips from verified Katihar kitchens are eligible.',
    details: [
      'Slip must display merchant trade name or Katihar stall address matching EatRight directory.',
      'Receipt timestamp must be within 48 hours of dining or ordering.',
      'Minimum qualifying bill amount is ₹50 after any merchant spot discounts.',
      'Both printed POS paper slips and digital UPI payment receipts (GPay, PhonePe, Paytm) are accepted.',
    ],
  },
  {
    id: 'cashback-tiers',
    title: '2. Guaranteed Cashback Structure',
    badge: 'Instant Earn',
    rateHighlight: '10% – 20% Back',
    summary: 'Tiered cash incentives calculated transparently based on kitchen hygiene tier and rating completeness.',
    details: [
      '15% Base Cashback: EatRight Gold kitchens (e.g. Champaran Litti, Annapurna Satvik, Al-Karim).',
      '10% Base Cashback: Street food carts, chai choupals & mineral water puchka stalls.',
      '+5% Lab Bounty Bonus: Awarded when all 4 hygiene dimensions (Oil, Water, Gloves, Portion) are rated.',
      'Maximum cashback per bill: ₹75. Maximum monthly citizen payout: ₹1,500.',
    ],
  },
  {
    id: 'approval-sla',
    title: '3. Approval Speed & Verification',
    badge: 'Fast Audit',
    rateHighlight: 'Under 15 Mins',
    summary: 'AI slip verification cross-checks vendor FSSAI ID and timestamp for immediate clearance.',
    details: [
      'Digital UPI slips are approved almost instantaneously via merchant VPA signature matching.',
      'Physical paper bill uploads are audited by our local Katihar field team within 15 minutes.',
      'Live status updates: "Scanning Receipt" → "Hygiene Verified" → "Cashback Credited".',
    ],
  },
  {
    id: 'payout-withdrawal',
    title: '4. Direct Payouts & Zero-Fee UPI',
    badge: 'Instant Transfer',
    rateHighlight: '0% Deduction',
    summary: 'Choose instant UPI bank transfer or store in your EatRight Wallet to redeem against safe food orders.',
    details: [
      'Direct UPI transfer: Money sent directly to your linked UPI ID (e.g., name@okaxis, name@paytm).',
      'EatRight Wallet: Use balance instantly on tray checkout for free meals.',
      'Zero withdrawal fees, zero processing cut: ₹1 earned is ₹1 received.',
    ],
  },
  {
    id: 'anti-fraud',
    title: '5. Community Trust & Anti-Fraud',
    badge: 'Integrity Rule',
    rateHighlight: '1 Bill / 24 Hours',
    summary: 'Strict safeguards prevent fraudulent slips and preserve the reliability of Katihar food audits.',
    details: [
      'Strict limit of 1 approved slip per user per restaurant every 24 hours.',
      'Duplicate slips, altered receipt images, or downloaded web bills lead to immediate citizen pass suspension.',
      'Field officers conduct randomized on-site verification audits at partner food stalls.',
    ],
  },
];

export const INITIAL_BILL_SUBMISSIONS: BillReviewSubmission[] = [
  {
    id: 'SUB-9102',
    restaurantId: 'champaran-litti',
    restaurantName: 'Champaran Handi & Litti Hub',
    locality: 'MG Road',
    billNumber: 'KTR/LIT/2026-94',
    billDate: '20 Nov 2026, 11:45 AM',
    billAmount: 190,
    cashbackEarned: 28.5,
    cashbackPercentage: 15,
    ratings: {
      oilFreshness: 5,
      cleanWater: 5,
      stallHygiene: 5,
      tasteAndValue: 5,
    },
    tags: ['Cold-Pressed Mustard Oil', 'Charcoal Woodfired', 'Clean Gloves', 'Generous Portion'],
    userReviewText: 'Cooked fresh over charcoal handi. Pure mustard oil aroma with zero grease. RO water served in clean steel tumblers.',
    status: 'approved',
    submittedAt: 'Today, 12:15 PM',
    payoutMethod: 'UPI',
    payoutRecipient: 'nilesh@okhdfcbank',
  },
  {
    id: 'SUB-8941',
    restaurantId: 'annapurna-satvik',
    restaurantName: 'Annapurna Satvik Rasoi & Sweets',
    locality: 'Bara Bazar',
    billNumber: 'ANN-SAT-4819',
    billDate: '19 Nov 2026, 02:15 PM',
    billAmount: 260,
    cashbackEarned: 39.0,
    cashbackPercentage: 15,
    ratings: {
      oilFreshness: 5,
      cleanWater: 5,
      stallHygiene: 4,
      tasteAndValue: 5,
    },
    tags: ['Desi Ghee Aroma', 'RO Purified', 'Hairnets Used', 'Clean Steel Thali'],
    userReviewText: 'Unlimited satvik thali was spotless. Desi ghee jalebi was crisp and light on the stomach.',
    status: 'approved',
    submittedAt: 'Yesterday, 02:40 PM',
    payoutMethod: 'EatRight Wallet',
    payoutRecipient: 'Wallet Balance',
  },
  {
    id: 'SUB-8805',
    restaurantId: 'mithila-puchka',
    restaurantName: 'Mithila Puchka & Chaat Corner',
    locality: 'Amlatola',
    billNumber: 'UPI-TXN-984021',
    billDate: '18 Nov 2026, 06:30 PM',
    billAmount: 80,
    cashbackEarned: 12.0,
    cashbackPercentage: 15,
    ratings: {
      oilFreshness: 4,
      cleanWater: 5,
      stallHygiene: 5,
      tasteAndValue: 5,
    },
    tags: ['100% Mineral Water Ice', 'Food Grade Gloves', 'Hing Infused', 'Biodegradable Plates'],
    userReviewText: 'The puchka water is genuine Bisleri RO water. Staff wore fresh disposable gloves for every batch.',
    status: 'approved',
    submittedAt: '18 Nov 2026',
    payoutMethod: 'UPI',
    payoutRecipient: 'nilesh@okhdfcbank',
  },
];
