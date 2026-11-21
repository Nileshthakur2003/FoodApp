// app/page.tsx
'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  MapPin,
  X,
  Search,
  ShieldCheck,
  User,
  Utensils,
  Flame,
  Droplets,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Scale,
  Moon,
  Sun,
  Navigation,
  Check,
  Heart,
  Receipt,
  Coins,
  Star,
  Upload,
  Wallet,
  FileText,
  Sparkles,
  ArrowRight,
  Info,
  CheckCheck,
  Phone,
  Smartphone,
  LogOut,
  Layers,
  LocateFixed,
  Compass,
  Filter,
} from 'lucide-react';

import {
  RESTAURANTS_DATA,
  KATIHAR_LOCALITIES,
  Restaurant,
  Locality,
  BillReviewSubmission,
  CASHBACK_POLICY_RULES,
  INITIAL_BILL_SUBMISSIONS,
  UserProfile,
  DEFAULT_USER,
  calculateSpatialDistance,
} from './data/foodData';

// Apple Activity Ring SVG Gauge for Health & Hygiene Score
function AppleScoreRing({ score, size = 46 }: { score: number; size?: number }) {
  const strokeWidth = 3.5;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="text-gray-200/80 dark:text-zinc-800"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="text-emerald-500 transition-all duration-700 ease-out"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
        />
      </svg>
      <div className="absolute text-[11px] font-bold text-gray-900 dark:text-white tracking-tighter">
        {score}%
      </div>
    </div>
  );
}

// Authentic Apple iOS Switch Toggle Component
function AppleToggle({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`w-12 h-7 rounded-full p-0.5 transition-colors duration-200 ease-in-out cursor-pointer flex items-center shrink-0 ${
        checked ? 'bg-[#34c759]' : 'bg-gray-300 dark:bg-zinc-700'
      }`}
    >
      <span
        className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export default function Home() {
  // Navigation & Tabs: discover (recommendations), map (spatial distance), safety (5 pillars), earn (citizen audit), profile (health pass)
  const [activeTab, setActiveTab] = useState<'discover' | 'map' | 'safety' | 'earn' | 'profile'>('discover');
  const [locationModalOpened, setLocationModalOpened] = useState(false);

  // Recommendation 5-Pillar Filter Selection & Proximity
  const [recommendationPillar, setRecommendationPillar] = useState<
    'all' | 'sanitation' | 'quantity' | 'quality' | 'process' | 'price' | 'nearby'
  >('all');
  const [proximityFilter, setProximityFilter] = useState<'all' | '1km' | '2km' | '3km'>('all');
  const [selectedMapVendor, setSelectedMapVendor] = useState<Restaurant>(RESTAURANTS_DATA[0]);

  // Personalized greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // User Authentication State (Mobile Number Login)
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window === 'undefined') return DEFAULT_USER;
    try {
      const saved = localStorage.getItem('eatright_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_USER;
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [loginStep, setLoginStep] = useState<'phone' | 'otp' | 'success'>('phone');
  const [loginPhone, setLoginPhone] = useState('9876543210');
  const [loginOtp, setLoginOtp] = useState<string[]>(['', '', '', '']);
  const [otpCountdown, setOtpCountdown] = useState(30);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Location State & Interactive Map Pin
  const [selectedLocality, setSelectedLocality] = useState<Locality>(KATIHAR_LOCALITIES[0]);
  const [localitySearch, setLocalitySearch] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [mapPinCoords, setMapPinCoords] = useState<{ x: number; y: number }>({
    x: KATIHAR_LOCALITIES[0].mapX,
    y: KATIHAR_LOCALITIES[0].mapY,
  });
  const [mapViewMode, setMapViewMode] = useState<'standard' | 'satellite'>('standard');
  const [showMapCallout, setShowMapCallout] = useState<boolean>(true);

  // Search & Category
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Personalized Diet Preference Toggles
  const [pureVegOnly, setPureVegOnly] = useState(false);
  const [lowOilOnly, setLowOilOnly] = useState(false);
  const [highProteinOnly, setHighProteinOnly] = useState(false);
  const [roWaterOnly, setRoWaterOnly] = useState(true);
  const [favoriteSpots, setFavoriteSpots] = useState<string[]>(['champaran-litti']);

  // Dark Mode State initialized from client preference
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      const saved = localStorage.getItem('eatright-theme');
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      return saved === 'dark' || (!saved && prefersDark);
    } catch {
      return false;
    }
  });

  // Sync dark class on HTML root whenever isDarkMode changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Selected Restaurant for Apple Bottom Sheet Modal
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [sheetOpened, setSheetOpened] = useState(false);

  // Report Modal
  const [reportModalOpened, setReportModalOpened] = useState(false);
  const [reportVendorName, setReportVendorName] = useState('');
  const [reportIssue, setReportIssue] = useState('');

  // Review, Rate & Cashback Workflow State
  const [billSubmissions, setBillSubmissions] = useState<BillReviewSubmission[]>(INITIAL_BILL_SUBMISSIONS);
  const [earnSubView, setEarnSubView] = useState<'new_review' | 'history' | 'policy'>('new_review');
  const [showPolicyModal, setShowPolicyModal] = useState(false);

  // Active Bill Upload Form State
  const [reviewRestaurant, setReviewRestaurant] = useState<Restaurant>(RESTAURANTS_DATA[0]);
  const [billAmount, setBillAmount] = useState<string>('180');
  const [billNumber, setBillNumber] = useState<string>('KTR/2026/881');
  const [billImageUploaded, setBillImageUploaded] = useState<boolean>(true);
  const [isScanningSlip, setIsScanningSlip] = useState<boolean>(false);
  const [slipOcrResult, setSlipOcrResult] = useState<{
    merchant: string;
    date: string;
    amount: number;
    valid: boolean;
  } | null>({
    merchant: RESTAURANTS_DATA[0].name,
    date: 'Today, 12:40 PM',
    amount: 180,
    valid: true,
  });

  // Ratings for 4 pillars (1 - 5)
  const [ratingOil, setRatingOil] = useState<number>(5);
  const [ratingWater, setRatingWater] = useState<number>(5);
  const [ratingHygiene, setRatingHygiene] = useState<number>(5);
  const [ratingTaste, setRatingTaste] = useState<number>(5);

  // Selected Evidence Tags
  const [selectedReviewTags, setSelectedReviewTags] = useState<string[]>([
    'Fresh Mustard Oil',
    'RO Filtered Water',
    'Clean Gloves Worn',
  ]);
  const [reviewNote, setReviewNote] = useState<string>('');

  // Payout Option
  const [payoutMethod, setPayoutMethod] = useState<'UPI' | 'EatRight Wallet'>('UPI');
  const [upiId, setUpiId] = useState<string>('nilesh@okhdfcbank');

  // Submission State & Success Modal
  const [isSubmittingBill, setIsSubmittingBill] = useState<boolean>(false);
  const [submittedClaim, setSubmittedClaim] = useState<BillReviewSubmission | null>(null);

  // Dynamic Calculated Cashback
  const calculatedCashback = useMemo(() => {
    const amt = parseFloat(billAmount) || 0;
    if (amt < 50) return { earned: 0, percentage: 0 };
    const isGold = reviewRestaurant.hygiene.score >= 95;
    const allRated = ratingOil > 0 && ratingWater > 0 && ratingHygiene > 0 && ratingTaste > 0;
    const basePct = isGold ? 15 : 10;
    const bonusPct = allRated ? 5 : 0;
    const totalPct = basePct + bonusPct;
    const earned = Math.min(Math.round(amt * (totalPct / 100) * 10) / 10, 75);
    return { earned, percentage: totalPct };
  }, [billAmount, reviewRestaurant, ratingOil, ratingWater, ratingHygiene, ratingTaste]);

  // Total Lifetime Cashback Earned
  const totalLifetimeCashback = useMemo(() => {
    return billSubmissions
      .filter((s) => s.status === 'approved')
      .reduce((sum, s) => sum + s.cashbackEarned, 85);
  }, [billSubmissions]);

  // Minimalist Toast Banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2200);
  };

  // Toggle Favorite
  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavoriteSpots((prev) => {
      const exists = prev.includes(id);
      if (exists) {
        triggerToast('Removed from favorites');
        return prev.filter((item) => item !== id);
      } else {
        triggerToast('Added to favorites');
        return [...prev, id];
      }
    });
  };

  // Toggle Dark Mode
  const handleToggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        try { localStorage.setItem('eatright-theme', 'dark'); } catch {}
      } else {
        document.documentElement.classList.remove('dark');
        try { localStorage.setItem('eatright-theme', 'light'); } catch {}
      }
      triggerToast(next ? 'Dark mode enabled' : 'Light mode enabled');
      return next;
    });
  };

  // OTP Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoginModalOpen && loginStep === 'otp' && otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown((c) => c - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isLoginModalOpen, loginStep, otpCountdown]);

  // Request SMS OTP for mobile number
  const handleRequestOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanPhone = loginPhone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setLoginError('Please enter a valid 10-digit mobile number');
      return;
    }
    setLoginError(null);
    setLoginStep('otp');
    setOtpCountdown(30);
    setLoginOtp(['', '', '', '']);
    setTimeout(() => {
      otpInputsRef.current[0]?.focus();
    }, 200);
    triggerToast(`OTP sent to +91 ${cleanPhone}`);
  };

  // Verify OTP code
  const handleVerifyOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const enteredCode = loginOtp.join('');
    if (enteredCode.length < 4) {
      setLoginError('Please enter the 4-digit verification code');
      return;
    }
    setIsVerifyingOtp(true);
    setLoginError(null);

    setTimeout(() => {
      setIsVerifyingOtp(false);
      const cleanPhone = loginPhone.replace(/\D/g, '');
      const formattedPhone = `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`;
      const newUser: UserProfile = {
        name: cleanPhone === '9876543210' ? 'Nilesh Kumar' : `Citizen ${cleanPhone.slice(-4)}`,
        phone: formattedPhone,
        passType: 'CITIZEN PASS',
        cleanFoodScore: 98,
        walletBalance: user ? user.walletBalance : 124.0,
        verified: true,
        upiId: `${cleanPhone}@okhdfcbank`,
        joinedDate: 'Nov 2026',
      };
      setUser(newUser);
      try {
        localStorage.setItem('eatright_user', JSON.stringify(newUser));
      } catch {}
      setLoginStep('success');
      triggerToast(`Welcome back, ${newUser.name}!`);

      setTimeout(() => {
        setIsLoginModalOpen(false);
        setLoginStep('phone');
        setLoginOtp(['', '', '', '']);
      }, 1100);
    }, 600);
  };

  // Instant 1-Tap Demo Login
  const handleDemoLogin = () => {
    const demoUser: UserProfile = {
      name: 'Nilesh Kumar',
      phone: '+91 98765 43210',
      passType: 'CITIZEN PASS',
      cleanFoodScore: 98,
      walletBalance: 124.0,
      verified: true,
      upiId: 'nilesh@okhdfcbank',
      joinedDate: 'Oct 2026',
    };
    setUser(demoUser);
    try {
      localStorage.setItem('eatright_user', JSON.stringify(demoUser));
    } catch {}
    setLoginStep('success');
    triggerToast('Signed in as Nilesh Kumar');
    setTimeout(() => {
      setIsLoginModalOpen(false);
      setLoginStep('phone');
    }, 1000);
  };

  // Sign Out
  const handleSignOut = () => {
    setUser(null);
    try {
      localStorage.removeItem('eatright_user');
    } catch {}
    setIsProfileMenuOpen(false);
    triggerToast('Signed out of EatRight');
  };

  // Handle single digit OTP box input
  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...loginOtp];
    newOtp[index] = digit;
    setLoginOtp(newOtp);

    if (digit && index < 3) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  // Handle backspace in OTP boxes
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !loginOtp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // Handle pasting 4-digit OTP code
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (pasted) {
      const newOtp = ['', '', '', ''];
      for (let i = 0; i < 4; i++) {
        newOtp[i] = pasted[i] || '';
      }
      setLoginOtp(newOtp);
      const nextIdx = Math.min(pasted.length, 3);
      otpInputsRef.current[nextIdx]?.focus();
    }
  };

  // Click anywhere on map to drop pin and snap to nearest Katihar locality
  const handleMapCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const rawX = ((e.clientX - rect.left) / rect.width) * 100;
    const rawY = ((e.clientY - rect.top) / rect.height) * 100;
    const clampedX = Math.max(10, Math.min(90, Math.round(rawX)));
    const clampedY = Math.max(12, Math.min(88, Math.round(rawY)));

    setMapPinCoords({ x: clampedX, y: clampedY });
    setShowMapCallout(true);

    // Snap to nearest locality
    let nearest = KATIHAR_LOCALITIES[0];
    let minDistance = Infinity;
    for (const loc of KATIHAR_LOCALITIES) {
      const dist = Math.hypot(loc.mapX - clampedX, loc.mapY - clampedY);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = loc;
      }
    }
    setSelectedLocality(nearest);
    triggerToast(`Pinned to ${nearest.name}`);
  };

  // Click on a locality pin on map
  const handleLocalityMarkerClick = (loc: Locality, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedLocality(loc);
    setMapPinCoords({ x: loc.mapX, y: loc.mapY });
    setShowMapCallout(true);
    triggerToast(`Pinned to ${loc.name}`);
  };

  // Bulletproof Geolocation detection & Map Pin Centering
  const handleDetectLocation = () => {
    setIsLocating(true);
    try {
      if (typeof window === 'undefined' || !window.isSecureContext || !navigator.geolocation) {
        setSelectedLocality(KATIHAR_LOCALITIES[0]);
        setMapPinCoords({ x: KATIHAR_LOCALITIES[0].mapX, y: KATIHAR_LOCALITIES[0].mapY });
        setShowMapCallout(true);
        setIsLocating(false);
        triggerToast(`Aligned to ${KATIHAR_LOCALITIES[0].name}, Katihar`);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        () => {
          setIsLocating(false);
          setSelectedLocality(KATIHAR_LOCALITIES[0]);
          setMapPinCoords({ x: KATIHAR_LOCALITIES[0].mapX, y: KATIHAR_LOCALITIES[0].mapY });
          setShowMapCallout(true);
          triggerToast(`Aligned to ${KATIHAR_LOCALITIES[0].name}, Katihar`);
        },
        () => {
          setIsLocating(false);
          setSelectedLocality(KATIHAR_LOCALITIES[0]);
          setMapPinCoords({ x: KATIHAR_LOCALITIES[0].mapX, y: KATIHAR_LOCALITIES[0].mapY });
          setShowMapCallout(true);
          triggerToast(`Set to ${KATIHAR_LOCALITIES[0].name}, Katihar`);
        },
        { enableHighAccuracy: false, timeout: 3500, maximumAge: 60000 }
      );
    } catch {
      setIsLocating(false);
      setSelectedLocality(KATIHAR_LOCALITIES[0]);
      setMapPinCoords({ x: KATIHAR_LOCALITIES[0].mapX, y: KATIHAR_LOCALITIES[0].mapY });
      setShowMapCallout(true);
      triggerToast(`Set to ${KATIHAR_LOCALITIES[0].name}`);
    }
  };

  // Filtered Localities for Modal
  const filteredLocalities = useMemo(() => {
    if (!localitySearch.trim()) return KATIHAR_LOCALITIES;
    return KATIHAR_LOCALITIES.filter(
      (l) =>
        l.name.toLowerCase().includes(localitySearch.toLowerCase()) ||
        l.landmark.toLowerCase().includes(localitySearch.toLowerCase()) ||
        l.famousFor.toLowerCase().includes(localitySearch.toLowerCase())
    );
  }, [localitySearch]);

  // Dynamic Real-Time Spatial Distance Analysis from user's active pin
  const vendorsWithLiveDistance = useMemo(() => {
    return RESTAURANTS_DATA.map((vendor) => {
      const live = calculateSpatialDistance(
        mapPinCoords.x,
        mapPinCoords.y,
        vendor.mapX,
        vendor.mapY
      );
      return {
        ...vendor,
        liveDistance: live,
      };
    });
  }, [mapPinCoords]);

  // Closest vendor to current location
  const closestVendor = useMemo(() => {
    if (vendorsWithLiveDistance.length === 0) return null;
    return [...vendorsWithLiveDistance].sort(
      (a, b) => a.liveDistance.distanceKm - b.liveDistance.distanceKm
    )[0];
  }, [vendorsWithLiveDistance]);

  // Selected vendor with live calculated distance
  const selectedMapVendorLive = useMemo(() => {
    return (
      vendorsWithLiveDistance.find((v) => v.id === selectedMapVendor.id) ||
      vendorsWithLiveDistance[0]
    );
  }, [vendorsWithLiveDistance, selectedMapVendor]);

  // High-Quality Multi-Pillar Recommendation Filter & Ranking Engine
  const filteredRestaurants = useMemo(() => {
    const list = vendorsWithLiveDistance.filter((item) => {
      // 1. Text Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesSpecialty = item.specialty.toLowerCase().includes(query);
        const matchesCategory = item.category.toLowerCase().includes(query);
        const matchesLocality = item.locality.toLowerCase().includes(query);
        const matchesDish = item.menu.some((m) => m.name.toLowerCase().includes(query));
        if (!matchesName && !matchesSpecialty && !matchesCategory && !matchesLocality && !matchesDish) {
          return false;
        }
      }

      // 2. Category
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }

      // 3. Personalized Dietary Toggles
      if (pureVegOnly && item.category !== 'Pure Veg' && !item.menu.every((m) => m.isVeg)) {
        return false;
      }
      if (
        lowOilOnly &&
        !item.hygiene.oilQuality.polarCompound.toLowerCase().includes('pristine') &&
        !item.hygiene.oilQuality.polarCompound.toLowerCase().includes('fresh') &&
        !item.hygiene.oilQuality.polarCompound.includes('0%')
      ) {
        return false;
      }
      if (
        highProteinOnly &&
        item.category !== 'Healthy & Bowls' &&
        !item.menu.some(
          (m) =>
            m.healthHighlight.toLowerCase().includes('protein') ||
            m.healthHighlight.toLowerCase().includes('lean')
        )
      ) {
        return false;
      }
      if (
        roWaterOnly &&
        !item.hygiene.waterQuality.type.toLowerCase().includes('ro') &&
        !item.hygiene.waterQuality.type.toLowerCase().includes('mineral')
      ) {
        return false;
      }

      // 4. Proximity Radius Filter
      if (proximityFilter === '1km' && item.liveDistance.distanceKm > 1.0) return false;
      if (proximityFilter === '2km' && item.liveDistance.distanceKm > 2.0) return false;
      if (proximityFilter === '3km' && item.liveDistance.distanceKm > 3.0) return false;

      return true;
    });

    // 5. 5-Pillar Recommendation Ranking
    if (recommendationPillar === 'sanitation') {
      list.sort((a, b) => b.fivePillars.sanitation.score - a.fivePillars.sanitation.score);
    } else if (recommendationPillar === 'quantity') {
      list.sort((a, b) => b.fivePillars.quantity.score - a.fivePillars.quantity.score);
    } else if (recommendationPillar === 'quality') {
      list.sort((a, b) => b.fivePillars.quality.score - a.fivePillars.quality.score);
    } else if (recommendationPillar === 'process') {
      list.sort((a, b) => b.authenticityRating - a.authenticityRating);
    } else if (recommendationPillar === 'price') {
      list.sort((a, b) => a.fivePillars.price.priceForTwo - b.fivePillars.price.priceForTwo);
    } else if (recommendationPillar === 'nearby') {
      list.sort((a, b) => a.liveDistance.distanceKm - b.liveDistance.distanceKm);
    }

    return list;
  }, [
    vendorsWithLiveDistance,
    searchQuery,
    selectedCategory,
    pureVegOnly,
    lowOilOnly,
    highProteinOnly,
    roWaterOnly,
    proximityFilter,
    recommendationPillar,
  ]);

  const categories = [
    { label: 'All', icon: '✨' },
    { label: 'Street Food', icon: '🥟' },
    { label: 'Regional Bihari', icon: '🥘' },
    { label: 'Pure Veg', icon: '🍛' },
    { label: 'Mughlai & Grill', icon: '🍗' },
    { label: 'Cafe & Bakery', icon: '☕' },
    { label: 'Healthy & Bowls', icon: '🥗' },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#000000] text-gray-900 dark:text-white antialiased font-sans flex flex-col">
      
      {/* 
        =======================================================================
        MINIMALIST TOP NAVIGATION BAR
        - Clean frosted glass header for both mobile and wide devices
        =======================================================================
      */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#161618]/80 backdrop-blur-2xl border-b border-black/5 dark:border-white/10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between">
          
          {/* Brand & Locality Selector */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setActiveTab('discover')}
              className="flex items-center space-x-2 text-left cursor-pointer active:scale-97 transition-transform bg-transparent border-0 p-0"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#007aff] to-emerald-400 text-white flex items-center justify-center font-bold shadow-xs">
                <ShieldCheck className="w-4.5 h-4.5 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="font-extrabold text-base tracking-tight leading-none text-gray-900 dark:text-white">
                  EatRight
                </span>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 ml-1.5 px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/40">
                  KATIHAR
                </span>
              </div>
            </button>

            {/* Quick Locality Pill Button */}
            <button
              type="button"
              onClick={() => setLocationModalOpened(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-gray-200/70 dark:bg-zinc-800 text-xs font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-zinc-700 active:scale-95 transition-all cursor-pointer border border-black/5 dark:border-white/10"
            >
              <MapPin className="w-3.5 h-3.5 text-[#007aff]" />
              <span className="max-w-[100px] truncate">{selectedLocality.name}</span>
              <span className="text-gray-400 dark:text-gray-400 text-[10px]">▾</span>
            </button>
          </div>

          {/* Desktop Search Bar (Hidden on Mobile) */}
          <div className="hidden md:flex flex-1 max-w-sm mx-6">
            <div className="relative w-full flex items-center">
              <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search food, vendors, or cuisines..."
                className="w-full pl-9 pr-8 py-2 rounded-full bg-gray-100 dark:bg-zinc-800 border border-transparent focus:border-[#007aff] focus:bg-white dark:focus:bg-zinc-900 text-xs outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer bg-transparent border-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Navigation Controls & Actions */}
          <div className="flex items-center space-x-2">
            {/* Desktop Tabs */}
            <div className="hidden md:flex items-center bg-gray-200/70 dark:bg-zinc-800 p-1 rounded-full text-xs font-semibold border border-black/5 dark:border-white/10">
              <button
                type="button"
                onClick={() => setActiveTab('discover')}
                className={`px-3.5 py-1 rounded-full transition-all cursor-pointer border-0 ${
                  activeTab === 'discover'
                    ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-xs'
                    : 'bg-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Recommendations
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('map')}
                className={`px-3.5 py-1 rounded-full transition-all cursor-pointer border-0 flex items-center space-x-1.5 ${
                  activeTab === 'map'
                    ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-xs'
                    : 'bg-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-[#007aff]" />
                <span>Spatial Map & Distance</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('safety')}
                className={`px-3.5 py-1 rounded-full transition-all cursor-pointer border-0 ${
                  activeTab === 'safety'
                    ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-xs'
                    : 'bg-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                5-Pillar Standards
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('earn')}
                className={`px-3.5 py-1 rounded-full transition-all cursor-pointer border-0 flex items-center space-x-1.5 ${
                  activeTab === 'earn'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs font-bold'
                    : 'bg-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Coins className="w-3.5 h-3.5 text-amber-500" />
                <span>Citizen Audit</span>
                <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                  activeTab === 'earn' ? 'bg-white/20 text-white' : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                }`}>
                  15%
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`px-3.5 py-1 rounded-full transition-all cursor-pointer border-0 ${
                  activeTab === 'profile'
                    ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-xs'
                    : 'bg-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Health Pass
              </button>
            </div>

            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={handleToggleDarkMode}
              className="p-2 rounded-full bg-gray-200/70 dark:bg-zinc-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-zinc-700 active:scale-95 transition-all cursor-pointer border border-black/5 dark:border-white/10"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            {/* Mobile Auth Button & Apple Popover Menu */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-1.5 p-1 sm:px-2.5 sm:py-1 rounded-full bg-gray-200/70 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all cursor-pointer active:scale-95 border border-black/5 dark:border-white/10"
                  title="Citizen Profile"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#007aff] to-purple-500 text-white flex items-center justify-center text-[10px] font-bold shadow-2xs">
                    {user.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200 hidden sm:inline max-w-[70px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 hidden sm:inline-block" />
                </button>

                {/* Apple User Popover Card */}
                {isProfileMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsProfileMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-11 z-50 w-72 bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-2xl rounded-2xl p-4 shadow-2xl border border-black/10 dark:border-white/10 animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex items-center space-x-3 pb-3 border-b border-gray-100 dark:border-zinc-800">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#007aff] to-purple-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                          {user.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xs text-gray-900 dark:text-white truncate">{user.name}</h4>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">{user.phone}</p>
                          <div className="flex items-center space-x-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{user.passType}</span>
                          </div>
                        </div>
                      </div>
                      <div className="py-2 space-y-1">
                        <div className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-xl bg-gray-50 dark:bg-zinc-800/60">
                          <span className="text-gray-500 dark:text-gray-400 text-[11px]">Wallet Balance</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{user.walletBalance.toFixed(2)}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            setActiveTab('profile');
                          }}
                          className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 flex items-center justify-between transition-colors cursor-pointer"
                        >
                          <span>View Health Pass</span>
                          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            setIsLoginModalOpen(true);
                            setLoginStep('phone');
                          }}
                          className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 flex items-center justify-between transition-colors cursor-pointer"
                        >
                          <span>Switch Mobile Number</span>
                          <Smartphone className="w-3.5 h-3.5 text-gray-400" />
                        </button>
                        <button
                          type="button"
                          onClick={handleSignOut}
                          className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center justify-between transition-colors cursor-pointer"
                        >
                          <span>Sign Out</span>
                          <LogOut className="w-3.5 h-3.5 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsLoginModalOpen(true);
                  setLoginStep('phone');
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#007aff] hover:bg-[#0062cc] text-white text-xs font-bold active:scale-95 transition-all cursor-pointer shadow-xs border-0"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Spatial Map & Distance Analysis Button */}
            <button
              type="button"
              onClick={() => setActiveTab('map')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer active:scale-95 border-0 ${
                activeTab === 'map'
                  ? 'bg-[#007aff] text-white shadow-xs'
                  : 'bg-[#007aff]/10 text-[#007aff] hover:bg-[#007aff]/20'
              }`}
              title="Spatial Map & Distance"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Map & Distance</span>
            </button>
          </div>

        </div>
      </header>

      {/* 
        =======================================================================
        MAIN CONTENT
        - Adapts dynamically to wide screens (desktop multi-column + sticky tray)
        - Seamless, smooth edge-to-edge touch layout on mobile
        =======================================================================
      */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-28 md:pb-10">

        {/* =============================================================== */}
        {/* TAB 1: DISCOVER (Apple Bento Grid + Personalized Feed)          */}
        {/* =============================================================== */}
        {activeTab === 'discover' && (
          <div className="space-y-5 sm:space-y-6">

            {/* Public Food Intelligence & Non-Ordering Advisory Banner */}
            <div className="p-3.5 sm:p-4 rounded-3xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-emerald-500/10 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-emerald-950/30 border border-[#007aff]/20 dark:border-blue-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-start sm:items-center space-x-3">
                <div className="w-9 h-9 rounded-2xl bg-[#007aff] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-xs sm:text-sm text-gray-900 dark:text-white">
                      EatRight Katihar Food Intelligence Directory
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-blue-100 text-[#007aff] dark:bg-blue-950/80 dark:text-blue-300">
                      NO ORDERING / ADVISORY ONLY
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                    One cannot order from this application. We evaluate <strong>Sanitation</strong>, <strong>Food Quantity</strong>, <strong>Food Quality</strong>, <strong>Cooking Process</strong>, and <strong>Fair Street Prices</strong> with live spatial distance analysis.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('map')}
                className="px-3.5 py-1.5 rounded-full bg-[#007aff] hover:bg-blue-600 text-white font-bold text-xs shrink-0 active:scale-95 transition-all cursor-pointer border-0 shadow-xs flex items-center space-x-1.5 self-start sm:self-auto"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Spatial Map & Distance →</span>
              </button>
            </div>

            {/* Personalized Apple Welcome Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 dark:text-white">
                  {greeting}, {user ? user.name.split(' ')[0] : 'Citizen'}
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {filteredRestaurants.length} vetted kitchens within proximity of {selectedLocality.name}
                </p>
              </div>

              {/* Minimalist 1-Tap Dietary Preference Chips */}
              <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-1">
                <button
                  type="button"
                  onClick={() => {
                    setPureVegOnly((p) => !p);
                    triggerToast(!pureVegOnly ? 'Pure Veg only' : 'Showing all foods');
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer active:scale-95 flex items-center space-x-1.5 border ${
                    pureVegOnly
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white dark:bg-[#1c1c1e] text-gray-700 dark:text-gray-200 border-gray-200/80 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${pureVegOnly ? 'bg-white' : 'bg-emerald-500'}`} />
                  <span>Pure Veg</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLowOilOnly((p) => !p);
                    triggerToast(!lowOilOnly ? 'Low Oil filter on' : 'Filter off');
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer active:scale-95 flex items-center space-x-1 border ${
                    lowOilOnly
                      ? 'bg-[#007aff] text-white border-[#007aff] shadow-xs'
                      : 'bg-white dark:bg-[#1c1c1e] text-gray-700 dark:text-gray-200 border-gray-200/80 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span>🌿 Low Oil</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setHighProteinOnly((p) => !p);
                    triggerToast(!highProteinOnly ? 'High Protein filter on' : 'Filter off');
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer active:scale-95 flex items-center space-x-1 border ${
                    highProteinOnly
                      ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                      : 'bg-white dark:bg-[#1c1c1e] text-gray-700 dark:text-gray-200 border-gray-200/80 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span>⚡ High Protein</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRoWaterOnly((p) => !p);
                    triggerToast(!roWaterOnly ? 'RO verified only' : 'Showing all water types');
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer active:scale-95 flex items-center space-x-1 border ${
                    roWaterOnly
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white dark:bg-[#1c1c1e] text-gray-700 dark:text-gray-200 border-gray-200/80 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span>💧 RO Water</span>
                </button>
              </div>
            </div>

            {/* 5-Pillar Recommendation Filter & Ranking Strip */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                  <Filter className="w-3 h-3 text-[#007aff]" />
                  <span>5-Pillar Recommendation Rank</span>
                </span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400">
                  Sorting: {recommendationPillar.toUpperCase()}
                </span>
              </div>

              <div className="flex space-x-2 overflow-x-auto no-scrollbar py-0.5">
                {(
                  [
                    { id: 'all', label: '✨ All Recommendations' },
                    { id: 'sanitation', label: '🧼 Sanitation Grade A+' },
                    { id: 'quantity', label: '⚖️ Generous Portions (>350g)' },
                    { id: 'quality', label: '🌿 Pure Ghee & Cold-Pressed' },
                    { id: 'process', label: '🔥 Woodfired / Clay Handi' },
                    { id: 'price', label: '🏷️ Fair Street Price (< ₹100)' },
                    { id: 'nearby', label: '📍 Nearest to Pin (< 1 km)' },
                  ] as const
                ).map((item) => {
                  const isActive = recommendationPillar === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setRecommendationPillar(item.id);
                        triggerToast(`Filtered: ${item.label}`);
                      }}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 cursor-pointer border ${
                        isActive
                          ? 'bg-[#007aff] text-white border-[#007aff] shadow-xs font-bold'
                          : 'bg-white dark:bg-[#1c1c1e] text-gray-700 dark:text-gray-200 border-gray-200/80 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile Search Input (Visible only on small screens) */}
            <div className="md:hidden">
              <div className="relative w-full flex items-center">
                <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search litti, biryani, chaat..."
                  className="w-full pl-9 pr-8 py-2.5 rounded-2xl bg-white dark:bg-zinc-800 border border-gray-200/80 dark:border-zinc-700 text-xs outline-none shadow-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-transparent border-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Minimalist Apple Category Pills Carousel */}
            <div className="flex space-x-2 overflow-x-auto no-scrollbar py-0.5">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat.label;
                return (
                  <button
                    key={cat.label}
                    type="button"
                    onClick={() => setSelectedCategory(cat.label)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 cursor-pointer flex items-center space-x-1.5 border ${
                      isActive
                        ? 'bg-[#007aff] text-white border-[#007aff] shadow-sm'
                        : 'bg-white dark:bg-[#1c1c1e] text-gray-700 dark:text-gray-200 border-gray-200/80 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* 
              =================================================================
              RESPONSIVE GRID: FOOD INTELLIGENCE FEED + SPATIAL PROXIMITY RADAR
              - On Desktop: 8 cols feed + 4 cols spatial radar
              - On Mobile: Full width feed with direct links to spatial map
              =================================================================
            */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
              
              {/* Left Column: 5-Pillar Food Spots Grid */}
              <div className="lg:col-span-8 space-y-4">
                
                {/* Responsive Card Grid (1 col mobile, 2 cols tablet/desktop) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  {filteredRestaurants.length > 0 ? (
                    filteredRestaurants.map((res) => {
                      const isFav = favoriteSpots.includes(res.id);
                      return (
                        <div
                          key={res.id}
                          className="group bg-white dark:bg-[#1c1c1e] rounded-3xl overflow-hidden border border-black/5 dark:border-white/10 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                        >
                          {/* Image Cover (Tapping opens detailed sheet) */}
                          <div
                            onClick={() => {
                              setSelectedRestaurant(res);
                              setSheetOpened(true);
                            }}
                            className="relative w-full h-44 overflow-hidden bg-gradient-to-tr from-gray-100 to-gray-200 dark:from-zinc-800 dark:to-zinc-900 cursor-pointer flex items-center justify-center"
                          >
                            <img
                              src={res.image}
                              alt={res.name}
                              loading="lazy"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                              className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                            />
                            {/* Fallback emoji icon if image is slow */}
                            <span className="absolute text-5xl opacity-30 pointer-events-none select-none">
                              {res.emoji}
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />

                            {/* Top Left: Locality & Rating */}
                            <div className="absolute top-3 left-3 flex items-center space-x-1.5 pointer-events-none">
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/95 dark:bg-black/85 backdrop-blur-md text-gray-900 dark:text-white shadow-xs border border-black/5 dark:border-white/10">
                                ★ {res.authenticityRating} • {res.liveDistance.distanceKm} km
                              </span>
                            </div>

                            {/* Top Right: Favorite Button + Apple Score Ring */}
                            <div className="absolute top-2.5 right-2.5 flex items-center space-x-1.5">
                              <button
                                type="button"
                                onClick={(e) => toggleFavorite(res.id, e)}
                                className="w-8 h-8 rounded-full bg-white/95 dark:bg-black/85 backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform cursor-pointer border border-black/5 dark:border-white/10 shadow-xs"
                              >
                                <Heart
                                  className={`w-4 h-4 ${
                                    isFav ? 'text-red-500 fill-red-500' : 'text-gray-700 dark:text-gray-300'
                                  }`}
                                />
                              </button>
                              <div className="p-1 rounded-2xl bg-white/95 dark:bg-black/85 backdrop-blur-md shadow-xs pointer-events-none border border-black/5 dark:border-white/10">
                                <AppleScoreRing score={res.hygiene.score} size={38} />
                              </div>
                            </div>

                            {/* Bottom Info on Image */}
                            <div className="absolute bottom-2.5 left-3 right-3 text-white pointer-events-none flex items-center justify-between">
                              <span className="text-[11px] font-semibold text-emerald-300 flex items-center space-x-1 drop-shadow-sm">
                                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                                {res.verifiedBadge}
                              </span>
                              <span className="text-[10px] font-mono text-gray-300 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-xs">
                                🚶 {res.liveDistance.walkingMins}m • 🛺 {res.liveDistance.rickshawMins}m
                              </span>
                            </div>
                          </div>

                          {/* Card Body: 5 Pillars Detailed Intelligence */}
                          <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                            <div
                              onClick={() => {
                                setSelectedRestaurant(res);
                                setSheetOpened(true);
                              }}
                              className="cursor-pointer space-y-2"
                            >
                              <div className="flex items-start justify-between">
                                <h4 className="font-bold text-sm text-gray-900 dark:text-white leading-tight">
                                  {res.name}
                                </h4>
                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                  ₹{res.priceForTwo} for 2
                                </span>
                              </div>
                              <p className="text-[11px] text-gray-600 dark:text-gray-300 line-clamp-1">
                                {res.specialty}
                              </p>

                              {/* 5-Pillar Score Badges Matrix */}
                              <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px]">
                                <div className="p-1.5 rounded-xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-800 flex items-center space-x-1">
                                  <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
                                  <span className="text-gray-700 dark:text-gray-300 truncate font-semibold">
                                    {res.fivePillars.sanitation.grade} ({res.fivePillars.sanitation.polarCompound})
                                  </span>
                                </div>
                                <div className="p-1.5 rounded-xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-800 flex items-center space-x-1">
                                  <Scale className="w-3 h-3 text-purple-500 shrink-0" />
                                  <span className="text-gray-700 dark:text-gray-300 truncate font-semibold">
                                    {res.fivePillars.quantity.avgPortionGrams} plate
                                  </span>
                                </div>
                                <div className="p-1.5 rounded-xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-800 flex items-center space-x-1">
                                  <Droplets className="w-3 h-3 text-blue-500 shrink-0" />
                                  <span className="text-gray-700 dark:text-gray-300 truncate font-semibold">
                                    {res.fivePillars.quality.fatSource.split(' ')[0]} Ghee/Oil
                                  </span>
                                </div>
                                <div className="p-1.5 rounded-xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-800 flex items-center space-x-1">
                                  <Flame className="w-3 h-3 text-amber-500 shrink-0" />
                                  <span className="text-gray-700 dark:text-gray-300 truncate font-semibold">
                                    {res.fivePillars.process.cookware.split(' ')[0]} Handi
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Dual Intelligence Actions: Inspect 5-Pillars & Locate on Map */}
                            <div className="pt-2 border-t border-gray-100 dark:border-zinc-800 grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedRestaurant(res);
                                  setSheetOpened(true);
                                }}
                                className="py-2 px-3 rounded-2xl bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-800 dark:text-gray-200 font-bold text-xs flex items-center justify-center space-x-1 transition-colors cursor-pointer border-0"
                              >
                                <ShieldCheck className="w-3.5 h-3.5 text-[#007aff]" />
                                <span>5-Pillar Audit</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedMapVendor(res);
                                  setActiveTab('map');
                                  triggerToast(`Locating ${res.name} on Map`);
                                }}
                                className="py-2 px-3 rounded-2xl bg-[#007aff]/10 hover:bg-[#007aff]/20 text-[#007aff] font-bold text-xs flex items-center justify-center space-x-1 transition-colors cursor-pointer border border-[#007aff]/20"
                              >
                                <Navigation className="w-3.5 h-3.5" />
                                <span>Map ({res.liveDistance.distanceKm}km)</span>
                              </button>
                            </div>

                            {/* Upload Bill & Earn Cashback Quick Pill */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setReviewRestaurant(res);
                                setBillAmount('160');
                                setSlipOcrResult({
                                  merchant: res.name,
                                  date: 'Today, 12:45 PM',
                                  amount: 160,
                                  valid: true,
                                });
                                setActiveTab('earn');
                                setEarnSubView('new_review');
                              }}
                              className="w-full py-1.5 px-3 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 text-[11px] font-bold flex items-center justify-between transition-colors cursor-pointer border border-amber-500/20"
                            >
                              <span className="flex items-center space-x-1.5">
                                <Receipt className="w-3.5 h-3.5 text-amber-500" />
                                <span>Dined Here? Upload Slip (+15% Cashback)</span>
                              </span>
                              <span>→</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="sm:col-span-2 text-center py-16 bg-white dark:bg-[#1c1c1e] rounded-3xl border border-black/5 dark:border-white/10">
                      <div className="w-12 h-12 mx-auto rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-400 mb-3">
                        <Search className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white">No Spots Match Filters</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Try resetting dietary toggles or expanding proximity.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedCategory('All');
                          setPureVegOnly(false);
                          setLowOilOnly(false);
                          setHighProteinOnly(false);
                          setRoWaterOnly(false);
                          setRecommendationPillar('all');
                          setProximityFilter('all');
                        }}
                        className="mt-3 px-5 py-2 rounded-full bg-[#007aff] text-white text-xs font-semibold cursor-pointer border-0"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Spatial Distance & Proximity Radar on Wide Screens */}
              <div className="hidden lg:block lg:col-span-4 sticky top-20 space-y-4">
                
                {/* Active Pin & Proximity Radar Widget */}
                <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl p-5 border border-black/5 dark:border-white/10 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800">
                    <div className="flex items-center space-x-2">
                      <Compass className="w-5 h-5 text-[#007aff]" />
                      <h3 className="font-extrabold text-base tracking-tight text-gray-900 dark:text-white">
                        Spatial Radar
                      </h3>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#007aff] border border-blue-200/60 dark:border-blue-800/40">
                      GPS SYNCED
                    </span>
                  </div>

                  {/* Active Pin Locality Card */}
                  <div className="p-3.5 bg-gray-50 dark:bg-zinc-900/60 rounded-2xl border border-gray-100 dark:border-zinc-800/60 flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#007aff] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-gray-900 dark:text-white">
                          {selectedLocality.name}
                        </div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400">
                          {selectedLocality.landmark}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLocationModalOpened(true)}
                      className="px-2.5 py-1 rounded-full bg-white dark:bg-zinc-800 text-[#007aff] text-[11px] font-bold border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 cursor-pointer"
                    >
                      Change Pin
                    </button>
                  </div>

                  {/* Closest Vetted Kitchen Callout */}
                  {closestVendor && (
                    <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-500/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Closest Kitchen</span>
                        </span>
                        <span className="text-xs font-black text-emerald-700 dark:text-emerald-400">
                          {closestVendor.liveDistance.distanceKm} km away
                        </span>
                      </div>
                      <div className="font-bold text-xs text-gray-900 dark:text-white">
                        {closestVendor.name}
                      </div>
                      <div className="text-[11px] text-gray-600 dark:text-gray-300 flex items-center space-x-2">
                        <span>🚶 {closestVendor.liveDistance.walkingMins} min walk</span>
                        <span>•</span>
                        <span>🛺 {closestVendor.liveDistance.rickshawMins} min e-rickshaw</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMapVendor(closestVendor);
                          setActiveTab('map');
                        }}
                        className="w-full mt-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] active:scale-95 transition-all cursor-pointer border-0"
                      >
                        Inspect on Spatial Map →
                      </button>
                    </div>
                  )}

                  {/* Proximity Radius Filter Toggles */}
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                      Filter by Distance Radius:
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 text-[11px] font-bold">
                      {[
                        { id: 'all', label: 'All' },
                        { id: '1km', label: '< 1 km' },
                        { id: '2km', label: '< 2 km' },
                        { id: '3km', label: '< 3 km' },
                      ].map((rad) => {
                        const isActive = proximityFilter === rad.id;
                        return (
                          <button
                            key={rad.id}
                            type="button"
                            onClick={() => {
                              setProximityFilter(rad.id as any);
                              triggerToast(`Proximity: ${rad.label}`);
                            }}
                            className={`py-1.5 rounded-xl transition-all cursor-pointer border text-center ${
                              isActive
                                ? 'bg-[#007aff] text-white border-[#007aff] shadow-2xs font-extrabold'
                                : 'bg-gray-50 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-zinc-700 hover:bg-gray-100'
                            }`}
                          >
                            {rad.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 5-Pillars Quick Inspection Summary */}
                  <div className="pt-2 border-t border-gray-100 dark:border-zinc-800 space-y-2 text-xs">
                    <div className="font-extrabold text-xs text-gray-900 dark:text-white">
                      5 Pillars of Katihar Food Intelligence
                    </div>
                    <div className="space-y-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <span><strong>Sanitation:</strong> TPC &lt; 8% Oil Polar, RO TDS &lt; 100</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                        <span><strong>Quantity:</strong> Verified standard portion &gt; 350g</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                        <span><strong>Quality:</strong> Cold-pressed mustard oil, Pure Desi Ghee</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                        <span><strong>Process:</strong> Slow earthen clay handi & woodfired</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                        <span><strong>Prices:</strong> Fair physical street rates, 0% platform markups</span>
                      </div>
                    </div>
                  </div>

                  {/* Direct Button to Spatial Map Tab */}
                  <button
                    type="button"
                    onClick={() => setActiveTab('map')}
                    className="w-full py-3 rounded-2xl bg-[#007aff] hover:bg-blue-600 text-white font-bold text-xs shadow-md active:scale-98 transition-all cursor-pointer border-0 flex items-center justify-center space-x-2"
                  >
                    <Compass className="w-4 h-4" />
                    <span>Open Full Spatial Map & Distance Matrix</span>
                  </button>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* =============================================================== */}
        {/* TAB 2: SAFETY INDEX                                             */}
        {/* =============================================================== */}
        {activeTab === 'safety' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-blue-700 text-white p-6 sm:p-7 rounded-3xl shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black">5 Pillars of Katihar Food Intelligence</h2>
                    <p className="text-xs sm:text-sm text-emerald-100 mt-0.5">
                      Standardized public advisory auditing Sanitation, Quantity, Quality, Process & Fair Street Prices.
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-xs font-bold bg-black/25 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/15 self-start sm:self-auto">
                  <span>✓ 100% Non-Commercial Directory</span>
                </div>
              </div>
            </div>

            {/* 5 Pillars Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
              
              {/* Pillar 1: Sanitation */}
              <div className="bg-white dark:bg-[#1c1c1e] p-5 rounded-3xl border border-black/5 dark:border-white/10 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">1. Sanitation</h4>
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">Hygiene Grade A+</div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                    Total Polar Compounds (TPC &lt; 8%). RO TDS &lt; 100, FSSAI compliance, clean gloves & hairnets.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-gray-100 dark:border-zinc-800 text-[10px] font-bold text-emerald-600">
                  Target: 0% Rancidity
                </div>
              </div>

              {/* Pillar 2: Quantity */}
              <div className="bg-white dark:bg-[#1c1c1e] p-5 rounded-3xl border border-black/5 dark:border-white/10 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3">
                    <Scale className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">2. Food Quantity</h4>
                  <div className="text-xs font-bold text-purple-600 dark:text-purple-400 mt-1">Grams per Serving</div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                    Explicit portion scales in grams (&gt; 350g thali / 480g handi). Hunger satiety rating verified.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-gray-100 dark:border-zinc-800 text-[10px] font-bold text-purple-600">
                  Target: Full Satiety
                </div>
              </div>

              {/* Pillar 3: Quality */}
              <div className="bg-white dark:bg-[#1c1c1e] p-5 rounded-3xl border border-black/5 dark:border-white/10 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                    <Droplets className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">3. Food Quality</h4>
                  <div className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-1">Fat & Spice Integrity</div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                    Cold-pressed mustard oil or pure dairy cow ghee. Zero palm oil, zero chemical food dyes, zero added MSG.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-gray-100 dark:border-zinc-800 text-[10px] font-bold text-blue-600">
                  Target: Zero Palm Oil
                </div>
              </div>

              {/* Pillar 4: Process */}
              <div className="bg-white dark:bg-[#1c1c1e] p-5 rounded-3xl border border-black/5 dark:border-white/10 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
                    <Flame className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">4. Food Process</h4>
                  <div className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-1">Cookware & Dum</div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                    Slow woodfired earthen handi, steam dum pukht, live fresh batch cooking. Single-cycle oil discard daily.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-gray-100 dark:border-zinc-800 text-[10px] font-bold text-amber-600">
                  Target: Earthen / Woodfired
                </div>
              </div>

              {/* Pillar 5: Price */}
              <div className="bg-white dark:bg-[#1c1c1e] p-5 rounded-3xl border border-black/5 dark:border-white/10 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                    <Coins className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">5. Fair Street Prices</h4>
                  <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-1">0% App Markup</div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                    Transparent street vendor rates. Zero platform inflation, honest price-to-portion value comparison.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-gray-100 dark:border-zinc-800 text-[10px] font-bold text-indigo-600">
                  Target: Physical Stall Parity
                </div>
              </div>

            </div>

            {/* City Leaderboard with 5 Pillars Evaluation */}
            <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl p-5 sm:p-6 border border-black/5 dark:border-white/10 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                    Katihar City 5-Pillar Food Leaderboard
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Vetted street spots and authentic regional kitchens ranked by comprehensive inspection score.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('map')}
                  className="text-xs font-bold text-[#007aff] hover:underline flex items-center space-x-1 cursor-pointer bg-transparent border-0 self-start sm:self-auto"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>View on Spatial Map →</span>
                </button>
              </div>

              <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                {vendorsWithLiveDistance.map((res, idx) => (
                  <div
                    key={res.id}
                    onClick={() => {
                      setSelectedRestaurant(res);
                      setSheetOpened(true);
                    }}
                    className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-gray-50 dark:hover:bg-zinc-800/50 p-2 rounded-2xl cursor-pointer transition-all"
                  >
                    <div className="flex items-center space-x-3.5 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#007aff]/10 text-[#007aff] dark:bg-blue-950/60 dark:text-blue-300 font-black text-xs flex items-center justify-center shrink-0">
                        #{idx + 1}
                      </div>
                      <img
                        src={res.image}
                        alt={res.name}
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                        className="w-12 h-12 rounded-2xl object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white truncate">
                            {res.name}
                          </h4>
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 px-1.5 py-0.2 rounded-full bg-emerald-50 dark:bg-emerald-950/60 shrink-0">
                            {res.fivePillars.sanitation.grade}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                          {res.locality} • {res.specialty}
                        </div>
                      </div>
                    </div>

                    {/* 5-Pillars Quick Metrics */}
                    <div className="flex flex-wrap items-center gap-2 text-[10px]">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200/60 dark:border-emerald-800/40">
                        🧼 {res.fivePillars.sanitation.polarCompound}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-semibold border border-purple-200/60 dark:border-purple-800/40">
                        ⚖️ {res.fivePillars.quantity.avgPortionGrams}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200/60 dark:border-blue-800/40">
                        🌿 {res.fivePillars.quality.fatSource.split(' ')[0]}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-semibold border border-amber-200/60 dark:border-amber-800/40">
                        🔥 {res.fivePillars.process.cookware.split(' ')[0]}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200/60 dark:border-indigo-800/40">
                        ₹{res.priceForTwo} for 2
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0 self-end md:self-auto">
                      <div className="text-right text-[10px] text-gray-400 hidden sm:block">
                        <div>🚶 {res.liveDistance.walkingMins}m walk</div>
                        <div className="font-bold text-gray-700 dark:text-gray-300">{res.liveDistance.distanceKm} km</div>
                      </div>
                      <AppleScoreRing score={res.hygiene.score} size={42} />
                      <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Nominate Stall CTA */}
            <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-amber-950/40 p-5 sm:p-6 rounded-3xl border border-amber-500/20 dark:border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">Know a stall needing an EatRight 5-Pillar Audit?</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                    Nominate your favorite Katihar food spot for free laboratory oil testing and portion verification.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReportModalOpened(true)}
                className="px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs active:scale-95 transition-all cursor-pointer border-0 shrink-0"
              >
                Nominate Stall
              </button>
            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* TAB: REVIEW, RATE & EARN CASHBACK ON APPROVED BILLS              */}
        {/* =============================================================== */}
        {activeTab === 'earn' && (
          <div className="space-y-6">

            {/* Apple Wallet / Titanium Card: Citizen Rewards Balance */}
            <div className="relative overflow-hidden rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 text-white shadow-lg">
              <div className="absolute top-0 right-0 -mr-10 -mt-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-black/25 backdrop-blur-md text-amber-100 flex items-center space-x-1">
                      <Coins className="w-3 h-3 text-amber-200" />
                      <span>EATRIGHT CITIZEN CASHBACK</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400 text-emerald-950">
                      ✓ FSSAI VERIFIED
                    </span>
                  </div>
                  <div className="mt-2">
                    <div className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-baseline space-x-1">
                      <span>₹{totalLifetimeCashback.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-amber-100 font-medium mt-0.5">
                      Lifetime Verified Cashback Earned on Local Katihar Dining
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="bg-black/20 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15">
                    <div className="text-[10px] text-amber-200 uppercase tracking-wider font-bold">Available to Redeem</div>
                    <div className="text-base font-extrabold text-white">₹{(totalLifetimeCashback * 0.45).toFixed(2)}</div>
                  </div>
                  <div className="bg-black/20 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15">
                    <div className="text-[10px] text-amber-200 uppercase tracking-wider font-bold">Slips Approved</div>
                    <div className="text-base font-extrabold text-white">
                      {billSubmissions.filter((s) => s.status === 'approved').length} Slips
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      triggerToast(`₹${(totalLifetimeCashback * 0.45).toFixed(2)} instant payout sent to ${upiId}`);
                    }}
                    className="px-4 py-2.5 rounded-2xl bg-white text-gray-900 font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer border-0 flex items-center space-x-1.5"
                  >
                    <Wallet className="w-4 h-4 text-emerald-600" />
                    <span>Withdraw to UPI</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Apple Segmented Sub-Navigation */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center bg-gray-200/70 dark:bg-zinc-800 p-1 rounded-2xl text-xs font-semibold border border-black/5 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setEarnSubView('new_review')}
                  className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 border-0 ${
                    earnSubView === 'new_review'
                      ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-xs font-bold'
                      : 'bg-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Receipt className="w-3.5 h-3.5 text-amber-500" />
                  <span>Upload Slip & Rate</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEarnSubView('history')}
                  className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 border-0 ${
                    earnSubView === 'history'
                      ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-xs font-bold'
                      : 'bg-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Approved Slips ({billSubmissions.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEarnSubView('policy')}
                  className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 border-0 ${
                    earnSubView === 'policy'
                      ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-xs font-bold'
                      : 'bg-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-blue-500" />
                  <span>Cashback Policy</span>
                </button>
              </div>

              {/* Quick Info Pill */}
              <button
                type="button"
                onClick={() => setShowPolicyModal(true)}
                className="text-xs text-amber-600 dark:text-amber-400 font-bold flex items-center space-x-1 hover:underline cursor-pointer bg-transparent border-0"
              >
                <Info className="w-3.5 h-3.5" />
                <span>How bill verification works →</span>
              </button>
            </div>

            {/* =========================================================== */}
            {/* SUB-VIEW 1: UPLOAD SLIP & RATE WORKFLOW                     */}
            {/* =========================================================== */}
            {earnSubView === 'new_review' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Column: Form & Rating Steps */}
                <div className="lg:col-span-8 space-y-5">
                  
                  {/* Step 1: Shop Selection */}
                  <div className="bg-white dark:bg-[#1c1c1e] p-5 sm:p-6 rounded-3xl border border-black/5 dark:border-white/10 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-6 h-6 rounded-full bg-[#007aff] text-white flex items-center justify-center font-bold text-xs">
                          1
                        </span>
                        <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                          Select Katihar Kitchen / Vendor
                        </h3>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {reviewRestaurant.hygiene.score >= 95 ? '15% Gold Rate' : '10% Street Rate'}
                      </span>
                    </div>

                    <div className="flex space-x-2 overflow-x-auto no-scrollbar py-1">
                      {RESTAURANTS_DATA.map((res) => {
                        const isSelected = reviewRestaurant.id === res.id;
                        return (
                          <button
                            key={res.id}
                            type="button"
                            onClick={() => {
                              setReviewRestaurant(res);
                              setSlipOcrResult({
                                merchant: res.name,
                                date: 'Today, 12:45 PM',
                                amount: parseFloat(billAmount) || 160,
                                valid: true,
                              });
                            }}
                            className={`p-3 rounded-2xl whitespace-nowrap transition-all cursor-pointer flex items-center space-x-2.5 border text-left active:scale-95 shrink-0 ${
                              isSelected
                                ? 'bg-[#007aff]/10 border-[#007aff] dark:bg-blue-950/40'
                                : 'bg-gray-50 dark:bg-zinc-900/60 border-gray-100 dark:border-zinc-800 hover:bg-gray-100'
                            }`}
                          >
                            <span className="text-xl">{res.emoji}</span>
                            <div>
                              <div className="font-bold text-xs text-gray-900 dark:text-white">{res.name}</div>
                              <div className="text-[10px] text-gray-500 dark:text-gray-400">
                                {res.locality} • Lab {res.hygiene.score}%
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 2: Upload Bill / Slip with Live OCR */}
                  <div className="bg-white dark:bg-[#1c1c1e] p-5 sm:p-6 rounded-3xl border border-black/5 dark:border-white/10 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-6 h-6 rounded-full bg-[#007aff] text-white flex items-center justify-center font-bold text-xs">
                          2
                        </span>
                        <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                          Upload Shop Bill or UPI Slip
                        </h3>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Min. bill: ₹50
                      </span>
                    </div>

                    {/* Simulated Scanner Area */}
                    <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/40 p-4 sm:p-5">
                      {isScanningSlip && (
                        <div className="absolute inset-0 bg-[#007aff]/15 z-20 flex flex-col items-center justify-center backdrop-blur-xs">
                          <div className="w-10 h-10 border-3 border-[#007aff] border-t-transparent rounded-full animate-spin mb-2" />
                          <span className="text-xs font-bold text-[#007aff]">AI Scanning Slip & Matching FSSAI...</span>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center space-x-3.5">
                          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                            <Receipt className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="font-extrabold text-xs text-gray-900 dark:text-white">
                              {slipOcrResult ? slipOcrResult.merchant : 'No Bill Uploaded'}
                            </div>
                            <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                              {slipOcrResult ? `Invoice #${billNumber} • ${slipOcrResult.date}` : 'Snap photo of paper receipt or upload UPI screenshot'}
                            </div>
                            {slipOcrResult && billImageUploaded && (
                              <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center space-x-1">
                                <CheckCheck className="w-3 h-3" />
                                <span>Verified Partner Slip Attached</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 w-full sm:w-auto">
                          <label className="flex-1 sm:flex-initial py-2 px-3.5 rounded-xl bg-gray-200/70 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 text-xs font-semibold cursor-pointer active:scale-95 transition-all text-center">
                            <Upload className="w-3.5 h-3.5 inline mr-1" />
                            <span>Upload File</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  setIsScanningSlip(true);
                                  setTimeout(() => {
                                    setIsScanningSlip(false);
                                    setBillImageUploaded(true);
                                    setSlipOcrResult({
                                      merchant: reviewRestaurant.name,
                                      date: 'Today, Just Now',
                                      amount: parseFloat(billAmount) || 180,
                                      valid: true,
                                    });
                                    triggerToast('Receipt verified by AI OCR');
                                  }, 700);
                                }
                              }}
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() => {
                              setIsScanningSlip(true);
                              setTimeout(() => {
                                setIsScanningSlip(false);
                                setBillImageUploaded(true);
                                setBillNumber(`KTR/${Math.floor(1000 + Math.random() * 9000)}`);
                                setSlipOcrResult({
                                  merchant: reviewRestaurant.name,
                                  date: 'Today, 12:45 PM',
                                  amount: 180,
                                  valid: true,
                                });
                                triggerToast('Sample receipt loaded & verified');
                              }, 600);
                            }}
                            className="flex-1 sm:flex-initial py-2 px-3.5 rounded-xl bg-[#007aff]/10 text-[#007aff] hover:bg-[#007aff]/20 text-xs font-bold active:scale-95 transition-all cursor-pointer border-0 text-center"
                          >
                            Sample Slip
                          </button>
                        </div>
                      </div>

                      {/* Bill Inputs Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-3 border-t border-gray-200/60 dark:border-zinc-800">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1">
                            Total Bill Amount (₹)
                          </label>
                          <input
                            type="number"
                            value={billAmount}
                            onChange={(e) => setBillAmount(e.target.value)}
                            placeholder="e.g. 180"
                            className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs outline-none font-bold text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1">
                            Bill / Transaction Ref #
                          </label>
                          <input
                            type="text"
                            value={billNumber}
                            onChange={(e) => setBillNumber(e.target.value)}
                            placeholder="e.g. KTR-2026-981"
                            className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs outline-none text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Rate 4 Hygiene & Taste Pillars */}
                  <div className="bg-white dark:bg-[#1c1c1e] p-5 sm:p-6 rounded-3xl border border-black/5 dark:border-white/10 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-6 h-6 rounded-full bg-[#007aff] text-white flex items-center justify-center font-bold text-xs">
                          3
                        </span>
                        <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                          Rate 4 Hygiene & Taste Pillars
                        </h3>
                      </div>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400">
                        +5% Lab Bounty Bonus
                      </span>
                    </div>

                    <div className="space-y-3">
                      {/* Pillar 1: Oil */}
                      <div className="p-3.5 bg-gray-50 dark:bg-zinc-900/60 rounded-2xl border border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="font-bold text-xs text-gray-900 dark:text-white">1. Cooking Oil Freshness</div>
                          <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
                            {ratingOil === 5 && 'Pristine Cold-Pressed Oil (Zero Rancidity)'}
                            {ratingOil === 4 && 'Clean Golden Oil, Light Taste'}
                            {ratingOil === 3 && 'Standard Commercial Oil'}
                            {ratingOil === 2 && 'Slightly Reheated Oil'}
                            {ratingOil === 1 && 'Dark / Burnt Reused Oil'}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRatingOil(star)}
                              className="p-1 cursor-pointer border-0 bg-transparent active:scale-90 transition-transform"
                            >
                              <Star
                                className={`w-5 h-5 ${
                                  star <= ratingOil ? 'text-amber-400 fill-amber-400 drop-shadow-xs' : 'text-gray-300 dark:text-zinc-700'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Pillar 2: Water */}
                      <div className="p-3.5 bg-gray-50 dark:bg-zinc-900/60 rounded-2xl border border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="font-bold text-xs text-gray-900 dark:text-white">2. Clean RO Water & Ice</div>
                          <div className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                            {ratingWater === 5 && '100% Certified RO / Sealed Mineral Water'}
                            {ratingWater === 4 && 'Filtered Drinking Water'}
                            {ratingWater === 3 && 'Boiled Standard Water'}
                            {ratingWater === 2 && 'Unverified Stored Water'}
                            {ratingWater === 1 && 'Direct Municipal Tap Water'}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRatingWater(star)}
                              className="p-1 cursor-pointer border-0 bg-transparent active:scale-90 transition-transform"
                            >
                              <Star
                                className={`w-5 h-5 ${
                                  star <= ratingWater ? 'text-blue-500 fill-blue-500 drop-shadow-xs' : 'text-gray-300 dark:text-zinc-700'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Pillar 3: Sanitation */}
                      <div className="p-3.5 bg-gray-50 dark:bg-zinc-900/60 rounded-2xl border border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="font-bold text-xs text-gray-900 dark:text-white">3. Stall Hygiene & Gloves</div>
                          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                            {ratingHygiene === 5 && 'Hairnets, Fresh Gloves & Glass Covered'}
                            {ratingHygiene === 4 && 'Clean Counters & Tongs Handled'}
                            {ratingHygiene === 3 && 'Average Cleanliness'}
                            {ratingHygiene === 2 && 'Open Street Dust Exposure'}
                            {ratingHygiene === 1 && 'Unsanitary & Fly Exposure'}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRatingHygiene(star)}
                              className="p-1 cursor-pointer border-0 bg-transparent active:scale-90 transition-transform"
                            >
                              <Star
                                className={`w-5 h-5 ${
                                  star <= ratingHygiene ? 'text-emerald-500 fill-emerald-500 drop-shadow-xs' : 'text-gray-300 dark:text-zinc-700'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Pillar 4: Taste & Value */}
                      <div className="p-3.5 bg-gray-50 dark:bg-zinc-900/60 rounded-2xl border border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="font-bold text-xs text-gray-900 dark:text-white">4. Taste, Portion & Value</div>
                          <div className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold mt-0.5">
                            {ratingTaste === 5 && 'Generous Portion, Delicious & Fresh'}
                            {ratingTaste === 4 && 'Tasty & Great Value for Money'}
                            {ratingTaste === 3 && 'Decent Standard Taste'}
                            {ratingTaste === 2 && 'Small Portion / Bland'}
                            {ratingTaste === 1 && 'Stale / Poor Value'}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRatingTaste(star)}
                              className="p-1 cursor-pointer border-0 bg-transparent active:scale-90 transition-transform"
                            >
                              <Star
                                className={`w-5 h-5 ${
                                  star <= ratingTaste ? 'text-purple-500 fill-purple-500 drop-shadow-xs' : 'text-gray-300 dark:text-zinc-700'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 4: 1-Tap Evidence Badges */}
                  <div className="bg-white dark:bg-[#1c1c1e] p-5 sm:p-6 rounded-3xl border border-black/5 dark:border-white/10 shadow-xs space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-full bg-[#007aff] text-white flex items-center justify-center font-bold text-xs">
                        4
                      </span>
                      <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                        1-Tap Verified Observation Badges
                      </h3>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {[
                        'Fresh Mustard Oil',
                        'RO Filtered Water',
                        'Clean Gloves Worn',
                        'Eco Packaging',
                        'Cooked Live Batch',
                        'Full Plate Weight',
                        'Clean Steel Tumblers',
                        'Pure Desi Ghee',
                      ].map((tag) => {
                        const isSelected = selectedReviewTags.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => {
                              setSelectedReviewTags((prev) =>
                                isSelected ? prev.filter((t) => t !== tag) : [...prev, tag]
                              );
                            }}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer active:scale-95 border ${
                              isSelected
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                : 'bg-gray-50 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-zinc-700 hover:bg-gray-100'
                            }`}
                          >
                            <span>{isSelected ? '✓ ' : '+ '}</span>
                            <span>{tag}</span>
                          </button>
                        );
                      })}
                    </div>

                    <input
                      type="text"
                      placeholder="Optional observation (e.g. litti was hot, oil had zero burnt smell)..."
                      value={reviewNote}
                      onChange={(e) => setReviewNote(e.target.value)}
                      className="mt-2 w-full px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-zinc-800 border border-transparent focus:border-[#007aff] text-xs outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  </div>

                  {/* Step 5: Payout Preference & Submission */}
                  <div className="bg-white dark:bg-[#1c1c1e] p-5 sm:p-6 rounded-3xl border border-black/5 dark:border-white/10 shadow-xs space-y-4">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-full bg-[#007aff] text-white flex items-center justify-center font-bold text-xs">
                        5
                      </span>
                      <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                        Choose Cashback Payout Method
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPayoutMethod('UPI')}
                        className={`p-3.5 rounded-2xl text-left border cursor-pointer active:scale-98 transition-all flex items-center space-x-3 ${
                          payoutMethod === 'UPI'
                            ? 'bg-[#007aff]/10 border-[#007aff] text-gray-900 dark:text-white'
                            : 'bg-gray-50 dark:bg-zinc-900/60 border-gray-200 dark:border-zinc-800 text-gray-500'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-xl bg-[#007aff] text-white flex items-center justify-center font-bold text-xs shrink-0">
                          ⚡
                        </div>
                        <div>
                          <div className="font-bold text-xs">Instant UPI Transfer</div>
                          <div className="text-[10px] text-gray-400">Direct to your Bank Account</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPayoutMethod('EatRight Wallet')}
                        className={`p-3.5 rounded-2xl text-left border cursor-pointer active:scale-98 transition-all flex items-center space-x-3 ${
                          payoutMethod === 'EatRight Wallet'
                            ? 'bg-emerald-500/10 border-emerald-500 text-gray-900 dark:text-white'
                            : 'bg-gray-50 dark:bg-zinc-900/60 border-gray-200 dark:border-zinc-800 text-gray-500'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          🛍️
                        </div>
                        <div>
                          <div className="font-bold text-xs">EatRight Food Wallet</div>
                          <div className="text-[10px] text-gray-400">Spend directly on Tray orders</div>
                        </div>
                      </button>
                    </div>

                    {payoutMethod === 'UPI' && (
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1">
                          Your UPI ID (VPA)
                        </label>
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="e.g. mobile@upi, username@okhdfc"
                          className="w-full px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-zinc-800 border border-transparent focus:border-[#007aff] text-xs outline-none text-gray-900 dark:text-white font-bold"
                        />
                      </div>
                    )}

                    <button
                      type="button"
                      disabled={isSubmittingBill || parseFloat(billAmount) < 50}
                      onClick={() => {
                        const amt = parseFloat(billAmount) || 0;
                        if (amt < 50) {
                          triggerToast('Minimum qualifying bill is ₹50');
                          return;
                        }
                        setIsSubmittingBill(true);
                        setTimeout(() => {
                          setIsSubmittingBill(false);
                          const newSub: BillReviewSubmission = {
                            id: `SUB-${Math.floor(1000 + Math.random() * 9000)}`,
                            restaurantId: reviewRestaurant.id,
                            restaurantName: reviewRestaurant.name,
                            locality: reviewRestaurant.locality,
                            billNumber: billNumber || `KTR-${Math.floor(1000 + Math.random() * 9000)}`,
                            billDate: 'Today, Just Now',
                            billAmount: amt,
                            cashbackEarned: calculatedCashback.earned,
                            cashbackPercentage: calculatedCashback.percentage,
                            ratings: {
                              oilFreshness: ratingOil,
                              cleanWater: ratingWater,
                              stallHygiene: ratingHygiene,
                              tasteAndValue: ratingTaste,
                            },
                            tags: selectedReviewTags,
                            userReviewText: reviewNote || 'Citizen audit verified clean oil, RO water, and authentic taste in Katihar.',
                            status: 'approved',
                            submittedAt: 'Just Now',
                            payoutMethod: payoutMethod,
                            payoutRecipient: payoutMethod === 'UPI' ? upiId : 'EatRight Wallet',
                          };
                          setBillSubmissions((prev) => [newSub, ...prev]);
                          setSubmittedClaim(newSub);
                          triggerToast(`🎉 ₹${calculatedCashback.earned} credited via ${payoutMethod}!`);
                        }, 1200);
                      }}
                      className="w-full py-3.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm shadow-md active:scale-98 transition-all cursor-pointer border-0 flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      {isSubmittingBill ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Auditing Slip & Crediting Cashback...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Submit Slip & Claim ₹{calculatedCashback.earned} Cashback</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>

                </div>

                {/* Right Column: Live Cashback Breakdown Panel (Sticky) */}
                <div className="lg:col-span-4 sticky top-20 space-y-4">
                  <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl p-5 border border-black/5 dark:border-white/10 shadow-xs space-y-4">
                    <div className="flex items-center space-x-2 pb-3 border-b border-gray-100 dark:border-zinc-800">
                      <Coins className="w-5 h-5 text-amber-500" />
                      <h4 className="font-extrabold text-sm text-gray-900 dark:text-white">
                        Live Cashback Calculator
                      </h4>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between text-gray-500 dark:text-gray-400">
                        <span>Reported Bill Amount</span>
                        <span className="font-bold text-gray-900 dark:text-white">
                          ₹{parseFloat(billAmount) || 0}
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-500 dark:text-gray-400">
                        <span>Kitchen Tier Rate ({reviewRestaurant.hygiene.score >= 95 ? 'Gold' : 'Street'})</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {reviewRestaurant.hygiene.score >= 95 ? '15%' : '10%'}
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-500 dark:text-gray-400">
                        <span>4-Pillar Rating Bounty</span>
                        <span className="font-bold text-purple-600 dark:text-purple-400">+5% Extra</span>
                      </div>
                      <div className="flex justify-between text-gray-500 dark:text-gray-400">
                        <span>Total Cashback Rate</span>
                        <span className="font-extrabold text-amber-600 dark:text-amber-400">
                          {calculatedCashback.percentage}%
                        </span>
                      </div>

                      <div className="pt-2 border-t border-gray-100 dark:border-zinc-800 flex justify-between font-black text-sm">
                        <span className="text-gray-900 dark:text-white">Your Earned Cashback</span>
                        <span className="text-amber-600 dark:text-amber-400 text-base">
                          ₹{calculatedCashback.earned}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200/60 dark:border-amber-800/40 text-[11px] text-amber-800 dark:text-amber-300 space-y-1">
                      <div className="font-bold flex items-center space-x-1">
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Instant Auto-Credit Guarantee</span>
                      </div>
                      <p className="text-[10px] text-amber-700/80 dark:text-amber-400/80">
                        Once approved, money is transferred automatically to your UPI or wallet. No coupons, no minimum withdrawal threshold.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setEarnSubView('policy')}
                      className="w-full text-center text-xs font-bold text-[#007aff] hover:underline cursor-pointer bg-transparent border-0"
                    >
                      Read Complete Katihar Cashback Policy →
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* =========================================================== */}
            {/* SUB-VIEW 2: APPROVED SLIPS & REVIEWS HISTORY                 */}
            {/* =========================================================== */}
            {earnSubView === 'history' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                      Your Approved Slips & Reviews
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {billSubmissions.length} slips verified with zero audit rejections
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEarnSubView('new_review')}
                    className="px-4 py-2 rounded-full bg-[#007aff] text-white font-bold text-xs cursor-pointer active:scale-95 border-0"
                  >
                    + Submit New Slip
                  </button>
                </div>

                <div className="space-y-3">
                  {billSubmissions.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-5 bg-white dark:bg-[#1c1c1e] rounded-3xl border border-black/5 dark:border-white/10 shadow-xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100 dark:border-zinc-800">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-extrabold text-sm text-gray-900 dark:text-white">
                              {sub.restaurantName}
                            </h4>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500 text-white">
                              ✓ {sub.status.toUpperCase()}
                            </span>
                          </div>
                          <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                            {sub.locality} • Invoice #{sub.billNumber} • {sub.billDate}
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <div className="text-xs text-gray-400">Bill: ₹{sub.billAmount}</div>
                            <div className="text-sm font-black text-amber-600 dark:text-amber-400">
                              +₹{sub.cashbackEarned.toFixed(2)} Cashback
                            </div>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                            via {sub.payoutMethod}
                          </span>
                        </div>
                      </div>

                      {/* Ratings Matrix */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div className="p-2 bg-gray-50 dark:bg-zinc-900/60 rounded-xl">
                          <div className="text-[10px] text-gray-400 font-bold">🌿 Oil Quality</div>
                          <div className="font-extrabold text-amber-500">★ {sub.ratings.oilFreshness}/5</div>
                        </div>
                        <div className="p-2 bg-gray-50 dark:bg-zinc-900/60 rounded-xl">
                          <div className="text-[10px] text-gray-400 font-bold">💧 Water Purity</div>
                          <div className="font-extrabold text-blue-500">★ {sub.ratings.cleanWater}/5</div>
                        </div>
                        <div className="p-2 bg-gray-50 dark:bg-zinc-900/60 rounded-xl">
                          <div className="text-[10px] text-gray-400 font-bold">🧼 Sanitation</div>
                          <div className="font-extrabold text-emerald-500">★ {sub.ratings.stallHygiene}/5</div>
                        </div>
                        <div className="p-2 bg-gray-50 dark:bg-zinc-900/60 rounded-xl">
                          <div className="text-[10px] text-gray-400 font-bold">⭐ Taste & Value</div>
                          <div className="font-extrabold text-purple-500">★ {sub.ratings.tasteAndValue}/5</div>
                        </div>
                      </div>

                      {/* Tags & Review Quote */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {sub.tags.map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300"
                          >
                            ✓ {t}
                          </span>
                        ))}
                      </div>

                      {sub.userReviewText && (
                        <p className="text-xs text-gray-600 dark:text-gray-300 italic pt-1 border-t border-gray-100 dark:border-zinc-800/60">
                          &ldquo;{sub.userReviewText}&rdquo;
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* =========================================================== */}
            {/* SUB-VIEW 3: OFFICIAL CASHBACK & VERIFICATION POLICY          */}
            {/* =========================================================== */}
            {earnSubView === 'policy' && (
              <div className="space-y-5">
                <div className="p-6 bg-gradient-to-r from-amber-600 to-orange-700 text-white rounded-3xl shadow-xs">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-8 h-8 text-white" />
                    <div>
                      <h3 className="text-xl font-black">Katihar Citizen Cashback Policy</h3>
                      <p className="text-xs text-amber-100 mt-0.5">
                        Transparent guidelines on earning money by submitting verified dining slips and ratings.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 5 Policy Rules */}
                <div className="space-y-4">
                  {CASHBACK_POLICY_RULES.map((rule) => (
                    <div
                      key={rule.id}
                      className="p-5 sm:p-6 bg-white dark:bg-[#1c1c1e] rounded-3xl border border-black/5 dark:border-white/10 shadow-xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-gray-100 dark:border-zinc-800">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white">
                            {rule.title}
                          </h4>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                            {rule.badge}
                          </span>
                        </div>
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                          {rule.rateHighlight}
                        </span>
                      </div>

                      <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                        {rule.summary}
                      </p>

                      <ul className="space-y-1.5 pt-1">
                        {rule.details.map((detail, idx) => (
                          <li
                            key={idx}
                            className="text-[11px] text-gray-500 dark:text-gray-400 flex items-start space-x-2"
                          >
                            <span className="text-amber-500 font-bold shrink-0">•</span>
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* FAQ Card */}
                <div className="p-5 sm:p-6 bg-white dark:bg-[#1c1c1e] rounded-3xl border border-black/5 dark:border-white/10 shadow-xs space-y-3">
                  <h4 className="font-extrabold text-sm text-gray-900 dark:text-white">
                    Frequently Asked Questions (FAQ)
                  </h4>
                  <div className="divide-y divide-gray-100 dark:divide-zinc-800 text-xs space-y-3 pt-1">
                    <div className="pt-2">
                      <div className="font-bold text-gray-900 dark:text-white">
                        Q: What if the local cart gives a handwritten kacha parcha?
                      </div>
                      <div className="text-gray-500 dark:text-gray-400 mt-1 text-[11px]">
                        A: Handwritten paper slips with the stall name, date, and amount are accepted. Our local Katihar field team audits and approves them within 20 minutes.
                      </div>
                    </div>
                    <div className="pt-3">
                      <div className="font-bold text-gray-900 dark:text-white">
                        Q: Can I submit UPI screenshot from Google Pay or PhonePe?
                      </div>
                      <div className="text-gray-500 dark:text-gray-400 mt-1 text-[11px]">
                        A: Yes! Digital merchant payment screenshots showing the transaction ID, shop VPA name, and amount qualify for instant automated approval.
                      </div>
                    </div>
                    <div className="pt-3">
                      <div className="font-bold text-gray-900 dark:text-white">
                        Q: When is the cashback transferred to my bank?
                      </div>
                      <div className="text-gray-500 dark:text-gray-400 mt-1 text-[11px]">
                        A: Direct UPI transfers are initiated automatically via banking APIs upon slip approval. You typically receive the credit notification within 2 to 15 minutes.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* =============================================================== */}
        {/* TAB 3: SPATIAL MAP & ACCURATE DISTANCE ANALYSIS                */}
        {/* =============================================================== */}
        {activeTab === 'map' && (
          <div className="space-y-6">
            
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 text-white p-6 sm:p-7 rounded-3xl shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                    <Compass className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-xl sm:text-2xl font-black">Katihar Spatial Map & Distance Analysis</h2>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-white/25 uppercase tracking-wider">
                        Trigonometric Engine
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-blue-100 mt-0.5">
                      Real-time distance calculations from your active GPS pin. Walking (@ 4.8 km/h), e-rickshaw (@ 18 km/h), and cycling (@ 12 km/h).
                    </p>
                  </div>
                </div>

                {/* Pin Status & Controls */}
                <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
                  <div className="bg-black/25 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/15 text-xs">
                    <span className="text-blue-200 text-[10px] uppercase font-bold block">Current Pin</span>
                    <span className="font-extrabold text-white">{selectedLocality.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLocationModalOpened(true)}
                    className="px-3.5 py-2 rounded-2xl bg-white text-gray-900 font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer border-0 flex items-center space-x-1"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#007aff]" />
                    <span>Change Pin</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Proximity Filter Toggles */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center bg-gray-200/70 dark:bg-zinc-800 p-1 rounded-2xl text-xs font-semibold border border-black/5 dark:border-white/10">
                {[
                  { id: 'all', label: 'All Katihar (6 Spots)' },
                  { id: '1km', label: 'Within 1 km' },
                  { id: '2km', label: 'Within 2 km' },
                  { id: '3km', label: 'Within 3 km' },
                ].map((rad) => {
                  const isActive = proximityFilter === rad.id;
                  const count =
                    rad.id === 'all'
                      ? vendorsWithLiveDistance.length
                      : rad.id === '1km'
                      ? vendorsWithLiveDistance.filter((v) => v.liveDistance.distanceKm <= 1.0).length
                      : rad.id === '2km'
                      ? vendorsWithLiveDistance.filter((v) => v.liveDistance.distanceKm <= 2.0).length
                      : vendorsWithLiveDistance.filter((v) => v.liveDistance.distanceKm <= 3.0).length;
                  return (
                    <button
                      key={rad.id}
                      type="button"
                      onClick={() => {
                        setProximityFilter(rad.id as any);
                        triggerToast(`Proximity: ${rad.label}`);
                      }}
                      className={`px-3 sm:px-4 py-2 rounded-xl transition-all cursor-pointer border-0 ${
                        isActive
                          ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-xs font-bold'
                          : 'bg-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <span>{rad.label}</span>
                      <span className="ml-1 opacity-60">({count})</span>
                    </button>
                  );
                })}
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                Tap on any vendor pin to calculate live distance ray & route guidance
              </div>
            </div>

            {/* 
              ===================================================================
              HIGH-PRECISION INTERACTIVE KATIHAR SPATIAL VECTOR CANVAS
              - Real Katihar geographic features:
                1. Koshi River Canal (Western curve)
                2. Katihar Jn Main Railway & South Branch
                3. Rajendra Stadium & Sports Ground
                4. Railway Colony Officers Park
                5. NH-31 Arterial Bypass & MG Road Corridor
                6. Dynamic SVG Distance Ray connecting user pin to selected vendor!
              ===================================================================
            */}
            <div className="relative w-full h-[460px] sm:h-[500px] rounded-3xl overflow-hidden border border-black/10 dark:border-white/10 select-none shadow-lg bg-[#eaf0f6] dark:bg-[#11171f]">
              
              {/* Map Layer Controls (Top Right Overlay) */}
              <div className="absolute top-3.5 right-3.5 z-20 flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setMapViewMode((m) => (m === 'standard' ? 'satellite' : 'standard'))}
                  className="px-3 py-1.5 rounded-xl bg-white/90 dark:bg-[#1c1c1e]/90 backdrop-blur-md text-xs font-bold text-gray-700 dark:text-gray-200 border border-black/10 dark:border-white/10 shadow-sm cursor-pointer hover:bg-white dark:hover:bg-zinc-800 transition-colors flex items-center space-x-1.5"
                >
                  <Layers className="w-3.5 h-3.5 text-[#007aff]" />
                  <span>{mapViewMode === 'standard' ? 'Vector Map' : 'Satellite'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  className="p-2 rounded-xl bg-white/90 dark:bg-[#1c1c1e]/90 backdrop-blur-md text-gray-700 dark:text-gray-200 border border-black/10 dark:border-white/10 shadow-sm cursor-pointer hover:bg-white dark:hover:bg-zinc-800 transition-colors flex items-center justify-center"
                  title="Recenter GPS Pin"
                >
                  <LocateFixed className="w-4 h-4 text-[#007aff]" />
                </button>
              </div>

              {/* Map Legend Overlay (Top Left) */}
              <div className="absolute top-3.5 left-3.5 z-20 pointer-events-none flex flex-col space-y-1 text-[10px] font-semibold text-gray-700 dark:text-gray-300 bg-white/85 dark:bg-black/75 p-2.5 rounded-2xl backdrop-blur-md border border-black/5 dark:border-white/10 shadow-xs">
                <div className="font-extrabold text-[11px] text-gray-900 dark:text-white flex items-center space-x-1">
                  <span>🗺️ Katihar Spatial Grid</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                  <span>Your GPS Location Pin</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#007aff] inline-block" />
                  <span>Vetted Kitchens ({filteredRestaurants.length})</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-5 h-[2px] bg-[#007aff] border-t-2 border-dashed border-[#007aff] inline-block" />
                  <span>Dynamic Distance Ray</span>
                </div>
              </div>

              {/* Interactive Vector SVG Canvas */}
              <div
                onClick={handleMapCanvasClick}
                className="w-full h-full cursor-crosshair relative"
              >
                <svg
                  className="w-full h-full"
                  viewBox="0 0 500 350"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <defs>
                    <linearGradient id="spatialPinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ff3b30" />
                      <stop offset="100%" stopColor="#d70015" />
                    </linearGradient>
                  </defs>

                  {/* Satellite or Clean Paper Background */}
                  <rect
                    width="500"
                    height="350"
                    fill={
                      mapViewMode === 'satellite'
                        ? '#0c1622'
                        : isDarkMode
                        ? '#12171f'
                        : '#e8edf3'
                    }
                  />

                  {/* Subtle Coordinate Grid Lines */}
                  <g opacity={isDarkMode ? '0.1' : '0.15'}>
                    <line x1="100" y1="0" x2="100" y2="350" stroke="currentColor" strokeWidth="1" />
                    <line x1="200" y1="0" x2="200" y2="350" stroke="currentColor" strokeWidth="1" />
                    <line x1="300" y1="0" x2="300" y2="350" stroke="currentColor" strokeWidth="1" />
                    <line x1="400" y1="0" x2="400" y2="350" stroke="currentColor" strokeWidth="1" />
                    <line x1="0" y1="80" x2="500" y2="80" stroke="currentColor" strokeWidth="1" />
                    <line x1="0" y1="170" x2="500" y2="170" stroke="currentColor" strokeWidth="1" />
                    <line x1="0" y1="260" x2="500" y2="260" stroke="currentColor" strokeWidth="1" />
                  </g>

                  {/* Water Feature: Koshi River Canal (Curving Western Ribbon) */}
                  <g>
                    <path
                      d="M 50,0 C 70,70 110,140 80,220 C 60,280 85,320 75,350"
                      stroke={isDarkMode ? '#1e3a5f' : '#8cc0f0'}
                      strokeWidth="24"
                      strokeLinecap="round"
                      fill="none"
                      opacity="0.5"
                    />
                    <path
                      d="M 50,0 C 70,70 110,140 80,220 C 60,280 85,320 75,350"
                      stroke={isDarkMode ? '#2d5c96' : '#60a5fa'}
                      strokeWidth="9"
                      strokeLinecap="round"
                      fill="none"
                      opacity="0.75"
                    />
                    <text
                      x="92"
                      y="160"
                      transform="rotate(65 92 160)"
                      className="text-[8px] font-black fill-blue-600 dark:fill-blue-400 opacity-70 tracking-widest"
                    >
                      KOSHI CANAL
                    </text>
                  </g>

                  {/* Green Zones: Rajendra Stadium & Sports Ground */}
                  <g>
                    <rect
                      x="185"
                      y="45"
                      width="95"
                      height="70"
                      rx="10"
                      fill={isDarkMode ? '#173322' : '#bce3be'}
                      opacity="0.55"
                    />
                    <ellipse
                      cx="232"
                      cy="80"
                      rx="32"
                      ry="20"
                      fill="none"
                      stroke={isDarkMode ? '#285e3c' : '#7cb87e'}
                      strokeWidth="2"
                      strokeDasharray="3 2"
                    />
                    <text
                      x="232"
                      y="83"
                      textAnchor="middle"
                      className="text-[8px] font-bold fill-emerald-800 dark:fill-emerald-300 opacity-90"
                    >
                      🏟️ Rajendra Stadium
                    </text>
                  </g>

                  {/* Green Zones: Railway Colony Officers Park */}
                  <g>
                    <rect
                      x="340"
                      y="25"
                      width="80"
                      height="48"
                      rx="8"
                      fill={isDarkMode ? '#173322' : '#bce3be'}
                      opacity="0.5"
                    />
                    <text
                      x="380"
                      y="50"
                      textAnchor="middle"
                      className="text-[8px] font-bold fill-emerald-800 dark:fill-emerald-300 opacity-80"
                    >
                      🌳 Colony Park
                    </text>
                  </g>

                  {/* Railway Lines: Katihar Junction Main Tracks */}
                  <g>
                    <path
                      d="M 0,65 Q 180,82 370,72 T 500,60"
                      stroke={isDarkMode ? '#3a3a3c' : '#9ca3af'}
                      strokeWidth="5"
                      fill="none"
                    />
                    <path
                      d="M 0,65 Q 180,82 370,72 T 500,60"
                      stroke={isDarkMode ? '#8e8e93' : '#4b5563'}
                      strokeWidth="5"
                      strokeDasharray="2 4"
                      fill="none"
                    />
                    <path
                      d="M 370,72 Q 395,165 415,350"
                      stroke={isDarkMode ? '#3a3a3c' : '#9ca3af'}
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      d="M 370,72 Q 395,165 415,350"
                      stroke={isDarkMode ? '#8e8e93' : '#4b5563'}
                      strokeWidth="4"
                      strokeDasharray="2 4"
                      fill="none"
                    />
                    {/* Katihar Junction Station Marker */}
                    <g transform="translate(350, 60)">
                      <rect
                        x="0"
                        y="0"
                        width="82"
                        height="20"
                        rx="10"
                        fill={isDarkMode ? '#2c2c2e' : '#ffffff'}
                        stroke="#8e8e93"
                        strokeWidth="1"
                      />
                      <text
                        x="41"
                        y="14"
                        textAnchor="middle"
                        className="text-[9px] font-black fill-gray-900 dark:fill-white"
                      >
                        🚂 Katihar Jn
                      </text>
                    </g>
                  </g>

                  {/* Road Network (Casing + Surface) */}
                  <g>
                    {/* NH 31 Arterial Bypass Highway */}
                    <path
                      d="M 30,340 Q 110,260 210,210 Q 260,175 230,90 Q 215,35 200,0"
                      stroke={isDarkMode ? '#242b35' : '#cbd5e1'}
                      strokeWidth="12"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d="M 30,340 Q 110,260 210,210 Q 260,175 230,90 Q 215,35 200,0"
                      stroke={isDarkMode ? '#1a222d' : '#ffffff'}
                      strokeWidth="8"
                      strokeLinecap="round"
                      fill="none"
                    />

                    {/* MG Road Main Commercial Corridor */}
                    <path
                      d="M 70,180 L 460,180"
                      stroke={isDarkMode ? '#242b35' : '#cbd5e1'}
                      strokeWidth="11"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d="M 70,180 L 460,180"
                      stroke={isDarkMode ? '#1a222d' : '#ffffff'}
                      strokeWidth="7"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <text
                      x="160"
                      y="176"
                      className="text-[8px] font-black fill-gray-500 dark:fill-gray-400 opacity-70 tracking-wider"
                    >
                      MG ROAD
                    </text>

                    {/* Station Link Road */}
                    <path
                      d="M 260,180 L 370,80"
                      stroke={isDarkMode ? '#242b35' : '#cbd5e1'}
                      strokeWidth="8"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d="M 260,180 L 370,80"
                      stroke={isDarkMode ? '#1a222d' : '#ffffff'}
                      strokeWidth="5"
                      strokeLinecap="round"
                      fill="none"
                    />

                    {/* Mirchaibari, Bara Bazar & Mangal Bazar Connectors */}
                    <path
                      d="M 210,210 L 320,200 L 420,155"
                      stroke={isDarkMode ? '#1a222d' : '#ffffff'}
                      strokeWidth="5"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d="M 150,245 L 210,210"
                      stroke={isDarkMode ? '#1a222d' : '#ffffff'}
                      strokeWidth="5"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </g>

                  {/* 
                    DYNAMIC DISTANCE RAY VECTOR:
                    Calculated line between user GPS pin (mapPinCoords) and selectedMapVendor coordinates!
                  */}
                  {selectedMapVendor && (
                    <g>
                      {/* Scaled coordinates in SVG 500x350 box */}
                      {(() => {
                        const userSvgX = (mapPinCoords.x / 100) * 500;
                        const userSvgY = (mapPinCoords.y / 100) * 350;
                        const vendorSvgX = (selectedMapVendor.mapX / 100) * 500;
                        const vendorSvgY = (selectedMapVendor.mapY / 100) * 350;
                        const midX = (userSvgX + vendorSvgX) / 2;
                        const midY = (userSvgY + vendorSvgY) / 2;

                        return (
                          <>
                            {/* Halo / Glow behind ray */}
                            <line
                              x1={userSvgX}
                              y1={userSvgY}
                              x2={vendorSvgX}
                              y2={vendorSvgY}
                              stroke="#007aff"
                              strokeWidth="6"
                              strokeOpacity="0.25"
                              strokeLinecap="round"
                            />
                            {/* Animated Dashed Vector Line */}
                            <line
                              x1={userSvgX}
                              y1={userSvgY}
                              x2={vendorSvgX}
                              y2={vendorSvgY}
                              stroke="#007aff"
                              strokeWidth="2.5"
                              strokeDasharray="6 4"
                              strokeLinecap="round"
                            />
                            {/* Midpoint Distance Badge */}
                            <g transform={`translate(${midX}, ${midY})`}>
                              <rect
                                x="-32"
                                y="-10"
                                width="64"
                                height="20"
                                rx="10"
                                fill="#007aff"
                                className="shadow-md"
                              />
                              <text
                                x="0"
                                y="4"
                                textAnchor="middle"
                                className="text-[10px] font-black fill-white"
                              >
                                {selectedMapVendorLive.liveDistance.distanceKm} km
                              </text>
                            </g>
                          </>
                        );
                      })()}
                    </g>
                  )}
                </svg>

                {/* 
                  ===============================================================
                  HTML OVERLAYS: Vendor Markers on the Map
                  ===============================================================
                */}
                {vendorsWithLiveDistance.map((v) => {
                  const isSelected = selectedMapVendor.id === v.id;
                  return (
                    <div
                      key={v.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMapVendor(v);
                        triggerToast(`Target: ${v.name} (${v.liveDistance.distanceKm} km)`);
                      }}
                      style={{ left: `${v.mapX}%`, top: `${v.mapY}%` }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-15 transition-transform hover:scale-120 ${
                        isSelected ? 'scale-115 z-25' : ''
                      }`}
                      title={`${v.name} (${v.liveDistance.distanceKm} km)`}
                    >
                      <div
                        className={`w-8 h-8 rounded-2xl flex items-center justify-center text-sm shadow-md transition-all ${
                          isSelected
                            ? 'bg-[#007aff] text-white ring-4 ring-[#007aff]/30 shadow-lg'
                            : 'bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-100 border border-black/10 dark:border-white/20 hover:bg-blue-50'
                        }`}
                      >
                        <span>{v.emoji}</span>
                      </div>
                      <span className={`absolute top-full mt-1 left-1/2 -translate-x-1/2 text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-xs pointer-events-none ${
                        isSelected
                          ? 'bg-[#007aff] text-white'
                          : 'bg-white/95 dark:bg-zinc-900/95 text-gray-800 dark:text-gray-200 border border-black/5 dark:border-white/10'
                      }`}>
                        {v.name.split(' ')[0]} ({v.liveDistance.distanceKm}km)
                      </span>
                    </div>
                  );
                })}

                {/* 
                  ===============================================================
                  THE ACTIVE USER GPS PIN (Apple Red Teardrop + Beacon Pulse)
                  ===============================================================
                */}
                <div
                  style={{ left: `${mapPinCoords.x}%`, top: `${mapPinCoords.y}%` }}
                  className="absolute pointer-events-none -translate-x-1/2 -translate-y-full z-30 transition-all duration-300 ease-out"
                >
                  <div className="relative flex flex-col items-center">
                    <svg
                      width="34"
                      height="42"
                      viewBox="0 0 32 40"
                      className="drop-shadow-xl animate-bounce"
                      style={{ animationDuration: '1.4s' }}
                    >
                      <path
                        d="M16 0C7.16 0 0 7.16 0 16c0 11.2 16 24 16 24s16-12.8 16-24C32 7.16 24.84 0 16 0z"
                        fill="url(#spatialPinGradient)"
                      />
                      <circle cx="16" cy="15" r="5.5" fill="#ffffff" />
                      <circle cx="16" cy="15" r="2.5" fill="#d70015" />
                    </svg>
                    <div className="w-4 h-1 rounded-full bg-black/40 blur-[1px] -mt-1" />
                  </div>
                </div>

              </div>

              {/* Floating Bottom Card: Inspected Selected Vendor */}
              {selectedMapVendor && (
                <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-3.5 sm:w-96 z-30">
                  <div className="bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-2xl rounded-3xl p-4 shadow-2xl border border-black/10 dark:border-white/15 space-y-2.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <h4 className="font-extrabold text-sm text-gray-900 dark:text-white truncate">
                            {selectedMapVendor.name}
                          </h4>
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 px-1.5 py-0.2 rounded-full bg-emerald-50 dark:bg-emerald-950/60">
                            {selectedMapVendor.fivePillars.sanitation.grade}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400">
                          {selectedMapVendor.locality} • ₹{selectedMapVendor.priceForTwo} for 2 street rate
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-black text-[#007aff]">
                          {selectedMapVendorLive.liveDistance.distanceKm} km
                        </div>
                        <div className="text-[9px] text-gray-400">from active pin</div>
                      </div>
                    </div>

                    {/* Travel Times Strip */}
                    <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                      <div className="p-1.5 bg-gray-50 dark:bg-zinc-800/60 rounded-xl">
                        <div className="text-[10px] text-gray-400 font-bold">🚶 Walking</div>
                        <div className="font-extrabold text-gray-800 dark:text-gray-200">
                          {selectedMapVendorLive.liveDistance.walkingMins} min
                        </div>
                      </div>
                      <div className="p-1.5 bg-gray-50 dark:bg-zinc-800/60 rounded-xl">
                        <div className="text-[10px] text-gray-400 font-bold">🛺 E-Rickshaw</div>
                        <div className="font-extrabold text-[#007aff]">
                          {selectedMapVendorLive.liveDistance.rickshawMins} min
                        </div>
                      </div>
                      <div className="p-1.5 bg-gray-50 dark:bg-zinc-800/60 rounded-xl">
                        <div className="text-[10px] text-gray-400 font-bold">🚲 Cycling</div>
                        <div className="font-extrabold text-emerald-600 dark:text-emerald-400">
                          {selectedMapVendorLive.liveDistance.cyclingMins} min
                        </div>
                      </div>
                    </div>

                    {/* Landmark Route Tip */}
                    <div className="text-[11px] text-gray-600 dark:text-gray-300 bg-blue-50/60 dark:bg-blue-950/40 p-2 rounded-xl border border-blue-200/50 dark:border-blue-800/30">
                      <strong>📍 Route guidance:</strong> {selectedMapVendorLive.distanceAnalysis.routeTip}
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRestaurant(selectedMapVendor);
                          setSheetOpened(true);
                        }}
                        className="py-2 px-3 rounded-xl bg-[#007aff] hover:bg-blue-600 text-white font-bold text-xs active:scale-95 transition-all cursor-pointer border-0 text-center"
                      >
                        Inspect 5 Pillars
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setReviewRestaurant(selectedMapVendor);
                          setBillAmount(String(selectedMapVendor.priceForTwo));
                          setActiveTab('earn');
                          setEarnSubView('new_review');
                        }}
                        className="py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs active:scale-95 transition-all cursor-pointer border-0 text-center"
                      >
                        Upload Bill (+15%)
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* 
              ===================================================================
              DISTANCE MATRIX & TRAVEL TIME TABLE
              - Exhaustive spatial breakdown of every kitchen in Katihar
              ===================================================================
            */}
            <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl p-5 sm:p-6 border border-black/5 dark:border-white/10 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                    Spatial Distance Matrix from {selectedLocality.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Sorted by physical proximity. All travel times dynamically recalibrated from your active pin.
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800/40 self-start sm:self-auto">
                  ✓ Trigonometrically Verified
                </span>
              </div>

              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-zinc-800 text-[10px] uppercase font-extrabold text-gray-400 tracking-wider">
                      <th className="py-2.5 px-3">Rank & Kitchen</th>
                      <th className="py-2.5 px-3">Distance</th>
                      <th className="py-2.5 px-3">Walking (@ 4.8 km/h)</th>
                      <th className="py-2.5 px-3">E-Rickshaw (@ 18 km/h)</th>
                      <th className="py-2.5 px-3">5-Pillar Score</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                    {[...vendorsWithLiveDistance]
                      .sort((a, b) => a.liveDistance.distanceKm - b.liveDistance.distanceKm)
                      .map((v, idx) => {
                        const isSelected = selectedMapVendor.id === v.id;
                        return (
                          <tr
                            key={v.id}
                            onClick={() => {
                              setSelectedMapVendor(v);
                              triggerToast(`Selected: ${v.name}`);
                            }}
                            className={`hover:bg-gray-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors ${
                              isSelected ? 'bg-blue-50/60 dark:bg-blue-950/30' : ''
                            }`}
                          >
                            <td className="py-3 px-3">
                              <div className="flex items-center space-x-2.5">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-[10px] ${
                                  idx === 0
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300'
                                }`}>
                                  #{idx + 1}
                                </span>
                                <div>
                                  <div className="font-bold text-gray-900 dark:text-white flex items-center space-x-1.5">
                                    <span>{v.name}</span>
                                    {isSelected && <span className="text-[#007aff] text-[10px]">● Active</span>}
                                  </div>
                                  <div className="text-[10px] text-gray-400">{v.locality} • {v.category}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3 font-black text-gray-900 dark:text-white">
                              {v.liveDistance.distanceKm} km
                            </td>
                            <td className="py-3 px-3 font-semibold text-gray-700 dark:text-gray-300">
                              🚶 {v.liveDistance.walkingMins} mins
                            </td>
                            <td className="py-3 px-3 font-semibold text-[#007aff]">
                              🛺 {v.liveDistance.rickshawMins} mins
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center space-x-1.5">
                                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                  {v.fivePillars.sanitation.grade}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                  ({v.fivePillars.quantity.avgPortionGrams})
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedRestaurant(v);
                                  setSheetOpened(true);
                                }}
                                className="px-3 py-1 rounded-full bg-gray-100 dark:bg-zinc-800 hover:bg-[#007aff] hover:text-white text-gray-800 dark:text-gray-200 font-bold text-[11px] transition-colors cursor-pointer border-0"
                              >
                                Audit
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* =============================================================== */}
        {/* TAB 4: HEALTH PASS & PREFERENCES                                */}
        {/* =============================================================== */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto space-y-6">
            {user ? (
              <>
                {/* Active Apple Citizen Pass Card */}
                <div className="p-5 bg-white dark:bg-[#1c1c1e] rounded-3xl border border-black/5 dark:border-white/10 shadow-xs space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#007aff] to-purple-500 text-white flex items-center justify-center text-xl font-black shadow-sm">
                      {user.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-base text-gray-900 dark:text-white truncate">{user.name}</h3>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500 text-white shrink-0">
                          {user.passType}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5 mt-0.5">
                        <Smartphone className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs font-mono font-medium text-gray-600 dark:text-gray-300">
                          {user.phone}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 px-1.5 py-0.2 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center space-x-1">
                          <Check className="w-2.5 h-2.5" />
                          <span>OTP Verified</span>
                        </span>
                      </div>
                      <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                        ✓ {user.cleanFoodScore}% Clean Food Record • Member since {user.joinedDate}
                      </div>
                    </div>
                  </div>

                  {/* Account Action Buttons */}
                  <div className="flex items-center space-x-2 pt-2 border-t border-gray-100 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => {
                        setIsLoginModalOpen(true);
                        setLoginStep('phone');
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-200 font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer border-0"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Switch Phone</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="py-2 px-4 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-600 dark:text-red-400 font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer border-0"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>

                {/* EatRight Citizen Wallet Card */}
                <div className="p-5 bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl shadow-md space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Wallet className="w-5 h-5 text-emerald-200" />
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">EatRight Citizen Wallet</span>
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white/20 text-white">
                      Instant Payout
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="text-2xl sm:text-3xl font-black tracking-tight">₹{user.walletBalance.toFixed(2)}</div>
                      <div className="text-[11px] text-emerald-100">Available balance from approved vendor bills</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold">{user.upiId}</div>
                      <div className="text-[10px] text-emerald-200">Auto-deposit enabled</div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Logged Out State Card */
              <div className="p-6 bg-white dark:bg-[#1c1c1e] rounded-3xl border border-black/5 dark:border-white/10 text-center space-y-4 shadow-xs">
                <div className="w-16 h-16 rounded-3xl bg-[#007aff]/10 text-[#007aff] flex items-center justify-center mx-auto">
                  <Smartphone className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900 dark:text-white">Sign In with Mobile Number</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
                    Verify your phone number to activate your Katihar Citizen Pass, earn up to 15% cashback on street food slips, and track food safety records.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsLoginModalOpen(true);
                    setLoginStep('phone');
                  }}
                  className="px-6 py-3 rounded-full bg-[#007aff] hover:bg-[#0062cc] text-white font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer border-0 inline-flex items-center space-x-2"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Sign In with Phone</span>
                </button>
              </div>
            )}

            {/* Minimalist Apple Preference List */}
            <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl overflow-hidden border border-black/5 dark:border-white/10 divide-y divide-gray-100 dark:divide-zinc-800">
              <div className="p-4 flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-xs text-gray-900 dark:text-white">Pure Vegetarian Only</h5>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">Hide meat and egg dishes</p>
                </div>
                <AppleToggle
                  checked={pureVegOnly}
                  onChange={(val) => {
                    setPureVegOnly(val);
                    triggerToast(val ? 'Pure Veg only' : 'Showing all foods');
                  }}
                />
              </div>

              <div className="p-4 flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-xs text-gray-900 dark:text-white">Low-Oil & Fresh Batch</h5>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">Only vendors with Polar Compound &lt; 9%</p>
                </div>
                <AppleToggle
                  checked={lowOilOnly}
                  onChange={(val) => {
                    setLowOilOnly(val);
                    triggerToast(val ? 'Low oil filter on' : 'Filter off');
                  }}
                />
              </div>

              <div className="p-4 flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-xs text-gray-900 dark:text-white">100% Mineral Water Verified</h5>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">Filter for puchka & street drinks</p>
                </div>
                <AppleToggle
                  checked={roWaterOnly}
                  onChange={(val) => {
                    setRoWaterOnly(val);
                    triggerToast(val ? 'RO verified only' : 'Filter off');
                  }}
                />
              </div>

              <div className="p-4 flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-xs text-gray-900 dark:text-white">High Protein & Fitness</h5>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">Show high-protein & low glycemic options</p>
                </div>
                <AppleToggle
                  checked={highProteinOnly}
                  onChange={(val) => {
                    setHighProteinOnly(val);
                    triggerToast(val ? 'High protein on' : 'Filter off');
                  }}
                />
              </div>
            </div>
          </div>
        )}

      </main>

      {/* 
        =======================================================================
        MOBILE-ONLY BOTTOM iOS TABBAR (Bulletproof touch native navigation)
        =======================================================================
      */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-[#161618]/90 backdrop-blur-2xl border-t border-black/5 dark:border-white/10 px-3 py-2 flex items-center justify-around">
        <button
          type="button"
          onClick={() => setActiveTab('discover')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 transition-colors cursor-pointer active:scale-90 bg-transparent border-0 ${
            activeTab === 'discover' ? 'text-[#007aff]' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          <Utensils className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-1">Discover</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('map')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 transition-colors cursor-pointer active:scale-90 bg-transparent border-0 ${
            activeTab === 'map' ? 'text-[#007aff]' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-1">Map & Dist</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('safety')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 transition-colors cursor-pointer active:scale-90 bg-transparent border-0 ${
            activeTab === 'safety' ? 'text-[#007aff]' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          <ShieldCheck className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-1">5 Pillars</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('earn')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 transition-colors cursor-pointer active:scale-90 bg-transparent border-0 ${
            activeTab === 'earn' ? 'text-amber-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          <Coins className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-1">Earn ₹</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 transition-colors cursor-pointer active:scale-90 bg-transparent border-0 ${
            activeTab === 'profile' ? 'text-[#007aff]' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-1">Health Pass</span>
        </button>
      </nav>

      {/* 
        =======================================================================
        INTERACTIVE APPLE MAPS LOCATION MODAL (Katihar District & Pin Drop)
        - Vector Map of Katihar with Railway Lines, River, Roads & Landmarks
        - Interactive Click/Tap to Place Pin & Snap to Locality
        - Floating Apple Maps Callout Card
        - GPS Beacon & Recenter Controls
        =======================================================================
      */}
      {locationModalOpened && (
        <div
          onClick={() => setLocationModalOpened(false)}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md p-0 sm:p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-xl bg-white dark:bg-[#1c1c1e] rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl max-h-[92vh] flex flex-col cursor-default animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-base text-gray-900 dark:text-white">Choose Location</h3>
                  <span className="text-[10px] font-bold text-[#007aff] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/40">
                    Katihar Map
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Tap anywhere on the map or select a neighborhood to drop your pin
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLocationModalOpened(false)}
                className="w-7 h-7 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700 active:scale-90 cursor-pointer border-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Map Search & GPS Quick Actions */}
            <div className="mt-3 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={localitySearch}
                  onChange={(e) => setLocalitySearch(e.target.value)}
                  placeholder="Search Katihar neighborhood or landmark..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-100 dark:bg-zinc-800 text-xs outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 border border-transparent focus:border-[#007aff]"
                />
                {localitySearch && (
                  <button
                    type="button"
                    onClick={() => setLocalitySearch('')}
                    className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer bg-transparent border-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={isLocating}
                className="py-2 px-3 bg-[#007aff]/10 text-[#007aff] dark:bg-blue-950/60 dark:text-blue-300 rounded-xl flex items-center space-x-1.5 text-xs font-bold active:scale-95 transition-all cursor-pointer border border-[#007aff]/20 dark:border-blue-800/40 shrink-0"
                title="Align to Current GPS Location"
              >
                <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">GPS</span>
              </button>
            </div>

            {/* 
              ===================================================================
              INTERACTIVE APPLE MAPS VECTOR CANVAS
              - Real Katihar coordinates, roads, railways, water & stadiums
              ===================================================================
            */}
            <div className="mt-3 relative w-full h-56 sm:h-64 rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 select-none shadow-inner bg-[#eaf0f6] dark:bg-[#11171f]">
              
              {/* Map Layer Controls (Top Right Overlay) */}
              <div className="absolute top-2.5 right-2.5 z-20 flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => setMapViewMode((m) => (m === 'standard' ? 'satellite' : 'standard'))}
                  className="px-2 py-1 rounded-lg bg-white/90 dark:bg-[#1c1c1e]/90 backdrop-blur-md text-[10px] font-bold text-gray-700 dark:text-gray-200 border border-black/10 dark:border-white/10 shadow-xs cursor-pointer hover:bg-white dark:hover:bg-zinc-800 transition-colors flex items-center space-x-1"
                >
                  <Layers className="w-3 h-3 text-[#007aff]" />
                  <span>{mapViewMode === 'standard' ? 'Vector' : 'Satellite'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  className="w-7 h-7 rounded-lg bg-white/90 dark:bg-[#1c1c1e]/90 backdrop-blur-md text-gray-700 dark:text-gray-200 border border-black/10 dark:border-white/10 shadow-xs cursor-pointer hover:bg-white dark:hover:bg-zinc-800 transition-colors flex items-center justify-center"
                  title="Recenter Pin to GPS"
                >
                  <LocateFixed className="w-3.5 h-3.5 text-[#007aff]" />
                </button>
              </div>

              {/* Apple Maps Scale Indicator (Bottom Left Overlay) */}
              <div className="absolute bottom-2 left-2.5 z-20 pointer-events-none flex items-center space-x-1 text-[9px] font-semibold text-gray-500 dark:text-gray-400 bg-white/80 dark:bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-xs">
                <span>500 m</span>
                <span className="w-8 h-[2px] bg-gray-500 dark:bg-gray-400 inline-block" />
              </div>

              {/* SVG Vector Map Canvas (Clickable Area) */}
              <div
                onClick={handleMapCanvasClick}
                className="w-full h-full cursor-crosshair relative"
              >
                <svg
                  className="w-full h-full"
                  viewBox="0 0 500 320"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <defs>
                    <linearGradient id="pinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ff3b30" />
                      <stop offset="100%" stopColor="#d70015" />
                    </linearGradient>
                    <linearGradient id="beaconGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#007aff" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#007aff" stopOpacity="0" />
                    </linearGradient>
                    <pattern id="railSleepers" width="8" height="4" patternUnits="userSpaceOnUse">
                      <line x1="0" y1="2" x2="8" y2="2" stroke="#8e8e93" strokeWidth="1" strokeDasharray="2 2" />
                    </pattern>
                  </defs>

                  {/* Satellite or Clean Paper Background */}
                  <rect
                    width="500"
                    height="320"
                    fill={
                      mapViewMode === 'satellite'
                        ? '#0c1622'
                        : isDarkMode
                        ? '#12171f'
                        : '#e8edf3'
                    }
                  />

                  {/* Subtle Coordinate Grid Lines */}
                  <g opacity={isDarkMode ? '0.1' : '0.15'}>
                    <line x1="100" y1="0" x2="100" y2="320" stroke="currentColor" strokeWidth="1" />
                    <line x1="200" y1="0" x2="200" y2="320" stroke="currentColor" strokeWidth="1" />
                    <line x1="300" y1="0" x2="300" y2="320" stroke="currentColor" strokeWidth="1" />
                    <line x1="400" y1="0" x2="400" y2="320" stroke="currentColor" strokeWidth="1" />
                    <line x1="0" y1="80" x2="500" y2="80" stroke="currentColor" strokeWidth="1" />
                    <line x1="0" y1="160" x2="500" y2="160" stroke="currentColor" strokeWidth="1" />
                    <line x1="0" y1="240" x2="500" y2="240" stroke="currentColor" strokeWidth="1" />
                  </g>

                  {/* Water Feature: Koshi River Canal (Curving Western Ribbon) */}
                  <g>
                    <path
                      d="M 50,0 C 70,60 110,130 80,200 C 60,260 85,295 75,320"
                      stroke={isDarkMode ? '#1e3a5f' : '#8cc0f0'}
                      strokeWidth="22"
                      strokeLinecap="round"
                      fill="none"
                      opacity="0.5"
                    />
                    <path
                      d="M 50,0 C 70,60 110,130 80,200 C 60,260 85,295 75,320"
                      stroke={isDarkMode ? '#2d5c96' : '#60a5fa'}
                      strokeWidth="8"
                      strokeLinecap="round"
                      fill="none"
                      opacity="0.7"
                    />
                    <text
                      x="92"
                      y="150"
                      transform="rotate(65 92 150)"
                      className="text-[8px] font-bold fill-blue-600 dark:fill-blue-400 opacity-60"
                    >
                      KOSHI CANAL
                    </text>
                  </g>

                  {/* Green Zones: Rajendra Stadium & Sports Ground */}
                  <g>
                    <rect
                      x="185"
                      y="45"
                      width="90"
                      height="65"
                      rx="8"
                      fill={isDarkMode ? '#173322' : '#bce3be'}
                      opacity="0.5"
                    />
                    <ellipse
                      cx="230"
                      cy="77"
                      rx="30"
                      ry="18"
                      fill="none"
                      stroke={isDarkMode ? '#285e3c' : '#7cb87e'}
                      strokeWidth="2"
                      strokeDasharray="3 2"
                    />
                    <text
                      x="230"
                      y="80"
                      textAnchor="middle"
                      className="text-[8px] font-bold fill-emerald-700 dark:fill-emerald-400 opacity-80"
                    >
                      🏟️ Rajendra Stadium
                    </text>
                  </g>

                  {/* Green Zones: Railway Colony Officers Park */}
                  <g>
                    <rect
                      x="340"
                      y="25"
                      width="75"
                      height="45"
                      rx="6"
                      fill={isDarkMode ? '#173322' : '#bce3be'}
                      opacity="0.45"
                    />
                    <text
                      x="377"
                      y="48"
                      textAnchor="middle"
                      className="text-[8px] font-bold fill-emerald-700 dark:fill-emerald-400 opacity-70"
                    >
                      🌳 Colony Park
                    </text>
                  </g>

                  {/* Railway Lines: Katihar Junction Main Tracks */}
                  <g>
                    {/* Main Line Bed */}
                    <path
                      d="M 0,65 Q 180,82 370,72 T 500,60"
                      stroke={isDarkMode ? '#3a3a3c' : '#9ca3af'}
                      strokeWidth="4.5"
                      fill="none"
                    />
                    {/* Railway Sleepers Cross Ties */}
                    <path
                      d="M 0,65 Q 180,82 370,72 T 500,60"
                      stroke={isDarkMode ? '#8e8e93' : '#4b5563'}
                      strokeWidth="4.5"
                      strokeDasharray="2 4"
                      fill="none"
                    />
                    {/* South Junction Branch */}
                    <path
                      d="M 370,72 Q 395,160 415,320"
                      stroke={isDarkMode ? '#3a3a3c' : '#9ca3af'}
                      strokeWidth="3.5"
                      fill="none"
                    />
                    <path
                      d="M 370,72 Q 395,160 415,320"
                      stroke={isDarkMode ? '#8e8e93' : '#4b5563'}
                      strokeWidth="3.5"
                      strokeDasharray="2 4"
                      fill="none"
                    />
                    {/* Katihar Junction Badge */}
                    <g transform="translate(350, 60)">
                      <rect
                        x="0"
                        y="0"
                        width="80"
                        height="18"
                        rx="9"
                        fill={isDarkMode ? '#2c2c2e' : '#ffffff'}
                        stroke="#8e8e93"
                        strokeWidth="0.8"
                      />
                      <text
                        x="40"
                        y="12"
                        textAnchor="middle"
                        className="text-[8px] font-black fill-gray-900 dark:fill-white"
                      >
                        🚂 Katihar Jn
                      </text>
                    </g>
                  </g>

                  {/* Road Network (Casing + Crisp Surface) */}
                  <g>
                    {/* NH 31 Arterial Bypass Highway */}
                    <path
                      d="M 30,310 Q 110,240 210,195 Q 260,165 230,85 Q 215,30 200,0"
                      stroke={isDarkMode ? '#242b35' : '#cbd5e1'}
                      strokeWidth="11"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d="M 30,310 Q 110,240 210,195 Q 260,165 230,85 Q 215,30 200,0"
                      stroke={isDarkMode ? '#1a222d' : '#ffffff'}
                      strokeWidth="7"
                      strokeLinecap="round"
                      fill="none"
                    />

                    {/* MG Road Main Commercial Corridor */}
                    <path
                      d="M 70,165 L 450,165"
                      stroke={isDarkMode ? '#242b35' : '#cbd5e1'}
                      strokeWidth="10"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d="M 70,165 L 450,165"
                      stroke={isDarkMode ? '#1a222d' : '#ffffff'}
                      strokeWidth="6"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <text
                      x="160"
                      y="161"
                      className="text-[8px] font-black fill-gray-500 dark:fill-gray-400 opacity-60 tracking-wider"
                    >
                      MG ROAD
                    </text>

                    {/* Station Link Road */}
                    <path
                      d="M 260,165 L 365,75"
                      stroke={isDarkMode ? '#242b35' : '#cbd5e1'}
                      strokeWidth="8"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d="M 260,165 L 365,75"
                      stroke={isDarkMode ? '#1a222d' : '#ffffff'}
                      strokeWidth="5"
                      strokeLinecap="round"
                      fill="none"
                    />

                    {/* Bara Bazar & Amlatola Connectors */}
                    <path
                      d="M 210,195 L 320,185 L 410,145"
                      stroke={isDarkMode ? '#1a222d' : '#ffffff'}
                      strokeWidth="5"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d="M 150,225 L 210,195"
                      stroke={isDarkMode ? '#1a222d' : '#ffffff'}
                      strokeWidth="4.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </g>
                </svg>

                {/* 
                  ===============================================================
                  HTML OVERLAYS: Locality Pin Discs on the Map
                  ===============================================================
                */}
                {filteredLocalities.map((loc) => {
                  const isCurrent = selectedLocality.id === loc.id;
                  return (
                    <div
                      key={loc.id}
                      onClick={(e) => handleLocalityMarkerClick(loc, e)}
                      style={{ left: `${loc.mapX}%`, top: `${loc.mapY}%` }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 transition-transform hover:scale-125 ${
                        isCurrent ? 'scale-110 z-20' : ''
                      }`}
                      title={`${loc.name} (${loc.distanceKm} km)`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shadow-md transition-all ${
                          isCurrent
                            ? 'bg-[#007aff] text-white ring-4 ring-[#007aff]/30'
                            : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-200 border border-black/10 dark:border-white/20 hover:bg-blue-50'
                        }`}
                      >
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                      <span className={`absolute top-full mt-0.5 left-1/2 -translate-x-1/2 text-[9px] font-bold px-1.5 py-0.2 rounded-full whitespace-nowrap shadow-2xs pointer-events-none ${
                        isCurrent
                          ? 'bg-[#007aff] text-white'
                          : 'bg-white/90 dark:bg-zinc-900/90 text-gray-800 dark:text-gray-200 border border-black/5 dark:border-white/10'
                      }`}>
                        {loc.name}
                      </span>
                    </div>
                  );
                })}

                {/* 
                  ===============================================================
                  GPS BEACON (Pulsing blue radar indicating user's current GPS)
                  ===============================================================
                */}
                <div
                  style={{ left: '46%', top: '26%' }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 flex items-center justify-center"
                >
                  <span className="w-7 h-7 rounded-full bg-[#007aff]/30 animate-ping absolute" />
                  <span className="w-3.5 h-3.5 rounded-full bg-[#007aff] border-2 border-white shadow-md relative" />
                </div>

                {/* 
                  ===============================================================
                  THE ACTIVE DROPPED PIN (Apple Teardrop Red Pin + Drop Shadow)
                  ===============================================================
                */}
                <div
                  style={{ left: `${mapPinCoords.x}%`, top: `${mapPinCoords.y}%` }}
                  className="absolute pointer-events-none -translate-x-1/2 -translate-y-full z-30 transition-all duration-300 ease-out"
                >
                  {/* Pin Drop Teardrop Shape */}
                  <div className="relative flex flex-col items-center">
                    <svg
                      width="32"
                      height="40"
                      viewBox="0 0 32 40"
                      className="drop-shadow-lg animate-bounce"
                      style={{ animationDuration: '1.4s' }}
                    >
                      <path
                        d="M16 0C7.16 0 0 7.16 0 16c0 11.2 16 24 16 24s16-12.8 16-24C32 7.16 24.84 0 16 0z"
                        fill="url(#pinGradient)"
                      />
                      <circle cx="16" cy="15" r="5.5" fill="#ffffff" />
                      <circle cx="16" cy="15" r="2.5" fill="#d70015" />
                    </svg>

                    {/* Pin Contact Shadow */}
                    <div className="w-3.5 h-1 rounded-full bg-black/40 blur-[1px] -mt-1" />
                  </div>

                  {/* Floating Apple Maps Callout Card */}
                  {showMapCallout && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-40 pointer-events-auto">
                      <div className="px-3 py-1.5 rounded-2xl bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-md border border-black/10 dark:border-white/15 shadow-xl flex items-center space-x-2 whitespace-nowrap animate-in fade-in zoom-in-95 duration-150">
                        <div className="text-left">
                          <div className="font-extrabold text-[11px] text-gray-900 dark:text-white flex items-center space-x-1">
                            <span>{selectedLocality.name}</span>
                            <span className="text-[#007aff] text-[10px]">✓</span>
                          </div>
                          <div className="text-[9px] text-gray-500 dark:text-gray-400">
                            {selectedLocality.distanceKm} km • {selectedLocality.vettedStallsCount} clean kitchens
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setLocationModalOpened(false);
                            triggerToast(`Delivering to ${selectedLocality.name}`);
                          }}
                          className="px-2.5 py-1 rounded-xl bg-[#007aff] text-white font-bold text-[10px] active:scale-95 cursor-pointer border-0 shadow-2xs hover:bg-[#0062cc]"
                        >
                          Select
                        </button>
                      </div>
                      {/* Downward triangle arrow */}
                      <div className="w-0 h-0 border-x-4 border-x-transparent border-t-5 border-t-white dark:border-t-[#1c1c1e] mx-auto -mt-0.5" />
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Neighborhoods List below Map */}
            <div className="mt-3 overflow-y-auto no-scrollbar space-y-1.5 flex-1 max-h-48 divide-y divide-gray-100 dark:divide-zinc-800">
              {filteredLocalities.map((loc) => {
                const isCurrent = selectedLocality.id === loc.id;
                return (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => {
                      setSelectedLocality(loc);
                      setMapPinCoords({ x: loc.mapX, y: loc.mapY });
                      setShowMapCallout(true);
                      triggerToast(`Pinned to ${loc.name}`);
                    }}
                    className={`w-full p-2.5 rounded-2xl text-left flex items-center justify-between transition-colors cursor-pointer border-0 ${
                      isCurrent
                        ? 'bg-blue-50 dark:bg-blue-950/50 border border-[#007aff]/30 dark:border-blue-700/50'
                        : 'bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                        isCurrent
                          ? 'bg-[#007aff] text-white shadow-xs'
                          : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300'
                      }`}>
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-gray-900 dark:text-white flex items-center space-x-1.5">
                          <span className="truncate">{loc.name}</span>
                          {isCurrent && <span className="text-[#007aff] font-bold text-[10px]">✓ Active Pin</span>}
                        </div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                          {loc.landmark} • {loc.vettedStallsCount} vetted stalls
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold shrink-0 ml-2">
                      {loc.distanceKm} km
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Confirm Location Pill */}
            <div className="pt-3 border-t border-gray-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  setLocationModalOpened(false);
                  triggerToast(`Location set to ${selectedLocality.name}`);
                }}
                className="w-full py-3 rounded-full bg-[#007aff] hover:bg-[#0062cc] text-white font-bold text-xs shadow-md active:scale-98 transition-all cursor-pointer border-0 flex items-center justify-center space-x-2"
              >
                <Check className="w-4 h-4" />
                <span>Confirm {selectedLocality.name} ({selectedLocality.distanceKm} km)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 
        =======================================================================
        APPLE iOS MOBILE NUMBER LOGIN MODAL (SMS OTP Authentication)
        - Step 1: Mobile Phone Number (+91) with 1-Tap Demo Login
        - Step 2: 4-Digit OTP Boxes with Autofocus, Timer & Auto-Fill
        - Step 3: Success Animation & Persistent User Session
        =======================================================================
      */}
      {isLoginModalOpen && (
        <div
          onClick={() => setIsLoginModalOpen(false)}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md p-0 sm:p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-md bg-white dark:bg-[#1c1c1e] rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl max-h-[90vh] flex flex-col cursor-default animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-[#007aff]/10 text-[#007aff] flex items-center justify-center font-bold">
                  <Smartphone className="w-4.5 h-4.5" />
                </div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white">
                  {loginStep === 'phone' ? 'Sign In with Mobile' : loginStep === 'otp' ? 'Verification Code' : 'Success!'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700 active:scale-90 cursor-pointer border-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* STEP 1: Enter Mobile Number */}
            {loginStep === 'phone' && (
              <form onSubmit={handleRequestOtp} className="mt-4 space-y-4">
                <div>
                  <h4 className="font-black text-lg text-gray-900 dark:text-white">Welcome to EatRight</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Enter your mobile number to access verified kitchens and claim 15% cashback on your food bills.
                  </p>
                </div>

                {/* Mobile Phone Input Box */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Mobile Number
                  </label>
                  <div className="flex items-center rounded-2xl bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 focus-within:border-[#007aff] focus-within:bg-white dark:focus-within:bg-zinc-900 transition-all p-1">
                    <span className="px-3 py-2 text-xs font-bold text-gray-600 dark:text-gray-300 border-r border-gray-200 dark:border-zinc-700 select-none flex items-center space-x-1.5">
                      <span>🇮🇳</span>
                      <span>+91</span>
                    </span>
                    <input
                      type="tel"
                      value={loginPhone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setLoginPhone(val);
                        if (loginError) setLoginError(null);
                      }}
                      placeholder="98765 43210"
                      maxLength={10}
                      autoFocus
                      className="w-full px-3 py-2.5 bg-transparent text-sm font-semibold outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-mono tracking-wider"
                    />
                    {loginPhone && (
                      <button
                        type="button"
                        onClick={() => setLoginPhone('')}
                        className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer bg-transparent border-0 mr-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  {loginError && (
                    <p className="text-[11px] font-semibold text-red-500 mt-1.5 flex items-center space-x-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{loginError}</span>
                    </p>
                  )}
                </div>

                {/* Primary Action: Get OTP */}
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-[#007aff] hover:bg-[#0062cc] text-white font-bold text-xs shadow-md active:scale-98 transition-all cursor-pointer border-0 flex items-center justify-center space-x-2"
                >
                  <span>Continue with SMS OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* 1-Tap Demo Login Button */}
                <div className="pt-2">
                  <div className="relative flex items-center justify-center mb-3">
                    <div className="w-full border-t border-gray-100 dark:border-zinc-800" />
                    <span className="absolute bg-white dark:bg-[#1c1c1e] px-2 text-[10px] text-gray-400 uppercase font-semibold">
                      Or instant test
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleDemoLogin}
                    className="w-full py-2.5 px-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold text-xs flex items-center justify-center space-x-2 active:scale-98 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                    <span>⚡ 1-Tap Demo Login (Nilesh Kumar)</span>
                  </button>
                </div>

                <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center pt-1">
                  We will send a 4-digit SMS OTP to verify your account. Standard SMS rates may apply.
                </p>
              </form>
            )}

            {/* STEP 2: Enter 4-Digit OTP Code */}
            {loginStep === 'otp' && (
              <form onSubmit={handleVerifyOtp} className="mt-4 space-y-4">
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginStep('phone');
                      setLoginError(null);
                    }}
                    className="text-xs font-semibold text-[#007aff] hover:underline flex items-center space-x-1 cursor-pointer bg-transparent border-0 p-0 mb-1"
                  >
                    <span>← Change Phone Number</span>
                  </button>
                  <h4 className="font-black text-lg text-gray-900 dark:text-white">Enter 4-Digit Code</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Sent via SMS to <span className="font-mono font-bold text-gray-800 dark:text-gray-200">+91 {loginPhone}</span>
                  </p>
                </div>

                {/* 4 Digit Boxes */}
                <div className="flex items-center justify-center gap-3 py-2">
                  {[0, 1, 2, 3].map((idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputsRef.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={loginOtp[idx]}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={handleOtpPaste}
                      className="w-13 h-14 sm:w-14 sm:h-16 text-center text-2xl font-black font-mono rounded-2xl bg-gray-100 dark:bg-zinc-800 border-2 border-transparent focus:border-[#007aff] focus:bg-white dark:focus:bg-zinc-900 outline-none transition-all text-gray-900 dark:text-white shadow-xs"
                    />
                  ))}
                </div>

                {loginError && (
                  <p className="text-[11px] font-semibold text-red-500 text-center flex items-center justify-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{loginError}</span>
                  </p>
                )}

                {/* Auto-Fill Demo OTP Pill */}
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginOtp(['1', '2', '3', '4']);
                      setLoginError(null);
                      triggerToast('Filled Demo OTP: 1234');
                    }}
                    className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 text-[#007aff] text-[11px] font-bold border border-blue-200/60 dark:border-blue-800/40 hover:bg-blue-100 cursor-pointer active:scale-95 transition-all"
                  >
                    💡 Auto-fill Demo OTP (1234)
                  </button>
                </div>

                {/* Verify Button */}
                <button
                  type="submit"
                  disabled={isVerifyingOtp}
                  className="w-full py-3.5 rounded-2xl bg-[#007aff] hover:bg-[#0062cc] text-white font-bold text-xs shadow-md active:scale-98 transition-all cursor-pointer border-0 flex items-center justify-center space-x-2"
                >
                  {isVerifyingOtp ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Verify & Sign In</span>
                    </>
                  )}
                </button>

                {/* Resend OTP Timer */}
                <div className="text-center text-xs text-gray-500 dark:text-gray-400 pt-1">
                  {otpCountdown > 0 ? (
                    <span>Resend SMS code in <strong className="font-mono text-gray-900 dark:text-white">{otpCountdown}s</strong></span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setOtpCountdown(30);
                        triggerToast('New OTP sent via SMS');
                      }}
                      className="text-[#007aff] font-bold hover:underline cursor-pointer bg-transparent border-0"
                    >
                      Resend SMS Code Now
                    </button>
                  )}
                </div>
              </form>
            )}

            {/* STEP 3: Verification Success */}
            {loginStep === 'success' && (
              <div className="py-8 text-center space-y-3 animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg animate-bounce">
                  <Check className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-black text-lg text-gray-900 dark:text-white">Verification Successful!</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Welcome back, {user ? user.name : 'Citizen'}. Your Health Pass and 15% cashback are active.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 
        =======================================================================
        APPLE BOTTOM SHEET: RESTAURANT & AUDIT DEEP-DIVE
        - Backdrop tap closes sheet!
        =======================================================================
      */}
      {sheetOpened && selectedRestaurant && (
        <div
          onClick={() => setSheetOpened(false)}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-white dark:bg-[#1c1c1e] rounded-t-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl cursor-default text-gray-900 dark:text-white"
          >
            {/* Grabber */}
            <div className="pt-2.5 pb-1 flex justify-center">
              <div className="w-10 h-1.5 bg-gray-300 dark:bg-zinc-700 rounded-full" />
            </div>

            {/* Cover Image & Header */}
            <div className="relative h-44 w-full overflow-hidden bg-black shrink-0">
              <img
                src={selectedRestaurant.image}
                alt={selectedRestaurant.name}
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
                className="w-full h-full object-cover opacity-85"
              />
              <span className="absolute inset-0 flex items-center justify-center text-6xl opacity-30 pointer-events-none">
                {selectedRestaurant.emoji}
              </span>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex flex-col justify-between text-white">
                <div className="flex justify-between items-start">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/20 backdrop-blur-md">
                    {selectedRestaurant.category}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSheetOpened(false)}
                    className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white active:scale-95 cursor-pointer border-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <h3 className="font-extrabold text-lg leading-tight text-white">{selectedRestaurant.name}</h3>
                  <p className="text-xs text-gray-200 mt-0.5">{selectedRestaurant.address}</p>
                </div>
              </div>
            </div>

            {/* Scrollable Content inside Sheet */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1 no-scrollbar pb-10">
              
              {/* Top 5-Pillar Audit Summary Banner */}
              <div className="bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 dark:from-emerald-950/40 dark:via-blue-950/30 dark:to-purple-950/30 p-4 sm:p-5 rounded-3xl border border-emerald-500/20 dark:border-emerald-800/40 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-black text-emerald-800 dark:text-emerald-300">
                      5-Pillar Verified Audit: Grade {selectedRestaurant.fivePillars.sanitation.grade}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-500 text-white">
                      {selectedRestaurant.hygiene.score}/100
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-600 dark:text-gray-300 mt-1">
                    📍 {selectedRestaurant.locality} • {selectedRestaurant.distanceAnalysis.routeTip}
                  </div>
                  <div className="text-[10px] font-mono text-gray-500 dark:text-gray-400 mt-0.5">
                    FSSAI: {selectedRestaurant.fivePillars.sanitation.fssaiLicense} • Last Audited: {selectedRestaurant.hygiene.oilQuality.reuseLimit}
                  </div>
                </div>
                <AppleScoreRing score={selectedRestaurant.hygiene.score} size={48} />
              </div>

              {/* 5 Pillars Deep-Dive Grid */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  5-Pillar Laboratory & Street Inspection
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  
                  {/* Pillar 1: Sanitation */}
                  <div className="p-3 bg-gray-50 dark:bg-zinc-900/60 rounded-2xl border border-gray-100 dark:border-zinc-800">
                    <div className="font-bold text-gray-900 dark:text-white flex items-center space-x-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span>1. Sanitation & Hygiene</span>
                    </div>
                    <div className="text-[11px] text-gray-600 dark:text-gray-300 mt-1 space-y-0.5">
                      <div>Oil Polar: <strong>{selectedRestaurant.fivePillars.sanitation.polarCompound}</strong></div>
                      <div>Water: <strong>{selectedRestaurant.hygiene.waterQuality.type}</strong> ({selectedRestaurant.fivePillars.sanitation.waterTds})</div>
                      <div>Compliance: <strong>{selectedRestaurant.fivePillars.sanitation.glovesWorn ? 'Gloves & Caps Enforced' : 'Standard'}</strong></div>
                    </div>
                  </div>

                  {/* Pillar 2: Quantity */}
                  <div className="p-3 bg-gray-50 dark:bg-zinc-900/60 rounded-2xl border border-gray-100 dark:border-zinc-800">
                    <div className="font-bold text-gray-900 dark:text-white flex items-center space-x-1.5">
                      <Scale className="w-4 h-4 text-purple-500" />
                      <span>2. Food Quantity</span>
                    </div>
                    <div className="text-[11px] text-gray-600 dark:text-gray-300 mt-1 space-y-0.5">
                      <div>Standard Plate: <strong>{selectedRestaurant.fivePillars.quantity.avgPortionGrams}</strong></div>
                      <div>Satiety Rating: <strong>{selectedRestaurant.fivePillars.quantity.hungerFill}</strong></div>
                      <div>Value Ratio: <strong>{selectedRestaurant.fivePillars.quantity.gramsPerRupee}</strong></div>
                    </div>
                  </div>

                  {/* Pillar 3: Quality */}
                  <div className="p-3 bg-gray-50 dark:bg-zinc-900/60 rounded-2xl border border-gray-100 dark:border-zinc-800">
                    <div className="font-bold text-gray-900 dark:text-white flex items-center space-x-1.5">
                      <Droplets className="w-4 h-4 text-blue-500" />
                      <span>3. Food Quality</span>
                    </div>
                    <div className="text-[11px] text-gray-600 dark:text-gray-300 mt-1 space-y-0.5">
                      <div>Fat Source: <strong>{selectedRestaurant.fivePillars.quality.fatSource}</strong></div>
                      <div>Purity Standard: <strong>{selectedRestaurant.fivePillars.quality.purityBadge}</strong></div>
                      <div>Spices: <strong>{selectedRestaurant.fivePillars.quality.spiceSource}</strong></div>
                    </div>
                  </div>

                  {/* Pillar 4: Process */}
                  <div className="p-3 bg-gray-50 dark:bg-zinc-900/60 rounded-2xl border border-gray-100 dark:border-zinc-800">
                    <div className="font-bold text-gray-900 dark:text-white flex items-center space-x-1.5">
                      <Flame className="w-4 h-4 text-amber-500" />
                      <span>4. Food Process</span>
                    </div>
                    <div className="text-[11px] text-gray-600 dark:text-gray-300 mt-1 space-y-0.5">
                      <div>Cookware: <strong>{selectedRestaurant.fivePillars.process.cookware}</strong></div>
                      <div>Method: <strong>{selectedRestaurant.fivePillars.process.method}</strong></div>
                      <div>Oil Discard: <strong>{selectedRestaurant.fivePillars.process.oilCycle}</strong></div>
                    </div>
                  </div>

                </div>

                {/* Pillar 5: Price Banner */}
                <div className="p-3 bg-gray-50 dark:bg-zinc-900/60 rounded-2xl border border-gray-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-gray-900 dark:text-white flex items-center space-x-1">
                      <Coins className="w-3.5 h-3.5 text-indigo-500" />
                      <span>5. Fair Physical Stall Pricing:</span>
                    </span>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 block">
                      Direct vendor rates with 0% platform markups or hidden fees.
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-sm text-emerald-600 dark:text-emerald-400">
                      ₹{selectedRestaurant.priceForTwo} for 2
                    </span>
                    <span className="block text-[9px] text-gray-400 font-mono">STREET PRICE</span>
                  </div>
                </div>
              </div>

              {/* Earn Cashback on Bill Banner */}
              <button
                type="button"
                onClick={() => {
                  setSheetOpened(false);
                  setReviewRestaurant(selectedRestaurant);
                  setBillAmount(String(selectedRestaurant.priceForTwo));
                  setSlipOcrResult({
                    merchant: selectedRestaurant.name,
                    date: 'Today, 12:45 PM',
                    amount: selectedRestaurant.priceForTwo,
                    valid: true,
                  });
                  setActiveTab('earn');
                  setEarnSubView('new_review');
                }}
                className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-amber-950/40 border border-amber-500/30 flex items-center justify-between text-left cursor-pointer transition-all active:scale-98"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-extrabold text-xs text-gray-900 dark:text-white flex items-center space-x-1.5">
                      <span>Dined Here? Upload Slip</span>
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-amber-500 text-white">
                        15% CASHBACK
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400">
                      Submit shop bill & rate 4 hygiene pillars to earn instant UPI cashback
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-500" />
              </button>

              {/* Verified Offerings with Gram Portions (No Ordering) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    Verified Offerings & Portion Scales
                  </h4>
                  <span className="text-[10px] font-semibold text-gray-400">
                    Physical Stall Menu
                  </span>
                </div>

                <div className="space-y-2.5">
                  {selectedRestaurant.menu.map((dish) => (
                    <div
                      key={dish.id}
                      className="p-3.5 bg-gray-50 dark:bg-zinc-900/60 rounded-3xl border border-gray-100 dark:border-zinc-800 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3 flex-1 pr-3">
                        <img
                          src={dish.image}
                          alt={dish.name}
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                          className="w-12 h-12 rounded-2xl object-cover shrink-0"
                        />
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span
                              className={`w-2 h-2 rounded-full ${dish.isVeg ? 'bg-emerald-500' : 'bg-red-500'}`}
                            />
                            <h5 className="font-bold text-xs text-gray-900 dark:text-white leading-tight">
                              {dish.name}
                            </h5>
                          </div>
                          <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                            {dish.calories} • {dish.healthHighlight}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs font-black text-gray-900 dark:text-white">
                          ₹{dish.price}
                        </div>
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/40">
                          ⚖️ {dish.portionGrams}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Actions: Locate on Map & Done */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMapVendor(selectedRestaurant);
                    setSheetOpened(false);
                    setActiveTab('map');
                    triggerToast(`Showing ${selectedRestaurant.name} on Spatial Map`);
                  }}
                  className="py-3 rounded-full bg-[#007aff] hover:bg-blue-600 text-white font-bold text-xs active:scale-98 transition-all cursor-pointer border-0 flex items-center justify-center space-x-1.5 shadow-xs"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Locate on Spatial Map</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSheetOpened(false)}
                  className="py-3 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 font-semibold text-xs active:scale-98 transition-all cursor-pointer border-0"
                >
                  Done
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 
        =======================================================================
        REPORT STALL MODAL
        - Backdrop tap closes modal!
        =======================================================================
      */}
      {reportModalOpened && (
        <div
          onClick={() => setReportModalOpened(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white dark:bg-[#1c1c1e] rounded-3xl p-5 shadow-2xl space-y-3 cursor-default text-gray-900 dark:text-white"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">Nominate a Street Cart</h3>
              <button
                type="button"
                onClick={() => setReportModalOpened(false)}
                className="w-6 h-6 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-500 dark:text-gray-400 cursor-pointer border-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Help our field team inspect local vendors in Katihar for free.
            </p>
            <input
              type="text"
              placeholder="Vendor Name or Landmark..."
              value={reportVendorName}
              onChange={(e) => setReportVendorName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-gray-100 dark:bg-zinc-800 text-xs outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 border border-transparent focus:border-[#007aff]"
            />
            <textarea
              placeholder="Observation (oil condition, clean water, or recommend for award)..."
              value={reportIssue}
              onChange={(e) => setReportIssue(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-xl bg-gray-100 dark:bg-zinc-800 text-xs outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 border border-transparent focus:border-[#007aff]"
            />
            <div className="flex space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setReportModalOpened(false)}
                className="flex-1 py-2 rounded-full bg-gray-100 dark:bg-zinc-800 text-xs font-semibold text-gray-800 dark:text-gray-200 cursor-pointer border-0"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setReportModalOpened(false);
                  setReportVendorName('');
                  setReportIssue('');
                  triggerToast('Nomination sent to inspection team');
                }}
                className="flex-1 py-2 rounded-full bg-[#007aff] text-white text-xs font-bold cursor-pointer border-0"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 
        =======================================================================
        CASHBACK CLAIM CONFIRMATION MODAL (Apple Wallet Green Pass)
        =======================================================================
      */}
      {submittedClaim && (
        <div
          onClick={() => setSubmittedClaim(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white dark:bg-[#1c1c1e] rounded-3xl p-6 shadow-2xl space-y-4 cursor-default text-gray-900 dark:text-white text-center"
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-500 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-emerald-500" />
            </div>

            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                ✓ SLIP APPROVED & CREDITED
              </span>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1.5">
                +₹{submittedClaim.cashbackEarned.toFixed(2)}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {submittedClaim.cashbackPercentage}% Cashback dispatched to {submittedClaim.payoutRecipient}
              </p>
            </div>

            <div className="p-3.5 bg-gray-50 dark:bg-zinc-900/60 rounded-2xl border border-gray-100 dark:border-zinc-800 text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-gray-400 text-[11px]">Merchant</span>
                <span className="font-bold text-gray-900 dark:text-white">{submittedClaim.restaurantName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-[11px]">Bill / Slip #</span>
                <span className="font-bold text-gray-900 dark:text-white">{submittedClaim.billNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-[11px]">Total Bill</span>
                <span className="font-bold text-gray-900 dark:text-white">₹{submittedClaim.billAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-[11px]">Audit Transaction</span>
                <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                  {submittedClaim.id}-TXN
                </span>
              </div>
            </div>

            <div className="flex space-x-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setSubmittedClaim(null);
                  setActiveTab('earn');
                  setEarnSubView('history');
                }}
                className="flex-1 py-2.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-xs font-semibold text-gray-800 dark:text-gray-200 cursor-pointer border-0"
              >
                View History
              </button>
              <button
                type="button"
                onClick={() => setSubmittedClaim(null)}
                className="flex-1 py-2.5 rounded-full bg-[#007aff] text-white text-xs font-bold cursor-pointer border-0 shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 
        =======================================================================
        CASHBACK & AUDIT POLICY MODAL
        =======================================================================
      */}
      {showPolicyModal && (
        <div
          onClick={() => setShowPolicyModal(false)}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-lg bg-white dark:bg-[#1c1c1e] rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl max-h-[85vh] flex flex-col cursor-default text-gray-900 dark:text-white"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-base">Katihar Cashback & Review Policy</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPolicyModal(false)}
                className="w-7 h-7 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-600 dark:text-gray-300 active:scale-90 cursor-pointer border-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3 overflow-y-auto no-scrollbar space-y-3.5 flex-1 pr-1 text-xs">
              {CASHBACK_POLICY_RULES.map((rule) => (
                <div
                  key={rule.id}
                  className="p-3.5 rounded-2xl bg-gray-50 dark:bg-zinc-900/60 border border-gray-100 dark:border-zinc-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 dark:text-white">{rule.title}</span>
                    <span className="text-[10px] font-black text-amber-600 dark:text-amber-400">{rule.rateHighlight}</span>
                  </div>
                  <p className="text-[11px] text-gray-600 dark:text-gray-300">{rule.summary}</p>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowPolicyModal(false)}
              className="mt-4 w-full py-2.5 rounded-full bg-[#007aff] text-white font-bold text-xs cursor-pointer border-0"
            >
              Close Policy
            </button>
          </div>
        </div>
      )}

      {/* 
        =======================================================================
        MINIMALIST APPLE TOAST PILL
        =======================================================================
      */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-3 duration-200 pointer-events-none">
          <div className="px-4 py-2 rounded-full bg-black/90 dark:bg-white/95 backdrop-blur-xl text-white dark:text-black text-xs font-bold shadow-xl flex items-center space-x-2">
            <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

    </div>
  );
}
