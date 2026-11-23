'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DevSutraLogo from '@/components/ui/DevSutraLogo';
import { Lock, ArrowLeft, Eye, EyeOff, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { loginAdmin } from '@/lib/auth';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both administrative email and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await loginAdmin(email, password);
      if (res.success) {
        router.push('/admin/dashboard');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Administrative authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans text-stone-800">
      <div className="w-full max-w-md bg-white border border-stone-200 rounded-3xl p-8 sm:p-10 shadow-xl space-y-6">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <DevSutraLogo variant="icon" size="lg" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-stone-900 tracking-tight">
            DevSutra Admin Console
          </h1>
          <p className="text-xs text-stone-500">
            Strict administrative control, verification & platform oversight
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>Authorized Personnel Only</span>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p>{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Admin Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@pujaconnect.in"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 transition"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Security Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-white border border-stone-300 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 transition"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 text-white animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-white" />
                <span>Authenticate Admin</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-stone-500 pt-3 border-t border-stone-200 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-1.5 text-stone-600 hover:text-stone-900 transition">
            <ArrowLeft className="w-3.5 h-3.5" /> DevSutra Home
          </Link>
          <Link href="/pandit/login" className="text-amber-700 hover:underline transition font-medium">
            Pandit Portal →
          </Link>
        </div>
      </div>
    </div>
  );
}
