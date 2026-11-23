'use client';

import { useState, useEffect, useCallback } from 'react';
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
} from 'lucide-react';
import { getClientToken } from '@/lib/auth';
import AdminLayout from '@/components/admin/AdminLayout';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Detail Modal
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchTickets = useCallback(async () => {
    const token = getClientToken();
    try {
      setLoading(true);
      const url = new URL(`${API_BASE_URL}/admin/support/tickets`);
      if (statusFilter !== 'ALL') url.searchParams.append('status', statusFilter);

      const res = await fetch(url.toString(), {
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
  }, [statusFilter]);

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
        setMsg({ type: 'success', text: `Ticket status updated to ${status}.` });
        setSelectedTicket(null);
        fetchTickets();
      }
    } catch (e: any) {
      alert(e.message || 'Error updating ticket.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
              Support Desk & Resolution Center
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Live customer and purohit support inquiries, disputes, and ceremony assistance tickets in PostgreSQL
            </p>
          </div>

          <button
            onClick={fetchTickets}
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
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{msg.text}</span>
            </div>
            <button onClick={() => setMsg(null)} className="text-stone-400 hover:text-stone-700 font-bold">
              Dismiss
            </button>
          </div>
        )}

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 bg-white p-2 rounded-2xl border border-stone-200 shadow-xs">
          {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                statusFilter === s
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              {s === 'ALL' ? `All Tickets (${tickets.length})` : s}
            </button>
          ))}
        </div>

        {/* Tickets Table */}
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto mb-3" />
              <p className="text-xs text-stone-500">Loading support tickets from PostgreSQL...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="py-16 text-center text-xs text-stone-500 space-y-2">
              <LifeBuoy className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <p className="font-bold text-stone-800 text-sm">No support tickets found</p>
              <p className="text-stone-400">Customer or Pandit support requests will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-stone-50 text-stone-500 uppercase text-[10px] font-bold border-b border-stone-200 tracking-wider">
                  <tr>
                    <th className="p-4">Ticket Number</th>
                    <th className="p-4">Submitted By</th>
                    <th className="p-4">Subject</th>
                    <th className="p-4">Priority</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Created Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {tickets.map((t) => {
                    const submitter = t.user?.customerProfile
                      ? `${t.user.customerProfile.firstName} ${t.user.customerProfile.lastName}`
                      : t.user?.panditProfile
                      ? `Pt. ${t.user.panditProfile.fullName}`
                      : t.user?.email || 'User';

                    return (
                      <tr key={t.id} className="hover:bg-stone-50/80 transition">
                        <td className="p-4 font-mono font-bold text-stone-900">
                          {t.ticketNumber || t.id.slice(0, 8)}
                        </td>

                        <td className="p-4">
                          <span className="font-bold text-stone-900 block">{submitter}</span>
                          <span className="text-[11px] text-stone-400">{t.user?.email}</span>
                        </td>

                        <td className="p-4">
                          <span className="font-semibold text-stone-900 block">{t.subject}</span>
                          <span className="text-[11px] text-stone-500 line-clamp-1">{t.description}</span>
                        </td>

                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              t.priority === 'URGENT'
                                ? 'bg-rose-100 text-rose-800'
                                : t.priority === 'HIGH'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-stone-100 text-stone-800'
                            }`}
                          >
                            {t.priority}
                          </span>
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

                        <td className="p-4 text-stone-500">
                          {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'N/A'}
                        </td>

                        <td className="p-4 text-right">
                          <button
                            onClick={() => setSelectedTicket(t)}
                            className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition"
                            title="Inspect & Resolve Ticket"
                          >
                            <Eye className="w-3.5 h-3.5" />
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
          <div className="bg-white border border-stone-200 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl text-xs text-stone-800">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                  <LifeBuoy className="w-4 h-4 text-amber-600" /> Ticket #{selectedTicket.ticketNumber}
                </h3>
                <span className="text-[11px] text-stone-400">
                  Submitted: {new Date(selectedTicket.createdAt).toLocaleString()}
                </span>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-stone-500 block text-[11px] font-bold">Subject</span>
                <p className="font-bold text-stone-900 text-sm mt-0.5">{selectedTicket.subject}</p>
              </div>

              <div>
                <span className="text-stone-500 block text-[11px] font-bold">Message Details</span>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-stone-700 leading-relaxed mt-1">
                  {selectedTicket.description}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <span className="text-stone-500 block text-[11px] font-bold">User</span>
                  <p className="font-semibold text-stone-900">{selectedTicket.user?.email}</p>
                </div>
                <div>
                  <span className="text-stone-500 block text-[11px] font-bold">Current Status</span>
                  <p className="font-bold text-stone-900">{selectedTicket.status}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
              {selectedTicket.status !== 'IN_PROGRESS' && selectedTicket.status !== 'RESOLVED' && (
                <button
                  onClick={() => handleUpdateStatus(selectedTicket.id, 'IN_PROGRESS')}
                  disabled={updating}
                  className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl font-bold"
                >
                  Mark In Progress
                </button>
              )}

              {selectedTicket.status !== 'RESOLVED' && (
                <button
                  onClick={() => handleUpdateStatus(selectedTicket.id, 'RESOLVED')}
                  disabled={updating}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
                >
                  Mark Resolved
                </button>
              )}

              <button
                onClick={() => setSelectedTicket(null)}
                className="px-3.5 py-1.5 border border-stone-200 text-stone-600 rounded-xl hover:bg-stone-50"
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
