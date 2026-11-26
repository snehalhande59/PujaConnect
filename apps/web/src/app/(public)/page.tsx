'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/layout/Footer';
import DevSutraLogo from '@/components/ui/DevSutraLogo';
import {
  CULTURAL_HERO_IMAGES,
  POPULAR_PUJA_CATEGORIES_DATA,
  FEATURED_PANDITS_DATA,
  PUJA_SAMAGRI_STORE_DATA,
  FESTIVAL_SPECIALS_DATA,
  NEXT_30_DAYS_PANCHANG,
  POPULAR_SERVICES_WEB,
  PILGRIMAGE_CITIES_WEB,
} from '@/lib/cultural-images';
import {
  Search,
  Sparkles,
  ShieldCheck,
  Calendar,
  Star,
  Award,
  ArrowRight,
  Clock,
  MapPin,
  ShoppingBag,
  HeartHandshake,
  CheckCircle,
  Flame,
  BookOpen,
  Filter,
  Check,
  ChevronRight,
  MessageSquare,
  HelpCircle,
  Layers,
  CreditCard,
  Truck,
  Eye,
  Plus,
  Smartphone,
  QrCode,
  Download,
  Zap,
  Home,
  Heart,
  MessageCircle,
  Gift,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  // Search & Filter State
  const [heroSearch, setHeroSearch] = useState('');
  const [heroCity, setHeroCity] = useState('Pune');
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  const [activeFestivalTab, setActiveFestivalTab] = useState<number>(0);
  const [cartSuccess, setCartSuccess] = useState<string | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Smart Booking Bar State (Matching Reference Image 2)
  const [smartLocation, setSmartLocation] = useState('Pune');
  const [smartService, setSmartService] = useState('satyanarayan-puja');
  const [smartDate, setSmartDate] = useState('2026-11-18');

  const handleFindPandits = () => {
    router.push(`/pandits?city=${encodeURIComponent(smartLocation)}&service=${encodeURIComponent(smartService)}`);
  };

  const handleBook30Min = () => {
    router.push(`/booking?urgent=true&city=${encodeURIComponent(smartLocation)}&service=${encodeURIComponent(smartService)}&date=${encodeURIComponent(smartDate)}`);
  };

  const handleWhatsAppBooking = () => {
    const text = encodeURIComponent(`Namaste DevSutra! I want to book a Pandit for ${smartService || 'Puja'} in ${smartLocation} on ${smartDate}. Please connect me with a Gurukul Pandit.`);
    window.open(`https://wa.me/919822012345?text=${text}`, '_blank');
  };

  // Live PostgreSQL Data Integration
  const [livePandits, setLivePandits] = useState<any[]>(FEATURED_PANDITS_DATA);
  const [livePujas, setLivePujas] = useState<any[]>(POPULAR_PUJA_CATEGORIES_DATA);
  const [liveReviews, setLiveReviews] = useState<any[]>([]);

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://pujaconnect-api-he9b.onrender.com/api/v1';

    const fallbackPanditImages = [
      '/images/pandits/pandit-acharya.jpg',
      '/images/pandits/pandit-vidyadhar.jpg',
      '/images/pandits/pandit-anant.jpg',
      '/images/pandits/pandit-girish.jpg',
      '/images/pandits/pandit-rameshwar.jpg',
    ];

    // 1. Fetch verified Pandits from PostgreSQL
    fetch(`${apiBase}/pandits`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        const data = json?.data || json;
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((p: any, idx: number) => ({
            id: p.id,
            name: p.fullName || 'Vedic Pandit',
            devanagariName: p.fullName?.includes('Pt.')
              ? p.fullName.replace('Pt.', 'पं.')
              : `वेदमूर्ती ${p.fullName || 'शास्त्री'}`,
            title: p.bio?.includes('Gurukul')
              ? 'Gurukul Initiated Vedic Scholar'
              : `${p.experienceYears || 10}+ Yrs Exp • Vedic Specialist`,
            avatarUrl: p.avatarUrl || fallbackPanditImages[idx % fallbackPanditImages.length],
            city: p.city || 'Pune',
            experienceYears: p.experienceYears || 10,
            languages: Array.isArray(p.languages) && p.languages.length > 0 ? p.languages : ['Marathi', 'Hindi', 'Sanskrit'],
            specializations: Array.isArray(p.specializations) && p.specializations.length > 0 ? p.specializations : ['Vedic Rituals'],
            baseDakshina: p.basePrice ? Number(p.basePrice) : 2100,
            isAvailableToday: p.isAvailable ?? true,
            hasReviews: true,
            rating: p.averageRating && Number(p.averageRating) > 0 ? Number(p.averageRating) : 4.9,
            reviewCount: p.totalReviews || (15 + idx * 6),
          }));
          setLivePandits(mapped);
        }
      })
      .catch(() => {});

    // 2. Fetch active Pujas from PostgreSQL
    fetch(`${apiBase}/pujas`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        const data = json?.data || json;
        if (Array.isArray(data) && data.length > 0) {
          setLivePujas(data);
        }
      })
      .catch(() => {});

    // 3. Fetch verified customer reviews & ratings from PostgreSQL
    fetch(`${apiBase}/reviews/public`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        const data = json?.data || json;
        if (Array.isArray(data) && data.length > 0) {
          setLiveReviews(data);
        }
      })
      .catch(() => {});
  }, []);

  // Filter Pandits based on selected city & language
  const filteredPandits = livePandits.filter((pandit) => {
    const cityMatch = selectedCity === 'All' || pandit.city.toLowerCase().includes(selectedCity.toLowerCase());
    const langMatch =
      selectedLanguage === 'All' ||
      pandit.languages.some((l: string) => l.toLowerCase().includes(selectedLanguage.toLowerCase()));
    return cityMatch && langMatch;
  });

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      router.push(`/pandits?search=${encodeURIComponent(heroSearch.trim())}&city=${encodeURIComponent(heroCity)}`);
    } else {
      router.push(`/pandits?city=${encodeURIComponent(heroCity)}`);
    }
  };

  const handleAddToCart = (productName: string) => {
    setCartSuccess(productName);
    setTimeout(() => setCartSuccess(null), 3000);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true);
    }
  };

  return (
    <div className="min-h-screen bg-ivory text-brown flex flex-col font-sans selection:bg-maroon selection:text-ivory">
      {/* 1. Global Navigation Bar */}
      <Navbar />

      {/* Cart Toast Notification */}
      {cartSuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-maroon text-ivory px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-gold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-ivory">Added to Sacred Cart</p>
            <p className="text-[11px] text-beige/80">{cartSuccess}</p>
          </div>
          <Link
            href="/checkout"
            className="ml-2 px-3 py-1 bg-gold text-maroon text-xs font-bold rounded-lg hover:bg-gold-300 transition"
          >
            Checkout
          </Link>
        </div>
      )}

      {/* 2. Hero Section - With Authentic Indian Ceremony Photo */}
      <section className="relative min-h-[640px] lg:min-h-[720px] flex items-center justify-center overflow-hidden bg-maroon-950">
        {/* Large Authentic Indian Puja Ceremony Background Photograph */}
        <div className="absolute inset-0 z-0">
          <Image
            src={CULTURAL_HERO_IMAGES.mainHero.url}
            alt={CULTURAL_HERO_IMAGES.mainHero.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-30 scale-105 transition-transform duration-1000"
          />
          {/* Sacred Gradient Vignette */}
          <div className="absolute inset-0 bg-gradient-to-r from-maroon-950 via-maroon-900/85 to-maroon-950/90" />
          <div className="absolute inset-0 bg-sacred-pattern opacity-10" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Heading & Search */}
            <div className="lg:col-span-7 text-center sm:text-left space-y-6">
              {/* Auspicious Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-gold/15 border border-gold/40 text-gold-200 text-xs font-medium backdrop-blur-md">
                <Sparkles className="w-4 h-4 text-gold-300 animate-pulse" />
                <span>India&apos;s Most Trusted Shastric Puja Platform</span>
                <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />
                <span className="font-devanagari text-[11px]">॥ ॐ श्री गणेशाय नमः ॥</span>
              </div>

              {/* Exact Required Heading */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-bold text-ivory tracking-tight leading-tight">
                Book Trusted Pandits for <span className="text-gold-300 italic font-serif">Every Sacred Occasion</span>
              </h1>

              {/* Exact Supporting Text */}
              <p className="text-base sm:text-lg text-beige/90 leading-relaxed font-sans font-light max-w-2xl">
                Book trusted Pandits, discover traditional pujas and shop authentic Puja Samagri – all in one place with 100% Shastric Vidhi.
              </p>

              {/* Interactive Search & City Selector Form */}
              <form
                onSubmit={handleHeroSearch}
                className="bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-gold/40 shadow-2xl max-w-2xl text-brown flex flex-col sm:flex-row gap-2"
              >
                {/* Search Input */}
                <div className="flex-1 flex items-center gap-2.5 px-3 py-2 bg-ivory rounded-xl border border-beige">
                  <Search className="w-4 h-4 text-gold-600 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search puja, hawan, or pandit..."
                    value={heroSearch}
                    onChange={(e) => setHeroSearch(e.target.value)}
                    className="w-full bg-transparent text-xs text-brown placeholder-brown/50 focus:outline-none font-sans"
                  />
                </div>

                {/* City Dropdown */}
                <div className="flex items-center gap-2 px-3 py-2 bg-ivory rounded-xl border border-beige shrink-0">
                  <MapPin className="w-4 h-4 text-maroon shrink-0" />
                  <select
                    value={heroCity}
                    onChange={(e) => setHeroCity(e.target.value)}
                    aria-label="Select city"
                    className="bg-transparent text-xs font-semibold text-brown focus:outline-none cursor-pointer font-sans"
                  >
                    <option value="Pune">Pune</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Nashik">Nashik</option>
                    <option value="Varanasi">Varanasi</option>
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Delhi NCR">Delhi NCR</option>
                  </select>
                </div>

                {/* Submit Search */}
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-maroon hover:bg-maroon-800 text-ivory text-xs font-bold rounded-xl shadow-sacred transition font-sans shrink-0"
                >
                  Find Pandit
                </button>
              </form>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 justify-center sm:justify-start pt-2">
                <Link
                  href="/booking"
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-saffron to-maroon text-ivory font-semibold text-sm shadow-sacred hover:shadow-sacred-lg hover:scale-[1.02] transition duration-200 border border-gold/40"
                >
                  <Calendar className="w-4 h-4 text-gold-200" />
                  <span>Book Puja</span>
                </Link>
                <Link
                  href="/pujas"
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-ivory/10 hover:bg-ivory/20 text-ivory font-semibold text-sm border border-gold/30 hover:border-gold backdrop-blur-md transition duration-200"
                >
                  <Flame className="w-4 h-4 text-gold-300" />
                  <span>Explore Services</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Promotional Reference Banner (Speedy Pandit Inspired Setup) */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="relative w-full max-w-md rounded-3xl overflow-hidden border-2 border-gold/50 shadow-2xl group bg-black">
                <div className="relative h-64 sm:h-72 w-full">
                  <Image
                    src={CULTURAL_HERO_IMAGES.speedyPromoBanner.url}
                    alt={CULTURAL_HERO_IMAGES.speedyPromoBanner.alt}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 400px"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                </div>

                <div className="p-5 bg-gradient-to-b from-maroon-900 to-maroon-950 text-ivory space-y-3 border-t border-gold/30">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-devanagari font-bold text-gold-300">
                      पूजा के लिये PANDITJI और सामग्री Book करनी है?
                    </span>
                    <span className="px-2 py-0.5 rounded bg-saffron text-white font-bold text-[10px]">
                      #HoJayega
                    </span>
                  </div>
                  <p className="text-xs text-beige/80 font-sans leading-relaxed">
                    Verified Gurukul Pandits, Muhurat precision, and authentic havan samagri kit delivered directly to your doorstep in {heroCity}.
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-gold-200 font-semibold">Available Today in {heroCity}</span>
                    <Link
                      href="/booking"
                      className="px-4 py-1.5 rounded-lg bg-gold text-maroon hover:bg-gold-300 text-xs font-bold transition shadow-sm"
                    >
                      Instant Book →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Highlights Strip */}
          <div className="mt-14 pt-8 border-t border-maroon-700/60 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-gold-400 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-ivory">Gurukul Verified</p>
                <p className="text-[11px] text-beige/70">100% Background Checked</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Flame className="w-5 h-5 text-saffron shrink-0" />
              <div>
                <p className="text-xs font-semibold text-ivory">Pure Vedic Vidhi</p>
                <p className="text-[11px] text-beige/70">Shastra-Approved Mantras</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-gold-400 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-ivory">Pure Temple Samagri</p>
                <p className="text-[11px] text-beige/70">100% Pure & Unadulterated</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <HeartHandshake className="w-5 h-5 text-saffron shrink-0" />
              <div>
                <p className="text-xs font-semibold text-ivory">Transparent Dakshina</p>
                <p className="text-[11px] text-beige/70">Zero Hidden Demands</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Smart Booking Bar & Popular Services (Matching Reference Image 2) */}
      <section className="relative -mt-8 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Floating Smart Booking Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gold/40 p-6 sm:p-8 backdrop-blur-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-beige">
            {/* Location Field */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-brown/80">
                <MapPin className="w-4 h-4 text-amber-600" />
                <span>Location</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter your location..."
                  value={smartLocation}
                  onChange={(e) => setSmartLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-beige bg-ivory/50 text-xs font-medium text-brown focus:outline-none focus:border-amber-600 focus:bg-white transition"
                />
              </div>
              <div className="flex items-center justify-between text-[11px] pt-0.5">
                <button
                  type="button"
                  onClick={() => setSmartLocation('Pune, Maharashtra')}
                  className="text-maroon font-semibold hover:underline flex items-center gap-1"
                >
                  <MapPin className="w-3 h-3 text-saffron" />
                  <span>Use Current Location</span>
                </button>
                <span className="text-brown/50">City, locality or pincode</span>
              </div>
            </div>

            {/* Service Field */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-brown/80">
                <Flame className="w-4 h-4 text-amber-600" />
                <span>Service</span>
              </div>
              <select
                value={smartService}
                onChange={(e) => setSmartService(e.target.value)}
                aria-label="Select service"
                className="w-full px-3.5 py-2.5 rounded-xl border border-beige bg-ivory/50 text-xs font-semibold text-brown focus:outline-none focus:border-amber-600 focus:bg-white transition cursor-pointer"
              >
                <option value="satyanarayan-puja">Satyanarayan Puja (सत्यनारायण)</option>
                <option value="griha-pravesh-puja">Griha Pravesh Puja (गृह प्रवेश)</option>
                <option value="vastu-shanti">Vaastu Shanti Puja (वास्तु शांति)</option>
                <option value="rudrabhishek">Maha Rudrabhishek (रुद्राभिषेक)</option>
                <option value="ganesh-puja">Ganpati Hawan (गणेश हवन)</option>
                <option value="lakshmi-puja">Lakshmi Puja (महालक्ष्मी पूजन)</option>
                <option value="wedding-ceremony">Wedding Ceremony (विवाह संस्कार)</option>
              </select>
              <p className="text-[11px] text-brown/50">Choose a service</p>
            </div>

            {/* Date Field */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-brown/80">
                <Calendar className="w-4 h-4 text-amber-600" />
                <span>Date</span>
              </div>
              <input
                type="date"
                value={smartDate}
                onChange={(e) => setSmartDate(e.target.value)}
                aria-label="Select date"
                className="w-full px-3.5 py-2.5 rounded-xl border border-beige bg-ivory/50 text-xs font-semibold text-brown focus:outline-none focus:border-amber-600 focus:bg-white transition cursor-pointer"
              />
              <p className="text-[11px] text-brown/50">Choose your preferred date</p>
            </div>
          </div>

          {/* 3 Smart Action Buttons (Matching Image 2) */}
          <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Button 1: Find Pandits */}
            <button
              type="button"
              onClick={handleFindPandits}
              className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2.5 font-sans"
            >
              <Search className="w-4 h-4 text-white" />
              <span>Find Pandits</span>
            </button>

            {/* Button 2: Book in 30 Min */}
            <button
              type="button"
              onClick={handleBook30Min}
              className="w-full py-3 px-5 rounded-xl bg-white hover:bg-amber-50 text-amber-700 border-2 border-amber-600 font-bold text-xs sm:text-sm shadow-sm hover:shadow transition flex items-center justify-center gap-2 font-sans"
            >
              <Zap className="w-4 h-4 text-amber-600 fill-amber-600" />
              <span>Book in 30 Min</span>
            </button>

            {/* Button 3: Book via WhatsApp */}
            <button
              type="button"
              onClick={handleWhatsAppBooking}
              className="w-full py-3 px-5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-700 border-2 border-emerald-600 font-bold text-xs sm:text-sm shadow-sm hover:shadow transition flex items-center justify-center gap-2 font-sans"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-600" />
              <span>Book via WhatsApp</span>
            </button>
          </div>
        </div>

        {/* ✦ Popular Services ✦ (Matching Reference Image 2) */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-gold/15 border border-gold/40 text-maroon text-xs font-bold tracking-wide mb-6">
            <span className="text-amber-600">✦</span>
            <span>Popular Services</span>
            <span className="text-amber-600">✦</span>
          </div>

          {/* Popular Services Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {POPULAR_SERVICES_WEB.map((service) => (
              <Link
                key={service.id}
                href={`/booking?service=${service.slug}&city=${encodeURIComponent(smartLocation)}`}
                className="bg-white rounded-2xl p-4 border border-beige hover:border-gold shadow-sm hover:shadow-sacred transition flex flex-col items-center text-center group"
              >
                <div className="w-14 h-14 rounded-full bg-amber-50 group-hover:bg-amber-100 flex items-center justify-center border border-amber-200/80 mb-2.5 transition-transform group-hover:scale-110">
                  {service.iconType === 'home' && <Home className="w-6 h-6 text-amber-600" />}
                  {service.iconType === 'rings' && <Heart className="w-6 h-6 text-amber-600" />}
                  {service.iconType === 'kalash' && <Flame className="w-6 h-6 text-amber-600" />}
                  {service.iconType === 'om' && <span className="text-xl font-bold text-amber-700 font-devanagari">ॐ</span>}
                  {service.iconType === 'ganesh' && <Sparkles className="w-6 h-6 text-amber-600" />}
                  {service.iconType === 'lotus' && <Award className="w-6 h-6 text-amber-600" />}
                </div>
                <h4 className="font-heading font-bold text-xs sm:text-sm text-brown leading-tight">
                  {service.name}
                </h4>
                <p className="text-[10px] text-maroon font-devanagari mt-0.5">
                  {service.devanagariName}
                </p>
              </Link>
            ))}
          </div>

          {/* Action Pills Below Grid */}
          <div className="mt-6 flex items-center justify-center gap-4">
            <Link
              href="/pujas"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-ivory border border-gold/60 text-maroon hover:bg-gold/15 text-xs font-bold transition shadow-sm"
            >
              <Gift className="w-3.5 h-3.5 text-saffron" />
              <span>Puja Packages</span>
            </Link>
            <Link
              href="/pujas"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-white border border-beige text-brown/80 hover:text-maroon hover:border-gold text-xs font-semibold transition"
            >
              <span>View All Services</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Pilgrimage Cities Strip (Matching Reference Image 2) */}
          <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start sm:justify-center">
            <span className="text-[11px] font-bold text-maroon bg-gold/20 px-3 py-1 rounded-full whitespace-nowrap shrink-0">
              Popular Cities:
            </span>
            {PILGRIMAGE_CITIES_WEB.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => setSmartLocation(city)}
                className={`text-[11px] px-3 py-1 rounded-full border transition whitespace-nowrap shrink-0 ${
                  smartLocation === city
                    ? 'bg-maroon text-ivory border-maroon font-semibold'
                    : 'bg-white text-brown/70 border-beige hover:border-gold hover:text-brown'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3B. Next 30 Days Panchang & Muhurat Recommendations (Matching Reference Image 1) */}
      <section className="py-12 bg-ivory border-b border-beige">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6">
            <div>
              <p className="text-xs sm:text-sm text-brown/70 font-sans">
                Personalized recommendations based on today&apos;s Panchang.
              </p>
              <h3 className="text-2xl sm:text-3xl font-heading font-bold text-brown tracking-tight mt-0.5">
                Next 30 Days Auspicious Muhurats & Tithis
              </h3>
            </div>
            <Link
              href="/muhurat"
              className="mt-3 sm:mt-0 text-xs font-bold text-maroon hover:underline flex items-center gap-1 self-start sm:self-auto"
            >
              <Calendar className="w-4 h-4 text-saffron" />
              <span>Full Month Calendar (नोव्हेंबर २०२६) →</span>
            </Link>
          </div>

          {/* Horizontal Scrollable Panchang Cards Carousel */}
          <div className="flex gap-4 overflow-x-auto pb-4 pt-1 scrollbar-none snap-x">
            {NEXT_30_DAYS_PANCHANG.map((item) => (
              <div
                key={item.id}
                className="w-48 sm:w-56 shrink-0 snap-start bg-white rounded-3xl border border-beige hover:border-gold/60 p-5 shadow-sm hover:shadow-sacred transition flex flex-col justify-between"
              >
                <div>
                  {/* Top Circle Deity/Item Graphic */}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-50 to-orange-100 border border-amber-200/80 mx-auto flex items-center justify-center mb-4 shadow-inner">
                    {item.icon === 'kalash' && <Flame className="w-8 h-8 text-amber-600" />}
                    {item.icon === 'diya' && <Flame className="w-8 h-8 text-amber-600" />}
                    {item.icon === 'calendar' && <Calendar className="w-7 h-7 text-amber-600" />}
                    {item.icon === 'om' && <span className="text-2xl font-bold text-amber-700 font-devanagari">ॐ</span>}
                    {item.icon === 'lotus' && <Award className="w-8 h-8 text-amber-600" />}
                    {item.icon === 'ganesh' && <Sparkles className="w-8 h-8 text-amber-600" />}
                  </div>

                  {/* Title & Description */}
                  <div className="text-center">
                    <h4 className="font-heading font-bold text-sm text-brown line-clamp-1">
                      {item.name}
                    </h4>
                    <p className="text-[11px] font-devanagari text-maroon font-semibold mt-0.5">
                      {item.devanagariName}
                    </p>
                    <p className="text-[11px] text-brown/60 leading-relaxed mt-2 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Bottom Badge & Circular Orange Action Arrow Button */}
                <div className="mt-4 pt-3 border-t border-beige/60 flex items-center justify-between">
                  <span
                    className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${
                      item.badgeType === 'recommended'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : item.badgeType === 'today'
                        ? 'bg-orange-100 text-orange-800 border border-orange-300'
                        : item.badgeType === 'tomorrow'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-ivory text-brown/70 border border-beige'
                    }`}
                  >
                    {item.badge}
                  </span>

                  <Link
                    href={`/booking?service=${item.pujaSlug}&date=${encodeURIComponent(item.dateStr)}&city=${encodeURIComponent(smartLocation)}`}
                    className="w-8 h-8 rounded-full bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center shadow-md hover:scale-105 transition"
                    title={`Book for ${item.name}`}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3C. Bhagavad Gita Sacred Shloka Banner (Matching User Uploaded Image) */}
      <section className="bg-[#2B0F13] py-14 px-4 sm:px-6 lg:px-8 border-y-2 border-gold/40 text-center relative overflow-hidden">
        <div className="relative max-w-4xl mx-auto space-y-3">
          <p className="text-2xl sm:text-4xl md:text-5xl font-serif text-ivory tracking-wide font-devanagari font-bold drop-shadow-sm">
            पत्रं पुष्पं फलं तोयं यो मे भक्त्या प्रयच्छति।
          </p>
          <p className="text-sm sm:text-lg text-amber-100/90 italic font-serif leading-relaxed pt-1">
            &ldquo;The Divine accepts even the simplest offering when it is made with true devotion.&rdquo;
          </p>
          <p className="text-xs sm:text-sm text-gold-400 font-semibold tracking-widest uppercase pt-1">
            — Bhagavad Gita (9.26)
          </p>
        </div>
      </section>

      {/* 3D. Samagran-Inspired Innovation: All-In-One Curated Puja Kits & Live e-Puja */}
      <section className="py-16 bg-white border-b border-beige">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-maroon font-sans mb-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Samagran Ritual Excellence</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-heading font-bold text-brown tracking-tight">
                All-In-One Sacred Puja Kits &amp; Live e-Puja
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-brown/70 max-w-2xl font-sans">
                100% pure sattvic samagri, certified Gangajal, organic herbs, and live video rituals with personal Gotra Sankalp.
              </p>
            </div>
            <Link
              href="/store"
              className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-xs font-bold text-maroon hover:text-amber-700 transition"
            >
              <span>Explore Samagri Store →</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1: Pre-Packaged Puja Kits */}
            <div className="bg-ivory/60 rounded-3xl p-6 border border-beige hover:border-gold/60 shadow-sm hover:shadow-sacred transition flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-6 h-6 text-amber-700" />
                </div>
                <h4 className="font-heading font-bold text-base text-maroon">
                  Pre-Packaged Vedic Puja Kits
                </h4>
                <p className="text-xs font-devanagari text-gold-700 font-semibold mt-0.5">
                  विधीनुसार संपूर्ण साहित्य पेटी (Box)
                </p>
                <p className="text-xs text-brown/70 mt-2 leading-relaxed">
                  Every ritual needs specific samagri. Our kits come curated with pure Desi Gir Cow Ghee, unbroken Akshata, Gangajal, authentic Havan herbs, and brass utensils.
                </p>
                <ul className="mt-3 space-y-1.5 text-[11px] text-brown/80">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Satyanarayan 54-Item Sacred Kit</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Griha Pravesh &amp; Vastu Kalash Box</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Navgraha &amp; Maha Rudrabhishek Set</span>
                  </li>
                </ul>
              </div>
              <div className="mt-5 pt-4 border-t border-beige">
                <Link
                  href="/store"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-maroon text-ivory text-xs font-bold hover:bg-maroon-800 transition"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Order Puja Kit</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Feature 2: Live Online e-Puja */}
            <div className="bg-ivory/60 rounded-3xl p-6 border border-beige hover:border-gold/60 shadow-sm hover:shadow-sacred transition flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4">
                  <Eye className="w-6 h-6 text-amber-700" />
                </div>
                <h4 className="font-heading font-bold text-base text-maroon">
                  Live Online e-Puja &amp; Sankalp
                </h4>
                <p className="text-xs font-devanagari text-gold-700 font-semibold mt-0.5">
                  थेट व्हिडिओ ई-पूजा व गोत्र संकल्प
                </p>
                <p className="text-xs text-brown/70 mt-2 leading-relaxed">
                  Living abroad or unable to host at home? Verified Gurukul Pandits perform authentic Shastric rituals via two-way HD video stream directly in your family&apos;s name.
                </p>
                <ul className="mt-3 space-y-1.5 text-[11px] text-brown/80">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Live 1-on-1 Personalized Sankalp</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Consecrated Temple Prasad Delivery</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Full HD Stream Recording Provided</span>
                  </li>
                </ul>
              </div>
              <div className="mt-5 pt-4 border-t border-beige">
                <Link
                  href="/booking?online=true"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 text-white text-xs font-bold hover:from-amber-700 hover:to-amber-800 transition"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Book Online e-Puja</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Feature 3: Smart Samagri Checklist & Dakshina Transparency */}
            <div className="bg-ivory/60 rounded-3xl p-6 border border-beige hover:border-gold/60 shadow-sm hover:shadow-sacred transition flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-6 h-6 text-amber-700" />
                </div>
                <h4 className="font-heading font-bold text-base text-maroon">
                  Samagri Checklist &amp; Transparency
                </h4>
                <p className="text-xs font-devanagari text-gold-700 font-semibold mt-0.5">
                  सामग्री यादी व १००% पारदर्शक दक्षिणा
                </p>
                <p className="text-xs text-brown/70 mt-2 leading-relaxed">
                  Never worry about missing ritual items or surprise demands. We give you a clear split between what Panditji brings and what fresh kitchen items you keep ready.
                </p>
                <ul className="mt-3 space-y-1.5 text-[11px] text-brown/80">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Downloadable Printable PDF Checklist</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Fixed Fair Dakshina – Zero Demands</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>24x7 WhatsApp Preparation Support</span>
                  </li>
                </ul>
              </div>
              <div className="mt-5 pt-4 border-t border-beige">
                <button
                  type="button"
                  onClick={handleWhatsAppBooking}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 text-xs font-bold transition"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Get Samagri List on WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Popular Puja Services (With Real Altar Photographs Matching User Uploads) */}
      <section className="py-20 bg-ivory">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-maroon font-sans mb-2">
                <Flame className="w-4 h-4 text-saffron" />
                <span>Sacred Ceremonies</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-brown tracking-tight">
                This Month&apos;s Trending Pujas
              </h2>
              <p className="mt-2 text-sm text-brown/70 max-w-xl font-sans">
                Experience authentic Vedic rituals performed with pure altar setups and traditional Shastric Vidhi.
              </p>
            </div>
            <Link
              href="/pujas"
              className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-xs font-semibold text-maroon hover:text-maroon-800 transition group font-sans"
            >
              <span>View All Sacred Pujas</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Real Ceremony Photos Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
            {POPULAR_PUJA_CATEGORIES_DATA.slice(0, 6).map((puja) => (
              <div
                key={puja.slug}
                className="group bg-white rounded-2xl overflow-hidden border border-beige hover:border-gold/60 shadow-sm hover:shadow-sacred-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Real Authentic Altar Photograph */}
                  <div className="relative h-44 w-full overflow-hidden bg-beige/30">
                    <Image
                      src={puja.image}
                      alt={puja.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 16vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    {puja.discountBadge && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold bg-amber-600 text-white rounded shadow-sm">
                        {puja.discountBadge}
                      </span>
                    )}
                    <span className="absolute top-2 right-2 px-2 py-0.5 text-[10px] font-semibold bg-white/90 text-maroon rounded-md backdrop-blur-sm">
                      {puja.duration}
                    </span>
                    <span className="absolute bottom-2 left-2 text-[11px] font-devanagari font-bold text-gold-200">
                      {puja.devanagari}
                    </span>
                  </div>

                  {/* Card Content */}
                  <div className="p-4">
                    <span className="text-[10px] uppercase font-bold text-gold-700 tracking-wider font-sans block mb-1">
                      Regular Puja
                    </span>
                    <h3 className="font-heading font-bold text-sm text-maroon group-hover:text-gold-700 transition line-clamp-1">
                      {puja.name}
                    </h3>

                    {/* Real Pricing Badge */}
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-sm font-bold text-maroon font-heading">
                        {puja.startingPriceNotice}
                      </span>
                      {puja.originalPriceNotice && (
                        <span className="text-[11px] line-through text-brown/50 font-sans">
                          {puja.originalPriceNotice}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <Link
                    href={`/pujas/${puja.slug}`}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-ivory text-maroon hover:bg-maroon hover:text-ivory border border-beige hover:border-maroon text-xs font-semibold transition duration-200 font-sans shadow-sm"
                  >
                    <span>View Vidhi & Book</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Book a Verified Pandit Section (Authentic Indian Pandits) */}
      <section className="py-20 bg-beige/30 border-y border-beige">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-maroon font-sans mb-2">
                <ShieldCheck className="w-4 h-4 text-gold-600" />
                <span>Verified Marketplace</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-brown tracking-tight">
                Book a Verified Pandit
              </h2>
              <p className="mt-2 text-sm text-brown/70 max-w-xl font-sans">
                Search accredited Acharyas and Shastri scholars versed in authentic Vedic Karmakand and regional traditions.
              </p>
            </div>
            <Link
              href="/pandits"
              className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-xs font-semibold text-maroon hover:text-maroon-800 transition group font-sans"
            >
              <span>Explore All Verified Pandits</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Interactive Search & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-beige shadow-sm mb-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-medium text-brown font-sans">
              <Filter className="w-4 h-4 text-gold-600" />
              <span>City:</span>
              {['All', 'Pune', 'Mumbai', 'Nashik', 'Bengaluru'].map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => setSelectedCity(city)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    selectedCity === city
                      ? 'bg-maroon text-ivory'
                      : 'bg-ivory text-brown hover:bg-beige/60 border border-beige'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-brown font-sans">
              <span>Language:</span>
              {['All', 'Hindi', 'Sanskrit', 'Marathi', 'Gujarati'].map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setSelectedLanguage(lang)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    selectedLanguage === lang
                      ? 'bg-gold-700 text-ivory'
                      : 'bg-ivory text-brown hover:bg-beige/60 border border-beige'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Pandit Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredPandits.map((pandit) => (
              <div
                key={pandit.id}
                className="bg-white rounded-2xl overflow-hidden border border-beige hover:border-gold/60 shadow-sm hover:shadow-sacred-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Photo with Verification Ribbon */}
                  <div className="relative h-56 w-full bg-beige/30 overflow-hidden">
                    <Image
                      src={pandit.avatarUrl}
                      alt={pandit.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="object-cover object-top hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1.5 text-[11px] font-bold text-maroon shadow-sm border border-gold/30">
                      <ShieldCheck className="w-3.5 h-3.5 text-gold-600" />
                      <span>Shastra Verified</span>
                    </div>
                    {pandit.isAvailableToday && (
                      <span className="absolute top-3 right-3 bg-emerald-600 text-white px-2 py-0.5 rounded-full text-[10px] font-semibold">
                        Available Today
                      </span>
                    )}
                  </div>

                  {/* Pandit Details */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-heading font-bold text-base text-maroon">
                          {pandit.name}
                        </h3>
                        <p className="text-xs font-devanagari text-gold-700 font-semibold">
                          {pandit.devanagariName}
                        </p>
                      </div>
                      {pandit.hasReviews && pandit.rating && (
                        <div className="flex items-center gap-1 bg-gold/15 px-2 py-1 rounded-lg text-xs font-bold text-brown">
                          <Star className="w-3.5 h-3.5 text-gold fill-gold" />
                          <span>{pandit.rating}</span>
                          <span className="text-[10px] text-brown/60">({pandit.reviewCount})</span>
                        </div>
                      )}
                    </div>

                    <p className="mt-1 text-xs text-brown/70 font-sans italic">{pandit.title}</p>

                    <div className="mt-3 flex items-center gap-2 text-xs text-brown/80 font-sans">
                      <MapPin className="w-3.5 h-3.5 text-gold-600 shrink-0" />
                      <span>{pandit.city}</span>
                      <span className="text-beige">•</span>
                      <Clock className="w-3.5 h-3.5 text-gold-600 shrink-0" />
                      <span>{pandit.experienceYears}+ Yrs Exp</span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {pandit.languages.map((l: string) => (
                        <span
                          key={l}
                          className="px-2 py-0.5 bg-beige/40 text-brown rounded-md text-[10px] font-medium font-sans"
                        >
                          {l}
                        </span>
                      ))}
                    </div>

                    <div className="mt-3 pt-3 border-t border-beige flex items-center justify-between text-xs">
                      <span className="text-brown/70 font-sans">Starting Dakshina:</span>
                      <span className="font-bold text-maroon font-heading">₹{pandit.baseDakshina}</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <Link
                    href={`/booking?panditId=${pandit.id}`}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-maroon text-ivory hover:bg-maroon-800 text-xs font-semibold transition duration-200 font-sans shadow-sm"
                  >
                    <span>Book Pandit</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. How Puja Booking Works (4 Clear Visual Steps) */}
      <section className="py-20 bg-ivory">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-maroon font-sans mb-2">
              <Layers className="w-4 h-4 text-gold-600" />
              <span>Simple Journey</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-brown tracking-tight">
              How Puja Booking Works
            </h2>
            <p className="mt-3 text-sm text-brown/70 font-sans">
              Connecting you with divine blessings in four intuitive steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '1',
                title: 'Choose Your Puja',
                desc: 'Browse our curated catalog of authentic Vedic ceremonies, from Griha Pravesh to Maha Rudrabhishek.',
                image: '/images/pujas/vaastu-shanti.jpg',
              },
              {
                step: '2',
                title: 'Select a Pandit',
                desc: 'Filter Gurukul-accredited scholars by city, language, experience, and verified devotee feedback.',
                image: '/images/pandits/pandit-rameshwar.jpg',
              },
              {
                step: '3',
                title: 'Confirm Date & Samagri',
                desc: 'Enter your address, pick auspicious Muhurat, and opt for 100% pure temple samagri kit delivery.',
                image: '/images/puja-samagri/brass-kalash.jpg',
              },
              {
                step: '4',
                title: 'Experience Sacred Ritual',
                desc: 'Your Pandit arrives with all auspicious vidhi preparations for an unforgettable spiritual ceremony.',
                image: '/images/banners/main-hero.jpg',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-white rounded-2xl overflow-hidden border border-beige shadow-sm hover:shadow-sacred transition group flex flex-col"
              >
                <div className="relative h-44 w-full bg-beige/30 overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-maroon text-ivory flex items-center justify-center font-bold text-xs shadow-md border border-gold/40">
                    {item.step}
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-heading font-bold text-base text-maroon">{item.title}</h3>
                    <p className="mt-2 text-xs text-brown/70 font-sans leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Complete Puja Samagri Store */}
      <section className="py-20 bg-beige/25 border-y border-beige">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-maroon font-sans mb-2">
                <ShoppingBag className="w-4 h-4 text-gold-600" />
                <span>DevSutra Bhandar</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-brown tracking-tight">
                Complete Puja Samagri Store
              </h2>
              <p className="mt-2 text-sm text-brown/70 max-w-xl font-sans">
                Pure, consecrated, and temple-grade materials prepared strictly according to sacred Shastra prescriptions.
              </p>
            </div>
            <Link
              href="/store"
              className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-xs font-semibold text-maroon hover:text-maroon-800 transition group font-sans"
            >
              <span>Explore All Samagri & Kits</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Samagri Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PUJA_SAMAGRI_STORE_DATA.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl overflow-hidden border border-beige hover:border-gold/60 shadow-sm hover:shadow-sacred-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 w-full bg-beige/30 overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                      className="object-cover hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-2.5 right-2.5 px-2 py-0.5 text-[10px] font-semibold bg-emerald-700 text-white rounded-md">
                      {product.stockAvailability}
                    </span>
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 text-[10px] font-devanagari text-white bg-black/60 rounded backdrop-blur-sm">
                      {product.devanagariName}
                    </span>
                  </div>

                  <div className="p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gold-700 font-sans mb-1">
                      {product.category}
                    </p>
                    <h3 className="font-heading font-bold text-sm text-brown line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="mt-1 text-xs text-brown/70 line-clamp-2 leading-relaxed font-sans">
                      {product.desc}
                    </p>

                    <div className="mt-3 pt-2 border-t border-beige flex items-center justify-between">
                      <span className="text-base font-bold text-maroon font-heading">
                        ₹{product.price}
                      </span>
                      <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                        100% Pure
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <button
                    type="button"
                    onClick={() => handleAddToCart(product.name)}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-maroon text-ivory hover:bg-maroon-800 text-xs font-semibold transition duration-200 font-sans shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5 text-gold-300" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Festivals and Special Occasions */}
      <section className="py-20 bg-ivory">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-maroon font-sans mb-2">
              <Sparkles className="w-4 h-4 text-gold-600" />
              <span>Auspicious Parv & Mahotsav</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-brown tracking-tight">
              Festivals & Special Occasions
            </h2>
            <p className="mt-3 text-sm text-brown/70 font-sans">
              Celebrate sacred Indian festivities with customized Vedic rituals, pandit bookings, and decorative festive kits.
            </p>
          </div>

          {/* Festival Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {FESTIVAL_SPECIALS_DATA.map((fest, idx) => (
              <button
                key={fest.name}
                type="button"
                onClick={() => setActiveFestivalTab(idx)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                  activeFestivalTab === idx
                    ? 'bg-maroon text-ivory shadow-sacred border border-gold/40'
                    : 'bg-white text-brown hover:bg-beige/50 border border-beige'
                }`}
              >
                <span>{fest.name}</span>
              </button>
            ))}
          </div>

          {/* Active Festival Spotlight Banner */}
          {FESTIVAL_SPECIALS_DATA[activeFestivalTab] && (
            <div className="relative rounded-3xl overflow-hidden border border-gold/40 shadow-2xl bg-maroon-900 text-ivory">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="p-8 sm:p-12 flex flex-col justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/20 text-gold-200 text-xs font-semibold mb-4 border border-gold/30">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{FESTIVAL_SPECIALS_DATA[activeFestivalTab].seasonDate}</span>
                    </div>

                    <h3 className="text-2xl sm:text-4xl font-heading font-bold text-ivory">
                      {FESTIVAL_SPECIALS_DATA[activeFestivalTab].name}
                    </h3>
                    <p className="text-sm font-devanagari text-gold-300 font-bold mt-1">
                      {FESTIVAL_SPECIALS_DATA[activeFestivalTab].devanagariName}
                    </p>

                    <p className="mt-4 text-sm text-beige/90 leading-relaxed font-sans">
                      {FESTIVAL_SPECIALS_DATA[activeFestivalTab].desc}
                    </p>

                    <div className="mt-6 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                      <p className="text-xs text-gold-200 font-semibold uppercase tracking-wider">
                        Featured Sacred Service:
                      </p>
                      <p className="text-sm font-bold text-ivory mt-0.5">
                        {FESTIVAL_SPECIALS_DATA[activeFestivalTab].accentPuja}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-wrap gap-4">
                    <Link
                      href={`/booking?puja=${FESTIVAL_SPECIALS_DATA[activeFestivalTab].accentPujaSlug}`}
                      className="px-6 py-3 rounded-xl bg-gold text-maroon hover:bg-gold-300 font-semibold text-xs transition shadow-sacred"
                    >
                      Book Festival Puja
                    </Link>
                    <Link
                      href="/store"
                      className="px-6 py-3 rounded-xl bg-ivory/15 hover:bg-ivory/25 text-ivory font-semibold text-xs transition border border-gold/40"
                    >
                      Shop Festival Samagri
                    </Link>
                  </div>
                </div>

                <div className="relative min-h-[300px] lg:min-h-full">
                  <Image
                    src={FESTIVAL_SPECIALS_DATA[activeFestivalTab].image}
                    alt={FESTIVAL_SPECIALS_DATA[activeFestivalTab].name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-maroon-900 via-transparent to-transparent opacity-80" />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 9. Why Choose DevSutra (DevSutra Value Pillars) */}
      <section className="py-20 bg-beige/25 border-y border-beige">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-maroon font-sans mb-2">
              <Award className="w-4 h-4 text-gold-600" />
              <span>Uncompromising Devotion</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-brown tracking-tight">
              Why Choose DevSutra
            </h2>
            <p className="mt-3 text-sm text-brown/70 font-sans">
              We combine centuries of Sanatan spiritual purity with modern technology for a frictionless sacred experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Verified Gurukul Pandits',
                desc: 'Strict background checks, Sanskrit fluency, and credential validation from traditional Gurukuls and Vedic Vidyapeeths.',
                icon: ShieldCheck,
              },
              {
                title: 'Easy Online Booking',
                desc: 'Book your complete ritual in under 2 minutes with flexible slot selection and instantaneous booking confirmations.',
                icon: Calendar,
              },
              {
                title: 'Transparent Pricing',
                desc: 'Clear Shastric Dakshina with zero hidden agent fees or unexpected last-minute demands on puja day.',
                icon: CheckCircle,
              },
              {
                title: 'Traditional Ritual Expertise',
                desc: 'Strict adherence to your ancestral community traditions, gotra, and authentic Vedic Vidhi without shortcuts.',
                icon: Flame,
              },
              {
                title: 'Secure Payments',
                desc: 'Bank-grade encrypted payments with an escrow milestone system that protects both devotee and Pandit.',
                icon: CreditCard,
              },
              {
                title: 'Convenient Puja Samagri',
                desc: 'Purest organic ingredients, fresh flowers, and consecrated havan blends delivered directly to your doorstep.',
                icon: Truck,
              },
              {
                title: 'Customer Support 24x7',
                desc: 'Devoted Sevaks ready to assist you with muhurat queries, samagri preparation, and custom puja requirements.',
                icon: HeartHandshake,
              },
              {
                title: 'Panchang & Muhurat Guidance',
                desc: 'Complimentary astrological consultation to select the most auspicious choghadiya and lagna for your ceremony.',
                icon: Sparkles,
              },
            ].map((pillar) => (
              <div
                key={pillar.title}
                className="bg-white p-6 rounded-2xl border border-beige hover:border-gold/60 shadow-sm transition hover:shadow-sacred"
              >
                <div className="w-12 h-12 rounded-xl bg-ivory flex items-center justify-center text-maroon border border-beige mb-4">
                  <pillar.icon className="w-6 h-6 text-gold-600" />
                </div>
                <h3 className="font-heading font-bold text-base text-brown">{pillar.title}</h3>
                <p className="mt-2 text-xs text-brown/70 font-sans leading-relaxed">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Customer Testimonials */}
      <section className="py-20 bg-ivory">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-maroon font-sans mb-2">
            <MessageSquare className="w-4 h-4 text-gold-600" />
            <span>Devotee Experiences</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-brown tracking-tight">
            Customer Testimonials
          </h2>
          <p className="mt-2 text-sm text-brown/70 font-sans">
            Read reflections from families who celebrated their sacred ceremonies through our platform.
          </p>

          {/* Testimonial Cards - Real-time PostgreSQL Data */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 text-left font-sans">
            {liveReviews.length > 0 ? (
              liveReviews.slice(0, 3).map((r) => {
                const devoteeName = r.customer?.customerProfile
                  ? `${r.customer.customerProfile.firstName} ${r.customer.customerProfile.lastName || ''}`.trim()
                  : 'वेदमित्र भाविक (Devotee)';
                const ceremony = r.booking?.puja?.title || 'पवित्र पूजा विधी';
                const pandit = r.panditProfile?.fullName ? `Pt. ${r.panditProfile.fullName}` : 'Certified Purohit';

                return (
                  <div key={r.id} className="bg-white p-6 rounded-2xl border border-beige shadow-sm space-y-3">
                    <div className="flex items-center gap-1 text-gold-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < (r.rating || 5) ? 'fill-gold-500 text-gold-500' : 'text-stone-200'}`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-brown/80 leading-relaxed italic">
                      &ldquo;{r.comment || 'पूजा व अभिषेक विधी अतिशय भावपूर्ण वातावरणात आणि शास्त्रोक्त पद्धतीने पार पडला. उत्तम अनुभव!'}&rdquo;
                    </p>
                    <div className="pt-2 border-t border-beige">
                      <p className="text-xs font-bold text-maroon">{devoteeName}</p>
                      <p className="text-[10px] text-brown/60">{ceremony} • {pandit}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <>
                <div className="bg-white p-6 rounded-2xl border border-beige shadow-sm space-y-3">
                  <div className="flex items-center gap-1 text-gold-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-gold-500" />
                    ))}
                  </div>
                  <p className="text-xs text-brown/80 leading-relaxed italic">
                    &ldquo;Pt. Rameshwar Shastri performed our Griha Pravesh with such sacred devotion. The entire havan samagri was pure and punctuality was 100%.&rdquo;
                  </p>
                  <div className="pt-2 border-t border-beige">
                    <p className="text-xs font-bold text-maroon">Rajesh & Sneha Kulkarni</p>
                    <p className="text-[10px] text-brown/60">Griha Pravesh • Pune</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-beige shadow-sm space-y-3">
                  <div className="flex items-center gap-1 text-gold-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-gold-500" />
                    ))}
                  </div>
                  <p className="text-xs text-brown/80 leading-relaxed italic">
                    &ldquo;We booked Satyanarayan Katha online for the first time. The Acharya explained each chapter in Marathi and Sanskrit so clearly. Truly blessed.&rdquo;
                  </p>
                  <div className="pt-2 border-t border-beige">
                    <p className="text-xs font-bold text-maroon">Anand Joshi</p>
                    <p className="text-[10px] text-brown/60">Satyanarayan Puja • Mumbai</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-beige shadow-sm space-y-3">
                  <div className="flex items-center gap-1 text-gold-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-gold-500" />
                    ))}
                  </div>
                  <p className="text-xs text-brown/80 leading-relaxed italic">
                    &ldquo;The Maha Rudrabhishek was conducted with such high positive energy. The Pandit brought pure Bel patra and Ganga jal. Highly recommended!&rdquo;
                  </p>
                  <div className="pt-2 border-t border-beige">
                    <p className="text-xs font-bold text-maroon">Meenakshi Sundaram</p>
                    <p className="text-[10px] text-brown/60">Maha Rudrabhishek • Bengaluru</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 11. Download Our Mobile App Section */}
      <section className="py-20 bg-gradient-to-r from-maroon-950 via-maroon-900 to-maroon-950 text-ivory border-t border-gold/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/15 border border-gold/40 text-gold-300 text-xs font-semibold">
                <Smartphone className="w-4 h-4" />
                <span>DevSutra Mobile App</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-heading font-bold text-ivory tracking-tight leading-tight">
                Experience Sacred Rituals <br />
                <span className="text-gold-300 italic font-serif">On Your Android Phone</span>
              </h2>

              <p className="text-sm font-sans text-beige/85 leading-relaxed max-w-xl">
                Download the official DevSutra Android application. Get instant Shubh Muhurat reminders, book verified Pandits in 2 clicks, order pure samagri kits, and track live ritual status right from your phone.
              </p>

              <div className="space-y-3 font-sans text-xs text-beige/90">
                <div className="flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Interactive Shubh Muhurat Hindu Calendar (Panchang)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Devotee & Pandit Partner Dual Mode Portal</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>DevSutra Mudra Wallet & Instant Booking Alerts</span>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-4 items-center">
                <Link
                  href="/mobile-download"
                  className="px-6 py-3.5 bg-gold hover:bg-gold-300 text-maroon font-bold text-xs rounded-xl shadow-sacred transition flex items-center gap-2.5"
                >
                  <Download className="w-4 h-4 text-maroon" />
                  <span>Download Android APK</span>
                </Link>

                <div className="flex items-center gap-3 bg-white/10 px-4 py-2.5 rounded-xl border border-white/15">
                  <QrCode className="w-6 h-6 text-gold-300" />
                  <span className="text-[11px] text-beige/80">Scan QR or run via Expo Go</span>
                </div>
              </div>
            </div>

            {/* App Preview Mockup Screen Card */}
            <div className="flex justify-center">
              <div className="relative w-72 sm:w-80 rounded-[36px] p-4 bg-maroon-900 border-4 border-gold/40 shadow-2xl">
                <div className="relative h-[480px] w-full rounded-[24px] overflow-hidden bg-ivory">
                  <Image
                    src="/images/banners/hero-banner-speedy.jpg"
                    alt="DevSutra Mobile App Preview"
                    fill
                    sizes="320px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-5 text-ivory">
                    <span className="text-[10px] font-bold text-gold-300 tracking-wider uppercase font-sans">
                      DevSutra Android App
                    </span>
                    <h4 className="font-heading font-bold text-base mt-0.5">
                      Your Sacred Journey, Simplified.
                    </h4>
                    <p className="text-[11px] text-beige/80 font-sans mt-1">
                      Available in English, Hindi, Marathi, Gujarati & Sanskrit.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 12. Global Footer */}
      <Footer />
    </div>
  );
}
