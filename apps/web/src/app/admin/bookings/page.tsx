'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Search,
  Filter,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  RefreshCw,
  Calendar,
  User,
  Sparkles,
  MapPin,
  IndianRupee,
} from 'lucide-react';
import { getClientToken } from '@/lib/auth';
import AdminLayout from '@/components/admin/AdminLayout';

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
        setMsg({ type: 'success', text: `Booking status updated to ${newStatus}. Status email notification dispatched to Devotee.` });
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
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Booking Management
            </h1>
            <p className="text-xs text-stone-400">
              Live PostgreSQL bookings, assigned purohits, devotee muhurats, and status workflows
            </p>
          </div>
          <button
            onClick={fetchBookings}
            className="self-start sm:self-auto px-3.5 py-2 bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 text-stone-300 hover:text-white transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {msg && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center justify-between ${
              msg.type === 'success'
                ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/80 border border-rose-500/40 text-rose-200'
            }`}
          >
            <span>{msg.text}</span>
            <button onClick={() => setMsg(null)} className="underline text-[10px] cursor-pointer">
              Dismiss
            </button>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative max-w-md w-full">
            <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Booking #, Devotee, or City..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-stone-900 border border-stone-800 rounded-xl text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-600"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'CONFIRMED', 'PENDING', 'COMPLETED', 'CANCELLED'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  statusFilter === s
                    ? 'bg-amber-600 text-white'
                    : 'bg-stone-900 text-stone-400 hover:text-white hover:bg-stone-800 border border-stone-800'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-3" />
              <p className="text-xs text-stone-400">Loading bookings from PostgreSQL database...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="py-16 text-center text-xs text-stone-400">
              <Calendar className="w-8 h-8 text-stone-600 mx-auto mb-2" />
              <p className="font-semibold text-stone-300">No bookings found</p>
              <p className="text-[11px] text-stone-500 mt-1">Try adjusting the status filter or search criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-300">
                <thead className="bg-stone-950 text-stone-400 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4">Booking Number</th>
                    <th className="p-4">Devotee Client</th>
                    <th className="p-4">Puja Ceremony</th>
                    <th className="p-4">Assigned Pandit</th>
                    <th className="p-4">Date & Time Slot</th>
                    <th className="p-4">Dakshina</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800">
                  {bookings.map((b) => {
                    const custName = b.customerProfile
                      ? `${b.customerProfile.firstName || ''} ${b.customerProfile.lastName || ''}`.trim() || 'Devotee'
                      : b.customerName || 'Devotee';
                    const panditName = b.panditProfile?.fullName || 'Awaiting Pandit Assignment';
                    const pujaTitle = b.puja?.title || 'Vedic Ritual';
                    const formattedDate = b.pujaDate ? new Date(b.pujaDate).toLocaleDateString() : 'N/A';

                    return (
                      <tr key={b.id} className="hover:bg-stone-800/50 transition">
                        <td className="p-4">
                          <span className="font-mono text-amber-400 font-bold block">
                            {b.bookingNumber || b.id.slice(0, 8)}
                          </span>
                          <span className="text-[10px] text-stone-500">{b.city || 'Pune'}</span>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-stone-400" />
                            <span>{custName}</span>
                          </div>
                          <span className="text-[10px] text-stone-400 block mt-0.5">
                            {b.customerProfile?.user?.phoneNumber || b.customerPhone || 'N/A'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-stone-200 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            <span>{pujaTitle}</span>
                          </div>
                          {b.includeSamagri && (
                            <span className="text-[10px] text-emerald-400 block mt-0.5">
                              + Samagri Kit Included
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-stone-300 font-medium">
                          {b.panditProfile ? (
                            <span className="text-amber-300 font-medium">Pt. {panditName}</span>
                          ) : (
                            <span className="text-stone-500 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className="text-white block font-medium">{formattedDate}</span>
                          <span className="text-[10px] text-stone-400">{b.pujaTimeSlot || 'Morning Muhurat'}</span>
                        </td>
                        <td className="p-4 font-bold text-white">
                          ₹{Number(b.totalAmount || 0).toLocaleString()}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block ${
                              b.status === 'CONFIRMED'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/40'
                                : b.status === 'COMPLETED'
                                ? 'bg-blue-950 text-blue-300 border border-blue-600/40'
                                : b.status === 'CANCELLED'
                                ? 'bg-rose-950 text-rose-300 border border-rose-600/40'
                                : 'bg-amber-950 text-amber-300 border border-amber-600/40'
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {b.status !== 'COMPLETED' && b.status !== 'CANCELLED' && (
                              <button
                                onClick={() => handleUpdateStatus(b.id, 'COMPLETED')}
                                disabled={updatingId === b.id}
                                className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-emerald-400 rounded-lg text-[10px] font-semibold border border-stone-700 transition cursor-pointer"
                              >
                                Mark Completed
                              </button>
                            )}
                            {b.status !== 'CANCELLED' && b.status !== 'COMPLETED' && (
                              <button
                                onClick={() => handleUpdateStatus(b.id, 'CANCELLED')}
                                disabled={updatingId === b.id}
                                className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-rose-400 rounded-lg text-[10px] font-semibold border border-stone-700 transition cursor-pointer"
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
    </AdminLayout>
  );
}
