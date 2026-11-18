'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/layout/Footer';
import DevSutraLogo from '@/components/ui/DevSutraLogo';
import { resetPasswordWithToken } from '@/lib/auth';
import {
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!token) {
      setErrorMessage('Missing security reset token. Please request a new recovery link.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    try {
      setLoading(true);
      const res = await resetPasswordWithToken(token, newPassword);
      setSuccessMessage(res.message);
      setTimeout(() => {
        router.push('/customer/login');
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update password. Your link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 border border-beige shadow-sacred-lg space-y-6">
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <DevSutraLogo variant="icon" size="lg" />
        </div>
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/15 text-gold-700 text-[11px] font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-gold-600" />
            <span>Set New Security Password</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-brown">
            Create New Password
          </h1>
          <p className="text-xs text-brown/70 mt-1">
            Choose a strong, unique password for your DevSutra devotee account
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {!token ? (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-3">
          <p>No valid security reset token was found in the link.</p>
          <Link
            href="/customer/forgot-password"
            className="block text-center py-2 px-3 bg-maroon text-ivory rounded-xl font-semibold"
          >
            Request New Reset Link
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-brown mb-1.5">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                placeholder="Minimum 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 pr-11 rounded-xl border border-beige focus:outline-none focus:ring-2 focus:ring-maroon text-brown bg-ivory/30 placeholder-brown/40 text-xs disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brown/50 hover:text-brown p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-brown mb-1.5">Confirm New Password</label>
            <input
              type="password"
              required
              autoComplete="new-password"
              placeholder="Re-enter your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl border border-beige focus:outline-none focus:ring-2 focus:ring-maroon text-brown bg-ivory/30 placeholder-brown/40 text-xs disabled:opacity-60"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-maroon hover:bg-maroon-800 disabled:bg-maroon/70 text-ivory font-bold rounded-xl shadow-sacred hover:shadow-sacred-lg transition flex items-center justify-center gap-2 border border-gold/40 text-xs"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 text-gold-300 animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4 text-gold-300" />
                <span>Update Password</span>
              </>
            )}
          </button>
        </form>
      )}

      <div className="text-center pt-2">
        <Link
          href="/customer/login"
          className="text-xs text-brown/70 hover:text-maroon inline-flex items-center gap-1.5 transition"
        >
          <span>Back to Devotee Sign In</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col bg-ivory text-brown selection:bg-maroon selection:text-ivory">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-14 px-4 sm:px-6 lg:px-8 font-sans">
        <Suspense
          fallback={
            <div className="p-8 text-center text-xs text-brown/60">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-maroon mb-2" />
              Loading recovery session...
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
