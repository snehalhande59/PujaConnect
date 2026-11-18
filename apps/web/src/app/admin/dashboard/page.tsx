'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DevSutraLogo from '@/components/ui/DevSutraLogo';
import { getSavedUserProfile, clearClientSession, AuthUser, getClientToken } from '@/lib/auth';
import {
  Users,
  ShieldCheck,
  Calendar,
  IndianRupee,
  Package,
  Layers,
  Settings,
  LifeBuoy,
  FileBarChart,
  Check,
  X,
  Sparkles,
  Lock,
  LogOut,
  Loader2,
  FileText,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<AuthUser | null>(null);
  const [authorized, setAuthorized] = useState(false);

  // Live Stats State
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    verified: 0,
    rejected: 0,
  });

  // Pending Pandits State
  const [pendingPandits, setPendingPandits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Rejection Modal State
  const [rejectingPanditId, setRejectingPanditId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionError, setRejectionError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    const token = getClientToken();
    if (!token) return;

    try {
      setLoading(true);
      // Fetch stats
      const statsRes = await fetch(`${API_BASE_URL}/admin/pandits/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        const payload = statsData.data?.data || statsData.data || statsData;
        setStats({
          total: payload.total || 0,
          pending: payload.pending || 0,
          verified: payload.verified || 0,
          rejected: payload.rejected || 0,
        });
      }

      // Fetch pending pandits
      const pendingRes = await fetch(`${API_BASE_URL}/admin/pandits/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (pendingRes.ok) {
        const pendingData = await pendingRes.json();
        const list = pendingData.data?.data || pendingData.data || [];
        setPendingPandits(list);
      }
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const profile = getSavedUserProfile();

    // Strict Role Enforcement
    if (!profile || profile.role !== 'ADMIN') {
      router.push('/admin/login');
      return;
    }

    setAdminUser(profile);
    setAuthorized(true);
    fetchDashboardData();
  }, [router, fetchDashboardData]);

  const handleApprove = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to approve and verify ${name}?`)) return;

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
        throw new Error(data.message || 'Failed to approve Pandit.');
      }

      setMessage({ type: 'success', text: `${name} has been verified and published to marketplace!` });
      await fetchDashboardData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to approve Pandit.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectionReason.trim()) {
      setRejectionError('Please provide a specific reason for rejection.');
      return;
    }

    const token = getClientToken();
    try {
      setActionLoading(rejectingPanditId);
      const res = await fetch(`${API_BASE_URL}/admin/pandits/${rejectingPanditId}/reject`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: rejectionReason.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to reject Pandit.');
      }

      setMessage({ type: 'success', text: 'Application rejected and notification sent to Pandit.' });
      setRejectingPanditId(null);
      setRejectionReason('');
      setRejectionError(null);
      await fetchDashboardData();
    } catch (err: any) {
      setRejectionError(err.message || 'Failed to submit rejection.');
    } finally {
      setActionLoading(null);
    }
  };

  if (!authorized) {
    return (
      <div className="min-h-screen bg-deep-maroon flex items-center justify-center p-4 text-beige font-sans">
        <div className="text-center space-y-3">
          <Lock className="w-8 h-8 text-gold animate-bounce mx-auto" />
          <p className="text-xs">Verifying Enterprise Administrative Privileges...</p>
        </div>
      </div>
    );
  }

  const adminNav = [
    { title: 'Dashboard Analytics', href: '/admin/dashboard', icon: FileBarChart },
    {
      title: 'Pandit Verification',
      href: '/admin/pandits',
      icon: ShieldCheck,
      badge: stats.pending > 0 ? `${stats.pending} Pending` : undefined,
    },
    { title: 'Customer Management', href: '/admin/customers', icon: Users },
    { title: 'Puja Management', href: '/admin/pujas', icon: Sparkles },
    { title: 'Puja Categories', href: '/admin/categories', icon: Layers },
    { title: 'Booking Management', href: '/admin/bookings', icon: Calendar },
    { title: 'Payment Management', href: '/admin/payments', icon: IndianRupee },
    { title: 'Samagri Products', href: '/admin/products', icon: Package },
    { title: 'Orders & Fulfillment', href: '/admin/orders', icon: Package },
    { title: 'Support Tickets', href: '/support/dashboard', icon: LifeBuoy },
    { title: 'Reports & Audit', href: '/admin/reports', icon: FileBarChart },
    { title: 'Platform Settings', href: '/admin/settings', icon: Settings },
  ];

  const handleAdminLogout = () => {
    clearClientSession();
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-deep-maroon text-beige flex flex-col font-sans">
      {/* Admin Topbar */}
      <header className="h-16 border-b border-gold/30 bg-maroon-900 px-6 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <DevSutraLogo variant="dark" size="sm" showTagline={false} />
          <span className="font-heading font-bold text-sm tracking-wide text-ivory border-l border-gold/30 pl-3">
            Enterprise Admin Console
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="text-beige/70">
            Admin: <strong className="text-ivory">{adminUser?.email || 'Administrator'}</strong>
          </span>
          <button
            onClick={handleAdminLogout}
            className="px-3 py-1.5 rounded-lg bg-maroon-950 hover:bg-maroon-800 text-ivory border border-gold/30 transition flex items-center gap-1.5 text-xs cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Admin Sidebar Navigation */}
        <aside className="w-full md:w-64 border-r border-gold/25 bg-maroon-950/60 p-4 space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gold-300 px-3 py-2">
            Operations
          </div>
          {adminNav.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === '/admin/dashboard';
            return (
              <Link
                key={item.title}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-maroon-900 text-ivory border border-gold/40 shadow-sm'
                    : 'text-beige/80 hover:text-ivory hover:bg-maroon-900/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-gold-400" />
                  <span>{item.title}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] bg-gold/20 text-gold-300 border border-gold/30 px-2 py-0.5 rounded-full font-bold">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </aside>

        {/* Admin Content Area */}
        <main className="flex-1 p-6 md:p-8 space-y-8">
          {message && (
            <div
              className={`p-4 rounded-xl text-xs flex items-center justify-between gap-3 border ${
                message.type === 'success'
                  ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/80 border-rose-500/40 text-rose-200'
              }`}
            >
              <span>{message.text}</span>
              <button
                onClick={() => setMessage(null)}
                className="text-beige/60 hover:text-ivory text-xs underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Top Real Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-maroon-900 border border-gold/30 p-5 rounded-2xl shadow-sacred">
              <span className="text-xs text-beige/70 font-medium">Pending Verifications</span>
              <p className="text-2xl font-heading font-bold text-gold-300 mt-1">
                {stats.pending} Applications
              </p>
              <span className="text-[11px] text-gold-400/80 mt-1 block">Awaiting admin review</span>
            </div>
            <div className="bg-maroon-900 border border-gold/30 p-5 rounded-2xl shadow-sacred">
              <span className="text-xs text-beige/70 font-medium">Verified Active Pandits</span>
              <p className="text-2xl font-heading font-bold text-emerald-400 mt-1">
                {stats.verified} Shastri / Acharyas
              </p>
              <span className="text-[11px] text-emerald-300/80 mt-1 block">Eligible for bookings</span>
            </div>
            <div className="bg-maroon-900 border border-gold/30 p-5 rounded-2xl shadow-sacred">
              <span className="text-xs text-beige/70 font-medium">Rejected / Action Req.</span>
              <p className="text-2xl font-heading font-bold text-rose-300 mt-1">
                {stats.rejected} Applications
              </p>
              <span className="text-[11px] text-rose-300/80 mt-1 block">Awaiting pandit resubmission</span>
            </div>
            <div className="bg-maroon-900 border border-gold/30 p-5 rounded-2xl shadow-sacred">
              <span className="text-xs text-beige/70 font-medium">Total Registered Pandits</span>
              <p className="text-2xl font-heading font-bold text-ivory mt-1">
                {stats.total} Total
              </p>
              <span className="text-[11px] text-beige/60 mt-1 block">Across all statuses</span>
            </div>
          </div>

          {/* Pending Pandit Approvals Module */}
          <div className="bg-maroon-900 border border-gold/30 rounded-2xl p-6 sm:p-7 space-y-4 shadow-sacred">
            <div className="flex items-center justify-between border-b border-maroon-800 pb-3">
              <div>
                <h3 className="font-heading font-bold text-base text-ivory">
                  Pandit Registrations Requiring Verification ({pendingPandits.length})
                </h3>
                <p className="text-xs text-beige/70 mt-0.5">
                  Accounts remain hidden from the public marketplace until verified by an Administrator
                </p>
              </div>
              <Link
                href="/admin/pandits"
                className="text-xs text-gold-300 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Full Directory & Verification</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-beige/60 space-y-2">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-gold" />
                <p>Loading pending verification requests...</p>
              </div>
            ) : pendingPandits.length === 0 ? (
              <div className="py-10 text-center text-xs text-beige/70 bg-maroon-950/50 rounded-xl border border-gold/20 space-y-1">
                <Check className="w-6 h-6 text-emerald-400 mx-auto" />
                <p className="font-semibold text-ivory">No pending applications</p>
                <p className="text-[11px] text-beige/60">
                  All registered Pandit applications have been processed.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingPandits.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 bg-maroon-950 border border-gold/20 rounded-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <h4 className="font-heading font-bold text-sm text-ivory">{p.fullName}</h4>
                        <span className="text-[10px] bg-gold/15 text-gold-300 px-2 py-0.5 rounded border border-gold/30 font-bold">
                          PENDING VERIFICATION
                        </span>
                        <span className="text-[11px] text-beige/60">
                          {p.city}, {p.state}
                        </span>
                      </div>
                      <p className="text-xs text-beige/75">
                        Experience: <strong>{p.experienceYears} Years</strong> • Languages:{' '}
                        {p.languages?.join(', ')} • Contact:{' '}
                        <strong className="text-ivory">{p.user?.phoneNumber || p.user?.email}</strong>
                      </p>
                      <div className="flex items-center gap-3 text-xs text-beige/60">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-gold" />
                          {p.documents?.length || 0} Document(s) Uploaded
                        </span>
                        {p.specializations?.length > 0 && (
                          <span>
                            Specializations: {p.specializations.slice(0, 3).join(', ')}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/admin/pandits/${p.id}`}
                        className="px-3 py-1.5 bg-maroon-900 hover:bg-maroon-800 text-ivory text-xs font-semibold rounded-lg border border-gold/30 transition flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5 text-gold" />
                        <span>Review Documents</span>
                      </Link>

                      <button
                        onClick={() => handleApprove(p.id, p.fullName)}
                        disabled={actionLoading === p.id}
                        className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-ivory text-xs font-semibold rounded-lg transition flex items-center gap-1 cursor-pointer"
                      >
                        {actionLoading === p.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        <span>Approve</span>
                      </button>

                      <button
                        onClick={() => {
                          setRejectingPanditId(p.id);
                          setRejectionReason('');
                          setRejectionError(null);
                        }}
                        disabled={actionLoading === p.id}
                        className="px-3.5 py-1.5 bg-rose-900/40 text-rose-300 hover:bg-rose-900 border border-rose-500/40 text-xs font-semibold rounded-lg transition flex items-center gap-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Reject Modal */}
      {rejectingPanditId && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-maroon-900 border border-gold/40 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl text-xs text-beige">
            <div className="flex items-center justify-between border-b border-maroon-800 pb-3">
              <h3 className="font-heading font-bold text-sm text-ivory flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400" /> Reject Pandit Application
              </h3>
              <button
                onClick={() => setRejectingPanditId(null)}
                className="text-beige/60 hover:text-ivory"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-beige/80">
              Please specify the reason for rejecting this Pandit application. This message will be sent to the Pandit so they can address the issue and resubmit.
            </p>

            {rejectionError && (
              <p className="p-2.5 rounded-lg bg-rose-950/80 border border-rose-500/40 text-rose-200">
                {rejectionError}
              </p>
            )}

            <div>
              <label className="block font-semibold text-ivory mb-1">
                Rejection Reason (Mandatory)
              </label>
              <textarea
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Gurukul certificate is unclear or Aadhaar verification failed. Please provide a clear scan."
                className="w-full p-3 rounded-xl bg-maroon-950 border border-gold/30 text-ivory focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-maroon-800">
              <button
                type="button"
                onClick={() => setRejectingPanditId(null)}
                className="px-4 py-2 rounded-xl bg-maroon-950 text-beige hover:text-ivory transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading === rejectingPanditId}
                onClick={handleRejectConfirm}
                className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-ivory font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {actionLoading === rejectingPanditId && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
