'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Filter, Loader2, CheckCircle2, Clock, XCircle, AlertCircle, RefreshCw, Calendar } from 'lucide-react';
import { getClientToken } from '@/lib/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchBookings = useCallback(async () => {
    const token = getClientToken();
    try {
      setLoading(true);
      const url = new URL(`${API_BASE_URL}/admin/bookings`);
      if (statusFilter !== 'ALL') url.searchParams.append('status', statusFilter);
      if (search.trim()) url.searchParams.append('search', search.trim());

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        const data = json.data?.bookings || json.bookings || json.data || [];
        setBookings(data);
      }
    } catch (e) {
      console.error('Failed to fetch bookings:', e);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    const token = getClientToken();
    try {
      setUpdatingId(bookingId);
      const res = await fetch(`${API_BASE_URL}/admin/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setMsg({ type: 'success', text: `Booking status updated to ${newStatus}.` });
        fetchBookings();
      } else {
        const err = await res.json();
        setMsg({ type: 'error', text: err.message || 'Failed to update status.' });
      }
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message || 'Error updating status.' });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 p-6 sm:p-8 space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/dashboard" className="p-2 bg-stone-800 rounded-lg hover:bg-stone-700 transition">
            <ArrowLeft className="w-4 h-4 text-stone-300" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">Platform Bookings Control</h1>
            <p className="text-xs text-stone-400">Live PostgreSQL bookings management and status workflow</p>
          </div>
        </div>
        <button
          onClick={fetchBookings}
          className="self-start sm:self-auto px-3 py-1.5 bg-stone-800 hover:bg-stone-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 text-stone-300 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {msg && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center justify-between ${
            msg.type === 'success' ? 'bg-emerald-950/80 border border-emerald-600 text-emerald-200' : 'bg-rose-950/80 border border-rose-600 text-rose-200'
          }`}
        >
          <span>{msg.text}</span>
          <button onClick={() => setMsg(null)} className="underline text-[10px]">Dismiss</button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Booking ID (#DS-...), Devotee name, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-600"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto w-full sm:w-auto">
          {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                statusFilter === s
                  ? 'bg-amber-600 text-white'
                  : 'bg-stone-950 text-stone-400 hover:bg-stone-800 border border-stone-800'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-stone-950 border border-stone-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-3" />
            <p className="text-xs text-stone-400">Loading bookings from database...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-16 text-center text-xs text-stone-400">
            <Calendar className="w-8 h-8 text-stone-600 mx-auto mb-2" />
            <p className="font-semibold text-stone-300">No bookings found</p>
            <p className="text-[11px] text-stone-500 mt-1">Try clearing your search query or status filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-300">
              <thead className="bg-stone-800 text-stone-400 uppercase text-[10px]">
                <tr>
                  <th className="p-4">Booking Ref</th>
                  <th className="p-4">Puja & Ceremony</th>
                  <th className="p-4">Devotee / Customer</th>
                  <th className="p-4">Assigned Pandit</th>
                  <th className="p-4">Muhurat Date & Time</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800">
                {bookings.map((b) => {
                  const customerName = b.customerProfile ? `${b.customerProfile.firstName} ${b.customerProfile.lastName}`.trim() : 'Guest Devotee';
                  const panditName = b.panditProfile?.fullName || 'Assigned Vedic Pandit';
                  const pujaTitle = b.puja?.title || 'Vedic Ritual';
                  const isUpdating = updatingId === b.id;

                  return (
                    <tr key={b.id} className="hover:bg-stone-900/60 transition">
                      <td className="p-4 font-mono font-bold text-white">{b.bookingNumber}</td>
                      <td className="p-4">
                        <p className="font-semibold text-stone-200">{pujaTitle}</p>
                        <p className="text-[10px] text-stone-400">{b.city} {b.pincode ? `(${b.pincode})` : ''}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-stone-200">{customerName}</p>
                        <p className="text-[10px] text-stone-400">{b.customerProfile?.user?.phoneNumber || ''}</p>
                      </td>
                      <td className="p-4 text-amber-300/90">{panditName}</td>
                      <td className="p-4">
                        <p className="text-stone-200">{new Date(b.pujaDate).toLocaleDateString()}</p>
                        <p className="text-[10px] text-stone-400">{b.pujaTimeSlot}</p>
                      </td>
                      <td className="p-4 text-emerald-400 font-bold">₹{Number(b.totalAmount).toLocaleString()}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          b.status === 'CONFIRMED'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : b.status === 'COMPLETED'
                            ? 'bg-blue-500/20 text-blue-400'
                            : b.status === 'CANCELLED'
                            ? 'bg-rose-500/20 text-rose-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {b.status === 'PENDING' && (
                            <button
                              disabled={isUpdating}
                              onClick={() => handleUpdateStatus(b.id, 'CONFIRMED')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-lg transition"
                            >
                              Confirm
                            </button>
                          )}
                          {b.status === 'CONFIRMED' && (
                            <button
                              disabled={isUpdating}
                              onClick={() => handleUpdateStatus(b.id, 'COMPLETED')}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold rounded-lg transition"
                            >
                              Complete
                            </button>
                          )}
                          {b.status !== 'CANCELLED' && b.status !== 'COMPLETED' && (
                            <button
                              disabled={isUpdating}
                              onClick={() => handleUpdateStatus(b.id, 'CANCELLED')}
                              className="px-2 py-1 bg-stone-800 hover:bg-rose-900/60 text-rose-400 text-[11px] font-bold rounded-lg transition"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
