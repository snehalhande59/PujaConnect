'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/layout/Footer';
import { getSavedUserProfile, clearClientSession, getClientToken, AuthUser } from '@/lib/auth';
import {
  Calendar,
  Package,
  Clock,
  User,
  MapPin,
  LogOut,
  Sparkles,
  ShieldCheck,
  PlusCircle,
  Loader2,
  BookOpen,
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export default function CustomerDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    const profile = getSavedUserProfile();
    if (!profile) {
      router.push('/customer/login');
      return;
    }

    if (profile.role !== 'CUSTOMER') {
      if (profile.role === 'ADMIN') {
        router.push('/admin/dashboard');
        return;
      }
      if (profile.role === 'PANDIT') {
        router.push('/pandit/dashboard');
        return;
      }
    }

    setUser(profile);

    // Fetch real devotee bookings from PostgreSQL
    const token = getClientToken();
    if (token) {
      fetch(`${API_BASE_URL}/bookings/my`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          const items = Array.isArray(json) ? json : (json?.data || []);
          if (Array.isArray(items)) {
            setBookings(items);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    clearClientSession();
    router.push('/customer/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-ivory text-brown">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-2">
            <Sparkles className="w-8 h-8 text-gold-600 animate-pulse mx-auto" />
            <p className="text-xs font-semibold text-maroon">Loading your Devotee Portal...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const displayName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Devotee' : 'Devotee';
  const upcomingBooking = bookings[0]; // latest / upcoming booking
  const scheduledCount = bookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'PENDING').length;

  return (
    <div className="min-h-screen flex flex-col bg-ivory text-brown font-sans">
      <Navbar />

      {/* Top Banner with Devotee Identity */}
      <div className="bg-maroon-800 text-ivory py-10 border-b border-gold/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-sans">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-gold/20 text-gold-200 text-[11px] font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Devotee Account</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-ivory">
              Namaste, {displayName}
            </h1>
            <p className="text-xs text-beige/80 mt-1 font-sans">
              {user?.email} • Manage your active puja bookings, Gurukul priests, and temple samagri
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/booking"
              className="px-4 py-2.5 bg-ivory hover:bg-beige text-maroon text-xs font-semibold rounded-xl shadow transition flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4 text-maroon" />
              <span>Book New Puja</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2.5 bg-maroon-900 hover:bg-maroon-950 text-beige hover:text-ivory text-xs font-semibold rounded-xl border border-gold/30 transition flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-gold-300" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8 font-sans">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-beige shadow-sacred">
            <span className="text-xs text-brown/60 font-medium">Scheduled Pujas</span>
            <p className="text-2xl font-heading font-bold text-maroon mt-1">{scheduledCount}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-beige shadow-sacred">
            <span className="text-xs text-brown/60 font-medium">Total Ceremonies</span>
            <p className="text-2xl font-heading font-bold text-maroon mt-1">{bookings.length}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-beige shadow-sacred">
            <span className="text-xs text-brown/60 font-medium">Samagri Orders</span>
            <p className="text-2xl font-heading font-bold text-maroon mt-1">0</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-beige shadow-sacred">
            <span className="text-xs text-brown/60 font-medium">Devotee Reviews</span>
            <p className="text-2xl font-heading font-bold text-maroon mt-1">0</p>
          </div>
        </div>

        {/* Scheduled / Upcoming Puja Card */}
        {upcomingBooking ? (
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-beige shadow-sacred space-y-4">
            <div className="flex items-center justify-between border-b border-beige/60 pb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gold-600" />
                <h3 className="text-base font-heading font-bold text-brown">Upcoming Sacred Ceremony</h3>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200">
                {upcomingBooking.status || 'CONFIRMED'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-base font-heading font-bold text-maroon">
                  {upcomingBooking.puja?.title || 'Vedic Ceremony'}
                </h4>
                <p className="text-xs text-brown/70 mt-1">
                  Assigned Priest: <strong>{upcomingBooking.panditProfile?.fullName || 'Assigned Gurukul Pandit'}</strong>
                </p>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-brown/70">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gold-600" />
                    {upcomingBooking.pujaDate ? new Date(upcomingBooking.pujaDate).toLocaleDateString() : 'Scheduled Date'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-gold-600" /> {upcomingBooking.pujaTimeSlot || 'Morning Muhurat'}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gold-600" /> {upcomingBooking.city || 'India'}
                  </span>
                </div>
              </div>

              <div className="text-left sm:text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-beige">
                <span className="text-[10px] uppercase font-bold text-brown/50 block">Dakshina</span>
                <p className="text-base font-bold text-maroon">
                  ₹{Number(upcomingBooking.totalAmount || upcomingBooking.basePrice || 0).toLocaleString('en-IN')}
                </p>
                <span className="text-[11px] text-emerald-700 font-semibold">100% Shastric Vidhi</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-beige shadow-sacred flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gold/15 flex items-center justify-center text-maroon shrink-0">
                <BookOpen className="w-6 h-6 text-gold-700" />
              </div>
              <div>
                <h4 className="text-sm font-bold font-heading text-brown">No Active Ceremonies Scheduled</h4>
                <p className="text-xs text-brown/70">Book your auspicious Griha Pravesh, Satyanarayan, or Hawan with certified Gurukul priests.</p>
              </div>
            </div>
            <Link
              href="/booking"
              className="px-5 py-2.5 bg-maroon text-ivory text-xs font-bold rounded-xl shadow-sacred hover:bg-maroon-800 transition shrink-0"
            >
              Book a Ceremony
            </Link>
          </div>
        )}

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Link
            href="/customer/bookings"
            className="p-6 bg-white rounded-3xl border border-beige shadow-sacred hover:border-gold transition group"
          >
            <Calendar className="w-7 h-7 text-gold-600 group-hover:scale-110 transition-transform mb-3" />
            <h4 className="font-heading font-bold text-brown text-base">My Bookings</h4>
            <p className="text-xs text-brown/70 mt-1">
              View ceremony schedules, assigned Pandits, and downloadable Shastric receipts.
            </p>
          </Link>

          <Link
            href="/customer/orders"
            className="p-6 bg-white rounded-3xl border border-beige shadow-sacred hover:border-gold transition group"
          >
            <Package className="w-7 h-7 text-gold-600 group-hover:scale-110 transition-transform mb-3" />
            <h4 className="font-heading font-bold text-brown text-base">My Samagri Orders</h4>
            <p className="text-xs text-brown/70 mt-1">
              Track delivery of consecrated puja kits, dhoop, and brassware items.
            </p>
          </Link>

          <Link
            href="/customer/profile"
            className="p-6 bg-white rounded-3xl border border-beige shadow-sacred hover:border-gold transition group"
          >
            <User className="w-7 h-7 text-gold-600 group-hover:scale-110 transition-transform mb-3" />
            <h4 className="font-heading font-bold text-brown text-base">Profile & Addresses</h4>
            <p className="text-xs text-brown/70 mt-1">
              Update your contact info, location, and saved ritual delivery addresses.
            </p>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
