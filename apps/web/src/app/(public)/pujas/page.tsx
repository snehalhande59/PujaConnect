'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/layout/Footer';
import { POPULAR_PUJA_CATEGORIES_DATA } from '@/lib/cultural-images';
import {
  Clock,
  Users,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Flame,
  Search,
  Filter,
} from 'lucide-react';

export default function PujasPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('All');

  const filteredPujas = POPULAR_PUJA_CATEGORIES_DATA.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.devanagari.includes(searchQuery);
    return matchesSearch;
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
              <span>Sacred Vedic Ceremonies</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-heading font-bold text-ivory">
              Vedic Puja Services & Rituals
            </h1>
            <p className="text-xs sm:text-sm font-sans text-beige/85 leading-relaxed pt-1">
              Every ritual is performed strictly in accordance with traditional Shastras by verified Gurukul-trained priests. Custom muhurats, regional languages, and doorstep samagri available across India.
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="border-b border-beige bg-white sticky top-20 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gold-600 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search pujas (e.g. Griha Pravesh)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-ivory border border-beige rounded-xl text-xs font-sans text-brown placeholder-brown/50 focus:outline-none focus:ring-2 focus:ring-maroon"
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-sans text-brown/80 w-full sm:w-auto justify-end">
            <span className="font-semibold text-maroon">{filteredPujas.length}</span> Sacred Pujas Available
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 font-sans">
          {filteredPujas.map((puja) => (
            <div
              key={puja.slug}
              className="bg-white rounded-2xl overflow-hidden border border-beige hover:border-gold/60 shadow-sacred hover:shadow-sacred-lg transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Cultural Photo */}
                <Link href={`/pujas/${puja.slug}`} className="block relative h-48 w-full bg-beige/30 overflow-hidden cursor-pointer">
                  <Image
                    src={puja.image}
                    alt={puja.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/95 px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-800 shadow-sm">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Shastra Approved</span>
                  </div>
                  <span className="absolute bottom-3 left-3 text-xs font-devanagari font-bold text-gold-200">
                    {puja.devanagari}
                  </span>
                </Link>

                <div className="p-6">
                  <Link href={`/pujas/${puja.slug}`}>
                    <h3 className="text-xl font-heading font-bold text-maroon group-hover:text-gold-700 transition">
                      {puja.name}
                    </h3>
                  </Link>
                  <p className="text-xs text-brown/75 mt-2 leading-relaxed">
                    {puja.desc}
                  </p>

                  <div className="mt-4 p-3 bg-ivory rounded-xl border border-beige text-[11px] text-brown/80 space-y-1">
                    <p className="font-semibold text-maroon">Vedic Significance:</p>
                    <p className="line-clamp-2">{puja.significance}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-beige text-xs text-brown/70">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gold-600 shrink-0" />
                      <span>{puja.duration}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-gold-600 shrink-0" />
                      <span>{puja.requiredPandits} Gurukul Pandit{puja.requiredPandits > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <div className="pt-3 border-t border-beige flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-brown/50 block">Dakshina</span>
                    <p className="text-sm font-bold text-maroon">{puja.startingPriceNotice || '₹2,100/-'}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/pujas/${puja.slug}`}
                      className="px-3 py-2 bg-ivory hover:bg-beige text-maroon text-xs font-semibold rounded-xl border border-beige transition"
                    >
                      Details
                    </Link>
                    <Link
                      href={`/booking?puja=${puja.slug}`}
                      className="px-4 py-2 bg-maroon hover:bg-maroon-800 text-ivory text-xs font-semibold rounded-xl shadow-sm transition flex items-center gap-1.5 border border-gold/30"
                    >
                      <span>Book</span>
                      <ArrowRight className="w-3.5 h-3.5 text-gold-300" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
