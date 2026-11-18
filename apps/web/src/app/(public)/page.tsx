'use client';

import { useState } from 'react';
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

  // Filter Pandits based on selected city & language
  const filteredPandits = FEATURED_PANDITS_DATA.filter((pandit) => {
    const cityMatch = selectedCity === 'All' || pandit.city.includes(selectedCity);
    const langMatch = selectedLanguage === 'All' || pandit.languages.includes(selectedLanguage);
    return cityMatch && langMatch;
  });

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      router.push(`/pujas?q=${encodeURIComponent(heroSearch.trim())}&city=${encodeURIComponent(heroCity)}`);
    } else {
      router.push(`/pujas?city=${encodeURIComponent(heroCity)}`);
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

      {/* 3. Popular Hindu Ceremonies Quick Categories (Matching User Reference Image 2) */}
      <section className="py-12 bg-ivory border-b border-beige">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-brown">
              Popular Hindu Ceremonies
            </h2>
            <p className="text-xs sm:text-sm text-brown/70 font-sans mt-1">
              Select category to discover traditional pujas and havans
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto font-sans">
            <Link
              href="/pujas?category=regular"
              className="p-6 rounded-2xl bg-white border border-beige hover:border-gold/60 shadow-sm hover:shadow-sacred text-center group transition flex flex-col items-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-gold/15 flex items-center justify-center text-maroon group-hover:scale-110 transition-transform mb-3">
                <Flame className="w-7 h-7 text-saffron" />
              </div>
              <h3 className="font-heading font-bold text-base text-maroon">Regular Puja</h3>
              <p className="text-xs text-brown/70 mt-1">Vaastu Shanti, Satya Narayan, Griha Pravesh</p>
            </Link>

            <Link
              href="/pujas?category=festive"
              className="p-6 rounded-2xl bg-white border border-beige hover:border-gold/60 shadow-sm hover:shadow-sacred text-center group transition flex flex-col items-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-gold/15 flex items-center justify-center text-maroon group-hover:scale-110 transition-transform mb-3">
                <Sparkles className="w-7 h-7 text-gold-600" />
              </div>
              <h3 className="font-heading font-bold text-base text-maroon">Festive Puja</h3>
              <p className="text-xs text-brown/70 mt-1">Ganesh Sthapana, Diwali Lakshmi, Navratri</p>
            </Link>

            <Link
              href="/pujas?category=hawan"
              className="p-6 rounded-2xl bg-white border border-beige hover:border-gold/60 shadow-sm hover:shadow-sacred text-center group transition flex flex-col items-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-gold/15 flex items-center justify-center text-maroon group-hover:scale-110 transition-transform mb-3">
                <Award className="w-7 h-7 text-maroon" />
              </div>
              <h3 className="font-heading font-bold text-base text-maroon">All Hawan</h3>
              <p className="text-xs text-brown/70 mt-1">Ganpati Hawan, Dhanvantari, Navgraha Agni</p>
            </Link>
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
                      {pandit.languages.map((l) => (
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

      {/* 9. Why Choose PujaConnect (DevSutra Value Pillars) */}
      <section className="py-20 bg-beige/25 border-y border-beige">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-maroon font-sans mb-2">
              <Award className="w-4 h-4 text-gold-600" />
              <span>Uncompromising Devotion</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-brown tracking-tight">
              Why Choose PujaConnect
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

          {/* Testimonial Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 text-left font-sans">
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
                <span>PujaConnect Mobile App</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-heading font-bold text-ivory tracking-tight leading-tight">
                Experience Sacred Rituals <br />
                <span className="text-gold-300 italic font-serif">On Your Android Phone</span>
              </h2>

              <p className="text-sm font-sans text-beige/85 leading-relaxed max-w-xl">
                Download the official PujaConnect Android application. Get instant Shubh Muhurat reminders, book verified Pandits in 2 clicks, order pure samagri kits, and track live ritual status right from your phone.
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
                    alt="PujaConnect Mobile App Preview"
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
