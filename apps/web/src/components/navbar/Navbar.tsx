'use client';

import { useState } from 'react';
import Link from 'next/link';
import DevSutraLogo from '@/components/ui/DevSutraLogo';
import {
  Compass,
  Users,
  ShoppingBag,
  PhoneCall,
  LogIn,
  Calendar,
  Sparkles,
  Search,
  Menu,
  X,
  Video,
  Info,
  ChevronRight,
  ShieldCheck,
  User,
  History,
  MapPin,
  HelpCircle,
  Power,
  Play,
} from 'lucide-react';
import Image from 'next/image';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const quickSearches = [
    { label: 'Griha Pravesh', link: '/pujas?q=griha-pravesh' },
    { label: 'Satyanarayan Katha', link: '/pujas?q=satyanarayan' },
    { label: 'Rudrabhishek', link: '/pujas?q=rudrabhishek' },
    { label: 'Pandit in Delhi', link: '/pandits?city=Delhi' },
    { label: 'Puja Thali', link: '/store?category=Puja+Thali' },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-ivory/95 backdrop-blur-md border-b border-beige shadow-sm transition-all">
        {/* Top Auspicious Ribbon */}
        <div className="bg-maroon-800 text-ivory text-[11px] font-sans py-1.5 px-4 text-center tracking-wider flex items-center justify-center gap-2 border-b border-gold/30">
          <Sparkles className="w-3.5 h-3.5 text-gold-300 shrink-0 animate-pulse" />
          <span className="font-medium">
            Vedic Tradition • 100% Verified Gurukul Pandits • Pure Temple-Grade Samagri • Pan-India Booking
          </span>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* DevSutra Logo */}
            <Link href="/" className="flex items-center shrink-0">
              <DevSutraLogo variant="horizontal" size="md" showTagline={true} />
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-7 text-sm font-medium font-sans">
              <Link
                href="/"
                className="text-brown hover:text-maroon transition-colors py-1 border-b-2 border-transparent hover:border-maroon"
              >
                Home
              </Link>
              <Link
                href="/pujas"
                className="text-brown hover:text-maroon transition-colors flex items-center gap-1.5 py-1 border-b-2 border-transparent hover:border-maroon"
              >
                <Compass className="w-4 h-4 text-gold-600" />
                Puja Services
              </Link>
              <Link
                href="/pandits"
                className="text-brown hover:text-maroon transition-colors flex items-center gap-1.5 py-1 border-b-2 border-transparent hover:border-maroon"
              >
                <Users className="w-4 h-4 text-gold-600" />
                Find a Pandit
              </Link>
              <Link
                href="/store"
                className="text-brown hover:text-maroon transition-colors flex items-center gap-1.5 py-1 border-b-2 border-transparent hover:border-maroon"
              >
                <ShoppingBag className="w-4 h-4 text-gold-600" />
                Puja Samagri
              </Link>
              <Link
                href="/pujas?type=online"
                className="text-brown hover:text-maroon transition-colors flex items-center gap-1.5 py-1 border-b-2 border-transparent hover:border-maroon"
              >
                <Video className="w-4 h-4 text-saffron" />
                <span>Online Puja</span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-saffron/15 text-saffron rounded">Live</span>
              </Link>
              <Link
                href="/about"
                className="text-brown hover:text-maroon transition-colors flex items-center gap-1.5 py-1 border-b-2 border-transparent hover:border-maroon"
              >
                <Info className="w-4 h-4 text-gold-600" />
                About Us
              </Link>
              <Link
                href="/contact"
                className="text-brown hover:text-maroon transition-colors flex items-center gap-1.5 py-1 border-b-2 border-transparent hover:border-maroon"
              >
                <PhoneCall className="w-4 h-4 text-gold-600" />
                Contact Us
              </Link>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Search Button */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Search pujas, pandits and samagri"
                className="p-2.5 text-brown hover:text-maroon hover:bg-beige/60 rounded-xl transition border border-transparent hover:border-beige"
              >
                <Search className="w-4 h-4 text-gold-700" />
              </button>

              {/* Customer Login */}
              <Link
                href="/customer/login"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-brown hover:text-maroon rounded-xl border border-beige hover:border-maroon transition font-sans"
              >
                <LogIn className="w-3.5 h-3.5 text-gold-600" />
                <span>Customer Login</span>
              </Link>

              {/* Book a Puja CTA */}
              <Link
                href="/booking"
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 text-xs font-semibold text-ivory bg-maroon hover:bg-maroon-800 rounded-xl shadow-sacred hover:shadow-sacred-lg transition duration-200 border border-gold/40 font-sans"
              >
                <Calendar className="w-4 h-4 text-gold-300" />
                <span>Book a Puja</span>
              </Link>

              {/* Mobile Menu Hamburger */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-brown hover:text-maroon hover:bg-beige/60 rounded-xl transition"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer - Speedy Pandit Exact Style */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-white overflow-y-auto animate-in slide-in-from-right duration-200">
            {/* Header: Hello User & Close Button */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-beige">
              <div>
                <h3 className="text-base font-bold text-maroon">Hello, User</h3>
                <p className="text-xs text-brown/80 font-medium">+91 8459369260</p>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 text-maroon hover:opacity-80 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="h-2 bg-ivory border-b border-beige" />

            <div className="flex flex-col text-sm font-sans">
              {/* 1. DevSutra Mudra */}
              <Link
                href="/booking"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-5 py-4 hover:bg-ivory transition border-b border-beige/60"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                    <Image
                      src="/images/icons/devsutra-mudra.jpg"
                      alt="DevSutra Mudra"
                      width={40}
                      height={40}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-maroon block">DevSutra Mudra</span>
                    <span className="text-base font-extrabold text-emerald-700">300</span>
                  </div>
                </div>
                <Play className="w-3.5 h-3.5 text-maroon fill-maroon" />
              </Link>

              {/* 2. Plus Membership */}
              <Link
                href="/pujas"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-5 py-4 hover:bg-ivory transition border-b border-beige/60"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 flex flex-col items-center">
                    <span className="text-[9px] font-black tracking-tighter text-maroon">devsutra</span>
                    <span className="px-1.5 py-0.2 bg-maroon text-ivory text-[8px] font-bold rounded">Plus</span>
                  </div>
                  <span className="text-sm font-bold text-maroon">Plus Membership</span>
                </div>
                <Play className="w-3.5 h-3.5 text-maroon fill-maroon" />
              </Link>

              <div className="h-2 bg-ivory border-y border-beige" />

              {/* 3. My Profile with 10% progress bar */}
              <Link
                href="/customer/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-5 py-4 hover:bg-ivory transition border-b border-beige/60"
              >
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-maroon" />
                  <span className="text-sm font-semibold text-brown">My Profile</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="w-24 h-1 bg-red-100 rounded-full overflow-hidden mb-1">
                      <div className="w-[10%] h-full bg-maroon rounded-full" />
                    </div>
                    <span className="text-[10px] text-brown/60 block">10% Completed</span>
                  </div>
                  <Play className="w-3.5 h-3.5 text-maroon fill-maroon" />
                </div>
              </Link>

              {/* 4. Puja History */}
              <Link
                href="/customer/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-5 py-4 hover:bg-ivory transition border-b border-beige/60"
              >
                <div className="flex items-center gap-3">
                  <History className="w-5 h-5 text-maroon" />
                  <span className="text-sm font-semibold text-brown">Puja History</span>
                </div>
                <Play className="w-3.5 h-3.5 text-maroon fill-maroon" />
              </Link>

              {/* 5. My Address */}
              <Link
                href="/customer/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-5 py-4 hover:bg-ivory transition border-b border-beige/60"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-maroon" />
                  <span className="text-sm font-semibold text-brown">My Address</span>
                </div>
                <Play className="w-3.5 h-3.5 text-maroon fill-maroon" />
              </Link>

              {/* 6. Help */}
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-5 py-4 hover:bg-ivory transition border-b border-beige/60"
              >
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-maroon" />
                  <span className="text-sm font-semibold text-brown">Help</span>
                </div>
                <Play className="w-3.5 h-3.5 text-maroon fill-maroon" />
              </Link>

              {/* 7. Logout / Login */}
              <Link
                href="/customer/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-5 py-4 hover:bg-ivory transition border-b border-beige/60"
              >
                <div className="flex items-center gap-3">
                  <Power className="w-5 h-5 text-maroon" />
                  <span className="text-sm font-semibold text-brown">Logout</span>
                </div>
                <Play className="w-3.5 h-3.5 text-maroon fill-maroon" />
              </Link>

              <div className="h-2 bg-ivory border-y border-beige" />

              {/* Follow Us On */}
              <div className="flex items-center justify-between px-5 py-5 border-b border-beige/60">
                <span className="text-sm font-semibold text-brown">Follow Us On</span>
                <div className="flex items-center gap-2.5">
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noreferrer"
                    className="w-7 h-7 rounded-full bg-[#1DA1F2] text-white flex items-center justify-center text-xs font-bold shadow-sm"
                  >
                    𝕏
                  </a>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noreferrer"
                    className="w-7 h-7 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-xs font-bold shadow-sm"
                  >
                    f
                  </a>
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noreferrer"
                    className="w-7 h-7 rounded-full bg-[#FF0000] text-white flex items-center justify-center text-xs font-bold shadow-sm"
                  >
                    ▶
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white flex items-center justify-center text-xs font-bold shadow-sm"
                  >
                    📷
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-brown/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-ivory border border-gold/40 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-beige pb-3">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-gold-600" />
                <h3 className="font-heading font-bold text-lg text-maroon">Search DevSutra</h3>
              </div>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-1 rounded-lg text-brown/60 hover:text-maroon"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                autoFocus
                placeholder="Search pujas (e.g. Griha Pravesh), Pandits, or Samagri..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-beige rounded-xl text-brown placeholder-brown/40 focus:outline-none focus:ring-2 focus:ring-maroon font-sans text-sm"
              />
            </div>

            {/* Quick Suggestions */}
            <div>
              <p className="text-xs font-medium text-brown/60 mb-2 font-sans">Auspicious quick searches:</p>
              <div className="flex flex-wrap gap-2">
                {quickSearches.map((item) => (
                  <Link
                    key={item.label}
                    href={item.link}
                    onClick={() => setSearchOpen(false)}
                    className="px-3 py-1.5 text-xs bg-beige/40 hover:bg-beige text-brown rounded-lg transition font-sans border border-beige"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-brown/60 pt-2 border-t border-beige">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-gold-600" /> Verified Shastric rituals & pure samagri
              </span>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="text-maroon hover:underline font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
