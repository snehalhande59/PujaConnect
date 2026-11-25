'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Star,
  Loader2,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Trash2,
  MessageSquare,
  AlertCircle,
  Eye,
  User,
  ShieldCheck,
} from 'lucide-react';
import { getClientToken } from '@/lib/auth';
import AdminLayout from '@/components/admin/AdminLayout';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState('ALL');
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchReviews = useCallback(async (opts?: boolean | any) => {
    const silent = opts === true;
    const token = getClientToken();
    try {
      if (!silent) setLoading(true);
      const url = new URL(`${API_BASE_URL}/admin/reviews`);
      if (ratingFilter !== 'ALL') url.searchParams.append('rating', ratingFilter);
      url.searchParams.append('_t', Date.now().toString());

      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const json = await res.json();
        const data = json.data?.data || json.data || json || [];
        setReviews(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Failed to load reviews:', e);
    } finally {
      setLoading(false);
    }
  }, [ratingFilter]);

  useEffect(() => {
    fetchReviews();
    // Auto-poll every 8 seconds so newly submitted reviews appear live without manual delay
    const interval = setInterval(() => fetchReviews(true), 8000);
    return () => clearInterval(interval);
  }, [fetchReviews]);

  const handleTogglePublish = async (id: string, currentPublished: boolean) => {
    const token = getClientToken();
    try {
      const res = await fetch(`${API_BASE_URL}/admin/reviews/${id}/publish`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isPublished: !currentPublished }),
      });

      if (res.ok) {
        setMsg({
          type: 'success',
          text: `Review has been ${!currentPublished ? 'published to marketplace' : 'hidden from public view'}.`,
        });
        fetchReviews();
      }
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message || 'Error updating review publish status.' });
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this customer review?')) return;

    const token = getClientToken();
    try {
      const res = await fetch(`${API_BASE_URL}/admin/reviews/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setMsg({ type: 'success', text: 'Review deleted successfully.' });
        fetchReviews();
      }
    } catch (e: any) {
      alert(e.message || 'Error deleting review.');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
              Customer Reviews & Quality Control
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Live feedback from devotees following ceremonies, star ratings, and public marketplace moderation
            </p>
          </div>

          <button
            onClick={fetchReviews}
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

        {/* Rating Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 bg-white p-2 rounded-2xl border border-stone-200 shadow-xs">
          {['ALL', '5', '4', '3', '2', '1'].map((r) => (
            <button
              key={r}
              onClick={() => setRatingFilter(r)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                ratingFilter === r
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              {r === 'ALL' ? (
                <span>All Ratings ({reviews.length})</span>
              ) : (
                <>
                  <span>{r} Star</span>
                  <Star className="w-3 h-3 fill-current" />
                </>
              )}
            </button>
          ))}
        </div>

        {/* Reviews Table */}
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto mb-3" />
              <p className="text-xs text-stone-500">Loading reviews from PostgreSQL database...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="py-16 text-center text-xs text-stone-500 space-y-2">
              <MessageSquare className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <p className="font-bold text-stone-800 text-sm">No reviews found</p>
              <p className="text-stone-400">Customer reviews submitted following completed ceremonies will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-stone-50 text-stone-500 uppercase text-[10px] font-bold border-b border-stone-200 tracking-wider">
                  <tr>
                    <th className="p-4">Devotee Reviewer</th>
                    <th className="p-4">Purohit & Ceremony</th>
                    <th className="p-4">Rating</th>
                    <th className="p-4">Comment</th>
                    <th className="p-4">Marketplace Status</th>
                    <th className="p-4">Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {reviews.map((r) => {
                    const custName = r.customer?.customerProfile
                      ? `${r.customer.customerProfile.firstName} ${r.customer.customerProfile.lastName}`
                      : r.customer?.email || 'Devotee';
                    const panditName = r.panditProfile?.fullName || 'Purohit';
                    const pujaTitle = r.booking?.puja?.title || 'Ritual';

                    return (
                      <tr key={r.id} className="hover:bg-stone-50/80 transition">
                        <td className="p-4">
                          <span className="font-bold text-stone-900 block">{custName}</span>
                          <span className="text-[11px] text-stone-400">{r.customer?.email}</span>
                        </td>

                        <td className="p-4">
                          <span className="font-semibold text-stone-900 block">Pt. {panditName}</span>
                          <span className="text-[11px] text-amber-700 font-medium">{pujaTitle}</span>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-1 font-bold text-stone-900">
                            <span className="text-sm">{r.rating}</span>
                            <div className="flex text-amber-500">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < r.rating ? 'fill-amber-500 text-amber-500' : 'text-stone-200'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </td>

                        <td className="p-4 text-stone-600 max-w-sm">
                          <p className="line-clamp-2 leading-relaxed">{r.comment || 'No written comment'}</p>
                        </td>

                        <td className="p-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              r.isPublished
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-stone-100 text-stone-600 border border-stone-200'
                            }`}
                          >
                            {r.isPublished ? 'PUBLISHED' : 'HIDDEN'}
                          </span>
                        </td>

                        <td className="p-4 text-stone-500">
                          {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'N/A'}
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleTogglePublish(r.id, r.isPublished)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition ${
                                r.isPublished
                                  ? 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent'
                              }`}
                            >
                              {r.isPublished ? 'Hide' : 'Publish'}
                            </button>

                            <button
                              onClick={() => handleDeleteReview(r.id)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg transition"
                              title="Delete Review"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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
