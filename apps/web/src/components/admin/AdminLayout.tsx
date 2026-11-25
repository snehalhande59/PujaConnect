'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import DevSutraLogo from '@/components/ui/DevSutraLogo';
import {
  FileBarChart,
  ShieldCheck,
  Users,
  Calendar,
  CalendarDays,
  IndianRupee,
  Sparkles,
  Layers,
  Package,
  ShoppingBag,
  Star,
  LifeBuoy,
  Tag,
  TrendingUp,
  Settings,
  Bell,
  Check,
  Clock,
  LogOut,
  Lock,
  Menu,
  X,
  XCircle,
  ExternalLink,
  ChevronRight,
  Database,
} from 'lucide-react';
import { getSavedUserProfile, clearClientSession, AuthUser, getClientToken } from '@/lib/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

interface AdminLayoutProps {
  children: ReactNode;
  pendingPanditsCount?: number;
}

interface NavSection {
  title: string;
  items: {
    name: string;
    href: string;
    icon: any;
    showBadge?: boolean;
  }[];
}

const navSections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard Analytics', href: '/admin/dashboard', icon: FileBarChart },
    ],
  },
  {
    title: 'Vedic Operations',
    items: [
      { name: 'Pandit Verification', href: '/admin/pandits', icon: ShieldCheck, showBadge: true },
      { name: 'Schedule & Calendar', href: '/admin/calendar', icon: CalendarDays },
      { name: 'Customer Directory', href: '/admin/customers', icon: Users },
      { name: 'Booking Operations', href: '/admin/bookings', icon: Calendar },
      { name: 'Puja Catalog', href: '/admin/pujas', icon: Sparkles },
      { name: 'Puja Categories', href: '/admin/categories', icon: Layers },
    ],
  },
  {
    title: 'Commerce & Finance',
    items: [
      { name: 'Payment Transactions', href: '/admin/payments', icon: IndianRupee },
      { name: 'Samagri Products', href: '/admin/products', icon: Package },
      { name: 'Orders & Logistics', href: '/admin/orders', icon: ShoppingBag },
    ],
  },
  {
    title: 'Quality & Community',
    items: [
      { name: 'Reviews & Ratings', href: '/admin/reviews', icon: Star },
      { name: 'Notifications', href: '/admin/notifications', icon: Bell, showBadge: true },
      { name: 'Support Help Desk', href: '/admin/support', icon: LifeBuoy },
      { name: 'Coupons & Promos', href: '/admin/coupons', icon: Tag },
    ],
  },
  {
    title: 'System & Intelligence',
    items: [
      { name: 'Platform Settings', href: '/admin/settings', icon: Settings },
    ],
  },
];

export default function AdminLayout({ children, pendingPanditsCount = 0 }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [adminUser, setAdminUser] = useState<AuthUser | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [livePendingCount, setLivePendingCount] = useState<number>(pendingPanditsCount);
  const [loginAlert, setLoginAlert] = useState<{ id: string; name: string; contact: string; method: string; time: string } | null>(null);
  const [cancellationAlert, setCancellationAlert] = useState<{ id: string; bookingNumber: string; customer: string; puja: string; reason: string; time: string } | null>(null);
  const [newBookingAlert, setNewBookingAlert] = useState<{ id: string; bookingNumber: string; customer: string; pandit: string; puja: string; amount: number; time: string } | null>(null);
  const [newReviewAlert, setNewReviewAlert] = useState<{ id: string; name: string; rating: number; comment: string; time: string } | null>(null);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(0);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState<boolean>(false);

  useEffect(() => {
    const user = getSavedUserProfile();
    const token = getClientToken();
    if (!user || !token || user.role !== 'ADMIN') {
      router.push('/admin/login');
      return;
    }
    setAdminUser(user);
    setAuthorized(true);

    // Fetch live pending pandits count
    fetch(`${API_BASE_URL}/admin/pandits/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.pending === 'number') {
          setLivePendingCount(data.pending);
        } else if (data?.data && typeof data.data.pending === 'number') {
          setLivePendingCount(data.data.pending);
        }
      })
      .catch(() => {});

    // Live customer login & booking cancellation detection polling (alerts Admin in real time)
    const pollAdminAlerts = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/dashboard/stats?_t=${Date.now()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const json = await res.json();
          const payload = json.data?.data || json.data || json;
          const now = Date.now();

          // 1. Check Customer Logins
          const customers = payload.recentCustomers;
          if (Array.isArray(customers) && customers.length > 0) {
            const recent = customers.find((c: any) => {
              if (!c.lastLoginAt) return false;
              const diffMinutes = (now - new Date(c.lastLoginAt).getTime()) / (1000 * 60);
              return diffMinutes < 15; // Active login in last 15 mins
            });

            if (recent) {
              const alertKey = `alerted_login_${recent.id}_${recent.lastLoginAt}`;
              if (typeof window !== 'undefined' && !sessionStorage.getItem(alertKey)) {
                sessionStorage.setItem(alertKey, '1');
                setLoginAlert({
                  id: recent.id,
                  name: `${recent.firstName || 'Devotee'} ${recent.lastName || ''}`.trim(),
                  contact: recent.user?.email || recent.user?.phoneNumber || 'Customer Account',
                  method: recent.lastLoginMethod || 'EMAIL_OTP',
                  time: new Date(recent.lastLoginAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                });
              }
            }
          }

          // 2. Check Cancelled Bookings or Newly Created Bookings (Real-time updates)
          const bookings = payload.recentBookings;
          if (Array.isArray(bookings) && bookings.length > 0) {
            // Check for new bookings created in last 30 mins
            const newest = bookings.find((b: any) => {
              if (b.status === 'CANCELLED') return false;
              const ts = new Date(b.createdAt).getTime();
              const diffMinutes = (now - ts) / (1000 * 60);
              return diffMinutes < 30;
            });

            if (newest) {
              const alertKey = `alerted_newbooking_${newest.id}_${newest.createdAt}`;
              if (typeof window !== 'undefined' && !sessionStorage.getItem(alertKey)) {
                sessionStorage.setItem(alertKey, '1');
                setNewBookingAlert({
                  id: newest.id,
                  bookingNumber: newest.bookingNumber || newest.id.slice(0, 8),
                  customer: `${newest.customerProfile?.firstName || 'Devotee'} ${newest.customerProfile?.lastName || ''}`.trim(),
                  pandit: newest.panditProfile?.fullName || 'Assigned Scholar',
                  puja: newest.puja?.title || 'Vedic Ceremony',
                  amount: Number(newest.totalAmount || 0),
                  time: new Date(newest.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                });
              }
            }

            // Check for cancellations
            const cancelled = bookings.find((b: any) => {
              if (b.status !== 'CANCELLED') return false;
              const ts = new Date(b.updatedAt || b.createdAt).getTime();
              const diffMinutes = (now - ts) / (1000 * 60);
              return diffMinutes < 60; // Cancelled in last 60 mins
            });

            if (cancelled) {
              const alertKey = `alerted_cancel_${cancelled.id}_${cancelled.updatedAt}`;
              if (typeof window !== 'undefined' && !sessionStorage.getItem(alertKey)) {
                sessionStorage.setItem(alertKey, '1');
                setCancellationAlert({
                  id: cancelled.id,
                  bookingNumber: cancelled.bookingNumber || cancelled.id.slice(0, 8),
                  customer: `${cancelled.customerProfile?.firstName || 'Devotee'} ${cancelled.customerProfile?.lastName || ''}`.trim(),
                  puja: cancelled.puja?.title || 'Vedic Ceremony',
                  reason: cancelled.cancellationReason || 'Cancelled by devotee',
                  time: new Date(cancelled.updatedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                });
              }
            }
          }

          // 3. Check New Devotee Reviews
          const reviews = payload.recentReviews;
          if (Array.isArray(reviews) && reviews.length > 0) {
            const latestReview = reviews[0];
            if (latestReview?.createdAt) {
              const diffMinutes = (now - new Date(latestReview.createdAt).getTime()) / (1000 * 60);
              if (diffMinutes < 30) {
                const alertKey = `alerted_review_${latestReview.id}_${latestReview.createdAt}`;
                if (typeof window !== 'undefined' && !sessionStorage.getItem(alertKey)) {
                  sessionStorage.setItem(alertKey, '1');
                  setNewReviewAlert({
                    id: latestReview.id,
                    name: `${latestReview.customer?.customerProfile?.firstName || 'Devotee'} ${latestReview.customer?.customerProfile?.lastName || ''}`.trim(),
                    rating: latestReview.rating || 5,
                    comment: latestReview.comment || 'Good ritual experience',
                    time: new Date(latestReview.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  });
                }
              }
            }
          }
          // 4. Check Live Unread Notifications
          fetch(`${API_BASE_URL}/admin/notifications?_t=${Date.now()}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then((r) => (r.ok ? r.json() : null))
            .then((nData) => {
              if (nData) {
                const notifs = nData.data?.notifications || nData.notifications || nData.data || [];
                const unread = nData.data?.unreadCount ?? nData.unreadCount ?? 0;
                setRecentNotifications(Array.isArray(notifs) ? notifs.slice(0, 5) : []);
                setUnreadNotificationsCount(typeof unread === 'number' ? unread : 0);
              }
            })
            .catch(() => {});
        }
      } catch (err) {}
    };

    const interval = setInterval(pollAdminAlerts, 8000);
    pollAdminAlerts();
    return () => clearInterval(interval);
  }, [router]);

  const handleMarkNotificationRead = async (id: string, link?: string) => {
    const token = getClientToken();
    try {
      setRecentNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadNotificationsCount((c) => Math.max(0, c - 1));
      await fetch(`${API_BASE_URL}/admin/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotificationDropdownOpen(false);
      if (link) router.push(link);
    } catch (err) {}
  };

  const handleMarkAllNotificationsRead = async () => {
    const token = getClientToken();
    try {
      setRecentNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadNotificationsCount(0);
      await fetch(`${API_BASE_URL}/admin/notifications/read-all`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {}
  };

  const handleSignOut = () => {
    clearClientSession();
    router.push('/admin/login');
  };

  if (!authorized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-stone-700 font-sans">
        <div className="text-center space-y-3 bg-white p-8 rounded-2xl border border-stone-200 shadow-sm max-w-sm w-full">
          <Lock className="w-8 h-8 text-amber-600 animate-bounce mx-auto" />
          <h2 className="font-bold text-stone-900 text-sm">DevSutra Admin Console</h2>
          <p className="text-xs text-stone-500">Verifying Administrative Privileges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-stone-800 flex flex-col font-sans">
      {/* Top Header */}
      <header className="h-16 border-b border-stone-200 bg-white sticky top-0 z-30 shadow-xs px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-stone-100 text-stone-600 hover:text-stone-900 hover:bg-stone-200 transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2.5 sm:gap-3">
            <DevSutraLogo variant="icon" size="sm" showTagline={false} />
            <div className="border-l border-stone-200 pl-3">
              <h1 className="font-bold text-sm sm:text-base text-stone-900 tracking-tight leading-tight">
                DevSutra
              </h1>
              <span className="text-[10px] text-amber-700 font-semibold tracking-wide block uppercase">
                Enterprise Management
              </span>
            </div>
          </div>

          <span className="hidden lg:inline-flex items-center gap-1.5 ml-4 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <Database className="w-3 h-3 text-emerald-600" />
            <span>PostgreSQL Connected</span>
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          {/* Notification Bell Dropdown (Part 4) */}
          <div className="relative">
            <button
              onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
              className="relative p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition border border-transparent hover:border-stone-200 cursor-pointer"
              title="Notifications"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5 text-stone-600" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white font-extrabold text-[9px] flex items-center justify-center shadow-xs">
                  {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                </span>
              )}
            </button>

            {notificationDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-stone-200 rounded-2xl shadow-2xl z-50 overflow-hidden text-xs text-stone-800 animate-fade-in">
                <div className="p-3.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-700" />
                    <span className="font-bold text-stone-900 text-sm">Notifications</span>
                    {unreadNotificationsCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                        {unreadNotificationsCount} New
                      </span>
                    )}
                  </div>
                  {unreadNotificationsCount > 0 && (
                    <button
                      onClick={handleMarkAllNotificationsRead}
                      className="text-[11px] text-amber-700 hover:text-amber-900 font-bold hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-stone-100">
                  {recentNotifications.length === 0 ? (
                    <div className="p-8 text-center text-stone-400">
                      <Bell className="w-8 h-8 mx-auto mb-1 text-stone-300" />
                      <p className="font-semibold text-stone-700 text-xs">No Notifications</p>
                      <p className="text-[11px] text-stone-400">All system events are up to date</p>
                    </div>
                  ) : (
                    recentNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => handleMarkNotificationRead(notif.id, notif.link || '/admin/notifications')}
                        className={`p-3 hover:bg-stone-50 transition cursor-pointer flex items-start gap-3 ${
                          !notif.isRead ? 'bg-amber-50/40' : ''
                        }`}
                      >
                        <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-amber-500" style={{ opacity: notif.isRead ? 0 : 1 }} />
                        <div className="flex-1 space-y-0.5">
                          <p className="font-bold text-stone-900 text-xs leading-snug">{notif.title}</p>
                          <p className="text-stone-600 text-[11px] line-clamp-2 leading-relaxed">{notif.message}</p>
                          <span className="text-[10px] text-stone-400 block pt-0.5">
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2.5 bg-stone-50 border-t border-stone-200 text-center">
                  <Link
                    href="/admin/notifications"
                    onClick={() => setNotificationDropdownOpen(false)}
                    className="text-amber-800 hover:text-amber-950 font-bold text-xs inline-flex items-center gap-1"
                  >
                    <span>View all notifications</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link
            href="/"
            target="_blank"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-stone-600 hover:text-amber-700 hover:bg-stone-100 transition font-medium border border-transparent hover:border-stone-200"
          >
            <span>Live Marketplace</span>
            <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
          </Link>

          <div className="text-right hidden sm:block border-l border-stone-200 pl-3">
            <span className="text-stone-400 text-[10px] uppercase font-bold tracking-wider block">Admin Session</span>
            <span className="font-semibold text-stone-800 text-xs">{adminUser?.email || 'admin@devsutra.in'}</span>
          </div>

          <button
            onClick={handleSignOut}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-stone-700 hover:text-rose-700 border border-stone-200 hover:border-rose-300 transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer shadow-2xs"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-500" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 top-16 z-20 w-64 bg-white border-r border-stone-200 p-4 space-y-4 overflow-y-auto transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static ${
            mobileMenuOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'
          }`}
        >
          <nav className="space-y-4">
            {navSections.map((section) => (
              <div key={section.title} className="space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 px-3 py-1">
                  {section.title}
                </div>
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      pathname === item.href ||
                      (item.href !== '/admin/dashboard' && pathname?.startsWith(item.href));

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition cursor-pointer ${
                          isActive
                            ? 'bg-amber-50 text-amber-800 font-bold border border-amber-200 shadow-2xs'
                            : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900 font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon
                            className={`w-4 h-4 ${
                              isActive ? 'text-amber-600' : 'text-stone-400 group-hover:text-stone-600'
                            }`}
                          />
                          <span>{item.name}</span>
                        </div>
                        {item.showBadge && livePendingCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white font-bold text-[9px] shadow-xs">
                            {livePendingCount}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="pt-4 border-t border-stone-200 text-[11px] text-stone-400 text-center">
            DevSutra Business System v2.0
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0 bg-slate-50 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Live New Ceremony Booking Slide-in Popup Alert */}
      {newBookingAlert && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-white border-2 border-emerald-500 rounded-2xl p-4 shadow-2xl flex items-start gap-3 animate-fade-in">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-stone-900 text-sm">✨ New Booking Created!</span>
              <button
                onClick={() => setNewBookingAlert(null)}
                className="text-stone-400 hover:text-stone-700 p-0.5 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-stone-400 font-mono text-[10px] mt-0.5">
              Ref: #{newBookingAlert.bookingNumber}
            </p>
            <p className="text-stone-900 text-xs font-bold">{newBookingAlert.puja}</p>
            <p className="text-stone-600 text-[11px]">
              Devotee: <span className="font-semibold text-stone-900">{newBookingAlert.customer}</span>
            </p>
            <p className="text-stone-600 text-[11px]">
              Scholar: <span className="font-semibold text-amber-800">{newBookingAlert.pandit}</span>
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px] uppercase border border-emerald-200">
                ₹{newBookingAlert.amount}
              </span>
              <span className="text-[10px] text-stone-400">At {newBookingAlert.time}</span>
              <Link
                href="/admin/calendar"
                onClick={() => setNewBookingAlert(null)}
                className="ml-auto text-emerald-700 hover:underline font-bold text-[11px]"
              >
                View in Calendar →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Live Customer App Login Slide-in Popup Alert */}
      {loginAlert && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-white border-2 border-amber-500 rounded-2xl p-4 shadow-2xl flex items-start gap-3 animate-fade-in">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-stone-900 text-sm">🔔 Customer Logged In App!</span>
              <button
                onClick={() => setLoginAlert(null)}
                className="text-stone-400 hover:text-stone-700 p-0.5 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="font-semibold text-stone-800 mt-1">{loginAlert.name}</p>
            <p className="text-stone-500 font-mono text-[11px]">{loginAlert.contact}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px] uppercase border border-emerald-200">
                Via {loginAlert.method}
              </span>
              <span className="text-[10px] text-stone-400">At {loginAlert.time}</span>
              <Link
                href="/admin/customers"
                onClick={() => setLoginAlert(null)}
                className="ml-auto text-amber-700 hover:underline font-bold text-[11px]"
              >
                View Profile & Orders →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Live Booking Cancelled Slide-in Popup Alert */}
      {cancellationAlert && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-white border-2 border-rose-500 rounded-2xl p-4 shadow-2xl flex items-start gap-3 animate-fade-in">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
            <XCircle className="w-5 h-5 text-rose-600" />
          </div>
          <div className="flex-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-rose-900 text-sm">🚨 Booking Cancelled!</span>
              <button
                onClick={() => setCancellationAlert(null)}
                className="text-stone-400 hover:text-stone-700 p-0.5 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="font-bold text-stone-900 mt-1">
              Booking #{cancellationAlert.bookingNumber}
            </p>
            <p className="text-stone-700 text-xs font-semibold">{cancellationAlert.puja}</p>
            <p className="text-stone-500 text-[11px]">
              Devotee: <span className="font-medium text-stone-800">{cancellationAlert.customer}</span>
            </p>
            <p className="text-stone-500 italic text-[11px] mt-0.5">&quot;{cancellationAlert.reason}&quot;</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 font-bold text-[10px] uppercase border border-rose-200">
                Status: CANCELLED
              </span>
              <span className="text-[10px] text-stone-400">At {cancellationAlert.time}</span>
              <Link
                href="/admin/bookings"
                onClick={() => setCancellationAlert(null)}
                className="ml-auto text-rose-700 hover:underline font-bold text-[11px]"
              >
                View Operations →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Live Customer Review Submitted Slide-in Popup Alert */}
      {newReviewAlert && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-white border-2 border-amber-400 rounded-2xl p-4 shadow-2xl flex items-start gap-3 animate-fade-in">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Star className="w-5 h-5 text-amber-600 fill-amber-500" />
          </div>
          <div className="flex-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-stone-900 text-sm">⭐ New Devotee Review!</span>
              <button
                onClick={() => setNewReviewAlert(null)}
                className="text-stone-400 hover:text-stone-700 p-0.5 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="font-semibold text-stone-800 mt-1">{newReviewAlert.name}</p>
            <div className="flex items-center gap-1 my-0.5">
              {[...Array(newReviewAlert.rating)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-amber-500 text-amber-500" />
              ))}
            </div>
            <p className="text-stone-600 italic text-[11px]">&quot;{newReviewAlert.comment}&quot;</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] text-stone-400">At {newReviewAlert.time}</span>
              <Link
                href="/admin/reviews"
                onClick={() => setNewReviewAlert(null)}
                className="ml-auto text-amber-700 hover:underline font-bold text-[11px]"
              >
                Moderate Reviews →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
