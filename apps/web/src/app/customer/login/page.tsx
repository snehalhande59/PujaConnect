'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/layout/Footer';
import DevSutraLogo from '@/components/ui/DevSutraLogo';
import { loginCustomer, sendCustomerOtp, verifyCustomerOtp } from '@/lib/auth';
import {
  LogIn,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Mail,
  KeyRound,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';

export default function CustomerLoginPage() {
  const router = useRouter();

  // Mode: 'otp' (Email OTP primary) vs 'password'
  const [authMode, setAuthMode] = useState<'otp' | 'password'>('otp');

  // OTP State
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [cooldown, setCooldown] = useState(0);

  // Password State
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status State
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Cooldown timer effect
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // Handle Send OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmed = email.trim();
    if (!trimmed) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (!trimmed.includes('@')) {
      setErrorMessage('Mobile SMS OTP is temporarily unavailable. Please enter a valid Email address to receive your OTP.');
      return;
    }

    try {
      setLoading(true);
      const res = await sendCustomerOtp(trimmed, 'email');
      setOtpSent(true);
      setCooldown(res.cooldownSeconds || 60);
      setSuccessMessage(res.message || '6-digit verification code has been sent to your email.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!otp.trim() || otp.trim().length !== 6) {
      setErrorMessage('Please enter the full 6-digit verification code.');
      return;
    }

    try {
      setLoading(true);
      const res = await verifyCustomerOtp(email.trim(), otp.trim());
      if (res.success) {
        setSuccessMessage('Verification successful! Opening your Devotee Dashboard...');
        setTimeout(() => {
          router.push('/customer/dashboard');
        }, 700);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Password Login
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

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
        setSuccessMessage('Welcome back! Opening your Devotee Dashboard...');
        setTimeout(() => {
          router.push('/customer/dashboard');
        }, 700);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to sign in. Please check your credentials.');
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

          {/* Mode Switch Tabs (Email OTP vs Password) */}
          <div className="flex p-1 bg-ivory/80 rounded-2xl border border-beige text-xs">
            <button
              type="button"
              onClick={() => {
                setAuthMode('otp');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 rounded-xl font-semibold transition flex items-center justify-center gap-1.5 ${
                authMode === 'otp'
                  ? 'bg-maroon text-ivory shadow-sm'
                  : 'text-brown/70 hover:text-brown'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email Code (Instant)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('password');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 rounded-xl font-semibold transition flex items-center justify-center gap-1.5 ${
                authMode === 'password'
                  ? 'bg-maroon text-ivory shadow-sm'
                  : 'text-brown/70 hover:text-brown'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Password Sign In</span>
            </button>
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

          {/* FORM: OTP MODE */}
          {authMode === 'otp' && (
            <div className="space-y-4 text-xs">
              {!otpSent ? (
                /* Step 1: Request OTP */
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block font-semibold text-brown mb-1.5">
                      Email Address or Mobile Number
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. devotee@example.com or +91 9876543210"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      className="w-full px-4 py-3 rounded-xl border border-beige focus:outline-none focus:ring-2 focus:ring-maroon text-brown bg-ivory/30 placeholder-brown/40 text-xs transition disabled:opacity-60"
                    />
                    <p className="text-[11px] text-brown/60 mt-1">
                      Enter your email to receive an instant 6-digit login code.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-maroon hover:bg-maroon-800 disabled:bg-maroon/70 text-ivory font-bold rounded-xl shadow-sacred hover:shadow-sacred-lg transition flex items-center justify-center gap-2 border border-gold/40 text-xs"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 text-gold-300 animate-spin" />
                        <span>Sending Verification Code...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 text-gold-300" />
                        <span>Send Verification Code</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Step 2: Verify OTP */
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between text-[11px] text-amber-900">
                    <span>
                      Code sent to <strong>{email}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setOtp('');
                        setErrorMessage(null);
                      }}
                      className="text-maroon font-semibold underline hover:text-maroon-800"
                    >
                      Change
                    </button>
                  </div>

                  <div>
                    <label className="block font-semibold text-brown mb-1.5">
                      Enter 6-Digit Code
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      autoFocus
                      required
                      placeholder="• • • • • •"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      disabled={loading}
                      className="w-full px-4 py-3 text-center tracking-[0.5em] font-mono text-lg font-bold rounded-xl border border-beige focus:outline-none focus:ring-2 focus:ring-maroon text-maroon bg-ivory/30 text-xs transition disabled:opacity-60"
                    />
                    <div className="flex items-center justify-between text-[11px] text-brown/60 mt-1.5">
                      <span>Valid for 5 minutes</span>
                      {cooldown > 0 ? (
                        <span className="text-stone-400">Resend in {cooldown}s</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSendOtp()}
                          disabled={loading}
                          className="text-maroon font-semibold hover:underline flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" /> Resend Code
                        </button>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full py-3.5 bg-maroon hover:bg-maroon-800 disabled:bg-maroon/50 text-ivory font-bold rounded-xl shadow-sacred hover:shadow-sacred-lg transition flex items-center justify-center gap-2 border border-gold/40 text-xs"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 text-gold-300 animate-spin" />
                        <span>Verifying Code...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-gold-300" />
                        <span>Verify & Sign In</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* FORM: PASSWORD MODE */}
          {authMode === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
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
                    <span>Sign In with Password</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Security Assurance */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-brown/60 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-gold-600" />
            <span>256-bit Encrypted Shastric Security Session</span>
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
