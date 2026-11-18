'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/layout/Footer';
import { POPULAR_PUJA_CATEGORIES_DATA, FEATURED_PANDITS_DATA } from '@/lib/cultural-images';
import {
  Clock,
  ShieldCheck,
  Calendar,
  Sparkles,
  Flame,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Star,
  MapPin,
  Gift,
  HelpCircle,
} from 'lucide-react';

export default function PujaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const puja =
    POPULAR_PUJA_CATEGORIES_DATA.find((p) => p.slug === slug) ||
    POPULAR_PUJA_CATEGORIES_DATA[0];

  const [includeSamagri, setIncludeSamagri] = useState(true);

  // Pandits specialized in this ritual
  const matchingPandits = FEATURED_PANDITS_DATA.filter((p) =>
    p.specialties.some((s) => s.toLowerCase().includes(puja.name.toLowerCase().split(' ')[0]))
  );
  const displayPandits = matchingPandits.length > 0 ? matchingPandits : FEATURED_PANDITS_DATA.slice(0, 2);

  return (
    <div className="min-h-screen flex flex-col bg-ivory text-brown">
      <Navbar />

      {/* Breadcrumb Bar */}
      <div className="bg-white border-b border-beige py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs font-sans text-brown/70">
          <Link href="/" className="hover:text-maroon">Home</Link>
          <span>/</span>
          <Link href="/pujas" className="hover:text-maroon">Sacred Pujas</Link>
          <span>/</span>
          <span className="text-maroon font-semibold">{puja.name}</span>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-maroon-900 text-ivory py-12 lg:py-16 relative overflow-hidden border-b border-gold/40">
        <div className="absolute inset-0 bg-sacred-pattern opacity-10" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/15 border border-gold/40 text-gold-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>100% Shastric Vidhi Guaranteed</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-heading font-bold text-ivory tracking-tight">
                {puja.name}
              </h1>
              <p className="text-lg font-devanagari text-gold-300 font-bold">
                {puja.devanagari}
              </p>

              <p className="text-sm font-sans text-beige/90 leading-relaxed max-w-xl">
                {puja.desc}
              </p>

              {/* Badges / Inclusions */}
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 text-xs">
                  <Clock className="w-4 h-4 text-gold-300" />
                  <span>Duration: <strong>{puja.duration}</strong></span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Purohits: <strong>{puja.requiredPandits} Gurukul Pandit</strong></span>
                </div>
              </div>

              {/* Price & Booking Call to Action */}
              <div className="pt-4 flex flex-wrap items-center gap-4">
                <div>
                  <span className="text-[11px] text-beige/70 block uppercase tracking-wider">Starting Dakshina</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-heading font-bold text-gold-300">
                      {puja.startingPriceNotice}
                    </span>
                    {puja.originalPriceNotice && (
                      <span className="text-sm line-through text-beige/60">
                        {puja.originalPriceNotice}
                      </span>
                    )}
                    {puja.discountBadge && (
                      <span className="text-xs bg-emerald-700 text-white px-2 py-0.5 rounded font-bold">
                        {puja.discountBadge}
                      </span>
                    )}
                  </div>
                </div>

                <Link
                  href={`/booking?puja=${puja.slug}`}
                  className="px-8 py-3.5 bg-gradient-to-r from-saffron to-maroon text-ivory font-semibold text-sm rounded-xl shadow-sacred hover:shadow-sacred-lg border border-gold/40 flex items-center gap-2 transition"
                >
                  <Calendar className="w-4 h-4 text-gold-200" />
                  <span>Book This Ceremony Now</span>
                </Link>
              </div>
            </div>

            {/* Authentic Ceremony Photograph */}
            <div className="relative h-80 sm:h-96 w-full rounded-3xl overflow-hidden border-2 border-gold/40 shadow-2xl bg-black">
              <Image
                src={puja.image}
                alt={puja.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-3 border border-gold/30 flex items-center justify-between text-xs text-brown font-sans shadow-lg">
                <span className="flex items-center gap-1.5 font-semibold text-maroon">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Authentic Traditional Setup
                </span>
                <span className="text-brown/70 font-devanagari">॥ शुभ मुहूर्त ॥</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Body Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 space-y-16">
        {/* Spiritual Significance & Purpose */}
        <section className="bg-white rounded-3xl p-8 sm:p-10 border border-beige shadow-sacred">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-maroon font-sans">
              <Flame className="w-4 h-4 text-saffron" />
              <span>Vedic Vidhi Insights</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-brown">
              Spiritual Significance & Benefits
            </h2>
            <p className="text-sm font-sans text-brown/80 leading-relaxed">
              {puja.significance}
            </p>
            <p className="text-sm font-sans text-brown/75 leading-relaxed pt-2">
              Performed with sacred Sanskrit mantras passed down through generations, this ritual removes negative energies (Doshas), aligns positive planetary vibrations, and brings health, prosperity, and peace to your family.
            </p>
          </div>
        </section>

        {/* 4 Sacred Steps Performed */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-brown">
              Ritual Ceremony Flow (Vidhi)
            </h2>
            <p className="text-xs sm:text-sm text-brown/70 font-sans mt-1">
              Every puja is conducted step-by-step according to canonical Sanatan scriptures.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 font-sans">
            {[
              {
                step: '01',
                title: 'Sankalpa & Kalash Sthapana',
                desc: 'The devotee family takes the sacred vow (Sankalpa) citing Gotra, Nakshatra, and auspicious intentions.',
              },
              {
                step: '02',
                title: 'Shodashopachara Pujan',
                desc: '16-step traditional worship of deities with flower garlands, sandalwood, deepak, dhoop, and naivedya.',
              },
              {
                step: '03',
                title: 'Sacred Hawan Agni Ahuti',
                desc: 'Offerings of pure cow ghee, 51 medicinal herbs, and navadhanya into the holy fire invoking Agni Devata.',
              },
              {
                step: '04',
                title: 'Maha Aarti & Vedic Ashirwad',
                desc: 'Concluding Mangal Aarti, sprinkling of consecrated Kalash holy water, and Pandit blessings for the family.',
              },
            ].map((s) => (
              <div
                key={s.step}
                className="bg-white p-6 rounded-2xl border border-beige shadow-sm hover:border-gold/60 transition"
              >
                <span className="text-xs font-bold text-gold-600 font-mono">Step {s.step}</span>
                <h3 className="font-heading font-bold text-base text-maroon mt-1">{s.title}</h3>
                <p className="text-xs text-brown/70 mt-2 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Samagri Included Option */}
        <section className="bg-beige/30 rounded-3xl p-8 border border-beige flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-maroon text-ivory flex items-center justify-center shrink-0">
              <Gift className="w-6 h-6 text-gold-300" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-brown">
                Hassle-Free 100% Pure Samagri Kit
              </h3>
              <p className="text-xs sm:text-sm text-brown/75 font-sans mt-1 max-w-xl">
                Don&apos;t worry about arranging ingredients! Our Pandit can bring a complete box of temple-grade pure Cow Ghee, Navadhanya, Gangajal, Dhoop, Kumkum, Supari, and fresh flowers.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs font-semibold text-maroon font-sans">Option available during booking</span>
            <Link
              href={`/booking?puja=${puja.slug}&samagri=true`}
              className="px-6 py-3 bg-maroon hover:bg-maroon-800 text-ivory font-semibold text-xs rounded-xl shadow-sm transition"
            >
              Book with Samagri Kit
            </Link>
          </div>
        </section>

        {/* Available Verified Pandits for this Puja */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-brown">
                Available Verified Pandits
              </h2>
              <p className="text-xs sm:text-sm text-brown/70 font-sans mt-1">
                Gurukul-accredited scholars ready to conduct this ceremony in your city.
              </p>
            </div>
            <Link href="/pandits" className="text-xs font-semibold text-maroon hover:underline">
              View All Pandits →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
            {displayPandits.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl p-6 border border-beige hover:border-gold/60 shadow-sm flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-gold shrink-0 bg-beige/30">
                    <Image
                      src={p.avatarUrl}
                      alt={p.name}
                      fill
                      sizes="64px"
                      className="object-cover object-top"
                    />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-base text-maroon">{p.name}</h3>
                    <p className="text-xs font-devanagari text-gold-700 font-bold">{p.devanagariName}</p>
                    <p className="text-xs text-brown/70 mt-1">{p.city} • {p.experienceYears}+ Yrs Exp</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-gold-600 font-bold">
                      <Star className="w-3 h-3 fill-gold-500 text-gold-500" />
                      <span>{p.rating} ({p.reviewCount} reviews)</span>
                    </div>
                  </div>
                </div>

                <Link
                  href={`/booking?puja=${puja.slug}&panditId=${p.id}`}
                  className="px-4 py-2 bg-maroon hover:bg-maroon-800 text-ivory text-xs font-semibold rounded-xl shadow-sm shrink-0 transition"
                >
                  Select Pandit
                </Link>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
