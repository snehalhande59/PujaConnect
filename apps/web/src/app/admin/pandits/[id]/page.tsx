'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  X,
  ShieldCheck,
  Download,
  Eye,
  Loader2,
  FileText,
  AlertCircle,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Award,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Star,
  IndianRupee,
} from 'lucide-react';
import { getSavedUserProfile, getClientToken, AuthUser } from '@/lib/auth';
import AdminLayout from '@/components/admin/AdminLayout';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export default function AdminPanditDetailPage() {
  const router = useRouter();
  const params = useParams();
  const panditId = params.id as string;

  const [pandit, setPandit] = useState<any>(null);
  const [panditBookings, setPanditBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [bannerMessage, setBannerMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Document Preview Modal
  const [previewDoc, setPreviewDoc] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Reject Modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState<string | null>(null);

  const fetchPanditDetails = useCallback(async () => {
    const token = getClientToken();
    if (!token || !panditId) return;

    try {
      setLoading(true);
      const [res, bookingsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/pandits/${panditId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/admin/pandits/${panditId}/bookings`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => null),
      ]);

      if (!res.ok) {
        throw new Error('Failed to fetch Pandit profile.');
      }

      const resData = await res.json();
      const data = resData.data?.data || resData.data;
      setPandit(data);

      if (bookingsRes && bookingsRes.ok) {
        const bJson = await bookingsRes.json();
        const bData = bJson.data?.bookings || bJson.bookings || bJson.data || [];
        setPanditBookings(Array.isArray(bData) ? bData : []);
      }
    } catch (err: any) {
      console.error(err);
      setBannerMessage({ type: 'error', text: err.message || 'Error loading profile.' });
    } finally {
      setLoading(false);
    }
  }, [panditId]);

  useEffect(() => {
    fetchPanditDetails();
  }, [fetchPanditDetails]);

  const handleApprove = async () => {
    if (!confirm(`Are you sure you want to approve Pt. ${pandit?.fullName}?`)) return;

    const token = getClientToken();
    try {
      setActionLoading(true);
      const res = await fetch(`${API_BASE_URL}/admin/pandits/${panditId}/verify`, {
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

      setBannerMessage({ type: 'success', text: 'Pandit has been verified and published to the marketplace!' });
      await fetchPanditDetails();
    } catch (err: any) {
      setBannerMessage({ type: 'error', text: err.message || 'Approval failed.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) {
      setRejectError('Please provide a specific rejection reason.');
      return;
    }

    const token = getClientToken();
    try {
      setActionLoading(true);
      const res = await fetch(`${API_BASE_URL}/admin/pandits/${panditId}/reject`, {
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

      setBannerMessage({ type: 'success', text: 'Pandit application rejected. Notification sent.' });
      setShowRejectModal(false);
      setRejectReason('');
      setRejectError(null);
      await fetchPanditDetails();
    } catch (err: any) {
      setRejectError(err.message || 'Failed to submit rejection.');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePreviewDocument = async (doc: any) => {
    const token = getClientToken();
    try {
      setPreviewDoc(doc);
      setPreviewLoading(true);
      const res = await fetch(`${API_BASE_URL}/pandits/documents/${doc.id}/file`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to retrieve document file.');

      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      setPreviewUrl(objectUrl);
    } catch (err: any) {
      alert(err.message || 'Could not preview file.');
      setPreviewDoc(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  const closePreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewDoc(null);
    setPreviewUrl(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Back Link & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/pandits"
              className="p-2 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-stone-900">Pandit Verification Detail</h1>
              <p className="text-xs text-stone-500">Examine identity credentials, certificate uploads & credentials</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {pandit?.verificationStatus !== 'VERIFIED' && (
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>Approve & Verify</span>
              </button>
            )}

            {pandit?.verificationStatus !== 'REJECTED' && (
              <button
                onClick={() => {
                  setShowRejectModal(true);
                  setRejectReason('');
                  setRejectError(null);
                }}
                disabled={actionLoading}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reject Application</span>
              </button>
            )}
          </div>
        </div>

        {bannerMessage && (
          <div
            className={`p-4 rounded-xl text-xs flex items-center justify-between shadow-xs ${
              bannerMessage.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-2">
              {bannerMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span className="font-medium">{bannerMessage.text}</span>
            </div>
            <button onClick={() => setBannerMessage(null)} className="text-stone-500 hover:text-stone-800 text-xs font-bold">
              Dismiss
            </button>
          </div>
        )}

        {loading ? (
          <div className="py-24 text-center bg-white rounded-2xl border border-stone-200">
            <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto mb-2" />
            <p className="text-xs text-stone-500">Loading Pandit profile & documents from PostgreSQL...</p>
          </div>
        ) : !pandit ? (
          <div className="py-20 text-center bg-white rounded-2xl border border-stone-200 text-stone-500 text-xs">
            Pandit profile not found in database.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pandit Card */}
            <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-stone-100 pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center font-bold text-2xl text-amber-800 overflow-hidden">
                    {pandit.avatarUrl ? (
                      <img src={pandit.avatarUrl} alt={pandit.fullName} className="w-full h-full object-cover" />
                    ) : (
                      pandit.fullName?.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-stone-900">Pt. {pandit.fullName}</h2>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {pandit.city}, {pandit.state} • {pandit.experienceYears} Years Shastric Experience
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          pandit.verificationStatus === 'VERIFIED'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : pandit.verificationStatus === 'REJECTED'
                            ? 'bg-rose-50 text-rose-800 border border-rose-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {pandit.verificationStatus}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          pandit.isAvailable
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-stone-100 text-stone-600 border border-stone-200'
                        }`}
                      >
                        {pandit.isAvailable ? 'AVAILABLE FOR PUJA' : 'CURRENTLY OFFLINE'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right sm:border-l sm:border-stone-100 sm:pl-6 text-xs space-y-1">
                  <span className="text-stone-400 block text-[11px] uppercase font-bold">Standard Base Fee</span>
                  <span className="text-2xl font-extrabold text-stone-900 block">
                    ₹{Number(pandit.basePrice || 0).toLocaleString()}
                  </span>
                  <span className="text-stone-500 text-[11px] block">Dakshina per ceremony</span>
                </div>
              </div>

              {/* Bio & Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-stone-700">
                <div className="space-y-4">
                  <div>
                    <span className="font-bold text-stone-900 block mb-1">Contact Information</span>
                    <div className="p-4 rounded-xl bg-stone-50 border border-stone-100 space-y-2">
                      <p className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-stone-400" />
                        <span>{pandit.user?.email || 'N/A'}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-stone-400" />
                        <span>{pandit.user?.phoneNumber || 'N/A'}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-stone-400" />
                        <span>{pandit.city}, {pandit.state}</span>
                      </p>
                    </div>
                  </div>

                  <div>
                    <span className="font-bold text-stone-900 block mb-1">Ritual Specializations</span>
                    <div className="flex flex-wrap gap-1.5">
                      {Array.isArray(pandit.specializations) && pandit.specializations.length > 0 ? (
                        pandit.specializations.map((s: string) => (
                          <span
                            key={s}
                            className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-medium text-[11px]"
                          >
                            {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-stone-400 italic">No specializations specified</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="font-bold text-stone-900 block mb-1">Puja Languages</span>
                    <div className="flex flex-wrap gap-1.5">
                      {Array.isArray(pandit.languages) && pandit.languages.length > 0 ? (
                        pandit.languages.map((l: string) => (
                          <span
                            key={l}
                            className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-800 border border-stone-200 font-medium text-[11px]"
                          >
                            {l}
                          </span>
                        ))
                      ) : (
                        <span className="text-stone-400 italic">No languages specified</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="font-bold text-stone-900 block mb-1">Vedic Bio & Traditional Training</span>
                    <div className="p-4 rounded-xl bg-stone-50 border border-stone-100 text-stone-600 leading-relaxed min-h-[100px]">
                      {pandit.bio || 'No bio provided.'}
                    </div>
                  </div>

                  <div>
                    <span className="font-bold text-stone-900 block mb-1">Customer Reviews Summary</span>
                    <div className="p-4 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                        <span className="text-xl font-bold text-stone-900">
                          {Number(pandit.averageRating || 0).toFixed(1)}
                        </span>
                        <span className="text-stone-500 text-xs">/ 5.0</span>
                      </div>
                      <span className="text-stone-600 font-medium">
                        Based on {pandit.totalReviews || 0} Devotee Reviews
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pandit Booking Schedule & History (Part 7A Real-time Database Sync) */}
            <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-stone-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    <span>Ceremony Schedule & Roster History</span>
                  </h3>
                  <p className="text-xs text-stone-500">
                    Live database-backed booking schedule, occupied time slots, and slot availability
                  </p>
                </div>
                <Link
                  href="/admin/calendar"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold hover:bg-amber-100 transition"
                >
                  <span>Open Full Calendar</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Booking Metrics Row */}
              {(() => {
                const nowTime = new Date();
                const todayMidnight = new Date(nowTime.getFullYear(), nowTime.getMonth(), nowTime.getDate()).getTime();
                const todayEnd = todayMidnight + 24 * 60 * 60 * 1000;

                const upcoming = panditBookings.filter((b) => {
                  const t = new Date(b.pujaDate).getTime();
                  return (b.status === 'CONFIRMED' || b.status === 'PENDING' || b.status === 'ACCEPTED') && t >= todayMidnight;
                });
                const today = panditBookings.filter((b) => {
                  const t = new Date(b.pujaDate).getTime();
                  return t >= todayMidnight && t < todayEnd;
                });
                const completed = panditBookings.filter((b) => b.status === 'COMPLETED');
                const cancelled = panditBookings.filter((b) => b.status === 'CANCELLED');
                const next = [...upcoming].sort(
                  (a, b) => new Date(a.pujaDate).getTime() - new Date(b.pujaDate).getTime()
                )[0];

                return (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                        <span className="text-[11px] text-stone-500 block">Total Bookings</span>
                        <span className="text-base font-bold text-stone-900 mt-0.5 block">{panditBookings.length}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200">
                        <span className="text-[11px] text-amber-800 font-medium block">Upcoming Bookings</span>
                        <span className="text-base font-bold text-amber-950 mt-0.5 block">{upcoming.length}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
                        <span className="text-[11px] text-emerald-800 font-medium block">Today&apos;s Bookings</span>
                        <span className="text-base font-bold text-emerald-950 mt-0.5 block">{today.length}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200">
                        <span className="text-[11px] text-blue-800 font-medium block">Completed</span>
                        <span className="text-base font-bold text-blue-950 mt-0.5 block">{completed.length}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200">
                        <span className="text-[11px] text-rose-800 font-medium block">Cancelled / Released</span>
                        <span className="text-base font-bold text-rose-950 mt-0.5 block">{cancelled.length}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-stone-100 border border-stone-200">
                        <span className="text-[11px] text-stone-600 font-medium block">Next Booking</span>
                        <span className="text-xs font-bold text-stone-900 mt-0.5 block truncate">
                          {next
                            ? `${new Date(next.pujaDate).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                              })} (${next.pujaTimeSlot || 'Muhurth'})`
                            : 'None Scheduled'}
                        </span>
                      </div>
                    </div>

                    {/* Bookings Table / Roster */}
                    {panditBookings.length === 0 ? (
                      <div className="p-8 text-center text-xs text-stone-400 bg-stone-50 rounded-xl border border-stone-100">
                        No ceremony bookings assigned to this Pandit yet. All calendar slots are currently available.
                      </div>
                    ) : (
                      <div className="border border-stone-200 rounded-xl overflow-hidden overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-stone-50 text-stone-600 border-b border-stone-200 font-bold uppercase text-[10px] tracking-wider">
                            <tr>
                              <th className="p-3">Ceremony & ID</th>
                              <th className="p-3">Date & Time Slot</th>
                              <th className="p-3">Devotee</th>
                              <th className="p-3">Dakshina & Samagri</th>
                              <th className="p-3">Slot Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-100">
                            {panditBookings.map((b) => (
                              <tr key={b.id} className="hover:bg-stone-50/80 transition">
                                <td className="p-3">
                                  <span className="font-bold text-stone-900 block">{b.puja?.title || 'Vedic Vidhi'}</span>
                                  <span className="text-[10px] text-stone-400 font-mono">
                                    #{b.bookingNumber || b.id.slice(0, 8)}
                                  </span>
                                </td>
                                <td className="p-3 whitespace-nowrap">
                                  <span className="font-semibold text-stone-800 block">
                                    {new Date(b.pujaDate).toLocaleDateString('en-IN', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric',
                                    })}
                                  </span>
                                  <span className="text-[11px] text-amber-800 font-medium block">
                                    {b.pujaTimeSlot || 'Morning Muhurth'}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <span className="font-medium text-stone-900 block">
                                    {b.customerProfile?.firstName || 'Devotee'} {b.customerProfile?.lastName || ''}
                                  </span>
                                  <span className="text-[10px] text-stone-500 block">
                                    {b.city || 'Pune'}, {b.customerProfile?.user?.phoneNumber || ''}
                                  </span>
                                </td>
                                <td className="p-3 whitespace-nowrap">
                                  <span className="font-bold text-stone-900 block">
                                    ₹{Number(b.totalAmount || 0).toLocaleString('en-IN')}
                                  </span>
                                  <span
                                    className={`text-[10px] font-bold ${
                                      b.payments?.[0]?.status === 'COMPLETED' ? 'text-emerald-700' : 'text-amber-700'
                                    }`}
                                  >
                                    {b.payments?.[0]?.status === 'COMPLETED' ? 'PAID' : 'PENDING'}
                                  </span>
                                </td>
                                <td className="p-3 whitespace-nowrap">
                                  {b.status === 'CONFIRMED' || b.status === 'ACCEPTED' ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Booked / Confirmed
                                    </span>
                                  ) : b.status === 'PENDING' ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                      <Calendar className="w-3 h-3 text-amber-600" /> Pending Approval
                                    </span>
                                  ) : b.status === 'COMPLETED' ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                                      <Sparkles className="w-3 h-3 text-blue-600" /> Completed
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                      <XCircle className="w-3 h-3 text-rose-600" /> Cancelled (Available)
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Document Uploads Review Section */}
            <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-600" />
                    <span>Submitted Verification Documents</span>
                  </h3>
                  <p className="text-xs text-stone-500">Government ID cards, Gurukul certification & address proof</p>
                </div>
              </div>

              {Array.isArray(pandit.documents) && pandit.documents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pandit.documents.map((doc: any) => (
                    <div
                      key={doc.id}
                      className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-1">
                        <span className="font-bold text-stone-900 block">{doc.documentType}</span>
                        <span className="text-stone-500 text-[11px] block">
                          Doc Ref: {doc.documentNumber || 'Uploaded Scan'}
                        </span>
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            doc.isVerified
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {doc.isVerified ? 'VERIFIED' : 'PENDING REVIEW'}
                        </span>
                      </div>

                      <button
                        onClick={() => handlePreviewDocument(doc)}
                        className="px-3 py-1.5 bg-white hover:bg-stone-100 text-stone-800 border border-stone-200 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-stone-500" />
                        <span>Inspect File</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-stone-400 bg-stone-50 rounded-xl border border-stone-100">
                  No document files uploaded by this applicant yet.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl text-xs text-stone-800">
            <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-600" /> Reject Pandit Application
            </h3>
            <p className="text-stone-600">
              Please enter the official reason for rejection. This reason will be stored in PostgreSQL and displayed to the Pandit.
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Identity documents unreadable, or missing Gurukul ordination certificate..."
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-600"
            />
            {rejectError && <p className="text-rose-600">{rejectError}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-3.5 py-1.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={actionLoading}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 max-w-3xl w-full space-y-4 shadow-2xl text-xs text-stone-800 my-8">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-sm text-stone-900">
                Document Preview: {previewDoc.documentType}
              </h3>
              <button onClick={closePreview} className="text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            {previewLoading ? (
              <div className="py-20 text-center text-stone-500">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-amber-600" />
                Loading file from storage...
              </div>
            ) : previewUrl ? (
              <div className="flex justify-center bg-stone-100 p-4 rounded-xl max-h-[500px] overflow-auto">
                <img src={previewUrl} alt="Document Scan" className="max-w-full h-auto rounded-lg shadow" />
              </div>
            ) : (
              <p className="text-center py-10 text-stone-500">Preview not available for this file type.</p>
            )}

            <div className="flex justify-end">
              <button
                onClick={closePreview}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
