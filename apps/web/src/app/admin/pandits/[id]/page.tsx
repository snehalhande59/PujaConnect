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
} from 'lucide-react';
import DevSutraLogo from '@/components/ui/DevSutraLogo';
import { getSavedUserProfile, getClientToken, AuthUser } from '@/lib/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export default function AdminPanditDetailPage() {
  const router = useRouter();
  const params = useParams();
  const panditId = params.id as string;

  const [adminUser, setAdminUser] = useState<AuthUser | null>(null);
  const [authorized, setAuthorized] = useState(false);

  const [pandit, setPandit] = useState<any>(null);
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
      const res = await fetch(`${API_BASE_URL}/admin/pandits/${panditId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch Pandit profile.');
      }

      const resData = await res.json();
      const data = resData.data?.data || resData.data;
      setPandit(data);
    } catch (err: any) {
      console.error(err);
      setBannerMessage({ type: 'error', text: err.message || 'Error loading profile.' });
    } finally {
      setLoading(false);
    }
  }, [panditId]);

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
      fetchPanditDetails();
    }
  }, [authorized, fetchPanditDetails]);

  const handleApprove = async () => {
    if (!confirm(`Are you sure you want to approve ${pandit?.fullName}?`)) return;

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

  if (!authorized || loading) {
    return (
      <div className="min-h-screen bg-deep-maroon flex items-center justify-center p-4 text-beige">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
      </div>
    );
  }

  if (!pandit) {
    return (
      <div className="min-h-screen bg-deep-maroon text-beige p-8 text-center space-y-4">
        <p>Pandit profile not found.</p>
        <Link href="/admin/pandits" className="text-gold underline">
          Return to directory
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-maroon text-beige font-sans flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-gold/30 bg-maroon-900 px-6 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/pandits"
            className="p-2 rounded-xl bg-maroon-950 hover:bg-maroon-800 text-ivory border border-gold/30 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <DevSutraLogo variant="icon" size="sm" showTagline={false} />
          <span className="font-heading font-bold text-sm tracking-wide text-ivory border-l border-gold/30 pl-3">
            DevSutra Pandit Verification
          </span>
        </div>

        {/* Action Buttons Top Bar */}
        <div className="flex items-center gap-2">
          {pandit.verificationStatus !== 'VERIFIED' && (
            <button
              onClick={handleApprove}
              disabled={actionLoading}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow"
            >
              {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              <span>Approve & Verify</span>
            </button>
          )}

          {pandit.verificationStatus !== 'REJECTED' && (
            <button
              onClick={() => {
                setShowRejectModal(true);
                setRejectReason('');
                setRejectError(null);
              }}
              disabled={actionLoading}
              className="px-4 py-2 bg-rose-900/60 hover:bg-rose-900 text-rose-200 border border-rose-500/40 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reject Application</span>
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 p-6 md:p-8 max-w-6xl mx-auto w-full space-y-6">
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

        {/* Rejection Notice Banner (if currently rejected) */}
        {pandit.verificationStatus === 'REJECTED' && (
          <div className="p-5 bg-rose-950/90 border-2 border-rose-500/50 rounded-2xl text-xs text-rose-200 space-y-2 shadow-sacred">
            <div className="flex items-center gap-2 font-bold text-rose-300 text-sm">
              <AlertCircle className="w-5 h-5 text-rose-400" />
              Application Currently Marked REJECTED
            </div>
            <p>
              <strong>Reason logged:</strong> {pandit.rejectionReason || 'No reason provided.'}
            </p>
            <p className="text-[11px] text-rose-300/80">
              The Pandit can view this feedback in their portal, upload updated documents, and resubmit for verification.
            </p>
          </div>
        )}

        {/* Pandit Profile Card */}
        <div className="bg-maroon-900 border border-gold/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sacred">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-maroon-800 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-maroon-950 border-2 border-gold/40 flex items-center justify-center font-heading font-bold text-2xl text-gold-300 overflow-hidden">
                {pandit.avatarUrl ? (
                  <img src={pandit.avatarUrl} alt={pandit.fullName} className="w-full h-full object-cover" />
                ) : (
                  pandit.fullName.slice(0, 2).toUpperCase()
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-heading font-bold text-ivory">
                    {pandit.fullName}
                  </h1>
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
                      pandit.verificationStatus === 'VERIFIED'
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                        : pandit.verificationStatus === 'PENDING'
                        ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                        : 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                    }`}
                  >
                    {pandit.verificationStatus}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-beige/70">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gold" />
                    {pandit.city}, {pandit.state}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-gold" />
                    {pandit.user?.email}
                  </span>
                  {pandit.user?.phoneNumber && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-gold" />
                      {pandit.user?.phoneNumber}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="text-right sm:self-center">
              <span className="text-[10px] uppercase tracking-wider text-gold-300 font-bold block">
                Vedic Experience
              </span>
              <span className="text-2xl font-heading font-bold text-ivory">
                {pandit.experienceYears} Years
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="space-y-1 bg-maroon-950/50 p-4 rounded-xl border border-gold/15">
              <span className="text-beige/60 font-semibold block uppercase text-[10px]">Languages Spoken</span>
              <p className="text-ivory font-medium">{pandit.languages?.join(', ') || 'Not specified'}</p>
            </div>

            <div className="space-y-1 bg-maroon-950/50 p-4 rounded-xl border border-gold/15">
              <span className="text-beige/60 font-semibold block uppercase text-[10px]">Ritual Specializations</span>
              <p className="text-ivory font-medium">{pandit.specializations?.join(', ') || 'All standard pujas'}</p>
            </div>

            <div className="space-y-1 bg-maroon-950/50 p-4 rounded-xl border border-gold/15">
              <span className="text-beige/60 font-semibold block uppercase text-[10px]">Service Operational Areas</span>
              <p className="text-ivory font-medium">{pandit.serviceAreas?.join(', ') || pandit.city}</p>
            </div>
          </div>

          {pandit.bio && (
            <div className="space-y-1.5 bg-maroon-950/50 p-4 rounded-xl border border-gold/15 text-xs">
              <span className="text-gold-300 font-semibold block uppercase text-[10px]">
                Vedic Background & Biography
              </span>
              <p className="text-beige/90 leading-relaxed">{pandit.bio}</p>
            </div>
          )}
        </div>

        {/* Verification Documents Section */}
        <div className="bg-maroon-900 border border-gold/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sacred">
          <div className="flex items-center justify-between border-b border-maroon-800 pb-3">
            <div>
              <h2 className="text-lg font-heading font-bold text-ivory">
                Uploaded Verification Documents ({pandit.documents?.length || 0})
              </h2>
              <p className="text-xs text-beige/70">
                Inspect identity proofs and Vedic Gurukul certificates for authenticity
              </p>
            </div>
          </div>

          {pandit.documents?.length === 0 ? (
            <div className="py-12 text-center text-xs text-beige/60 space-y-2 bg-maroon-950/40 rounded-2xl border border-gold/20">
              <AlertCircle className="w-6 h-6 text-amber-400 mx-auto" />
              <p className="font-semibold text-ivory">No verification documents uploaded</p>
              <p className="text-[11px] text-beige/60">
                The Pandit has not uploaded any identity proof or certifications yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pandit.documents?.map((doc: any) => (
                <div
                  key={doc.id}
                  className="bg-maroon-950 border border-gold/25 rounded-2xl p-5 space-y-4 hover:border-gold/50 transition shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-maroon-900 rounded-xl border border-gold/30 text-gold-400">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-heading font-bold text-sm text-ivory">
                          {doc.documentType === 'AADHAAR'
                            ? 'Aadhaar Card'
                            : doc.documentType === 'PAN'
                            ? 'PAN Card'
                            : doc.documentType === 'VEDIC_CERTIFICATE'
                            ? 'Vedic / Gurukul Degree'
                            : doc.documentType === 'PROFILE_PHOTO'
                            ? 'Profile Photograph'
                            : doc.documentType}
                        </h4>
                        <span className="text-[11px] text-beige/60 block">
                          Doc ID: {doc.documentNumber || 'Not specified'}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        doc.isVerified
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                          : 'bg-amber-950 text-amber-300 border-amber-500/40'
                      }`}
                    >
                      {doc.isVerified ? 'VERIFIED' : 'PENDING'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-beige/60 pt-2 border-t border-maroon-800">
                    <span>
                      Uploaded:{' '}
                      {new Date(doc.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <button
                      onClick={() => handlePreviewDocument(doc)}
                      className="px-3 py-1.5 bg-maroon-900 hover:bg-maroon-800 text-ivory rounded-lg border border-gold/30 transition flex items-center gap-1.5 cursor-pointer text-xs"
                    >
                      <Eye className="w-3.5 h-3.5 text-gold" />
                      <span>Preview Document</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-maroon-900 border border-gold/50 rounded-2xl max-w-3xl w-full h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="h-14 bg-maroon-950 px-6 flex items-center justify-between border-b border-gold/30">
              <div className="flex items-center gap-2 text-xs">
                <FileText className="w-4 h-4 text-gold" />
                <span className="font-bold text-ivory">
                  {previewDoc.documentType} Preview — {previewDoc.documentNumber || previewDoc.fileUrl}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {previewUrl && (
                  <a
                    href={previewUrl}
                    download={`devsutra-${previewDoc.documentType}-${previewDoc.fileUrl}`}
                    className="p-1.5 rounded-lg bg-maroon-900 hover:bg-maroon-800 text-beige hover:text-ivory border border-gold/30 text-xs flex items-center gap-1 px-2.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                )}
                <button onClick={closePreview} className="text-beige/60 hover:text-ivory p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-stone-950 flex items-center justify-center overflow-auto p-4">
              {previewLoading ? (
                <div className="text-center text-xs text-beige/60 space-y-2">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-gold" />
                  <p>Streaming secure document file...</p>
                </div>
              ) : previewUrl ? (
                previewDoc.fileUrl.endsWith('.pdf') ? (
                  <iframe
                    src={previewUrl}
                    title="Document Preview"
                    className="w-full h-full rounded-xl border border-stone-800 bg-white"
                  />
                ) : (
                  <img
                    src={previewUrl}
                    alt="Document"
                    className="max-h-full max-w-full object-contain rounded-xl border border-stone-800"
                  />
                )
              ) : (
                <p className="text-xs text-rose-300">Could not preview document.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-maroon-900 border border-gold/40 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl text-xs text-beige">
            <div className="flex items-center justify-between border-b border-maroon-800 pb-3">
              <h3 className="font-heading font-bold text-sm text-ivory flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400" /> Reject Pandit Application
              </h3>
              <button onClick={() => setShowRejectModal(false)} className="text-beige/60 hover:text-ivory">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-beige/80">
              Provide a clear reason for rejecting this Pandit application. The reason will be sent to the Pandit so they can make corrections.
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
                placeholder="e.g. Identity document is illegible. Please upload a clear color scan of your Aadhaar card."
                className="w-full p-3 rounded-xl bg-maroon-950 border border-gold/30 text-ivory focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-maroon-800">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 rounded-xl bg-maroon-950 text-beige hover:text-ivory transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleRejectConfirm}
                className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-ivory font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
