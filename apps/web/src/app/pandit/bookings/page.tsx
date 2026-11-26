'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/layout/Footer';
import { Calendar, Clock, MapPin, CheckCircle, Phone, Loader2, ArrowLeft, RefreshCw, XCircle } from 'lucide-react';
import { getClientToken, getSavedUserProfile } from '@/lib/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://pujaconnect-api-he9b.onrender.com/api/v1';

export default function PanditBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchBookings = useCallback(async () => {
    const token = getClientToken();
    if (!token) return;

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/pandits/me/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        const list = json.data?.bookings || json.bookings || json.data || [];
        setBookings(list);
      }
    } catch (e) {
      console.error('Failed to load pandit bookings:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleRespond = async (bookingId: string, action: 'ACCEPT' | 'REJECT') => {
    const token = getClientToken();
    try {
      setActionLoading(bookingId);
      const res = await fetch(`${API_BASE_URL}/pandits/bookings/${bookingId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        setMsg({ type: 'success', text: `Booking successfully ${action === 'ACCEPT' ? 'accepted' : 'declined'}.` });
        fetchBookings();
      } else {
        const err = await res.json();
        setMsg({ type: 'error', text: err.message || 'Action failed.' });
      }
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message || 'Error updating booking.' });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-ivory text-brown font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/pandit/dashboard" className="p-2 bg-beige/50 rounded-xl hover:bg-beige transition">
              <ArrowLeft className="w-4 h-4 text-brown" />
            </Link>
            <div>
              <h1 className="text-2xl font-heading font-bold text-maroon">My Assigned Ceremonies</h1>
              <p className="text-xs text-brown/70">Devotee bookings, sacred muhurat timestamps, and venue locations</p>
            </div>
          </div>

          <button
            onClick={fetchBookings}
            className="self-start sm:self-auto px-3.5 py-2 bg-white border border-beige hover:border-gold rounded-xl text-xs font-semibold flex items-center gap-1.5 text-brown transition shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5 text-gold-600" /> Refresh Bookings
          </button>
        </div>

        {msg && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center justify-between ${
              msg.type === 'success' ? 'bg-emerald-50 border border-emerald-300 text-emerald-900' : 'bg-rose-50 border border-rose-300 text-rose-900'
            }`}
          >
            <span>{msg.text}</span>
            <button onClick={() => setMsg(null)} className="underline text-[10px]">Dismiss</button>
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 text-maroon animate-spin mx-auto mb-3" />
            <p className="text-xs font-semibold text-brown/70">Loading assigned ceremonies from database...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-beige p-8 shadow-sm space-y-2">
            <Calendar className="w-10 h-10 text-gold-600 mx-auto" />
            <h3 className="font-heading font-bold text-base text-maroon">No Ceremonies Assigned Yet</h3>
            <p className="text-xs text-brown/70 max-w-sm mx-auto">
              When devotees book rituals in your city, requests will appear here for your confirmation.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => {
              const customerName = b.customerProfile ? `${b.customerProfile.firstName} ${b.customerProfile.lastName}`.trim() : 'Devotee';
              const customerPhone = b.customerProfile?.user?.phoneNumber || 'Registered Contact';
              const isResponding = actionLoading === b.id;

              return (
                <div
                  key={b.id}
                  className="bg-white p-6 rounded-2xl border border-beige hover:border-gold/60 shadow-sacred transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-brown/60">{b.bookingNumber}</span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          b.status === 'CONFIRMED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : b.status === 'COMPLETED'
                            ? 'bg-blue-100 text-blue-800'
                            : b.status === 'CANCELLED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {b.status}
                      </span>
                      {b.includeSamagri && (
                        <span className="text-[10px] bg-gold/15 text-gold-800 font-semibold px-2 py-0.5 rounded-full border border-gold/30">
                          Samagri Included
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-heading font-bold text-maroon">{b.puja?.title || 'Vedic Ritual'}</h3>
                    <p className="text-xs text-brown/80">
                      Devotee: <strong>{customerName}</strong> ({customerPhone})
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-brown/70 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gold-600" />
                        {new Date(b.pujaDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gold-600" />
                        {b.pujaTimeSlot}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gold-600" />
                        {b.venueAddress}, {b.city} ({b.pincode})
                      </span>
                    </div>
                  </div>

                  <div className="sm:text-right space-y-2 shrink-0">
                    <div>
                      <span className="text-[10px] text-brown/50 uppercase font-bold block">Dakshina</span>
                      <p className="text-lg font-heading font-bold text-maroon">
                        ₹{Number(b.pujaFee || b.totalAmount).toLocaleString()}
                      </p>
                    </div>

                    {b.status === 'PENDING' && (
                      <div className="flex items-center gap-2">
                        <button
                          disabled={isResponding}
                          onClick={() => handleRespond(b.id, 'ACCEPT')}
                          className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-ivory text-xs font-bold rounded-xl transition flex items-center gap-1 shadow-sm"
                        >
                          {isResponding && <Loader2 className="w-3 h-3 animate-spin" />}
                          <span>Accept</span>
                        </button>
                        <button
                          disabled={isResponding}
                          onClick={() => handleRespond(b.id, 'REJECT')}
                          className="px-3 py-1.5 border border-beige hover:bg-rose-50 text-rose-700 text-xs font-bold rounded-xl transition"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
