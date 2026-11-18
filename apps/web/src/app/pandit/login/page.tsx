'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/layout/Footer';
import DevSutraLogo from '@/components/ui/DevSutraLogo';
import { LogIn, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { loginPandit } from '@/lib/auth';

export default function PanditLoginPage() {
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
      setErrorMessage('Please provide both registered email and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await loginPandit(email, password);
      if (res.success) {
        // Check if Pandit profile verification is pending or rejected
        const panditProfile = (res.user as any)?.panditProfile;
        if (panditProfile && panditProfile.verificationStatus !== 'VERIFIED') {
          router.push('/pandit/verification');
        } else {
          router.push('/pandit/dashboard');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Pandit authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-ivory text-brown">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-16 px-4 font-sans">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 border border-beige shadow-sacred-lg space-y-6">
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <DevSutraLogo variant="icon" size="lg" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-brown">
              Vedic Pandit Portal Login
            </h1>
            <p className="text-xs text-brown/70">
              Access your ritual bookings, verification status, and earnings
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p>{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-brown mb-1">
                Registered Email or Username
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="pandit@devsutra.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-beige focus:outline-none focus:ring-2 focus:ring-maroon text-brown bg-ivory/40"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-brown">Password</label>
                <Link href="/auth/forgot-password" className="text-maroon hover:underline text-[11px]">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your account password"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-beige focus:outline-none focus:ring-2 focus:ring-maroon text-brown bg-ivory/40"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brown/50 hover:text-brown transition"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-maroon hover:bg-maroon-800 disabled:opacity-60 text-ivory font-bold rounded-xl shadow-sacred transition flex items-center justify-center gap-2 border border-gold/40 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 text-gold-300 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 text-gold-300" />
                  <span>Sign In to Pandit Portal</span>
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-brown/70 pt-2 border-t border-beige/60 space-y-2">
            <div>
              New Shastri or Acharya?{' '}
              <Link href="/pandit/register" className="font-bold text-maroon hover:text-maroon-800">
                Apply for Pandit Verification →
              </Link>
            </div>
            <div>
              Devotee or Customer?{' '}
              <Link href="/customer/login" className="text-brown/80 hover:text-maroon underline">
                Devotee Sign In
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
