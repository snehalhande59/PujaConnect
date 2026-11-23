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
  LogOut,
  Lock,
  Menu,
  X,
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
      { name: 'Support Help Desk', href: '/admin/support', icon: LifeBuoy },
      { name: 'Coupons & Promos', href: '/admin/coupons', icon: Tag },
    ],
  },
  {
    title: 'System & Intelligence',
    items: [
      { name: 'Reports & Audits', href: '/admin/reports', icon: TrendingUp },
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
  }, [router]);

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
    </div>
  );
}
