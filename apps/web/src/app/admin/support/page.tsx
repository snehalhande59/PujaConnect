'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  LifeBuoy,
  Loader2,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  X,
  Check,
  ChevronRight,
  MessageSquare,
  XCircle,
  HelpCircle,
  User,
  Calendar,
  IndianRupee,
  Phone,
  Mail,
  ShieldAlert,
} from 'lucide-react';
import { getClientToken } from '@/lib/auth';
import AdminLayout from '@/components/admin/AdminLayout';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://pujaconnect-api-he9b.onrender.com/api/v1';

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'CANCELLED' | 'CONFIRMED' | 'OPEN'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Detail Modal
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchTickets = useCallback(async () => {
    const token = getClientToken();
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/admin/support/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        const data = json.data?.data || json.data || json || [];
        setTickets(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Failed to load tickets:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleUpdateStatus = async (id: string, status: string) => {
    const token = getClientToken();
    try {
      setUpdating(true);
      const res = await fetch(`${API_BASE_URL}/admin/support/tickets/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setMsg({ type: 'success', text: `Ticket status successfully updated to ${status}.` });
        setSelectedTicket(null);
        fetchTickets();
      }
    } catch (e: any) {
      alert(e.message || 'Error updating ticket.');
    } finally {
      setUpdating(false);
    }
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      // Category filter
      if (activeCategory === 'CANCELLED') {
        const isCancelled =
          t.booking?.status === 'CANCELLED' ||
          t.subject?.toLowerCase().includes('cancel') ||
          t.description?.toLowerCase().includes('cancel');
        if (!isCancelled) return false;
      } else if (activeCategory === 'CONFIRMED') {
        const isConfirmed =
          t.booking?.status === 'CONFIRMED' ||
          t.subject?.toLowerCase().includes('confirm') ||
          t.description?.toLowerCase().includes('confirm');
        if (!isConfirmed) return false;
      } else if (activeCategory === 'OPEN') {
        if (t.status === 'RESOLVED' || t.status === 'CLOSED') return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const ticketNum = (t.ticketNumber || t.id).toLowerCase();
        const subject = (t.subject || '').toLowerCase();
        const userEmail = (t.user?.email || '').toLowerCase();
        const pujaName = (t.booking?.puja?.name || t.booking?.customPujaName || '').toLowerCase();
        const panditName = (t.booking?.panditProfile?.fullName || '').toLowerCase();
        return (
          ticketNum.includes(q) ||
          subject.includes(q) ||
          userEmail.includes(q) ||
          pujaName.includes(q) ||
          panditName.includes(q)
        );
      }

      return true;
    });
  }, [tickets, activeCategory, searchQuery]);

  const counts = useMemo(() => {
    const total = tickets.length;
    const cancelled = tickets.filter(
      (t) =>
        t.booking?.status === 'CANCELLED' ||
        t.subject?.toLowerCase().includes('cancel') ||
        t.description?.toLowerCase().includes('cancel'),
    ).length;
    const confirmed = tickets.filter(
      (t) =>
        t.booking?.status === 'CONFIRMED' ||
        t.subject?.toLowerCase().includes('confirm') ||
        t.description?.toLowerCase().includes('confirm'),
    ).length;
    const open = tickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;
    return { total, cancelled, confirmed, open };
  }, [tickets]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
              <LifeBuoy className="w-6 h-6 text-amber-600" />
              Live Order Assistance & Support Help Desk
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Live tracking of confirmed ceremony bookings, cancellation requests, refunds, and devotee support inquiries.
            </p>
          </div>

          <button
            onClick={fetchTickets}
            className="self-start sm:self-auto px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-600' : ''}`} />
            <span>Refresh Support Feed</span>
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
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{msg.text}</span>
            </div>
            <button onClick={() => setMsg(null)} className="text-stone-400 hover:text-stone-700 font-bold">
              Dismiss
            </button>
          </div>
        )}

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div
            onClick={() => setActiveCategory('ALL')}
            className={`p-4 rounded-2xl border transition cursor-pointer ${
              activeCategory === 'ALL'
                ? 'bg-amber-50/70 border-amber-300 shadow-xs'
                : 'bg-white border-stone-200 hover:bg-stone-50'
            }`}
          >
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">Total Inquiries</span>
            <span className="text-2xl font-extrabold text-stone-900 mt-1 block">{counts.total}</span>
            <span className="text-[10px] text-stone-400 mt-0.5 block">All support records</span>
          </div>

          <div
            onClick={() => setActiveCategory('CANCELLED')}
            className={`p-4 rounded-2xl border transition cursor-pointer ${
              activeCategory === 'CANCELLED'
                ? 'bg-rose-50 border-rose-300 shadow-xs'
                : 'bg-white border-stone-200 hover:bg-stone-50'
            }`}
          >
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5 text-rose-600" /> Cancelled & Refunds
            </span>
            <span className="text-2xl font-extrabold text-rose-900 mt-1 block">{counts.cancelled}</span>
            <span className="text-[10px] text-rose-500 mt-0.5 block">Cancellations requiring refund</span>
          </div>

          <div
            onClick={() => setActiveCategory('CONFIRMED')}
            className={`p-4 rounded-2xl border transition cursor-pointer ${
              activeCategory === 'CONFIRMED'
                ? 'bg-emerald-50 border-emerald-300 shadow-xs'
                : 'bg-white border-stone-200 hover:bg-stone-50'
            }`}
          >
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Confirmed Bookings
            </span>
            <span className="text-2xl font-extrabold text-emerald-900 mt-1 block">{counts.confirmed}</span>
            <span className="text-[10px] text-emerald-600 mt-0.5 block">Active upcoming rituals</span>
          </div>

          <div
            onClick={() => setActiveCategory('OPEN')}
            className={`p-4 rounded-2xl border transition cursor-pointer ${
              activeCategory === 'OPEN'
                ? 'bg-blue-50 border-blue-300 shadow-xs'
                : 'bg-white border-stone-200 hover:bg-stone-50'
            }`}
          >
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-600" /> Open / In Progress
            </span>
            <span className="text-2xl font-extrabold text-blue-900 mt-1 block">{counts.open}</span>
            <span className="text-[10px] text-blue-500 mt-0.5 block">Awaiting admin resolution</span>
          </div>
        </div>

        {/* Search & Operational Controls */}
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ticket#, devotee, ritual, pandit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center gap-1 self-stretch sm:self-auto overflow-x-auto">
            {[
              { id: 'ALL', label: `All (${counts.total})` },
              { id: 'CANCELLED', label: `Cancelled (${counts.cancelled})` },
              { id: 'CONFIRMED', label: `Confirmed (${counts.confirmed})` },
              { id: 'OPEN', label: `Action Needed (${counts.open})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  activeCategory === tab.id
                    ? 'bg-stone-900 text-white shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tickets Table */}
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto mb-3" />
              <p className="text-xs text-stone-500">Syncing live support desk from PostgreSQL database...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="py-16 text-center text-xs text-stone-500 space-y-2">
              <LifeBuoy className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <p className="font-bold text-stone-800 text-sm">No support tickets match the selected filter</p>
              <p className="text-stone-400">
                {searchQuery ? 'Try clearing your search term.' : 'All devotee requests are currently up to date.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-stone-50 text-stone-500 uppercase text-[10px] font-bold border-b border-stone-200 tracking-wider">
                  <tr>
                    <th className="p-4">Ticket & Ref</th>
                    <th className="p-4">Devotee Submitter</th>
                    <th className="p-4">Ceremony & Pandit</th>
                    <th className="p-4">Order Status</th>
                    <th className="p-4">Inquiry Subject</th>
                    <th className="p-4">Support Status</th>
                    <th className="p-4">Created Date</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredTickets.map((t) => {
                    const submitterName = t.user?.customerProfile
                      ? `${t.user.customerProfile.firstName} ${t.user.customerProfile.lastName}`
                      : t.user?.panditProfile
                      ? `Pt. ${t.user.panditProfile.fullName}`
                      : t.user?.email?.split('@')[0] || 'Devotee';

                    const booking = t.booking;
                    const isCancelled =
                      booking?.status === 'CANCELLED' ||
                      t.subject?.toLowerCase().includes('cancel') ||
                      t.description?.toLowerCase().includes('cancel');
                    const isConfirmed =
                      booking?.status === 'CONFIRMED' ||
                      t.subject?.toLowerCase().includes('confirm') ||
                      t.description?.toLowerCase().includes('confirm');

                    const pujaTitle = booking?.puja?.name || booking?.customPujaName || 'Vedic Ritual';
                    const panditName = booking?.panditProfile?.fullName
                      ? `Pt. ${booking.panditProfile.fullName.replace(/^Pt\.\s*/i, '')}`
                      : 'Assigned Purohit';

                    return (
                      <tr key={t.id} className="hover:bg-stone-50/80 transition">
                        <td className="p-4">
                          <span className="font-mono font-bold text-stone-900 block text-[11px]">
                            {t.ticketNumber || `#TKT-${t.id.slice(0, 6)}`}
                          </span>
                          {booking && (
                            <span className="font-mono text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 inline-block mt-0.5">
                              {booking.bookingNumber || `Ref: #${booking.id.slice(0, 8)}`}
                            </span>
                          )}
                        </td>

                        <td className="p-4">
                          <span className="font-bold text-stone-900 block">{submitterName}</span>
                          <span className="text-[11px] text-stone-400 block">{t.user?.email}</span>
                          {t.user?.phoneNumber && (
                            <span className="text-[10px] text-stone-400 block">{t.user.phoneNumber}</span>
                          )}
                        </td>

                        <td className="p-4">
                          <span className="font-semibold text-stone-900 block">{pujaTitle}</span>
                          <span className="text-[11px] text-amber-800 font-medium block">{panditName}</span>
                          {booking?.totalAmount && (
                            <span className="text-[10px] text-stone-500 font-semibold block">
                              ₹{Number(booking.totalAmount).toLocaleString('en-IN')} Dakshina
                            </span>
                          )}
                        </td>

                        <td className="p-4">
                          {isCancelled ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <XCircle className="w-3 h-3 text-rose-600" /> CANCELLED
                            </span>
                          ) : isConfirmed ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> CONFIRMED
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700 border border-stone-200">
                              {booking?.status || 'GENERAL'}
                            </span>
                          )}
                        </td>

                        <td className="p-4 max-w-xs">
                          <span className="font-semibold text-stone-900 block truncate">{t.subject}</span>
                          <span className="text-[11px] text-stone-500 line-clamp-1">{t.description}</span>
                        </td>

                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                              t.status === 'RESOLVED'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : t.status === 'IN_PROGRESS'
                                ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                : t.status === 'CLOSED'
                                ? 'bg-stone-100 text-stone-600 border border-stone-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {t.status}
                          </span>
                        </td>

                        <td className="p-4 text-stone-500 text-[11px]">
                          {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'N/A'}
                        </td>

                        <td className="p-4 text-right">
                          <button
                            onClick={() => setSelectedTicket(t)}
                            className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold flex items-center gap-1 ml-auto cursor-pointer border border-stone-200 transition"
                            title="Inspect & Resolve Ticket"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect</span>
                          </button>
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

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 max-w-xl w-full space-y-4 shadow-xl text-xs text-stone-800">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                  <LifeBuoy className="w-4 h-4 text-amber-600" /> Ticket #{selectedTicket.ticketNumber || selectedTicket.id.slice(0, 8)}
                </h3>
                <span className="text-[11px] text-stone-400">
                  Received: {new Date(selectedTicket.createdAt).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* If Associated Booking exists */}
            {selectedTicket.booking && (
              <div
                className={`p-3.5 rounded-xl border ${
                  selectedTicket.booking.status === 'CANCELLED'
                    ? 'bg-rose-50/70 border-rose-200'
                    : 'bg-emerald-50/70 border-emerald-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-stone-700 uppercase">
                    Associated Sacred Ceremony Order
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      selectedTicket.booking.status === 'CANCELLED'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {selectedTicket.booking.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-stone-800">
                  <div>
                    <span className="text-[10px] text-stone-500 block">Ceremony</span>
                    <span className="font-bold">
                      {selectedTicket.booking.puja?.name || selectedTicket.booking.customPujaName || 'Vedic Ritual'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 block">Assigned Pandit</span>
                    <span className="font-bold">
                      {selectedTicket.booking.panditProfile?.fullName
                        ? `Pt. ${selectedTicket.booking.panditProfile.fullName.replace(/^Pt\.\s*/i, '')}`
                        : 'Vedic Scholar'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 block">Ceremony Date</span>
                    <span className="font-semibold">
                      {new Date(selectedTicket.booking.pujaDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 block">Total Dakshina</span>
                    <span className="font-bold text-amber-700">
                      ₹{Number(selectedTicket.booking.totalAmount).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {selectedTicket.booking.cancellationReason && (
                  <div className="mt-2.5 pt-2 border-t border-rose-200 text-rose-900">
                    <span className="text-[10px] font-bold uppercase block text-rose-700">Cancellation Reason:</span>
                    <p className="font-medium text-[11px] mt-0.5">{selectedTicket.booking.cancellationReason}</p>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <span className="text-stone-500 block text-[11px] font-bold">Inquiry Subject</span>
                <p className="font-bold text-stone-900 text-sm mt-0.5">{selectedTicket.subject}</p>
              </div>

              <div>
                <span className="text-stone-500 block text-[11px] font-bold">Devotee Message & Notes</span>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-stone-700 leading-relaxed mt-1">
                  {selectedTicket.description}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <span className="text-stone-500 block text-[11px] font-bold">Devotee Email</span>
                  <p className="font-semibold text-stone-900">{selectedTicket.user?.email || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-stone-500 block text-[11px] font-bold">Priority Level</span>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase mt-0.5 ${
                      selectedTicket.priority === 'URGENT'
                        ? 'bg-rose-100 text-rose-800'
                        : selectedTicket.priority === 'HIGH'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-stone-100 text-stone-800'
                    }`}
                  >
                    {selectedTicket.priority || 'MEDIUM'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
              {selectedTicket.status !== 'IN_PROGRESS' && selectedTicket.status !== 'RESOLVED' && (
                <button
                  onClick={() => handleUpdateStatus(selectedTicket.id, 'IN_PROGRESS')}
                  disabled={updating}
                  className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl font-bold cursor-pointer"
                >
                  Mark In Progress
                </button>
              )}

              {selectedTicket.status !== 'RESOLVED' && (
                <button
                  onClick={() => handleUpdateStatus(selectedTicket.id, 'RESOLVED')}
                  disabled={updating}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer shadow-xs"
                >
                  Resolve & Close Ticket
                </button>
              )}

              <button
                onClick={() => setSelectedTicket(null)}
                className="px-3.5 py-1.5 border border-stone-200 text-stone-600 rounded-xl hover:bg-stone-50 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
