'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DevSutraLogo from '@/components/ui/DevSutraLogo';
import { Lock, ArrowLeft, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
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
    <div className="min-h-screen bg-deep-maroon flex flex-col items-center justify-center p-4 font-sans text-beige">
      <div className="w-full max-w-md bg-maroon-900 border border-gold/30 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <DevSutraLogo variant="dark" size="lg" showTagline={false} />
          </div>
          <h1 className="text-2xl font-heading font-bold text-ivory tracking-tight">
            DevSutra Admin Console
          </h1>
          <p className="text-xs text-beige/70">
            Strict administrative control, verification & platform oversight
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 bg-rose-950/80 border border-rose-500/50 rounded-xl text-rose-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <p>{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-beige mb-1">Admin Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@devsutra.in"
              className="w-full px-3.5 py-2.5 rounded-xl bg-maroon-950 border border-gold/30 text-ivory placeholder-beige/40 focus:outline-none focus:ring-2 focus:ring-gold transition"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block font-semibold text-beige mb-1">Security Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-maroon-950 border border-gold/30 text-ivory placeholder-beige/40 focus:outline-none focus:ring-2 focus:ring-gold transition"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-beige/50 hover:text-ivory transition"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-maroon hover:bg-maroon-800 disabled:opacity-60 text-ivory font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 border border-gold/50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 text-gold animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-gold-300" />
                <span>Authenticate Admin</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-beige/60 pt-2 border-t border-maroon-800 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-1.5 hover:text-ivory transition">
            <ArrowLeft className="w-3.5 h-3.5" /> DevSutra Home
          </Link>
          <Link href="/pandit/login" className="hover:text-gold transition">
            Pandit Portal →
          </Link>
        </div>
      </div>
    </div>
  );
}
