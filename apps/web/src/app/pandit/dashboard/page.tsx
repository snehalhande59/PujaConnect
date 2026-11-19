'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/layout/Footer';
import {
  Calendar,
  IndianRupee,
  ShieldCheck,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  FileText,
  ArrowRight,
} from 'lucide-react';
import { getSavedUserProfile, getClientToken, AuthUser } from '@/lib/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export default function PanditDashboardPage() {
  const router = useRouter();
  const [panditUser, setPanditUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getSavedUserProfile();
    if (!user || user.role !== 'PANDIT') {
      router.push('/pandit/login');
      return;
    }
    setPanditUser(user);

    const token = getClientToken();
    if (token) {
      Promise.all([
        fetch(`${API_BASE_URL}/pandits/me/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then((res) => (res.ok ? res.json() : null)),
        fetch(`${API_BASE_URL}/pandits/me/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then((res) => (res.ok ? res.json() : null)),
      ])
        .then(([profileRes, dashRes]) => {
          if (profileRes) {
            setProfile(profileRes.data?.data || profileRes.data);
          }
          if (dashRes) {
            setDashboardData(dashRes.data?.data || dashRes.data);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory">
        <Loader2 className="w-8 h-8 text-maroon animate-spin" />
      </div>
    );
  }

  const verificationStatus = profile?.verificationStatus || 'PENDING';
  const fullName = profile?.fullName || panditUser?.firstName || 'Vedic Pandit';
  const city = profile?.city || 'India';
  const experience = profile?.experienceYears || 5;

  return (
    <div className="min-h-screen flex flex-col bg-ivory text-brown">
      <Navbar />

      {/* Top Banner Header */}
      <div className="bg-maroon-800 text-ivory py-10 border-b border-gold/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-sans">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gold-300 uppercase tracking-wider">
                DevSutra Pandit Portal
              </span>
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  verificationStatus === 'VERIFIED'
                    ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40'
                    : verificationStatus === 'PENDING'
                    ? 'bg-amber-500/20 text-amber-200 border-amber-400/40'
                    : 'bg-rose-500/20 text-rose-200 border-rose-400/40'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                {verificationStatus === 'VERIFIED'
                  ? 'Verified Shastri'
                  : verificationStatus === 'PENDING'
                  ? 'Verification Pending'
                  : 'Action Required'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold mt-1 text-ivory">
              {fullName}
            </h1>
            <p className="text-xs text-beige/80 mt-1">
              {city} • {experience}+ Years Vedic Experience
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/pandit/verification"
              className="px-4 py-2.5 bg-gold/20 hover:bg-gold/30 text-gold-200 text-xs font-semibold rounded-xl border border-gold/40 transition flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Documents & Accreditation</span>
            </Link>
            <Link
              href="/pandit/availability"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-ivory text-xs font-semibold rounded-xl border border-white/20 transition"
            >
              Update Availability
            </Link>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8 font-sans">
        {/* Verification Status Alert Banner */}
        {verificationStatus !== 'VERIFIED' && (
          <div
            className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sacred ${
              verificationStatus === 'REJECTED'
                ? 'bg-rose-50 border-rose-300 text-rose-950'
                : 'bg-amber-50 border-amber-300 text-amber-950'
            }`}
          >
            <div className="flex items-start gap-3">
              <AlertCircle
                className={`w-5 h-5 shrink-0 mt-0.5 ${
                  verificationStatus === 'REJECTED' ? 'text-rose-600' : 'text-amber-600'
                }`}
              />
              <div className="space-y-1 text-xs">
                <h3 className="font-heading font-bold text-sm">
                  {verificationStatus === 'REJECTED'
                    ? 'Action Required: Verification Not Approved'
                    : 'Account Verification In Progress'}
                </h3>
                <p>
                  {verificationStatus === 'REJECTED'
                    ? `Reason: "${profile?.rejectionReason || 'Please review your uploaded documents.'}" Please update your documents to resubmit for review.`
                    : 'Your Pandit credentials and identity documents are being reviewed by the DevSutra admin team. Public booking requests will be activated once approved.'}
                </p>
              </div>
            </div>

            <Link
              href="/pandit/verification"
              className="px-4 py-2 bg-maroon hover:bg-maroon-800 text-ivory text-xs font-bold rounded-xl shadow-sacred transition flex items-center gap-1.5 shrink-0 self-start sm:self-center"
            >
              <span>{verificationStatus === 'REJECTED' ? 'Review & Resubmit' : 'Manage Documents'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-beige shadow-sacred">
            <span className="text-xs text-brown/60 font-medium">Sacred Dakshina Settled</span>
            <p className="text-2xl font-heading font-bold text-maroon mt-1">
              ₹{(dashboardData?.stats?.totalEarnings || 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-beige shadow-sacred">
            <span className="text-xs text-brown/60 font-medium">New Booking Requests</span>
            <p className="text-2xl font-heading font-bold text-gold-600 mt-1">
              {verificationStatus === 'VERIFIED'
                ? `${dashboardData?.stats?.pendingRequests || 0} Pending`
                : 'Locked (Awaiting Approval)'}
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-beige shadow-sacred">
            <span className="text-xs text-brown/60 font-medium">Upcoming Rituals</span>
            <p className="text-2xl font-heading font-bold text-maroon mt-1">
              {dashboardData?.stats?.upcomingPujas || 0} Confirmed
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-beige shadow-sacred">
            <span className="text-xs text-brown/60 font-medium">Total Ceremonies Assigned</span>
            <p className="text-2xl font-heading font-bold text-emerald-600 mt-1">
              {dashboardData?.stats?.totalAssigned || 0} Total
            </p>
          </div>
        </div>

        {/* Pending Requests Block */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-beige shadow-sacred space-y-4">
          <div className="flex items-center justify-between border-b border-beige/60 pb-3">
            <h3 className="text-base font-heading font-bold text-brown">
              New Booking Requests Awaiting Acceptance
            </h3>
            <span className="text-xs text-maroon font-semibold">Action Required</span>
          </div>

          <div className="p-4 sm:p-5 rounded-xl border border-beige bg-ivory/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-brown/50">Booking #DS-2026-904</span>
              <h4 className="text-base font-heading font-bold text-brown">Maha Rudrabhishek with Panchamrit</h4>
              <p className="text-xs text-brown/75 mt-1">Devotee: <strong>Amit Saxena</strong> • South Extension II, New Delhi</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-brown/65">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-gold-600" /> 28 Nov 2026</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-gold-600" /> 08:00 AM IST</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={verificationStatus !== 'VERIFIED'}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-ivory text-xs font-semibold rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" /> Accept
              </button>
              <button
                disabled={verificationStatus !== 'VERIFIED'}
                className="px-4 py-2 border border-rose-300 text-rose-700 hover:bg-rose-50 disabled:opacity-50 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <XCircle className="w-4 h-4" /> Decline
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
