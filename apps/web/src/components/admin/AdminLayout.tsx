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
  LifeBuoy,
  TrendingUp,
  Settings,
  LogOut,
  Lock,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { getSavedUserProfile, clearClientSession, AuthUser, getClientToken } from '@/lib/auth';

interface AdminLayoutProps {
  children: ReactNode;
  pendingPanditsCount?: number;
}

const navItems = [
  { name: 'Dashboard Analytics', href: '/admin/dashboard', icon: FileBarChart },
  { name: 'Pandit Verification', href: '/admin/pandits', icon: ShieldCheck, showBadge: true },
  { name: 'Customer Management', href: '/admin/customers', icon: Users },
  { name: 'Puja Management', href: '/admin/pujas', icon: Sparkles },
  { name: 'Puja Categories', href: '/admin/categories', icon: Layers },
  { name: 'Booking Management', href: '/admin/bookings', icon: Calendar },
  { name: 'Payment Management', href: '/admin/payments', icon: IndianRupee },
  { name: 'Samagri Products', href: '/admin/products', icon: Package },
  { name: 'Orders & Fulfillment', href: '/admin/orders', icon: ShoppingBag },
  { name: 'Support Tickets', href: '/admin/reports', icon: LifeBuoy },
  { name: 'Reports & Audit', href: '/admin/reports', icon: TrendingUp },
  { name: 'Platform Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children, pendingPanditsCount = 0 }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [adminUser, setAdminUser] = useState<AuthUser | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const user = getSavedUserProfile();
    const token = getClientToken();
    if (!user || !token || user.role !== 'ADMIN') {
      router.push('/admin/login');
      return;
    }
    setAdminUser(user);
    setAuthorized(true);
  }, [router]);

  const handleSignOut = () => {
    clearClientSession();
    router.push('/admin/login');
  };

  if (!authorized) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4 text-stone-200 font-sans">
        <div className="text-center space-y-3">
          <Lock className="w-8 h-8 text-amber-500 animate-bounce mx-auto" />
          <p className="text-xs text-stone-400">Verifying Administrative Privileges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="h-16 border-b border-stone-800 bg-stone-900/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-stone-800 text-stone-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2 sm:gap-3">
            <DevSutraLogo variant="icon" size="sm" showTagline={false} />
            <div className="border-l border-stone-800 pl-3">
              <h1 className="font-bold text-sm sm:text-base text-white tracking-tight leading-tight">
                DevSutra
              </h1>
              <span className="text-[10px] text-amber-400 font-medium block">
                Enterprise Admin Console
              </span>
            </div>
          </div>
          <span className="hidden lg:inline-flex items-center gap-1.5 ml-4 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-[10px] text-emerald-300 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live PostgreSQL Connected
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <Link
            href="/"
            target="_blank"
            className="hidden sm:flex items-center gap-1 text-[11px] text-stone-400 hover:text-amber-400 transition mr-2"
          >
            <span>View Live Site</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
          <div className="text-right hidden sm:block">
            <span className="text-stone-400 text-[11px] block">Admin:</span>
            <span className="font-semibold text-white text-xs">{adminUser?.email || 'admin@devsutra.in'}</span>
          </div>
          <button
            onClick={handleSignOut}
            className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 top-16 z-20 w-64 bg-stone-900 border-r border-stone-800 p-4 space-y-1 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 px-3 py-2">
            Operations
          </div>
          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                    isActive
                      ? 'bg-amber-600/20 text-amber-300 font-semibold border border-amber-500/30'
                      : 'text-stone-300 hover:bg-stone-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-stone-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.showBadge && pendingPanditsCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-stone-950 font-bold text-[9px]">
                      {pendingPanditsCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0 bg-stone-950 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
