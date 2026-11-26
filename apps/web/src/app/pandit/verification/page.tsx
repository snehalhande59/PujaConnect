'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/layout/Footer';
import {
  ShieldCheck,
  UploadCloud,
  FileText,
  Trash2,
  Eye,
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  RefreshCw,
  ArrowLeft,
  X,
  Download,
} from 'lucide-react';
import { getSavedUserProfile, getClientToken, AuthUser } from '@/lib/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://pujaconnect-api-he9b.onrender.com/api/v1';

export default function PanditVerificationPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [panditUser, setPanditUser] = useState<AuthUser | null>(null);
  const [authorized, setAuthorized] = useState(false);

  // Profile & Documents State
  const [profile, setProfile] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload Form State
  const [documentType, setDocumentType] = useState('AADHAAR');
  const [documentNumber, setDocumentNumber] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // Resubmit State
  const [resubmitting, setResubmitting] = useState(false);
  const [resubmitMessage, setResubmitMessage] = useState<string | null>(null);

  // Preview Modal
  const [previewDoc, setPreviewDoc] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const fetchProfileAndDocs = useCallback(async () => {
    const token = getClientToken();
    if (!token) return;

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/pandits/me/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error('Failed to load profile.');
      }

      const resData = await res.json();
      const data = resData.data?.data || resData.data;
      setProfile(data);
      setDocuments(data.documents || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const user = getSavedUserProfile();
    if (!user || user.role !== 'PANDIT') {
      router.push('/pandit/login');
      return;
    }
    setPanditUser(user);
    setAuthorized(true);
    fetchProfileAndDocs();
  }, [router, fetchProfileAndDocs]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    setUploadSuccess(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const maxSizeBytes = 5 * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        setUploadError('File exceeds 5MB size limit.');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);
    setUploadSuccess(null);

    if (!selectedFile) {
      setUploadError('Please select a file to upload.');
      return;
    }

    const token = getClientToken();
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('documentType', documentType);
      if (documentNumber.trim()) {
        formData.append('documentNumber', documentNumber.trim());
      }
      formData.append('file', selectedFile);

      const res = await fetch(`${API_BASE_URL}/pandits/me/documents`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Document upload failed.');
      }

      setUploadSuccess('Document uploaded successfully.');
      setSelectedFile(null);
      setDocumentNumber('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      await fetchProfileAndDocs();
    } catch (err: any) {
      setUploadError(err.message || 'Document upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    const token = getClientToken();
    try {
      const res = await fetch(`${API_BASE_URL}/pandits/me/documents/${docId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to delete document.');
      }

      await fetchProfileAndDocs();
    } catch (err: any) {
      alert(err.message || 'Could not delete document.');
    }
  };

  const handleResubmitVerification = async () => {
    const token = getClientToken();
    try {
      setResubmitting(true);
      setResubmitMessage(null);
      const res = await fetch(`${API_BASE_URL}/pandits/me/resubmit`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Resubmission failed.');
      }

      setResubmitMessage('Your profile and updated documents have been resubmitted for admin review.');
      await fetchProfileAndDocs();
    } catch (err: any) {
      alert(err.message || 'Resubmission failed.');
    } finally {
      setResubmitting(false);
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
      <div className="min-h-screen bg-ivory flex items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-maroon animate-spin" />
      </div>
    );
  }

  const status = profile?.verificationStatus || 'PENDING';

  return (
    <div className="min-h-screen flex flex-col bg-ivory text-brown font-sans">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        {/* Top Back Link & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/pandit/dashboard"
              className="p-2 bg-white rounded-xl border border-beige hover:bg-beige/40 text-brown transition shadow-sm"
              title="Return to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-2xl font-heading font-bold text-brown">
                Pandit Verification & Documents
              </h1>
              <p className="text-xs text-brown/70">
                Official accreditation portal for {profile?.fullName}
              </p>
            </div>
          </div>

          <button
            onClick={() => fetchProfileAndDocs()}
            className="self-start sm:self-center px-3 py-1.5 bg-white text-xs font-semibold rounded-lg border border-beige hover:bg-beige/30 transition flex items-center gap-1.5 shadow-sm text-brown"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Status</span>
          </button>
        </div>

        {/* Verification Status Banner */}
        <div
          className={`p-6 rounded-3xl border shadow-sacred space-y-4 ${
            status === 'VERIFIED'
              ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
              : status === 'REJECTED'
              ? 'bg-rose-50/90 border-rose-300 text-rose-950'
              : 'bg-amber-50/90 border-amber-300 text-amber-950'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div
                className={`p-3 rounded-2xl ${
                  status === 'VERIFIED'
                    ? 'bg-emerald-600 text-white'
                    : status === 'REJECTED'
                    ? 'bg-rose-600 text-white'
                    : 'bg-amber-500 text-white'
                }`}
              >
                {status === 'VERIFIED' ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : status === 'REJECTED' ? (
                  <AlertCircle className="w-6 h-6" />
                ) : (
                  <Clock className="w-6 h-6" />
                )}
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-75">
                  Current Marketplace Status
                </span>
                <h3 className="text-lg font-heading font-bold">
                  {status === 'VERIFIED'
                    ? 'Verified Vedic Shastri (Active)'
                    : status === 'REJECTED'
                    ? 'Application Requires Attention'
                    : 'Verification In Progress (Under Review)'}
                </h3>
              </div>
            </div>

            {status === 'REJECTED' && (
              <button
                onClick={handleResubmitVerification}
                disabled={resubmitting || documents.length === 0}
                className="px-5 py-2.5 bg-maroon hover:bg-maroon-800 disabled:opacity-50 text-ivory text-xs font-bold rounded-xl shadow-sacred transition flex items-center gap-2 cursor-pointer"
              >
                {resubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-gold" />
                ) : (
                  <RefreshCw className="w-4 h-4 text-gold-300" />
                )}
                <span>Resubmit for Verification</span>
              </button>
            )}
          </div>

          {/* Detailed explanation depending on status */}
          <div className="text-xs pt-3 border-t border-black/10 space-y-2">
            {status === 'VERIFIED' ? (
              <p>
                Congratulations! Your profile and credentials have been thoroughly verified by the DevSutra admin team. Your profile is live on the public marketplace and ready to accept bookings from devotees.
              </p>
            ) : status === 'REJECTED' ? (
              <div className="space-y-1.5">
                <p>
                  <strong>Admin Feedback:</strong> {profile?.rejectionReason || 'Please review your uploaded documents and resubmit.'}
                </p>
                <p className="opacity-80">
                  Please upload clear, valid documents below to address the feedback. Once you have uploaded the corrected documents, click <strong>&quot;Resubmit for Verification&quot;</strong>.
                </p>
              </div>
            ) : (
              <p>
                Your application is currently queued for review by our Vedic credential verification committee. We verify your identity proof and qualifications before publishing your profile to the devotee marketplace.
              </p>
            )}
          </div>

          {resubmitMessage && (
            <p className="p-3 bg-white/80 rounded-xl text-xs font-medium text-emerald-800 border border-emerald-300">
              {resubmitMessage}
            </p>
          )}
        </div>

        {/* Document Upload Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-beige shadow-sacred space-y-6">
          <div className="border-b border-beige/60 pb-3">
            <h2 className="text-lg font-heading font-bold text-brown">
              Upload Verification Documents
            </h2>
            <p className="text-xs text-brown/70">
              Upload authentic government-issued identity proof (Aadhaar/PAN) and Vedic Gurukul qualifications.
            </p>
          </div>

          {uploadError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p>{uploadError}</p>
            </div>
          )}

          {uploadSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p>{uploadSuccess}</p>
            </div>
          )}

          <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-brown mb-1">
                  Document Type
                </label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-beige bg-ivory/30 text-brown focus:outline-none focus:ring-2 focus:ring-maroon"
                >
                  <option value="AADHAAR">Aadhaar Card (Identity Proof)</option>
                  <option value="PAN">PAN Card (Tax / Business Proof)</option>
                  <option value="VEDIC_CERTIFICATE">Gurukul / Vedic Degree / Certification</option>
                  <option value="PROFILE_PHOTO">Official Profile Photograph</option>
                  <option value="OTHER">Other Proof / Recommendation Letter</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-brown mb-1">
                  Document Number / Reference (Optional)
                </label>
                <input
                  type="text"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  placeholder="e.g. XXXX-XXXX-1234 or Certificate No."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-beige bg-ivory/30 text-brown focus:outline-none focus:ring-2 focus:ring-maroon"
                />
              </div>
            </div>

            {/* File Input Box */}
            <div className="p-6 border-2 border-dashed border-beige hover:border-gold rounded-2xl text-center space-y-2 bg-ivory/20 transition">
              <UploadCloud className="w-8 h-8 text-gold-600 mx-auto" />
              <div>
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer font-bold text-maroon hover:text-maroon-800 underline"
                >
                  Choose Document File
                </label>
                <input
                  id="file-upload"
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onChange={handleFileChange}
                  className="sr-only"
                />
                <span className="text-brown/70"> or drag and drop here</span>
              </div>
              <p className="text-[10px] text-brown/50">
                PDF, JPG, JPEG, PNG, WEBP up to 5MB
              </p>
              {selectedFile && (
                <p className="text-xs font-bold text-brown pt-1">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={uploading || !selectedFile}
                className="px-6 py-2.5 bg-maroon hover:bg-maroon-800 disabled:opacity-50 text-ivory font-bold rounded-xl shadow-sacred transition flex items-center gap-2 cursor-pointer"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-gold" />
                    <span>Uploading Securely...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4 text-gold-300" />
                    <span>Upload Document</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Uploaded Documents List */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-beige shadow-sacred space-y-4">
          <div className="flex items-center justify-between border-b border-beige/60 pb-3">
            <h2 className="text-lg font-heading font-bold text-brown">
              My Uploaded Documents ({documents.length})
            </h2>
            <span className="text-xs text-brown/60">Stored securely in encrypted private storage</span>
          </div>

          {documents.length === 0 ? (
            <div className="py-12 text-center text-xs text-brown/60 space-y-2 bg-ivory/30 rounded-2xl border border-beige">
              <FileText className="w-6 h-6 text-brown/40 mx-auto" />
              <p className="font-semibold text-brown">No verification documents uploaded yet</p>
              <p className="text-[11px] text-brown/50">
                Please upload your Aadhaar card and Vedic credentials using the form above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-ivory/40 border border-beige rounded-2xl p-4 sm:p-5 space-y-3 shadow-sm hover:border-gold transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-white rounded-xl border border-beige text-gold-600 shadow-sm">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-heading font-bold text-sm text-brown">
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
                        <span className="text-[11px] text-brown/60 block">
                          {doc.documentNumber ? `ID: ${doc.documentNumber}` : 'No ID specified'}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        doc.isVerified
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}
                    >
                      {doc.isVerified ? 'VERIFIED' : 'PENDING REVIEW'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-brown/60 pt-2 border-t border-beige/60">
                    <span className="text-[11px]">
                      {new Date(doc.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePreviewDocument(doc)}
                        className="px-2.5 py-1 bg-white hover:bg-beige/40 text-brown rounded-lg border border-beige text-[11px] font-semibold transition flex items-center gap-1 shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5 text-gold-600" />
                        <span>Preview</span>
                      </button>

                      {!doc.isVerified && (
                        <button
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg border border-rose-200 text-[11px] font-semibold transition flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
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
          <div className="bg-white border border-beige rounded-3xl max-w-3xl w-full h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="h-14 bg-ivory px-6 flex items-center justify-between border-b border-beige">
              <div className="flex items-center gap-2 text-xs">
                <FileText className="w-4 h-4 text-gold-600" />
                <span className="font-bold text-brown">
                  {previewDoc.documentType} Preview
                </span>
              </div>
              <div className="flex items-center gap-2">
                {previewUrl && (
                  <a
                    href={previewUrl}
                    download={`devsutra-${previewDoc.documentType}-${previewDoc.fileUrl}`}
                    className="p-1.5 rounded-lg bg-white hover:bg-beige/50 text-brown border border-beige text-xs flex items-center gap-1 px-2.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                )}
                <button onClick={closePreview} className="text-brown/60 hover:text-brown p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-stone-100 flex items-center justify-center overflow-auto p-4">
              {previewLoading ? (
                <div className="text-center text-xs text-brown/60 space-y-2">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-maroon" />
                  <p>Loading document preview securely...</p>
                </div>
              ) : previewUrl ? (
                previewDoc.fileUrl.endsWith('.pdf') ? (
                  <iframe
                    src={previewUrl}
                    title="Document Preview"
                    className="w-full h-full rounded-xl border border-stone-300 bg-white"
                  />
                ) : (
                  <img
                    src={previewUrl}
                    alt="Document"
                    className="max-h-full max-w-full object-contain rounded-xl border border-stone-300"
                  />
                )
              ) : (
                <p className="text-xs text-rose-600">Could not preview document.</p>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
