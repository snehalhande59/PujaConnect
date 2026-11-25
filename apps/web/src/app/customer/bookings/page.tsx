'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/layout/Footer';
import { getClientToken, getSavedUserProfile } from '@/lib/auth';
import { Calendar, Clock, MapPin, Download, CheckCircle2, Loader2, BookOpen, AlertCircle } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export default function CustomerBookingsPage() {
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleCancelBooking = async (rawId: string, bookingNumber: string) => {
    if (!confirm(`Are you sure you want to cancel booking #${bookingNumber}?`)) return;
    const token = getClientToken();
    if (!token) return;

    try {
      setCancellingId(rawId);
      const res = await fetch(`${API_BASE_URL}/bookings/${rawId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: 'Devotee cancelled reservation from dashboard' }),
      });

      if (res.ok) {
        setAllBookings((prev) =>
          prev.map((item) => (item.rawId === rawId ? { ...item, status: 'CANCELLED' } : item))
        );
        alert('Your ceremony reservation has been cancelled successfully.');
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.message || 'Failed to cancel reservation.');
      }
    } catch (e: any) {
      alert(e.message || 'Error communicating with server.');
    } finally {
      setCancellingId(null);
    }
  };

  useEffect(() => {
    async function loadBookings() {
      const token = getClientToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/bookings/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const json = await res.json();
          const items = Array.isArray(json) ? json : (json.data || []);
          if (Array.isArray(items)) {
            const mapped = items.map((b: any) => ({
              id: b.bookingNumber || b.id,
              rawId: b.id,
              pujaName: b.puja?.title || 'Vedic Ceremony',
              panditName: b.panditProfile?.fullName || 'Assigned Gurukul Pandit',
              date: b.pujaDate ? new Date(b.pujaDate).toLocaleDateString() : 'Scheduled Date',
              timeSlot: b.pujaTimeSlot || 'Morning Muhurat',
              city: b.city || 'India',
              totalAmount: `₹${Number(b.totalAmount || b.basePrice || 0).toLocaleString('en-IN')}`,
              status: b.status || 'CONFIRMED',
            }));
            setAllBookings(mapped);
          }
        }
      } catch (e) {
        console.error('Failed to load real customer bookings:', e);
      } finally {
        setLoading(false);
      }
    }

    loadBookings();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-ivory text-brown font-sans">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-heading text-maroon">My Sacred Bookings</h1>
            <p className="text-xs text-brown/70">
              Track ceremony schedules, assigned Gurukul priests, and dakshina receipts
            </p>
          </div>
          <Link
            href="/booking"
            className="px-4 py-2.5 bg-maroon hover:bg-maroon-800 text-ivory text-xs font-semibold rounded-xl shadow transition self-start sm:self-auto"
          >
            + Book New Ceremony
          </Link>
        </div>

        {loading ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-beige shadow-sacred">
            <Loader2 className="w-8 h-8 text-gold-600 animate-spin mx-auto mb-3" />
            <p className="text-xs font-semibold text-brown/70">Loading your bookings from DevSutra database...</p>
          </div>
        ) : allBookings.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-beige p-8 shadow-sacred max-w-lg mx-auto">
            <BookOpen className="w-12 h-12 text-gold-600 mx-auto mb-3 opacity-60" />
            <h3 className="font-heading font-bold text-lg text-maroon">No Sacred Ceremonies Yet</h3>
            <p className="text-xs text-brown/70 mt-1 mb-6">
              You haven&apos;t booked any Vedic rituals yet. Book your first puja with certified Gurukul priests.
            </p>
            <Link
              href="/booking"
              className="px-6 py-2.5 bg-maroon text-ivory text-xs font-bold rounded-xl shadow-sacred hover:bg-maroon-800 transition"
            >
              Explore Pujas & Book
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {allBookings.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-3xl p-6 border border-beige hover:border-gold shadow-sacred transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-beige/60 pb-3">
                  <div>
                    <span className="text-[10px] font-mono text-brown/50 uppercase font-semibold">
                      Booking ID: {b.id}
                    </span>
                    <h3 className="text-base font-bold font-heading text-maroon">{b.pujaName}</h3>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {b.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs text-brown/80">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-brown/50 block">Purohit / Pandit</span>
                    <p className="font-semibold text-brown">{b.panditName}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-brown/50 block">Muhurat Date & Time</span>
                    <div className="flex items-center gap-1.5 text-brown">
                      <Calendar className="w-3.5 h-3.5 text-gold-600 shrink-0" />
                      <span>{b.date} • {b.timeSlot}</span>
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-brown/50 block">Location</span>
                    <div className="flex items-center gap-1 text-brown">
                      <MapPin className="w-3.5 h-3.5 text-gold-600 shrink-0" />
                      <span>{b.city}</span>
                    </div>
                  </div>
                  <div className="space-y-0.5 sm:text-right">
                    <span className="text-[10px] uppercase font-bold text-brown/50 block">Total Dakshina</span>
                    <p className="text-base font-extrabold text-maroon">{b.totalAmount}</p>
                  </div>
                </div>

                {(b.status === 'CONFIRMED' || b.status === 'PENDING') && (
                  <div className="flex items-center justify-end pt-3 border-t border-beige/40">
                    <button
                      onClick={() => handleCancelBooking(b.rawId, b.id)}
                      disabled={cancellingId === b.rawId}
                      className="px-3.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                    >
                      {cancellingId === b.rawId ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Cancelling...</span>
                        </>
                      ) : (
                        <span>Cancel Sacred Reservation</span>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
