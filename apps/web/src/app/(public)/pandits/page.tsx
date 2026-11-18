'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/layout/Footer';
import { FEATURED_PANDITS_DATA } from '@/lib/cultural-images';
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
} from 'lucide-react';

export default function PanditsPage() {
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPandits = FEATURED_PANDITS_DATA.filter((p) => {
    const cityMatch = selectedCity === 'All' || p.city.includes(selectedCity);
    const langMatch = selectedLanguage === 'All' || p.languages.includes(selectedLanguage);
    const searchMatch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.devanagariName.includes(searchQuery) ||
      p.specialties.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return cityMatch && langMatch && searchMatch;
  });

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
              <span>Certified Gurukul Acharyas</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-heading font-bold text-ivory">
              Verified Vedic Pandits Marketplace
            </h1>
            <p className="text-xs sm:text-sm font-sans text-beige/85 leading-relaxed pt-1">
              Connect with background-checked, Sanskrit-fluent scholars credentialed from historic Gurukuls across India. Punctual, dignified, and committed to pure Shastric Vidhi.
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
              placeholder="Search by name, specialization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-ivory border border-beige rounded-xl text-xs font-sans text-brown placeholder-brown/50 focus:outline-none focus:ring-2 focus:ring-maroon"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-sans">
            <span className="font-semibold text-brown/70 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-gold-600" /> City:
            </span>
            {['All', 'Delhi', 'Mumbai', 'Bengaluru', 'Ahmedabad'].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedCity(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedCity === c
                    ? 'bg-maroon text-ivory'
                    : 'bg-ivory text-brown hover:bg-beige/60 border border-beige'
                }`}
              >
                {c}
              </button>
            ))}

            <span className="font-semibold text-brown/70 ml-2">Language:</span>
            {['All', 'Hindi', 'Sanskrit', 'Marathi', 'Kannada'].map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setSelectedLanguage(l)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedLanguage === l
                    ? 'bg-gold-700 text-ivory'
                    : 'bg-ivory text-brown hover:bg-beige/60 border border-beige'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
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
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gold-600" />
                        {pandit.city}
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
                  <p className="text-xs font-semibold text-maroon italic">Per Ceremony Vidhi</p>
                </div>

                <Link
                  href={`/booking?panditId=${pandit.id}`}
                  className="px-5 py-2.5 bg-maroon hover:bg-maroon-800 text-ivory text-xs font-semibold rounded-xl shadow-sm transition flex items-center gap-1.5 border border-gold/30"
                >
                  <Calendar className="w-3.5 h-3.5 text-gold-300" />
                  <span>Book This Pandit</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
