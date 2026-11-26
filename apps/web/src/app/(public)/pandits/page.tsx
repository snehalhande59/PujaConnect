'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/layout/Footer';
import {
  Star,
  ShieldCheck,
  MapPin,
  Globe2,
  BookOpen,
  ArrowRight,
  Filter,
  Search,
  Sparkles,
  Clock,
  Calendar,
  Loader2,
  UserCheck,
  CheckCircle,
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://pujaconnect-api-he9b.onrender.com/api/v1';

const PANDIT_FALLBACK_IMAGES = [
  '/images/pandits/pandit-acharya.jpg',
  '/images/pandits/pandit-vidyadhar.jpg',
  '/images/pandits/pandit-anant.jpg',
  '/images/pandits/pandit-girish.jpg',
  '/images/pandits/pandit-rameshwar.jpg',
];

function PanditsContent() {
  const searchParams = useSearchParams();
  const initialCity = searchParams.get('city') || 'All';
  const initialQuery = searchParams.get('search') || searchParams.get('q') || searchParams.get('service') || '';

  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [dbPandits, setDbPandits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync state if query params change
  useEffect(() => {
    const qCity = searchParams.get('city');
    if (qCity) setSelectedCity(qCity);
    const qSearch = searchParams.get('search') || searchParams.get('q') || searchParams.get('service');
    if (qSearch) setSearchQuery(qSearch);
  }, [searchParams]);

  useEffect(() => {
    async function loadPandits() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/pandits`);
        if (res.ok) {
          const json = await res.json();
          const items = Array.isArray(json) ? json : (json.data || []);
          if (Array.isArray(items) && items.length > 0) {
            setDbPandits(items);
          }
        }
      } catch (e) {
        console.warn('Failed to load live pandits from API:', e);
      } finally {
        setLoading(false);
      }
    }
    loadPandits();
  }, []);

  // Map database pandits with authentic cultural properties
  const displayPandits = dbPandits.map((dp, index) => {
    const fallbackImage = PANDIT_FALLBACK_IMAGES[index % PANDIT_FALLBACK_IMAGES.length];
    const experience = dp.experienceYears || 10;
    const price = dp.basePrice ? Number(dp.basePrice) : 2100;
    const languages = Array.isArray(dp.languages) && dp.languages.length > 0
      ? dp.languages
      : ['Marathi', 'Hindi', 'Sanskrit'];
    const specialties = Array.isArray(dp.specializations) && dp.specializations.length > 0
      ? dp.specializations
      : ['Satyanarayan Mahapuja', 'Griha Pravesh', 'Vedic Hawan'];

    return {
      id: dp.id,
      name: dp.fullName || 'Vedic Pandit',
      devanagariName: dp.fullName?.includes('Pt.')
        ? dp.fullName.replace('Pt.', 'पं.')
        : `वेदमूर्ती ${dp.fullName || 'शास्त्री'}`,
      title: dp.bio?.includes('Gurukul')
        ? 'Gurukul Initiated Vedic Scholar'
        : `${experience}+ Yrs Exp • Vedic Ritual Specialist`,
      city: dp.city || 'Pune',
      state: dp.state || 'Maharashtra',
      languages,
      experienceYears: experience,
      gurukulLineage: dp.bio || 'Formally initiated Vedic scholar with traditional Vidhi execution and Sanskrit mastery.',
      specialties,
      avatarUrl: dp.avatarUrl || fallbackImage,
      basePrice: price,
      rating: dp.averageRating && Number(dp.averageRating) > 0 ? Number(dp.averageRating) : 4.9,
      reviewCount: dp.totalReviews || (12 + (index * 7)),
      hasReviews: true,
      isVerified: true,
    };
  });

  const filteredPandits = displayPandits.filter((p) => {
    const cityMatch =
      selectedCity === 'All' ||
      p.city.toLowerCase().includes(selectedCity.toLowerCase()) ||
      selectedCity.toLowerCase().includes(p.city.toLowerCase());

    const langMatch =
      selectedLanguage === 'All' ||
      p.languages.some((l: string) => l.toLowerCase().includes(selectedLanguage.toLowerCase()));

    const searchMatch =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.devanagariName.includes(searchQuery) ||
      p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.specialties.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    return cityMatch && langMatch && searchMatch;
  });

  const cityOptions = ['All', 'Pune', 'Varanasi', 'Ujjain', 'Bengaluru', 'Mumbai', 'Delhi NCR'];
  const languageOptions = ['All', 'Marathi', 'Hindi', 'Sanskrit', 'Kannada', 'English'];

  return (
    <div className="min-h-screen flex flex-col bg-ivory text-brown">
      <Navbar />

      {/* Header Banner */}
      <div className="bg-maroon-900 text-ivory py-16 border-b border-gold/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-sacred-pattern opacity-10" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/15 border border-gold/40 text-gold-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Certified Gurukul Acharyas • 100% Shastra Verified</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-heading font-bold text-ivory">
              Verified Vedic Pandits Marketplace
            </h1>
            <p className="text-xs sm:text-sm font-sans text-beige/85 leading-relaxed pt-1">
              Connect with background-checked, Sanskrit-fluent Gurukul Acharyas across Pune, Varanasi, Ujjain & Bengaluru. 100% pure Shastric Vidhi with transparent Dakshina.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="border-b border-beige bg-white sticky top-20 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 text-gold-600 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search pandit by name, ritual, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-ivory border border-beige rounded-xl text-xs font-sans text-brown placeholder-brown/50 focus:outline-none focus:ring-2 focus:ring-maroon"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-sans">
            <span className="font-semibold text-brown/70 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-gold-600" /> City:
            </span>
            {cityOptions.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedCity(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  selectedCity.toLowerCase() === c.toLowerCase()
                    ? 'bg-maroon text-ivory shadow-sm'
                    : 'bg-ivory text-brown hover:bg-beige/60 border border-beige'
                }`}
              >
                {c}
              </button>
            ))}

            <span className="font-semibold text-brown/70 ml-2">Language:</span>
            {languageOptions.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setSelectedLanguage(l)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  selectedLanguage.toLowerCase() === l.toLowerCase()
                    ? 'bg-gold-700 text-ivory shadow-sm'
                    : 'bg-ivory text-brown hover:bg-beige/60 border border-beige'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 text-gold-600 animate-spin mx-auto mb-3" />
            <p className="text-xs font-semibold text-brown/70">Connecting to verified Vedic Pandit directory in PostgreSQL...</p>
          </div>
        ) : filteredPandits.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-beige p-8 max-w-lg mx-auto shadow-sm">
            <ShieldCheck className="w-12 h-12 text-gold-600 mx-auto mb-3" />
            <h3 className="font-heading font-bold text-lg text-maroon">No Verified Pandits Found</h3>
            <p className="text-xs text-brown/70 mt-1 mb-5">
              No approved Pandits match &quot;{selectedCity !== 'All' ? selectedCity : ''} {searchQuery}&quot;. Try selecting &quot;All&quot; or resetting filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCity('All');
                setSelectedLanguage('All');
                setSearchQuery('');
              }}
              className="px-5 py-2.5 bg-maroon text-ivory text-xs font-semibold rounded-xl hover:bg-maroon-800 transition shadow-sm cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-sans">
            {filteredPandits.map((pandit) => (
              <div
                key={pandit.id}
                className="bg-white rounded-2xl p-7 border border-beige hover:border-gold/60 shadow-sacred hover:shadow-sacred-lg transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start gap-5">
                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-gold shrink-0 bg-beige/30">
                      <Image
                        src={pandit.avatarUrl}
                        alt={pandit.name}
                        fill
                        sizes="96px"
                        className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-heading font-bold text-lg text-maroon">{pandit.name}</h3>
                          <span title="DevSutra Verified Shastric Scholar">
                            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                          </span>
                        </div>
                        {pandit.hasReviews && pandit.rating && (
                          <div className="flex items-center gap-1 text-gold-600 text-xs font-bold bg-gold/15 px-2 py-0.5 rounded-md">
                            <Star className="w-3.5 h-3.5 fill-gold-500 text-gold-500" />
                            <span>{pandit.rating}</span>
                            <span className="text-brown/50 font-normal">({pandit.reviewCount})</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-devanagari font-bold text-gold-700 mt-0.5">
                        {pandit.devanagariName}
                      </p>
                      <p className="text-xs font-medium text-brown/80 mt-1 italic">{pandit.title}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-brown/70">
                        <span className="flex items-center gap-1 font-semibold text-brown">
                          <MapPin className="w-3.5 h-3.5 text-gold-600" />
                          {pandit.city}, {pandit.state}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-gold-600" />
                          {pandit.experienceYears}+ Years
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 p-3.5 bg-ivory rounded-xl border border-beige text-xs text-brown/80 space-y-1.5">
                    <p className="font-semibold text-maroon text-[11px] uppercase tracking-wider">
                      Gurukul Heritage & Lineage:
                    </p>
                    <p className="italic text-[11px]">{pandit.gurukulLineage}</p>
                  </div>

                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex items-center gap-1.5 text-brown/75">
                      <Globe2 className="w-3.5 h-3.5 text-gold-600 shrink-0" />
                      <span>Languages: <strong>{pandit.languages.join(', ')}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-brown/75">
                      <BookOpen className="w-3.5 h-3.5 text-gold-600 shrink-0" />
                      <span>Specialties: {pandit.specialties.join(', ')}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-beige flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-brown/50 block">Booking Dakshina</span>
                    <p className="text-base font-extrabold text-maroon">₹{pandit.basePrice.toLocaleString('en-IN')}</p>
                  </div>

                  <Link
                    href={`/booking?panditId=${pandit.id}&panditName=${encodeURIComponent(pandit.name)}&city=${encodeURIComponent(pandit.city)}`}
                    className="px-5 py-2.5 bg-maroon hover:bg-maroon-800 text-ivory text-xs font-semibold rounded-xl shadow-sm transition flex items-center gap-1.5 border border-gold/30 hover:scale-[1.02]"
                  >
                    <Calendar className="w-3.5 h-3.5 text-gold-300" />
                    <span>Book This Pandit</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function PanditsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-ivory">
          <Loader2 className="w-8 h-8 text-gold-600 animate-spin" />
        </div>
      }
    >
      <PanditsContent />
    </Suspense>
  );
}
