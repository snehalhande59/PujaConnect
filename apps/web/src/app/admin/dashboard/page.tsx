'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getClientToken } from '@/lib/auth';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  Users,
  ShieldCheck,
  Calendar,
  IndianRupee,
  Sparkles,
  Loader2,
  AlertCircle,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  PlusCircle,
  TrendingUp,
  Activity,
  ArrowUpRight,
  Filter,
  Check,
  X,
  Eye,
  Award,
  Layers,
  ChevronRight,
  Star,
  Gift,
  Tag,
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export default function AdminDashboardPage() {
  const router = useRouter();

  // Metrics state
  const [platformStats, setPlatformStats] = useState({
    customers: { total: 0 },
    pandits: {
      total: 0,
      active: 0,
      inactive: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
    },
    pujas: { total: 0 },
    bookings: {
      total: 0,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
    },
    payments: {
      total: 0,
      successful: 0,
      pending: 0,
      failed: 0,
      totalRevenue: 0,
    },
    reviews: { total: 0 },
    coupons: { total: 0 },
  });

  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [recentCustomers, setRecentCustomers] = useState<any[]>([]);
  const [recentPandits, setRecentPandits] = useState<any[]>([]);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [recentReviews, setRecentReviews] = useState<any[]>([]);
  const [pendingPandits, setPendingPandits] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date>(new Date());
  const [dateRange, setDateRange] = useState<'ALL' | '7D' | '30D' | 'TODAY'>('ALL');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modals state
  const [rejectingPanditId, setRejectingPanditId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showAddPanditModal, setShowAddPanditModal] = useState(false);
  const [panditForm, setPanditForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '+91 ',
    experienceYears: 10,
    languages: 'Marathi, Hindi, Sanskrit',
    specializations: 'Satyanarayan Mahapuja, Griha Pravesh, Rudrabhishek',
    city: 'Pune',
    state: 'Maharashtra',
    basePrice: 2500,
    bio: 'Vedic scholar trained in traditional Gurukul with authentic Vidhi execution.',
  });

  const fetchDashboardData = useCallback(async (silent = false) => {
    const token = getClientToken();
    if (!token) return;

    try {
      if (!silent) setLoading(true);
      else setIsRefreshing(true);

      const [statsRes, pendingRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/admin/pandits/pending`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        const payload = statsData.data?.data || statsData.data || statsData;

        if (payload.customers) {
          const totalPandits = Number(payload.pandits?.total || 0);
          const approvedPandits = Number(payload.pandits?.approved || payload.pandits?.active || 0);
          const pendingPanditsCount = Number(payload.pandits?.pending || 0);
          const rejectedPanditsCount = Number(payload.pandits?.rejected || 0);
          const inactivePandits =
            payload.pandits?.inactive !== undefined
              ? Number(payload.pandits.inactive)
              : Math.max(0, totalPandits - approvedPandits);

          setPlatformStats({
            customers: { total: Number(payload.customers.total || 0) },
            pandits: {
              total: totalPandits,
              active: approvedPandits,
              inactive: inactivePandits,
              pending: pendingPanditsCount,
              approved: approvedPandits,
              rejected: rejectedPanditsCount,
            },
            pujas: { total: Number(payload.pujas?.total || 0) },
            bookings: {
              total: Number(payload.bookings?.total || 0),
              pending: Number(payload.bookings?.pending || 0),
              confirmed: Number(payload.bookings?.confirmed || 0),
              completed: Number(payload.bookings?.completed || 0),
              cancelled: Number(payload.bookings?.cancelled || 0),
            },
            payments: {
              total: Number(payload.payments?.total || 0),
              successful: Number(payload.payments?.successful || 0),
              pending: Number(payload.payments?.pending || 0),
              failed: Number(payload.payments?.failed || 0),
              totalRevenue: Number(payload.payments?.totalRevenue || 0),
            },
            reviews: { total: Number(payload.reviews?.total || 0) },
            coupons: { total: Number(payload.coupons?.total || 0) },
          });
        }

        if (Array.isArray(payload.recentBookings)) setRecentBookings(payload.recentBookings);
        if (Array.isArray(payload.recentCustomers)) setRecentCustomers(payload.recentCustomers);
        if (Array.isArray(payload.recentPandits)) setRecentPandits(payload.recentPandits);
        if (Array.isArray(payload.recentPayments)) setRecentPayments(payload.recentPayments);
        if (Array.isArray(payload.recentActivity)) setRecentActivity(payload.recentActivity);
        if (Array.isArray(payload.recentReviews)) setRecentReviews(payload.recentReviews);
      } else {
        setMessage({
          type: 'error',
          text: `API Sync Notice (${statsRes.status}): Live statistics could not be loaded from backend (${API_BASE_URL}).`,
        });
      }

      if (pendingRes.ok) {
        const pendingData = await pendingRes.json();
        const pendingList = pendingData.data?.data || pendingData.data || pendingData;
        if (Array.isArray(pendingList)) setPendingPandits(pendingList);
      }

      setLastSynced(new Date());
    } catch (err: any) {
      console.error('Error fetching dashboard metrics:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => fetchDashboardData(true), 60000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const handleApprovePandit = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to approve and verify Pt. ${name}?`)) return;
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
      setMessage({ type: 'success', text: `Pt. ${name} approved and verified successfully!` });
      await fetchDashboardData(true);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to approve.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectPandit = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a specific rejection reason.');
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
        throw new Error(data.message || 'Rejection failed.');
      }
      setMessage({ type: 'success', text: 'Pandit application rejected. Email notification dispatched.' });
      setRejectingPanditId(null);
      setRejectionReason('');
      await fetchDashboardData(true);
    } catch (err: any) {
      alert(err.message || 'Failed to reject application.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddPanditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getClientToken();
    try {
      setActionLoading('create-pandit');
      const res = await fetch(`${API_BASE_URL}/admin/pandits`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: panditForm.fullName.trim(),
          email: panditForm.email.trim(),
          phoneNumber: panditForm.phoneNumber.trim(),
          experienceYears: Number(panditForm.experienceYears),
          languages: panditForm.languages.split(',').map((s) => s.trim()).filter(Boolean),
          specializations: panditForm.specializations.split(',').map((s) => s.trim()).filter(Boolean),
          city: panditForm.city.trim(),
          state: panditForm.state.trim(),
          basePrice: Number(panditForm.basePrice),
          bio: panditForm.bio.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to register Pandit.');
      }

      setMessage({ type: 'success', text: `Pt. ${panditForm.fullName} registered and verified directly!` });
      setShowAddPanditModal(false);
      setPanditForm({
        fullName: '',
        email: '',
        phoneNumber: '+91 ',
        experienceYears: 10,
        languages: 'Marathi, Hindi, Sanskrit',
        specializations: 'Satyanarayan Mahapuja, Griha Pravesh, Rudrabhishek',
        city: 'Pune',
        state: 'Maharashtra',
        basePrice: 2500,
        bio: 'Vedic scholar trained in traditional Gurukul with authentic Vidhi execution.',
      });
      await fetchDashboardData(true);
    } catch (err: any) {
      alert(err.message || 'Error registering Pandit.');
    } finally {
      setActionLoading(null);
    }
  };

  const bookingCompletionRate =
    platformStats.bookings.total > 0
      ? Math.round((platformStats.bookings.completed / platformStats.bookings.total) * 100)
      : 0;

  const panditApprovalRate =
    platformStats.pandits.total > 0
      ? Math.round((platformStats.pandits.approved / platformStats.pandits.total) * 100)
      : 0;

  return (
    <AdminLayout pendingPanditsCount={platformStats.pandits.pending}>
      <div className="space-y-6">
        {/* Top Operational Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                Business Command Center
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold">
                Live PostgreSQL
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Real-time platform overview: devotee registrations, verified purohits, bookings & settled dakshina
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Date Range Selector */}
            <div className="flex items-center bg-stone-100 rounded-xl p-1 text-xs">
              {(['ALL', '30D', '7D', 'TODAY'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setDateRange(r)}
                  className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                    dateRange === r
                      ? 'bg-white text-stone-900 shadow-2xs'
                      : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  {r === 'ALL' ? 'All Time' : r === '30D' ? '30 Days' : r === '7D' ? '7 Days' : 'Today'}
                </button>
              ))}
            </div>

            <button
              onClick={() => fetchDashboardData(true)}
              disabled={isRefreshing}
              className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-stone-200 shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-600' : ''}`} />
              <span className="hidden sm:inline">Sync</span>
            </button>

            <button
              onClick={() => setShowAddPanditModal(true)}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Pandit</span>
            </button>
          </div>
        </div>

        {message && (
          <div
            className={`p-4 rounded-xl text-xs flex items-center justify-between shadow-xs ${
              message.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span className="font-medium">{message.text}</span>
            </div>
            <button onClick={() => setMessage(null)} className="text-stone-500 hover:text-stone-800 text-xs font-bold">
              Dismiss
            </button>
          </div>
        )}

        {/* 4 Core Financial & Volume KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Gross Revenue */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Gross Dakshina Settled</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <IndianRupee className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-stone-900">
                ₹{platformStats.payments.totalRevenue.toLocaleString()}
              </p>
              <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-stone-500">
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                  {platformStats.payments.successful} Paid Txns
                </span>
                <span>• PostgreSQL Verified</span>
              </div>
            </div>
          </div>

          {/* Total Bookings */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Total Bookings</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-stone-900">
                {platformStats.bookings.total}
              </p>
              <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-stone-500">
                <span className="font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                  {platformStats.bookings.confirmed} Confirmed
                </span>
                <span>• {platformStats.bookings.completed} Completed</span>
              </div>
            </div>
          </div>

          {/* Registered Devotees */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Devotee Customers</span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-stone-900">
                {platformStats.customers.total}
              </p>
              <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-stone-500">
                <span className="font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                  Active Devotees
                </span>
                <span>• Mobile & Web Accounts</span>
              </div>
            </div>
          </div>

          {/* Pandit Directory */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Vedic Pandits</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-stone-900">
                {platformStats.pandits.total}
              </p>
              <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-stone-500">
                <span className="font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded">
                  {platformStats.pandits.approved} Verified
                </span>
                {platformStats.pandits.pending > 0 && (
                  <span className="font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded animate-pulse">
                    {platformStats.pandits.pending} Pending
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Visual Charts & Operational Gauges (Light Theme Responsive SVG) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Booking Pipeline Bar Breakdown */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-stone-900">Booking Execution Pipeline</h3>
                <p className="text-xs text-stone-500">Live breakdown of ritual lifecycle states in database</p>
              </div>
              <span className="text-xs font-semibold text-stone-700 bg-stone-100 px-2.5 py-1 rounded-lg">
                Completion Rate: {bookingCompletionRate}%
              </span>
            </div>

            {/* Visual Status Progress Stack */}
            <div className="h-6 w-full bg-stone-100 rounded-xl overflow-hidden flex shadow-inner">
              {platformStats.bookings.total === 0 ? (
                <div className="w-full h-full bg-stone-200 flex items-center justify-center text-[10px] text-stone-500">
                  No bookings logged yet
                </div>
              ) : (
                <>
                  <div
                    style={{
                      width: `${(platformStats.bookings.completed / platformStats.bookings.total) * 100}%`,
                    }}
                    title={`Completed: ${platformStats.bookings.completed}`}
                    className="bg-emerald-500 transition-all duration-500 hover:opacity-90"
                  />
                  <div
                    style={{
                      width: `${(platformStats.bookings.confirmed / platformStats.bookings.total) * 100}%`,
                    }}
                    title={`Confirmed: ${platformStats.bookings.confirmed}`}
                    className="bg-blue-500 transition-all duration-500 hover:opacity-90"
                  />
                  <div
                    style={{
                      width: `${(platformStats.bookings.pending / platformStats.bookings.total) * 100}%`,
                    }}
                    title={`Pending: ${platformStats.bookings.pending}`}
                    className="bg-amber-400 transition-all duration-500 hover:opacity-90"
                  />
                  <div
                    style={{
                      width: `${(platformStats.bookings.cancelled / platformStats.bookings.total) * 100}%`,
                    }}
                    title={`Cancelled: ${platformStats.bookings.cancelled}`}
                    className="bg-rose-400 transition-all duration-500 hover:opacity-90"
                  />
                </>
              )}
            </div>

            {/* Legend Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-stone-50 border border-stone-100">
                <span className="w-3 h-3 rounded-md bg-emerald-500 shrink-0" />
                <div>
                  <span className="text-[10px] text-stone-500 block uppercase font-bold">Completed</span>
                  <span className="font-extrabold text-stone-900">{platformStats.bookings.completed}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-xl bg-stone-50 border border-stone-100">
                <span className="w-3 h-3 rounded-md bg-blue-500 shrink-0" />
                <div>
                  <span className="text-[10px] text-stone-500 block uppercase font-bold">Confirmed</span>
                  <span className="font-extrabold text-stone-900">{platformStats.bookings.confirmed}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-xl bg-stone-50 border border-stone-100">
                <span className="w-3 h-3 rounded-md bg-amber-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-stone-500 block uppercase font-bold">Pending</span>
                  <span className="font-extrabold text-stone-900">{platformStats.bookings.pending}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-xl bg-stone-50 border border-stone-100">
                <span className="w-3 h-3 rounded-md bg-rose-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-stone-500 block uppercase font-bold">Cancelled</span>
                  <span className="font-extrabold text-stone-900">{platformStats.bookings.cancelled}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pandit Verification Status Card */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-900">Purohit Quality & Verification</h3>
              <ShieldCheck className="w-5 h-5 text-amber-600" />
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-stone-600">Verification Health</span>
                  <span className="text-stone-900 font-bold">{panditApprovalRate}% Approved</span>
                </div>
                <div className="w-full bg-stone-100 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${panditApprovalRate}%` }}
                  />
                </div>
              </div>

              <div className="divide-y divide-stone-100 text-xs">
                <div className="py-2 flex justify-between items-center">
                  <span className="text-stone-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> Approved & Marketplace Active
                  </span>
                  <span className="font-bold text-stone-900">{platformStats.pandits.approved}</span>
                </div>
                <div className="py-2 flex justify-between items-center">
                  <span className="text-stone-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" /> Awaiting Document Review
                  </span>
                  <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                    {platformStats.pandits.pending}
                  </span>
                </div>
                <div className="py-2 flex justify-between items-center">
                  <span className="text-stone-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" /> Rejected Applications
                  </span>
                  <span className="font-bold text-rose-700">{platformStats.pandits.rejected}</span>
                </div>
                <div className="py-2 flex justify-between items-center">
                  <span className="text-stone-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-stone-400" /> Catalog Pujas Active
                  </span>
                  <span className="font-bold text-stone-900">{platformStats.pujas.total}</span>
                </div>
              </div>
            </div>

            <Link
              href="/admin/pandits"
              className="w-full py-2 bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-bold rounded-xl border border-stone-200 transition flex items-center justify-center gap-1.5"
            >
              <span>Manage Pandit Applications</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Pending Verification Priority Queue */}
        {pendingPandits.length > 0 && (
          <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-ping" />
                <h2 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                  Pending Pandit Verification Queue ({pendingPandits.length})
                </h2>
              </div>
              <span className="text-xs text-amber-800">
                Action required: review documents & credentials to publish to marketplace
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {pendingPandits.slice(0, 6).map((p) => (
                <div key={p.id} className="bg-white border border-amber-200/80 rounded-xl p-4 space-y-3 shadow-2xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-stone-900 text-sm">{p.fullName}</h4>
                      <p className="text-[11px] text-stone-500">
                        {p.city}, {p.state} • {p.experienceYears} Yrs Exp
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
                      PENDING
                    </span>
                  </div>

                  <div className="text-[11px] text-stone-600 space-y-0.5">
                    <p>📧 {p.user?.email || 'No email'}</p>
                    <p>📞 {p.user?.phoneNumber || 'No phone'}</p>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center gap-2">
                    <button
                      onClick={() => handleApprovePandit(p.id, p.fullName)}
                      disabled={actionLoading === p.id}
                      className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => {
                        setRejectingPanditId(p.id);
                        setRejectionReason('');
                      }}
                      disabled={actionLoading === p.id}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition border border-rose-200 cursor-pointer"
                    >
                      Reject
                    </button>
                    <Link
                      href={`/admin/pandits/${p.id}`}
                      className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition"
                      title="View Full Profile & Documents"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Real Live Activity Feed & Recent Bookings */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Real Bookings (2 Cols) */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-stone-900">Recent Customer Bookings</h3>
                <p className="text-xs text-stone-500">Chronological list of ceremonies scheduled across India</p>
              </div>
              <Link href="/admin/bookings" className="text-xs text-amber-700 font-bold hover:underline flex items-center gap-1">
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-stone-400">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-600" />
                Loading bookings from database...
              </div>
            ) : recentBookings.length === 0 ? (
              <div className="py-12 text-center text-xs text-stone-400">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                <p className="font-semibold text-stone-600">No bookings found in database</p>
                <p className="text-[11px] text-stone-400 mt-0.5">Real bookings placed via mobile/web will appear here</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-stone-700">
                  <thead className="bg-stone-50 text-stone-500 uppercase text-[10px] font-bold border-b border-stone-200">
                    <tr>
                      <th className="p-3">Booking #</th>
                      <th className="p-3">Devotee</th>
                      <th className="p-3">Puja Service</th>
                      <th className="p-3">Assigned Purohit</th>
                      <th className="p-3">Dakshina</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {recentBookings.slice(0, 6).map((b) => {
                      const custName = b.customerProfile
                        ? `${b.customerProfile.firstName} ${b.customerProfile.lastName}`
                        : 'Devotee';
                      const panditName = b.panditProfile ? `Pt. ${b.panditProfile.fullName}` : 'Unassigned';

                      return (
                        <tr key={b.id} className="hover:bg-stone-50/80 transition">
                          <td className="p-3 font-mono font-bold text-stone-900">
                            {b.bookingNumber || b.id.slice(0, 8)}
                          </td>
                          <td className="p-3">
                            <span className="font-semibold text-stone-900 block">{custName}</span>
                            <span className="text-[10px] text-stone-400">{b.city || 'Pune'}</span>
                          </td>
                          <td className="p-3">
                            <span className="font-medium text-stone-800">{b.puja?.title || 'Vedic Ritual'}</span>
                          </td>
                          <td className="p-3">
                            <span className={b.panditProfile ? 'text-amber-800 font-medium' : 'text-stone-400 italic'}>
                              {panditName}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-stone-900">
                            ₹{Number(b.totalAmount || 0).toLocaleString()}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block ${
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
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Real Live Database Activity Stream (1 Col) */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-amber-600" />
                  <span>Live Activity Stream</span>
                </h3>
                <p className="text-[11px] text-stone-400">Chronological PostgreSQL events</p>
              </div>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                Live
              </span>
            </div>

            {recentActivity.length === 0 ? (
              <div className="py-12 text-center text-xs text-stone-400">
                <Activity className="w-6 h-6 mx-auto mb-2 text-stone-300" />
                No events recorded yet
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-[360px] pr-1">
                {recentActivity.slice(0, 10).map((act) => (
                  <div key={act.id} className="p-3 rounded-xl bg-stone-50 border border-stone-100 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900">{act.title}</span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {act.timestamp ? new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600">{act.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* ACTUAL DEVOTEE CUSTOMERS ROSTER (LIVE POSTGRESQL) */}
        {/* ------------------------------------------------------------------ */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span>Actual Devotee Customers (नोंदणीकृत भक्त ग्राहक)</span>
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                  {platformStats.customers.total} Total
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Real devotee accounts registered through the Android application and website
              </p>
            </div>
            <Link
              href="/admin/customers"
              className="text-xs text-amber-700 font-bold hover:underline flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Manage All Customers ({platformStats.customers.total})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentCustomers.length === 0 ? (
            <div className="py-10 text-center text-xs text-stone-400">
              <Users className="w-8 h-8 mx-auto mb-2 text-stone-300" />
              <p className="font-semibold text-stone-600">No customer accounts found in database</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-stone-50 text-stone-500 uppercase text-[10px] font-bold border-b border-stone-200 tracking-wider">
                  <tr>
                    <th className="p-3">Devotee Name</th>
                    <th className="p-3">Email Address</th>
                    <th className="p-3">Phone Number</th>
                    <th className="p-3">City</th>
                    <th className="p-3">Bookings</th>
                    <th className="p-3">Registered Date</th>
                    <th className="p-3">Last Login / Activity</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {recentCustomers.slice(0, 7).map((c) => {
                    const name = `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Devotee';
                    const email = c.user?.email || 'N/A';
                    const phone = c.user?.phoneNumber || 'N/A';
                    const city = c.city || 'India';
                    const bookingCount = c._count?.bookings || 0;
                    const regDate = c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A';
                    const hasLogin = Boolean(c.lastLoginAt);

                    return (
                      <tr key={c.id} className="hover:bg-stone-50/80 transition">
                        <td className="p-3 font-bold text-stone-900 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-purple-50 text-purple-700 font-bold flex items-center justify-center text-xs border border-purple-200 shrink-0">
                            {name.charAt(0).toUpperCase()}
                          </div>
                          <span>{name}</span>
                        </td>
                        <td className="p-3 font-mono text-[11px] text-stone-700">{email}</td>
                        <td className="p-3 font-mono text-[11px] text-stone-700">{phone}</td>
                        <td className="p-3 text-stone-600">{city}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-800 font-bold text-[11px]">
                            {bookingCount} {bookingCount === 1 ? 'Booking' : 'Bookings'}
                          </span>
                        </td>
                        <td className="p-3 text-stone-500 font-mono text-[11px]">{regDate}</td>
                        <td className="p-3">
                          {hasLogin ? (
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-stone-800 text-[11px]">
                                {new Date(c.lastLoginAt).toLocaleDateString()}
                              </span>
                              <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 font-bold text-[9px] border border-amber-200">
                                {c.lastLoginMethod || 'OTP'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-stone-400 text-[11px] italic">No login recorded</span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Active
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* ACTUAL VEDIC PUROHITS & PANDITS DIRECTORY */}
        {/* ------------------------------------------------------------------ */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>Actual Vedic Pandits & Purohits (अधिकृत पुरोहित)</span>
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  {platformStats.pandits.total} Total ({platformStats.pandits.approved} Verified)
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Qualified Vedic scholars and purohits registered to conduct sacred ceremonies
              </p>
            </div>
            <Link
              href="/admin/pandits"
              className="text-xs text-amber-700 font-bold hover:underline flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Manage All Pandits ({platformStats.pandits.total})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentPandits.length === 0 ? (
            <div className="py-10 text-center text-xs text-stone-400">
              <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-stone-300" />
              <p className="font-semibold text-stone-600">No Pandits found in database</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-stone-50 text-stone-500 uppercase text-[10px] font-bold border-b border-stone-200 tracking-wider">
                  <tr>
                    <th className="p-3">Purohit Name</th>
                    <th className="p-3">Contact Email</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Location</th>
                    <th className="p-3">Experience</th>
                    <th className="p-3">Base Dakshina</th>
                    <th className="p-3">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {recentPandits.slice(0, 7).map((p) => {
                    const isVerified = p.verificationStatus === 'VERIFIED';
                    const isPending = p.verificationStatus === 'PENDING';

                    return (
                      <tr key={p.id} className="hover:bg-stone-50/80 transition">
                        <td className="p-3 font-bold text-stone-900 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-700 font-bold flex items-center justify-center text-xs border border-amber-200 shrink-0">
                            {p.fullName ? p.fullName.charAt(0).toUpperCase() : 'P'}
                          </div>
                          <span>Pt. {p.fullName}</span>
                        </td>
                        <td className="p-3 font-mono text-[11px] text-stone-700">{p.user?.email || 'N/A'}</td>
                        <td className="p-3 font-mono text-[11px] text-stone-700">{p.user?.phoneNumber || 'N/A'}</td>
                        <td className="p-3 text-stone-600">{p.city}, {p.state}</td>
                        <td className="p-3 font-semibold text-stone-800">{p.experienceYears} Years</td>
                        <td className="p-3 font-extrabold text-stone-900">₹{Number(p.basePrice || 2100).toLocaleString()}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              isVerified
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : isPending
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-rose-50 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {p.verificationStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* RECENT REVIEWS & SACRED RATINGS FEED */}
        {/* ------------------------------------------------------------------ */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>Devotee Ratings & Sacred Reviews (अभिप्राय व रेटिंग)</span>
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  {platformStats.reviews.total} Reviews
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Authentic star ratings and feedback submitted by devotees from the mobile application
              </p>
            </div>
            <Link
              href="/admin/reviews"
              className="text-xs text-amber-700 font-bold hover:underline flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Manage All Reviews</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentReviews.length === 0 ? (
            <div className="py-10 text-center text-xs text-stone-400">
              <Star className="w-8 h-8 mx-auto mb-2 text-stone-300" />
              <p className="font-semibold text-stone-600">No reviews submitted yet</p>
              <p className="text-stone-400 mt-0.5">When devotees complete rituals and rate via the Android app, reviews appear here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {recentReviews.map((rev) => {
                const devoteeName = rev.customer?.customerProfile
                  ? `${rev.customer.customerProfile.firstName} ${rev.customer.customerProfile.lastName || ''}`.trim()
                  : 'Sacred Devotee';

                return (
                  <div key={rev.id} className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= rev.rating ? 'text-amber-500 fill-amber-500' : 'text-stone-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : ''}
                      </span>
                    </div>

                    <p className="text-xs text-stone-800 italic line-clamp-3">
                      &ldquo;{rev.comment || 'Authentic shastric vidhi conducted with deep devotion.'}&rdquo;
                    </p>

                    <div className="pt-2 border-t border-stone-200/60 text-[11px] flex justify-between items-center">
                      <span className="font-semibold text-stone-900">{devoteeName}</span>
                      <span className="text-amber-800 font-medium">Pt. {rev.panditProfile?.fullName || 'Purohit'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {rejectingPanditId && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl text-xs text-stone-800">
            <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-600" /> Reject Pandit Application
            </h3>
            <p className="text-stone-600 text-xs">
              Please provide a specific reason for rejection. This will be recorded and communicated to the applicant.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Incomplete ID document submitted, or experience certificate required..."
              rows={3}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-600 text-stone-900"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectingPanditId(null)}
                className="px-3 py-1.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectPandit}
                disabled={actionLoading === rejectingPanditId}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Pandit Modal */}
      {showAddPanditModal && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl text-xs text-stone-800 my-8">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Direct Pandit Registration & Verification
              </h3>
              <button
                onClick={() => setShowAddPanditModal(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddPanditSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={panditForm.fullName}
                  onChange={(e) => setPanditForm({ ...panditForm, fullName: e.target.value })}
                  placeholder="Pt. Ramesh Shastri"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={panditForm.email}
                    onChange={(e) => setPanditForm({ ...panditForm, email: e.target.value })}
                    placeholder="pandit@devsutra.in"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={panditForm.phoneNumber}
                    onChange={(e) => setPanditForm({ ...panditForm, phoneNumber: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={panditForm.city}
                    onChange={(e) => setPanditForm({ ...panditForm, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Base Fee (₹) *</label>
                  <input
                    type="number"
                    required
                    value={panditForm.basePrice}
                    onChange={(e) => setPanditForm({ ...panditForm, basePrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Specializations (comma separated)</label>
                <input
                  type="text"
                  value={panditForm.specializations}
                  onChange={(e) => setPanditForm({ ...panditForm, specializations: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddPanditModal(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === 'create-pandit'}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition flex items-center gap-1.5"
                >
                  {actionLoading === 'create-pandit' ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>Register & Verify Pandit</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
