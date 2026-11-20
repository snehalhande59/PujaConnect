"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DevSutraLogo from "@/components/ui/DevSutraLogo";
import {
  getSavedUserProfile,
  clearClientSession,
  AuthUser,
  getClientToken,
} from "@/lib/auth";
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
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserCheck,
  UserX,
  PlusCircle,
  TrendingUp,
} from "lucide-react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<AuthUser | null>(null);
  const [authorized, setAuthorized] = useState(false);

  // Platform Stats State (13 Real PostgreSQL Metrics)
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
  });

  // Recent Entities State
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [recentCustomers, setRecentCustomers] = useState<any[]>([]);

  // Pending Pandits State
  const [pendingPandits, setPendingPandits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date>(new Date());
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Rejection Modal State
  const [rejectingPanditId, setRejectingPanditId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionError, setRejectionError] = useState<string | null>(null);

  // Add Pandit Modal State
  const [showAddPanditModal, setShowAddPanditModal] = useState(false);
  const [panditForm, setPanditForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "+91 ",
    experienceYears: 10,
    languages: "Marathi, Hindi, Sanskrit",
    specializations: "Satyanarayan Mahapuja, Griha Pravesh, Rudrabhishek",
    city: "Pune",
    state: "Maharashtra",
    basePrice: 2500,
    bio: "Vedic scholar trained in traditional Gurukul with authentic Vidhi execution.",
  });

  // Add Puja Modal State
  const [showAddPujaModal, setShowAddPujaModal] = useState(false);
  const [pujaForm, setPujaForm] = useState({
    title: "",
    description: "",
    basePrice: 3501,
    samagriPrice: 1100,
    durationMinutes: 120,
  });

  const fetchDashboardData = useCallback(async (silent = false) => {
    const token = getClientToken();
    if (!token) return;

    try {
      if (!silent) setLoading(true);
      else setIsRefreshing(true);

      // 1. Fetch real platform stats from PostgreSQL
      const statsRes = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        const payload = statsData.data?.data || statsData.data || statsData;

        if (payload.customers) {
          const totalPandits = Number(payload.pandits?.total || 0);
          const approvedPandits = Number(payload.pandits?.approved || payload.pandits?.active || 0);
          const pendingPanditsCount = Number(payload.pandits?.pending || 0);
          const rejectedPanditsCount = Number(payload.pandits?.rejected || 0);
          const inactivePandits = payload.pandits?.inactive !== undefined
            ? Number(payload.pandits.inactive)
            : Math.max(0, totalPandits - approvedPandits);

          setPlatformStats({
            customers: {
              total: Number(payload.customers?.total || 0),
            },
            pandits: {
              total: totalPandits,
              active: approvedPandits,
              inactive: inactivePandits,
              pending: pendingPanditsCount,
              approved: approvedPandits,
              rejected: rejectedPanditsCount,
            },
            pujas: {
              total: Number(payload.pujas?.total || 0),
            },
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
          });

          if (Array.isArray(payload.recentBookings)) {
            setRecentBookings(payload.recentBookings);
          }
          if (Array.isArray(payload.recentCustomers)) {
            setRecentCustomers(payload.recentCustomers);
          }
        }
      }

      // 2. Fetch pending Pandits needing approval
      const pendingRes = await fetch(`${API_BASE_URL}/admin/pandits/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (pendingRes.ok) {
        const pendingData = await pendingRes.json();
        const list = pendingData.data?.data || pendingData.data || [];
        setPendingPandits(list);
      }

      setLastSynced(new Date());
    } catch (err: any) {
      console.error("Failed to load real dashboard data:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial Auth Check
  useEffect(() => {
    const profile = getSavedUserProfile();

    if (!profile || profile.role !== "ADMIN") {
      router.push("/admin/login");
      return;
    }

    setAdminUser(profile);
    setAuthorized(true);
    fetchDashboardData(false);
  }, [router, fetchDashboardData]);

  // Reliable Auto-Polling every 10 seconds for real-time PostgreSQL updates
  useEffect(() => {
    if (!authorized) return;

    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [authorized, fetchDashboardData]);

  const handleApprove = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to approve and verify ${name}?`))
      return;

    const token = getClientToken();
    try {
      setActionLoading(id);
      const res = await fetch(`${API_BASE_URL}/admin/pandits/${id}/verify`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to approve Pandit.");
      }

      setMessage({
        type: "success",
        text: `${name} has been verified and published to marketplace!`,
      });
      await fetchDashboardData(true);
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.message || "Failed to approve Pandit.",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectionReason.trim()) {
      setRejectionError("Please provide a specific reason for rejection.");
      return;
    }

    const token = getClientToken();
    try {
      setActionLoading(rejectingPanditId);
      const res = await fetch(
        `${API_BASE_URL}/admin/pandits/${rejectingPanditId}/reject`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason: rejectionReason.trim() }),
        },
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to reject Pandit.");
      }

      setMessage({
        type: "success",
        text: "Application rejected and notification sent to Pandit.",
      });
      setRejectingPanditId(null);
      setRejectionReason("");
      setRejectionError(null);
      await fetchDashboardData(true);
    } catch (err: any) {
      setRejectionError(err.message || "Failed to submit rejection.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddPanditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getClientToken();
    if (!token) return;

    if (!panditForm.fullName.trim() || !panditForm.email.trim() || !panditForm.phoneNumber.trim()) {
      setMessage({ type: "error", text: "Please enter Pandit name, email, and mobile number." });
      return;
    }

    try {
      setActionLoading("adding_pandit");
      const res = await fetch(`${API_BASE_URL}/admin/pandits`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: panditForm.fullName.trim(),
          email: panditForm.email.trim(),
          phoneNumber: panditForm.phoneNumber.trim(),
          experienceYears: Number(panditForm.experienceYears) || 1,
          languages: panditForm.languages.split(",").map((s) => s.trim()).filter(Boolean),
          specializations: panditForm.specializations.split(",").map((s) => s.trim()).filter(Boolean),
          city: panditForm.city.trim(),
          state: panditForm.state.trim(),
          basePrice: Number(panditForm.basePrice) || 2100,
          bio: panditForm.bio.trim(),
          isAvailable: true,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to add Pandit.");
      }

      setMessage({
        type: "success",
        text: `Pandit ${panditForm.fullName.trim()} registered and verified successfully in PostgreSQL!`,
      });
      setShowAddPanditModal(false);
      setPanditForm({
        fullName: "",
        email: "",
        phoneNumber: "+91 ",
        experienceYears: 10,
        languages: "Marathi, Hindi, Sanskrit",
        specializations: "Satyanarayan Mahapuja, Griha Pravesh, Rudrabhishek",
        city: "Pune",
        state: "Maharashtra",
        basePrice: 2500,
        bio: "Vedic scholar trained in traditional Gurukul with authentic Vidhi execution.",
      });
      await fetchDashboardData(true);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to add Pandit." });
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddPujaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getClientToken();
    if (!token) return;

    if (!pujaForm.title.trim()) {
      setMessage({ type: "error", text: "Please enter Puja title." });
      return;
    }

    try {
      setActionLoading("adding_puja");
      const res = await fetch(`${API_BASE_URL}/admin/pujas`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: pujaForm.title.trim(),
          description: pujaForm.description.trim(),
          basePrice: Number(pujaForm.basePrice) || 3501,
          samagriPrice: Number(pujaForm.samagriPrice) || 1100,
          durationMinutes: Number(pujaForm.durationMinutes) || 120,
          languages: ["Marathi", "Hindi", "Sanskrit"],
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to add Puja.");
      }

      setMessage({
        type: "success",
        text: `Puja '${pujaForm.title.trim()}' added to catalog successfully in PostgreSQL!`,
      });
      setShowAddPujaModal(false);
      setPujaForm({
        title: "",
        description: "",
        basePrice: 3501,
        samagriPrice: 1100,
        durationMinutes: 120,
      });
      await fetchDashboardData(true);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to add Puja." });
    } finally {
      setActionLoading(null);
    }
  };

  const handleAdminLogout = () => {
    clearClientSession();
    router.push("/admin/login");
  };

  if (!authorized) {
    return (
      <div className="min-h-screen bg-deep-maroon flex items-center justify-center p-4 text-beige font-sans">
        <div className="text-center space-y-3">
          <Lock className="w-8 h-8 text-gold animate-bounce mx-auto" />
          <p className="text-xs">
            Verifying Administrative Privileges...
          </p>
        </div>
      </div>
    );
  }

  const adminNav = [
    { title: "Dashboard Analytics", href: "/admin/dashboard", icon: FileBarChart },
    {
      title: "Pandit Verification",
      href: "/admin/pandits",
      icon: ShieldCheck,
      badge: platformStats.pandits.pending > 0 ? `${platformStats.pandits.pending} New` : undefined,
    },
    { title: "Customer Management", href: "/admin/customers", icon: Users },
    { title: "Puja Management", href: "/admin/pujas", icon: Sparkles },
    { title: "Puja Categories", href: "/admin/categories", icon: Layers },
    { title: "Booking Management", href: "/admin/bookings", icon: Calendar },
    { title: "Payment Management", href: "/admin/payments", icon: IndianRupee },
    { title: "Samagri Products", href: "/admin/products", icon: Package },
    { title: "Orders & Fulfillment", href: "/admin/orders", icon: Package },
    { title: "Support Tickets", href: "/admin/reports", icon: LifeBuoy },
    { title: "Reports & Audit", href: "/admin/reports", icon: TrendingUp },
    { title: "Platform Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-deep-maroon text-beige flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="h-16 border-b border-gold/30 bg-maroon-900 px-6 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <DevSutraLogo variant="dark" size="sm" showTagline={false} />
          <div className="border-l border-gold/30 pl-3">
            <span className="font-heading font-bold text-sm tracking-wide text-ivory block leading-tight">
              DevSutra
            </span>
            <span className="text-[10px] text-gold-400 font-medium block">
              Enterprise Admin Console
            </span>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 ml-2 px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-[10px] text-emerald-300 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live PostgreSQL Connected
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          {/* Real-time Refresh Control */}
          <div className="hidden md:flex items-center gap-2 text-beige/60 text-[11px]">
            <Clock className="w-3.5 h-3.5 text-gold-400" />
            <span>Synced: {lastSynced.toLocaleTimeString()}</span>
            <button
              onClick={() => fetchDashboardData(false)}
              disabled={loading || isRefreshing}
              className="p-1.5 bg-maroon-950 hover:bg-maroon-800 rounded-lg text-gold-300 border border-gold/25 transition cursor-pointer"
              title="Refresh Live Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
          </div>

          <span className="text-beige/70 hidden lg:inline">
            Admin: <strong className="text-ivory">{adminUser?.email || "Super Admin"}</strong>
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
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 border-r border-gold/25 bg-maroon-950/70 p-4 space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gold-300 px-3 py-2 flex items-center justify-between">
            <span>Operations</span>
            <button
              onClick={() => fetchDashboardData(false)}
              className="text-[10px] text-gold hover:underline md:hidden"
            >
              Refresh
            </button>
          </div>
          {adminNav.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === "/admin/dashboard";
            return (
              <Link
                key={item.title}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? "bg-maroon-900 text-ivory border border-gold/40 shadow-sm"
                    : "text-beige/80 hover:text-ivory hover:bg-maroon-900/80"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-gold-400" />
                  <span>{item.title}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gold text-deep-maroon">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-8 space-y-8">
          {message && (
            <div
              className={`p-4 rounded-xl text-xs flex items-center justify-between gap-3 border ${
                message.type === "success"
                  ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-200"
                  : "bg-rose-950/80 border-rose-500/40 text-rose-200"
              }`}
            >
              <span>{message.text}</span>
              <button
                onClick={() => setMessage(null)}
                className="text-beige/60 hover:text-ivory text-xs underline cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Quick Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-maroon-900/90 border border-gold/30 rounded-2xl shadow-sacred">
            <div>
              <h2 className="text-base font-heading font-bold text-ivory">
                Platform Overview & Live Operations
              </h2>
              <p className="text-xs text-beige/70">
                Data reflects real-time PostgreSQL database state. Refreshes every 10 seconds.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAddPanditModal(true)}
                className="px-3.5 py-2 bg-gold hover:bg-gold-600 text-deep-maroon font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Add Pandit</span>
              </button>
              <button
                type="button"
                onClick={() => setShowAddPujaModal(true)}
                className="px-3.5 py-2 bg-maroon-950 hover:bg-maroon-800 text-ivory border border-gold/40 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-gold" />
                <span>+ Add Puja</span>
              </button>
              <button
                onClick={() => fetchDashboardData(false)}
                disabled={loading || isRefreshing}
                className="px-3.5 py-2 bg-maroon-950 hover:bg-maroon-800 text-ivory border border-gold/30 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                <span>Sync Now</span>
              </button>
            </div>
          </div>

          {/* SECTION 1: DEVOTEES & PUROHITS (5 Real Metrics) */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gold-300 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-gold" /> Devotees & Purohit Network
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {/* 1. Total Customers */}
              <Link
                href="/admin/customers"
                className="bg-maroon-900 border border-gold/30 p-4 rounded-xl shadow-sacred hover:border-gold transition block group"
              >
                <span className="text-[11px] text-beige/70 font-medium flex items-center justify-between">
                  <span>Total Customers</span>
                  <Users className="w-3.5 h-3.5 text-gold group-hover:scale-110 transition-transform" />
                </span>
                <p className="text-2xl font-heading font-bold text-ivory mt-1">
                  {platformStats.customers.total}
                </p>
                <span className="text-[10px] text-beige/50 mt-0.5 block">
                  Registered Devotees &rarr;
                </span>
              </Link>

              {/* 2. Total Pandits */}
              <Link
                href="/admin/pandits"
                className="bg-maroon-900 border border-gold/30 p-4 rounded-xl shadow-sacred hover:border-gold transition block group"
              >
                <span className="text-[11px] text-beige/70 font-medium flex items-center justify-between">
                  <span>Total Pandits</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-gold group-hover:scale-110 transition-transform" />
                </span>
                <p className="text-2xl font-heading font-bold text-ivory mt-1">
                  {platformStats.pandits.total}
                </p>
                <span className="text-[10px] text-beige/50 mt-0.5 block">
                  All Profiles On Record &rarr;
                </span>
              </Link>

              {/* 3. Active Pandits */}
              <Link
                href="/admin/pandits?status=VERIFIED"
                className="bg-maroon-900 border border-emerald-500/30 p-4 rounded-xl shadow-sacred hover:border-emerald-400 transition block group"
              >
                <span className="text-[11px] text-emerald-300 font-medium flex items-center justify-between">
                  <span>Active Pandits</span>
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                </span>
                <p className="text-2xl font-heading font-bold text-emerald-400 mt-1">
                  {platformStats.pandits.active}
                </p>
                <span className="text-[10px] text-emerald-300/70 mt-0.5 block">
                  Marketplace Verified &rarr;
                </span>
              </Link>

              {/* 4. Inactive Pandits */}
              <Link
                href="/admin/pandits?status=PENDING"
                className="bg-maroon-900 border border-amber-500/30 p-4 rounded-xl shadow-sacred hover:border-amber-400 transition block group"
              >
                <span className="text-[11px] text-amber-300 font-medium flex items-center justify-between">
                  <span>Inactive / Pending</span>
                  <UserX className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                </span>
                <p className="text-2xl font-heading font-bold text-amber-300 mt-1">
                  {platformStats.pandits.inactive}
                </p>
                <span className="text-[10px] text-amber-200/70 mt-0.5 block">
                  {platformStats.pandits.pending} Pending Review &rarr;
                </span>
              </Link>

              {/* 5. Total Puja Services */}
              <Link
                href="/admin/pujas"
                className="bg-maroon-900 border border-gold/30 p-4 rounded-xl shadow-sacred hover:border-gold transition block group"
              >
                <span className="text-[11px] text-beige/70 font-medium flex items-center justify-between">
                  <span>Total Puja Services</span>
                  <Sparkles className="w-3.5 h-3.5 text-gold group-hover:scale-110 transition-transform" />
                </span>
                <p className="text-2xl font-heading font-bold text-gold-300 mt-1">
                  {platformStats.pujas.total}
                </p>
                <span className="text-[10px] text-beige/50 mt-0.5 block">
                  Active Shastric Catalog &rarr;
                </span>
              </Link>
            </div>
          </div>

          {/* SECTION 2: BOOKINGS WORKFLOW & REVENUE (6 Real Metrics) */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gold-300 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-gold" /> Bookings Lifecycle & Financials
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
              {/* 6. Total Bookings */}
              <Link
                href="/admin/bookings"
                className="bg-maroon-900 border border-gold/30 p-4 rounded-xl shadow-sacred hover:border-gold transition block group"
              >
                <span className="text-[11px] text-beige/70 font-medium flex items-center justify-between">
                  <span>Total Bookings</span>
                  <Calendar className="w-3.5 h-3.5 text-gold group-hover:scale-110 transition-transform" />
                </span>
                <p className="text-2xl font-heading font-bold text-ivory mt-1">
                  {platformStats.bookings.total}
                </p>
                <span className="text-[10px] text-beige/50 mt-0.5 block">
                  All Booking Records &rarr;
                </span>
              </Link>

              {/* 7. Pending Bookings */}
              <Link
                href="/admin/bookings?status=PENDING"
                className="bg-maroon-900 border border-amber-500/30 p-4 rounded-xl shadow-sacred hover:border-amber-400 transition block group"
              >
                <span className="text-[11px] text-amber-300 font-medium flex items-center justify-between">
                  <span>Pending</span>
                  <Clock className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                </span>
                <p className="text-2xl font-heading font-bold text-amber-300 mt-1">
                  {platformStats.bookings.pending}
                </p>
                <span className="text-[10px] text-amber-200/70 mt-0.5 block">
                  Awaiting Assignment &rarr;
                </span>
              </Link>

              {/* 8. Confirmed Bookings */}
              <Link
                href="/admin/bookings?status=CONFIRMED"
                className="bg-maroon-900 border border-emerald-500/30 p-4 rounded-xl shadow-sacred hover:border-emerald-400 transition block group"
              >
                <span className="text-[11px] text-emerald-300 font-medium flex items-center justify-between">
                  <span>Confirmed</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                </span>
                <p className="text-2xl font-heading font-bold text-emerald-400 mt-1">
                  {platformStats.bookings.confirmed}
                </p>
                <span className="text-[10px] text-emerald-300/70 mt-0.5 block">
                  Purohit Assigned &rarr;
                </span>
              </Link>

              {/* 9. Completed Bookings */}
              <Link
                href="/admin/bookings?status=COMPLETED"
                className="bg-maroon-900 border border-blue-500/30 p-4 rounded-xl shadow-sacred hover:border-blue-400 transition block group"
              >
                <span className="text-[11px] text-blue-300 font-medium flex items-center justify-between">
                  <span>Completed</span>
                  <Check className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
                </span>
                <p className="text-2xl font-heading font-bold text-blue-300 mt-1">
                  {platformStats.bookings.completed}
                </p>
                <span className="text-[10px] text-blue-200/70 mt-0.5 block">
                  Rituals Finished &rarr;
                </span>
              </Link>

              {/* 10. Cancelled Bookings */}
              <Link
                href="/admin/bookings?status=CANCELLED"
                className="bg-maroon-900 border border-rose-500/30 p-4 rounded-xl shadow-sacred hover:border-rose-400 transition block group"
              >
                <span className="text-[11px] text-rose-300 font-medium flex items-center justify-between">
                  <span>Cancelled</span>
                  <XCircle className="w-3.5 h-3.5 text-rose-400 group-hover:scale-110 transition-transform" />
                </span>
                <p className="text-2xl font-heading font-bold text-rose-300 mt-1">
                  {platformStats.bookings.cancelled}
                </p>
                <span className="text-[10px] text-rose-200/70 mt-0.5 block">
                  Cancellation Audits &rarr;
                </span>
              </Link>

              {/* 11. Total Payments & Revenue */}
              <Link
                href="/admin/payments"
                className="bg-maroon-900 border border-gold/30 p-4 rounded-xl shadow-sacred hover:border-gold transition block group"
              >
                <span className="text-[11px] text-gold-300 font-medium flex items-center justify-between">
                  <span>Total Payments</span>
                  <IndianRupee className="w-3.5 h-3.5 text-gold group-hover:scale-110 transition-transform" />
                </span>
                <p className="text-2xl font-heading font-bold text-gold-300 mt-1">
                  ₹{platformStats.payments.totalRevenue.toLocaleString()}
                </p>
                <span className="text-[10px] text-beige/60 mt-0.5 block">
                  {platformStats.payments.successful} Settled ({platformStats.payments.total} Total) &rarr;
                </span>
              </Link>
            </div>
          </div>

          {/* Pending Pandit Approvals Module */}
          <div className="bg-maroon-900 border border-gold/30 rounded-2xl p-6 space-y-4 shadow-sacred">
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
              <div className="py-10 text-center text-xs text-beige/60 space-y-2">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-gold" />
                <p>Loading pending verification requests...</p>
              </div>
            ) : pendingPandits.length === 0 ? (
              <div className="py-8 text-center text-xs text-beige/70 bg-maroon-950/50 rounded-xl border border-gold/20 space-y-1">
                <Check className="w-6 h-6 text-emerald-400 mx-auto" />
                <p className="font-semibold text-ivory">No pending applications</p>
                <p className="text-[11px] text-beige/60">
                  All registered Pandit applications have been processed and approved.
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
                        <h4 className="font-heading font-bold text-sm text-ivory">
                          {p.fullName}
                        </h4>
                        <span className="text-[10px] bg-gold/15 text-gold-300 px-2 py-0.5 rounded border border-gold/30 font-bold">
                          PENDING VERIFICATION
                        </span>
                        <span className="text-[11px] text-beige/60">
                          {p.city}, {p.state}
                        </span>
                      </div>
                      <p className="text-xs text-beige/75">
                        Experience: <strong>{p.experienceYears} Years</strong> • Languages:{" "}
                        {p.languages?.join(", ")} • Contact:{" "}
                        <strong className="text-ivory">
                          {p.user?.phoneNumber || p.user?.email}
                        </strong>
                      </p>
                      <div className="flex items-center gap-3 text-xs text-beige/60">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-gold" />
                          {p.documents?.length || 0} Document(s) Uploaded
                        </span>
                        {p.specializations?.length > 0 && (
                          <span>
                            Specializations: {p.specializations.slice(0, 3).join(", ")}
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
                          setRejectionReason("");
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

          {/* SECTION 3: RECENT BOOKINGS & DEVOTEES (Metrics 12 & 13) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 12. Recent Bookings Table */}
            <div className="bg-maroon-900 border border-gold/30 rounded-2xl p-6 space-y-4 shadow-sacred">
              <div className="flex items-center justify-between border-b border-maroon-800 pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gold" />
                  <h3 className="font-heading font-bold text-sm text-ivory">
                    Recent Bookings ({recentBookings.length})
                  </h3>
                </div>
                <Link
                  href="/admin/bookings"
                  className="text-xs text-gold-300 hover:underline font-semibold flex items-center gap-1"
                >
                  <span>View All Bookings</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              {recentBookings.length === 0 ? (
                <div className="py-10 text-center text-xs text-beige/60 space-y-1">
                  <Calendar className="w-6 h-6 text-gold/40 mx-auto" />
                  <p>No recent bookings recorded in database yet.</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                  {recentBookings.map((b) => {
                    const devoteeName = b.customerProfile
                      ? `${b.customerProfile.firstName} ${b.customerProfile.lastName}`.trim()
                      : b.customer?.firstName
                      ? `${b.customer.firstName} ${b.customer.lastName || ""}`.trim()
                      : "Devotee";

                    const purohitName = b.panditProfile?.fullName || b.pandit?.fullName || "Awaiting Purohit";
                    const pujaTitle = b.puja?.title || "Sacred Vedic Ritual";

                    return (
                      <div
                        key={b.id}
                        className="p-3.5 bg-maroon-950/80 border border-gold/15 rounded-xl flex items-center justify-between text-xs gap-3 hover:border-gold/40 transition"
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-gold text-[11px] font-bold">
                              {b.bookingNumber}
                            </span>
                            <span className="font-bold text-ivory truncate max-w-[180px]">
                              {pujaTitle}
                            </span>
                          </div>
                          <p className="text-[11px] text-beige/70">
                            Devotee: <strong className="text-ivory">{devoteeName}</strong>
                            {b.customerProfile?.user?.email && (
                              <span className="text-beige/50"> ({b.customerProfile.user.email})</span>
                            )}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-beige/60">
                            <span>Date: {new Date(b.pujaDate).toLocaleDateString()}</span>
                            <span>•</span>
                            <span className="text-emerald-400">Purohit: {purohitName}</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              b.status === "CONFIRMED"
                                ? "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
                                : b.status === "COMPLETED"
                                ? "bg-blue-950 text-blue-300 border border-blue-500/40"
                                : b.status === "CANCELLED"
                                ? "bg-rose-950 text-rose-300 border border-rose-500/40"
                                : "bg-gold/15 text-gold border border-gold/30"
                            }`}
                          >
                            {b.status}
                          </span>
                          <p className="text-xs font-bold text-ivory mt-1">
                            ₹{Number(b.totalAmount || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 13. Recent Customer Registrations Table */}
            <div className="bg-maroon-900 border border-gold/30 rounded-2xl p-6 space-y-4 shadow-sacred">
              <div className="flex items-center justify-between border-b border-maroon-800 pb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gold" />
                  <h3 className="font-heading font-bold text-sm text-ivory">
                    Recent Customer Registrations ({recentCustomers.length})
                  </h3>
                </div>
                <Link
                  href="/admin/customers"
                  className="text-xs text-gold-300 hover:underline font-semibold flex items-center gap-1"
                >
                  <span>View All Customers</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              {recentCustomers.length === 0 ? (
                <div className="py-10 text-center text-xs text-beige/60 space-y-1">
                  <Users className="w-6 h-6 text-gold/40 mx-auto" />
                  <p>No customer registrations recorded in database yet.</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                  {recentCustomers.map((c) => {
                    const email = c.user?.email || c.email || "N/A";
                    const phone = c.user?.phoneNumber || c.phoneNumber || "Mobile unverified";
                    const bookingCount = c._count?.bookings ?? c.bookings?.length ?? 0;

                    return (
                      <div
                        key={c.id}
                        className="p-3.5 bg-maroon-950/80 border border-gold/15 rounded-xl flex items-center justify-between text-xs gap-3 hover:border-gold/40 transition"
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-ivory">
                              {c.firstName} {c.lastName}
                            </span>
                            <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/30">
                              ACTIVE
                            </span>
                            <span className="text-[10px] text-gold-300">
                              {bookingCount} Bookings
                            </span>
                          </div>
                          <p className="text-[11px] text-beige/70">
                            {email} • {phone}
                          </p>
                        </div>

                        <div className="text-right shrink-0 text-[10px] text-beige/50">
                          {c.user?.createdAt
                            ? new Date(c.user.createdAt).toLocaleDateString()
                            : c.createdAt
                            ? new Date(c.createdAt).toLocaleDateString()
                            : "Recently"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Add Pandit Modal */}
      {showAddPanditModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-maroon-900 border border-gold/40 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl text-xs text-beige my-8">
            <div className="flex items-center justify-between border-b border-maroon-800 pb-3">
              <h3 className="font-heading font-bold text-sm text-ivory flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Directly Register & Verify Pandit
              </h3>
              <button
                onClick={() => setShowAddPanditModal(false)}
                className="text-beige/60 hover:text-ivory cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddPanditSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-ivory mb-1">
                    Pandit Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pt. Rameshwar Shastri"
                    value={panditForm.fullName}
                    onChange={(e) => setPanditForm({ ...panditForm, fullName: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-maroon-950 border border-gold/30 text-ivory focus:outline-none focus:ring-1 focus:ring-gold text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-ivory mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="rameshwar@pujaconnect.com"
                    value={panditForm.email}
                    onChange={(e) => setPanditForm({ ...panditForm, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-maroon-950 border border-gold/30 text-ivory focus:outline-none focus:ring-1 focus:ring-gold text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-ivory mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98220 12345"
                    value={panditForm.phoneNumber}
                    onChange={(e) => setPanditForm({ ...panditForm, phoneNumber: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-maroon-950 border border-gold/30 text-ivory focus:outline-none focus:ring-1 focus:ring-gold text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-ivory mb-1">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={panditForm.experienceYears}
                    onChange={(e) => setPanditForm({ ...panditForm, experienceYears: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-maroon-950 border border-gold/30 text-ivory focus:outline-none focus:ring-1 focus:ring-gold text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-ivory mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pune"
                    value={panditForm.city}
                    onChange={(e) => setPanditForm({ ...panditForm, city: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-maroon-950 border border-gold/30 text-ivory focus:outline-none focus:ring-1 focus:ring-gold text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-ivory mb-1">
                    Base Dakshina (₹)
                  </label>
                  <input
                    type="number"
                    min="500"
                    value={panditForm.basePrice}
                    onChange={(e) => setPanditForm({ ...panditForm, basePrice: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-maroon-950 border border-gold/30 text-ivory focus:outline-none focus:ring-1 focus:ring-gold text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-ivory mb-1">
                  Ritual Specializations (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="Satyanarayan Mahapuja, Griha Pravesh, Rudrabhishek"
                  value={panditForm.specializations}
                  onChange={(e) => setPanditForm({ ...panditForm, specializations: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-maroon-950 border border-gold/30 text-ivory focus:outline-none focus:ring-1 focus:ring-gold text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-ivory mb-1">
                  Languages Spoken
                </label>
                <input
                  type="text"
                  placeholder="Marathi, Hindi, Sanskrit"
                  value={panditForm.languages}
                  onChange={(e) => setPanditForm({ ...panditForm, languages: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-maroon-950 border border-gold/30 text-ivory focus:outline-none focus:ring-1 focus:ring-gold text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-ivory mb-1">
                  Brief Bio / Gurukul Background
                </label>
                <textarea
                  rows={2}
                  value={panditForm.bio}
                  onChange={(e) => setPanditForm({ ...panditForm, bio: e.target.value })}
                  className="w-full p-2 rounded-xl bg-maroon-950 border border-gold/30 text-ivory focus:outline-none focus:ring-1 focus:ring-gold text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-maroon-800">
                <button
                  type="button"
                  onClick={() => setShowAddPanditModal(false)}
                  className="px-4 py-2 rounded-xl bg-maroon-950 text-beige hover:text-ivory transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === "adding_pandit"}
                  className="px-5 py-2 rounded-xl bg-gold hover:bg-gold-600 text-deep-maroon font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {actionLoading === "adding_pandit" && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save & Activate in DB</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Puja Modal */}
      {showAddPujaModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-maroon-900 border border-gold/40 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl text-xs text-beige my-8">
            <div className="flex items-center justify-between border-b border-maroon-800 pb-3">
              <h3 className="font-heading font-bold text-sm text-ivory flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gold-400" /> Add New Puja to Shastric Catalog
              </h3>
              <button
                onClick={() => setShowAddPujaModal(false)}
                className="text-beige/60 hover:text-ivory cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddPujaSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-ivory mb-1">
                  Puja Service Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. सत्यनारायण महापूजा / Maha Rudrabhishek"
                  value={pujaForm.title}
                  onChange={(e) => setPujaForm({ ...pujaForm, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-maroon-950 border border-gold/30 text-ivory focus:outline-none focus:ring-1 focus:ring-gold text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-ivory mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Complete Vedic ritual including havan, sankalp, and stuti"
                  value={pujaForm.description}
                  onChange={(e) => setPujaForm({ ...pujaForm, description: e.target.value })}
                  className="w-full p-2 rounded-xl bg-maroon-950 border border-gold/30 text-ivory focus:outline-none focus:ring-1 focus:ring-gold text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-ivory mb-1">
                    Base Fee (₹)
                  </label>
                  <input
                    type="number"
                    min="500"
                    value={pujaForm.basePrice}
                    onChange={(e) => setPujaForm({ ...pujaForm, basePrice: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-maroon-950 border border-gold/30 text-ivory focus:outline-none focus:ring-1 focus:ring-gold text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-ivory mb-1">
                    Kit Fee (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={pujaForm.samagriPrice}
                    onChange={(e) => setPujaForm({ ...pujaForm, samagriPrice: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-maroon-950 border border-gold/30 text-ivory focus:outline-none focus:ring-1 focus:ring-gold text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-ivory mb-1">
                    Duration (Min)
                  </label>
                  <input
                    type="number"
                    min="30"
                    value={pujaForm.durationMinutes}
                    onChange={(e) => setPujaForm({ ...pujaForm, durationMinutes: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-maroon-950 border border-gold/30 text-ivory focus:outline-none focus:ring-1 focus:ring-gold text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-maroon-800">
                <button
                  type="button"
                  onClick={() => setShowAddPujaModal(false)}
                  className="px-4 py-2 rounded-xl bg-maroon-950 text-beige hover:text-ivory transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === "adding_puja"}
                  className="px-5 py-2 rounded-xl bg-gold hover:bg-gold-600 text-deep-maroon font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {actionLoading === "adding_puja" && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save to Catalog</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {rejectingPanditId && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-maroon-900 border border-gold/40 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl text-xs text-beige">
            <div className="flex items-center justify-between border-b border-maroon-800 pb-3">
              <h3 className="font-heading font-bold text-sm text-ivory flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400" /> Reject Pandit Application
              </h3>
              <button
                onClick={() => setRejectingPanditId(null)}
                className="text-beige/60 hover:text-ivory cursor-pointer"
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
                className="px-4 py-2 rounded-xl bg-maroon-950 text-beige hover:text-ivory transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading === rejectingPanditId}
                onClick={handleRejectConfirm}
                className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-ivory font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {actionLoading === rejectingPanditId && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                )}
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
