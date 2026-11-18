'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  X,
  ShieldCheck,
  Search,
  Filter,
  Eye,
  Loader2,
  FileText,
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import DevSutraLogo from '@/components/ui/DevSutraLogo';
import { getSavedUserProfile, getClientToken, AuthUser } from '@/lib/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export default function AdminPanditsPage() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<AuthUser | null>(null);
  const [authorized, setAuthorized] = useState(false);

  // Filters & State
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Data
  const [pandits, setPandits] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [bannerMessage, setBannerMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Rejection Dialog State
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState<string | null>(null);

  const fetchPandits = useCallback(async () => {
    const token = getClientToken();
    if (!token) return;

    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (cityFilter.trim()) params.append('city', cityFilter.trim());
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const res = await fetch(`${API_BASE_URL}/admin/pandits?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch pandits list.');
      }

      const resData = await res.json();
      const payload = resData.data?.data || resData.data || [];
      const total = resData.data?.total ?? resData.meta?.total ?? payload.length;
      const pages = resData.data?.totalPages ?? resData.meta?.totalPages ?? Math.ceil(total / limit);

      setPandits(payload);
      setTotalCount(total);
      setTotalPages(pages || 1);
    } catch (err: any) {
      console.error(err);
      setBannerMessage({ type: 'error', text: err.message || 'Error loading directory.' });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery, cityFilter, page, limit]);

  useEffect(() => {
    const profile = getSavedUserProfile();
    if (!profile || profile.role !== 'ADMIN') {
      router.push('/admin/login');
      return;
    }
    setAdminUser(profile);
    setAuthorized(true);
  }, [router]);

  useEffect(() => {
    if (authorized) {
      fetchPandits();
    }
  }, [authorized, fetchPandits]);

  const handleApprove = async (id: string, name: string) => {
    if (!confirm(`Verify and approve ${name}? This will publish them to the marketplace.`)) return;

    const token = getClientToken();
    try {
      setActionLoading(id);
      const res = await fetch(`${API_BASE_URL}/admin/pandits/${id}/verify`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Approval failed.');
      }

      setBannerMessage({ type: 'success', text: `${name} has been verified successfully.` });
      await fetchPandits();
    } catch (err: any) {
      setBannerMessage({ type: 'error', text: err.message || 'Approval failed.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) {
      setRejectError('Rejection reason cannot be empty.');
      return;
    }

    const token = getClientToken();
    try {
      setActionLoading(rejectId);
      const res = await fetch(`${API_BASE_URL}/admin/pandits/${rejectId}/reject`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: rejectReason.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Rejection failed.');
      }

      setBannerMessage({ type: 'success', text: 'Application rejected and notice sent to Pandit.' });
      setRejectId(null);
      setRejectReason('');
      setRejectError(null);
      await fetchPandits();
    } catch (err: any) {
      setRejectError(err.message || 'Failed to submit rejection.');
    } finally {
      setActionLoading(null);
    }
  };

  if (!authorized) {
    return (
      <div className="min-h-screen bg-deep-maroon flex items-center justify-center p-4 text-beige">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-maroon text-beige font-sans flex flex-col">
      {/* Top Header */}
      <header className="h-16 border-b border-gold/30 bg-maroon-900 px-6 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/dashboard"
            className="p-2 rounded-xl bg-maroon-950 hover:bg-maroon-800 text-ivory border border-gold/30 transition"
            title="Return to Admin Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <DevSutraLogo variant="dark" size="sm" showTagline={false} />
          <span className="font-heading font-bold text-sm tracking-wide text-ivory border-l border-gold/30 pl-3">
            Pandit Verification & Directory
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <button
            onClick={() => fetchPandits()}
            className="px-3 py-1.5 bg-maroon-950 hover:bg-maroon-800 text-beige hover:text-ivory rounded-lg border border-gold/30 transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
        {bannerMessage && (
          <div
            className={`p-4 rounded-xl text-xs flex items-center justify-between gap-3 border ${
              bannerMessage.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/80 border-rose-500/40 text-rose-200'
            }`}
          >
            <span>{bannerMessage.text}</span>
            <button
              onClick={() => setBannerMessage(null)}
              className="text-beige/60 hover:text-ivory text-xs underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Filters and Search Bar */}
        <div className="bg-maroon-900 border border-gold/30 rounded-2xl p-4 sm:p-6 space-y-4 shadow-sacred">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-maroon-950/70 p-1 rounded-xl border border-gold/20 overflow-x-auto text-xs">
              {(['ALL', 'PENDING', 'VERIFIED', 'REJECTED'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setStatusFilter(tab);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap cursor-pointer ${
                    statusFilter === tab
                      ? 'bg-maroon text-ivory border border-gold/50 shadow'
                      : 'text-beige/70 hover:text-ivory'
                  }`}
                >
                  {tab === 'ALL'
                    ? 'All Pandits'
                    : tab === 'PENDING'
                    ? 'Pending Review'
                    : tab === 'VERIFIED'
                    ? 'Verified'
                    : 'Action Required'}
                </button>
              ))}
            </div>

            {/* Total count badge */}
            <span className="text-xs text-gold-300 font-semibold self-end md:self-center">
              Total Found: <strong className="text-ivory">{totalCount}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* Search by Name / Email / Phone */}
            <div className="relative sm:col-span-2">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-beige/50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by Pandit name, registered email, or mobile..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-maroon-950 border border-gold/25 text-ivory placeholder-beige/40 focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>

            {/* City filter */}
            <div className="relative">
              <input
                type="text"
                value={cityFilter}
                onChange={(e) => {
                  setCityFilter(e.target.value);
                  setPage(1);
                }}
                placeholder="Filter by city (e.g. Varanasi)..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-maroon-950 border border-gold/25 text-ivory placeholder-beige/40 focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
          </div>
        </div>

        {/* Pandits Table */}
        <div className="bg-maroon-900 border border-gold/30 rounded-2xl overflow-hidden shadow-sacred">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-beige">
              <thead className="bg-maroon-950 text-gold-300 uppercase text-[10px] tracking-wider border-b border-gold/25">
                <tr>
                  <th className="p-4">Pandit & Title</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Experience & Rituals</th>
                  <th className="p-4">Documents</th>
                  <th className="p-4">Verification Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-maroon-800">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-beige/60 space-y-2">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-gold" />
                      <p>Loading Pandit applications...</p>
                    </td>
                  </tr>
                ) : pandits.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-beige/60">
                      No Pandit accounts match the selected filters.
                    </td>
                  </tr>
                ) : (
                  pandits.map((p) => {
                    const docCount = p.documents?.length || 0;
                    return (
                      <tr key={p.id} className="hover:bg-maroon-800/40 transition">
                        <td className="p-4">
                          <div>
                            <span className="font-heading font-bold text-sm text-ivory block">
                              {p.fullName}
                            </span>
                            <span className="text-[11px] text-beige/60 block">
                              {p.user?.email} • {p.user?.phoneNumber || 'No Phone'}
                            </span>
                          </div>
                        </td>

                        <td className="p-4 whitespace-nowrap">
                          <span className="text-ivory font-medium">{p.city}</span>
                          <span className="text-[11px] text-beige/60 block">{p.state}</span>
                        </td>

                        <td className="p-4">
                          <span className="font-semibold text-ivory block">
                            {p.experienceYears} Years Exp.
                          </span>
                          <span className="text-[11px] text-beige/60 block truncate max-w-xs">
                            {p.specializations?.join(', ') || 'General Vedic Rituals'}
                          </span>
                        </td>

                        <td className="p-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-maroon-950 border border-gold/25 text-beige text-[11px]">
                            <FileText className="w-3.5 h-3.5 text-gold" />
                            <strong>{docCount}</strong> doc(s)
                          </span>
                        </td>

                        <td className="p-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 rounded-full font-bold text-[10px] border ${
                              p.verificationStatus === 'VERIFIED'
                                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                                : p.verificationStatus === 'PENDING'
                                ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                                : 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                            }`}
                          >
                            {p.verificationStatus}
                          </span>
                        </td>

                        <td className="p-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/admin/pandits/${p.id}`}
                              className="px-2.5 py-1.5 bg-maroon-950 hover:bg-maroon-800 text-ivory rounded-lg border border-gold/30 text-[11px] font-semibold transition flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5 text-gold" />
                              <span>Review</span>
                            </Link>

                            {p.verificationStatus !== 'VERIFIED' && (
                              <button
                                onClick={() => handleApprove(p.id, p.fullName)}
                                disabled={actionLoading === p.id}
                                className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                              >
                                {actionLoading === p.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Check className="w-3 h-3" />
                                )}
                                <span>Approve</span>
                              </button>
                            )}

                            {p.verificationStatus !== 'REJECTED' && (
                              <button
                                onClick={() => {
                                  setRejectId(p.id);
                                  setRejectReason('');
                                  setRejectError(null);
                                }}
                                disabled={actionLoading === p.id}
                                className="px-2.5 py-1.5 bg-rose-900/50 hover:bg-rose-900 text-rose-200 border border-rose-500/30 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                                <span>Reject</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 bg-maroon-950 border-t border-gold/20 flex items-center justify-between text-xs">
              <span className="text-beige/60">
                Page <strong className="text-ivory">{page}</strong> of{' '}
                <strong className="text-ivory">{totalPages}</strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1.5 bg-maroon-900 hover:bg-maroon-800 disabled:opacity-40 text-ivory rounded-lg border border-gold/30 transition flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1.5 bg-maroon-900 hover:bg-maroon-800 disabled:opacity-40 text-ivory rounded-lg border border-gold/30 transition flex items-center gap-1"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Reject Modal */}
      {rejectId && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-maroon-900 border border-gold/40 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl text-xs text-beige">
            <div className="flex items-center justify-between border-b border-maroon-800 pb-3">
              <h3 className="font-heading font-bold text-sm text-ivory flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400" /> Reject Pandit Application
              </h3>
              <button onClick={() => setRejectId(null)} className="text-beige/60 hover:text-ivory">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-beige/80">
              Provide a clear reason for rejecting this Pandit application. The reason will be communicated to the Pandit so they can make corrections.
            </p>

            {rejectError && (
              <p className="p-2.5 rounded-lg bg-rose-950/80 border border-rose-500/40 text-rose-200">
                {rejectError}
              </p>
            )}

            <div>
              <label className="block font-semibold text-ivory mb-1">
                Rejection Reason (Mandatory)
              </label>
              <textarea
                rows={4}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Identity document number does not match submitted name. Please provide valid Aadhaar scan."
                className="w-full p-3 rounded-xl bg-maroon-950 border border-gold/30 text-ivory focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-maroon-800">
              <button
                type="button"
                onClick={() => setRejectId(null)}
                className="px-4 py-2 rounded-xl bg-maroon-950 text-beige hover:text-ivory transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading === rejectId}
                onClick={handleRejectConfirm}
                className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-ivory font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {actionLoading === rejectId && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
