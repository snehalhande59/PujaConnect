'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/layout/Footer';
import DevSutraLogo from '@/components/ui/DevSutraLogo';
import { loginCustomer } from '@/lib/auth';
import {
  LogIn,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export default function CustomerLoginPage() {
  const router = useRouter();

  // Form State - strictly EMPTY by default (No hardcoded credentials)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status State
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Client-side validation
    if (!email.trim()) {
      setErrorMessage('Please enter your registered email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    try {
      setLoading(true);
      const res = await loginCustomer(email, password);

      if (res.success) {
        setSuccessMessage('Welcome back! Redirecting to your Devotee Dashboard...');
        setTimeout(() => {
          router.push('/customer/dashboard');
        }, 800);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to sign in. Please verify your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-ivory text-brown selection:bg-maroon selection:text-ivory">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-14 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 border border-beige shadow-sacred-lg space-y-6">
          {/* Header & Logo */}
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <DevSutraLogo variant="icon" size="lg" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/15 text-gold-700 text-[11px] font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-gold-600" />
                <span>Devotee Sacred Portal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-brown">
                Devotee Sign In
              </h1>
              <p className="text-xs text-brown/70 mt-1">
                Access your scheduled pujas, Pandit bookings, and samagri orders
              </p>
            </div>
          </div>

          {/* Feedback Alerts */}
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

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Email Field */}
            <div>
              <label className="block font-semibold text-brown mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl border border-beige focus:outline-none focus:ring-2 focus:ring-maroon text-brown bg-ivory/30 placeholder-brown/40 text-xs transition disabled:opacity-60"
              />
            </div>

            {/* Password Field with Show/Hide toggle */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold text-brown">Password</label>
                <Link
                  href="/customer/forgot-password"
                  className="text-maroon hover:text-maroon-800 hover:underline text-[11px] font-medium"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-beige focus:outline-none focus:ring-2 focus:ring-maroon text-brown bg-ivory/30 placeholder-brown/40 text-xs transition disabled:opacity-60"
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

            {/* Sign In CTA with Loading State */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-maroon hover:bg-maroon-800 disabled:bg-maroon/70 text-ivory font-bold rounded-xl shadow-sacred hover:shadow-sacred-lg transition flex items-center justify-center gap-2 border border-gold/40 text-xs"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 text-gold-300 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 text-gold-300" />
                  <span>Sign In to Devotee Account</span>
                </>
              )}
            </button>
          </form>

          {/* Security Assurance */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-brown/60 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-gold-600" />
            <span>Encrypted 256-bit Shastric Security Session</span>
          </div>

          {/* Registration Navigation Link */}
          <div className="text-center text-xs text-brown/70 pt-4 border-t border-beige/60">
            Don&apos;t have an account yet?{' '}
            <Link
              href="/customer/register"
              className="font-bold text-maroon hover:text-maroon-800 hover:underline"
            >
              Create Account Here
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
