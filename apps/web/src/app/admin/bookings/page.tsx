'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
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
  Check,
  X,
  History,
  UserCheck,
  ChevronRight,
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

  // Reassignment Modal State
  const [reassignBooking, setReassignBooking] = useState<any | null>(null);
  const [availablePandits, setAvailablePandits] = useState<any[]>([]);
  const [selectedPanditId, setSelectedPanditId] = useState('');
  const [reassignReason, setReassignReason] = useState('');
  const [reassignLoading, setReassignLoading] = useState(false);

  // Audit History Modal State
  const [historyBooking, setHistoryBooking] = useState<any | null>(null);
  const [auditHistory, setAuditHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchBookings = useCallback(async (opts?: boolean | any) => {
    const silent = opts === true;
    const token = getClientToken();
    try {
      if (!silent) setLoading(true);
      const url = new URL(`${API_BASE_URL}/admin/bookings`);
      if (statusFilter !== 'ALL') url.searchParams.append('status', statusFilter);
      if (search.trim()) url.searchParams.append('search', search.trim());
      url.searchParams.append('_t', Date.now().toString());

      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
    const interval = setInterval(() => fetchBookings(true), 10000);
    return () => clearInterval(interval);
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
        setMsg({
          type: 'success',
          text: `Booking status updated to ${newStatus}. Status email notification dispatched to Devotee.`,
        });
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

  const openReassignModal = async (booking: any) => {
    setReassignBooking(booking);
    setSelectedPanditId('');
    setReassignReason('');
    const token = getClientToken();
    try {
      const res = await fetch(`${API_BASE_URL}/admin/pandits?status=VERIFIED&limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const list = data.data?.data || data.data || [];
        setAvailablePandits(list);
      }
    } catch (e) {
      console.error('Failed to load available pandits:', e);
    }
  };

  const handleReassignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassignBooking || !selectedPanditId) return;

    const token = getClientToken();
    try {
      setReassignLoading(true);
      const res = await fetch(`${API_BASE_URL}/admin/bookings/${reassignBooking.id}/reassign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          newPanditProfileId: selectedPanditId,
          reason: reassignReason.trim() || 'Administrative reassignment',
        }),
      });

      if (res.ok) {
        setMsg({ type: 'success', text: 'Purohit reassigned successfully with slot conflict validation.' });
        setReassignBooking(null);
        fetchBookings();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to reassign pandit.');
      }
    } catch (e: any) {
      alert(e.message || 'Error during reassignment.');
    } finally {
      setReassignLoading(false);
    }
  };

  const openAuditHistoryModal = async (booking: any) => {
    setHistoryBooking(booking);
    setAuditHistory([]);
    setHistoryLoading(true);

    const token = getClientToken();
    try {
      const res = await fetch(`${API_BASE_URL}/admin/bookings/${booking.id}/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setAuditHistory(json.data || json || []);
      }
    } catch (e) {
      console.error('Failed to fetch history:', e);
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
              Booking Management
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Live PostgreSQL bookings, assigned purohits, devotee muhurats, and status workflows
            </p>
          </div>
          <button
            onClick={fetchBookings}
            className="self-start sm:self-auto px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-600' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {msg && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center justify-between shadow-xs ${
              msg.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-2">
              {msg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span className="font-medium">{msg.text}</span>
            </div>
            <button onClick={() => setMsg(null)} className="text-stone-400 hover:text-stone-700 font-bold">
              Dismiss
            </button>
          </div>
        )}

        {/* Status Filters Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 bg-white p-2 rounded-2xl border border-stone-200 shadow-xs">
          {['ALL', 'CONFIRMED', 'PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                statusFilter === s
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between text-xs">
          <div className="relative max-w-md w-full">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Booking #, Devotee, or City..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-stone-300 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-600"
            />
          </div>

          <span className="text-stone-500 font-medium">
            Showing <span className="font-bold text-stone-900">{bookings.length}</span> Bookings
          </span>
        </div>

        {/* Bookings Table */}
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto mb-3" />
              <p className="text-xs text-stone-500">Loading bookings from PostgreSQL database...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="py-16 text-center text-xs text-stone-500 space-y-2">
              <Calendar className="w-10 h-10 text-stone-300 mx-auto" />
              <p className="font-bold text-stone-800 text-sm">No bookings found</p>
              <p className="text-stone-400">Try adjusting the status filter or search criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-stone-50 text-stone-500 uppercase text-[10px] font-bold border-b border-stone-200 tracking-wider">
                  <tr>
                    <th className="p-4">Booking Number</th>
                    <th className="p-4">Devotee Client</th>
                    <th className="p-4">Puja Ceremony</th>
                    <th className="p-4">Assigned Pandit</th>
                    <th className="p-4">Date & Time Slot</th>
                    <th className="p-4">Dakshina Fee</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {bookings.map((b) => {
                    const custName = b.customerProfile
                      ? `${b.customerProfile.firstName || ''} ${b.customerProfile.lastName || ''}`.trim() || 'Devotee'
                      : b.customerName || 'Devotee';
                    const panditName = b.panditProfile?.fullName || 'Awaiting Pandit';
                    const pujaTitle = b.puja?.title || 'Vedic Ritual';
                    const formattedDate = b.pujaDate ? new Date(b.pujaDate).toLocaleDateString() : 'N/A';

                    return (
                      <tr key={b.id} className="hover:bg-stone-50/80 transition">
                        <td className="p-4">
                          <span className="font-mono text-stone-900 font-bold block">
                            {b.bookingNumber || b.id.slice(0, 8)}
                          </span>
                          <span className="text-[10px] text-stone-400">{b.city || 'Pune'}</span>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-stone-900 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-stone-400" />
                            <span>{custName}</span>
                          </div>
                          <span className="text-[10px] text-stone-400 block mt-0.5">
                            {b.customerProfile?.user?.phoneNumber || 'N/A'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                            <span>{pujaTitle}</span>
                          </div>
                          {b.includeSamagri && (
                            <span className="text-[10px] text-emerald-700 font-medium block mt-0.5">
                              + Samagri Kit Included
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          {b.panditProfile ? (
                            <span className="text-amber-800 font-bold">Pt. {panditName}</span>
                          ) : (
                            <span className="text-stone-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className="text-stone-900 block font-semibold">{formattedDate}</span>
                          <span className="text-[10px] text-stone-500">{b.pujaTimeSlot || 'Morning Muhurat'}</span>
                        </td>
                        <td className="p-4 font-bold text-stone-900">
                          ₹{Number(b.totalAmount || 0).toLocaleString()}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block ${
                              b.status === 'CONFIRMED'
                                ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                : b.status === 'COMPLETED'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : b.status === 'CANCELLED'
                                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openReassignModal(b)}
                              className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-[10px] font-bold border border-stone-200 transition cursor-pointer"
                              title="Reassign Pandit"
                            >
                              Reassign
                            </button>

                            <button
                              onClick={() => openAuditHistoryModal(b)}
                              className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-lg transition"
                              title="View Audit History"
                            >
                              <History className="w-3.5 h-3.5" />
                            </button>

                            {b.status !== 'COMPLETED' && b.status !== 'CANCELLED' && (
                              <button
                                onClick={() => handleUpdateStatus(b.id, 'COMPLETED')}
                                disabled={updatingId === b.id}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition cursor-pointer"
                              >
                                Complete
                              </button>
                            )}

                            {b.status !== 'CANCELLED' && b.status !== 'COMPLETED' && (
                              <button
                                onClick={() => handleUpdateStatus(b.id, 'CANCELLED')}
                                disabled={updatingId === b.id}
                                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[10px] font-bold border border-rose-200 transition cursor-pointer"
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

      {/* Reassign Pandit Modal */}
      {reassignBooking && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl text-xs text-stone-800">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-amber-600" /> Reassign Pandit
              </h3>
              <button onClick={() => setReassignBooking(null)} className="text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-1">
              <p className="font-bold text-stone-900">Booking #{reassignBooking.bookingNumber}</p>
              <p className="text-stone-600">{reassignBooking.puja?.title} • {reassignBooking.city}</p>
              <p className="text-stone-500 text-[11px]">
                Date: {reassignBooking.pujaDate ? new Date(reassignBooking.pujaDate).toLocaleDateString() : 'N/A'} ({reassignBooking.pujaTimeSlot})
              </p>
            </div>

            <form onSubmit={handleReassignSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Select Verified Pandit *</label>
                <select
                  required
                  value={selectedPanditId}
                  onChange={(e) => setSelectedPanditId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-600 bg-white"
                >
                  <option value="">-- Choose Purohit --</option>
                  {availablePandits.map((p) => (
                    <option key={p.id} value={p.id}>
                      Pt. {p.fullName} ({p.city}) - Base: ₹{Number(p.basePrice || 0)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Reason for Reassignment *</label>
                <textarea
                  rows={2}
                  required
                  value={reassignReason}
                  onChange={(e) => setReassignReason(e.target.value)}
                  placeholder="e.g. Previous Pandit unavailable for scheduled muhurat..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReassignBooking(null)}
                  className="px-3.5 py-1.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reassignLoading}
                  className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold"
                >
                  Confirm Reassignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Audit History Modal */}
      {historyBooking && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl text-xs text-stone-800">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                  <History className="w-4 h-4 text-amber-600" /> Booking Audit Trail
                </h3>
                <p className="text-[11px] text-stone-500">Booking #{historyBooking.bookingNumber}</p>
              </div>
              <button onClick={() => setHistoryBooking(null)} className="text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            {historyLoading ? (
              <div className="py-8 text-center text-stone-500">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-600" />
                Loading audit trail from database...
              </div>
            ) : auditHistory.length === 0 ? (
              <div className="py-8 text-center text-stone-400">
                No status changes recorded yet. Initial creation was logged.
              </div>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {auditHistory.map((h) => (
                  <div key={h.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                    <div className="flex items-center justify-between font-bold text-stone-900">
                      <span>{h.fromStatus ? `${h.fromStatus} ➔ ` : ''}{h.toStatus}</span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {h.createdAt ? new Date(h.createdAt).toLocaleString() : ''}
                      </span>
                    </div>
                    <p className="text-stone-600">Action: {h.action} by {h.changedBy}</p>
                    {h.reason && <p className="text-stone-500 italic">Reason: {h.reason}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
