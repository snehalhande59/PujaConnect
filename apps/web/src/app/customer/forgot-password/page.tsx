'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/layout/Footer';
import DevSutraLogo from '@/components/ui/DevSutraLogo';
import { requestPasswordReset } from '@/lib/auth';
import {
  KeyRound,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ message: string; resetUrl?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessInfo(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your registered email address.');
      return;
    }

    try {
      setLoading(true);
      const res = await requestPasswordReset(email);
      setSuccessInfo({
        message: res.message,
        resetUrl: res.resetUrl,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to request password reset. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-ivory text-brown selection:bg-maroon selection:text-ivory">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-14 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 border border-beige shadow-sacred-lg space-y-6">
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <DevSutraLogo variant="icon" size="lg" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/15 text-gold-700 text-[11px] font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-gold-600" />
                <span>Account Recovery</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-brown">
                Reset Your Password
              </h1>
              <p className="text-xs text-brown/70 mt-1">
                Enter your registered email address and we will provide you with a secure recovery link
              </p>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {successInfo ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Reset Link Generated</span>
                </div>
                <p className="text-[11px] leading-relaxed text-emerald-800/90">
                  {successInfo.message} The recovery link remains valid for 15 minutes.
                </p>
              </div>

              {successInfo.resetUrl && (
                <div className="p-4 rounded-2xl bg-ivory border border-gold/40 text-xs space-y-2">
                  <p className="font-semibold text-maroon text-[11px]">Direct Recovery Link:</p>
                  <Link
                    href={successInfo.resetUrl}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-maroon text-ivory font-semibold text-xs shadow-sm hover:bg-maroon-800 transition"
                  >
                    <span>Click Here to Reset Password Now</span>
                    <ArrowRight className="w-3.5 h-3.5 text-gold-300" />
                  </Link>
                </div>
              )}

              <div className="pt-2 text-center">
                <Link
                  href="/customer/login"
                  className="text-xs font-semibold text-maroon hover:underline inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Devotee Sign In</span>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-brown mb-1.5">
                  Registered Email Address
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-maroon hover:bg-maroon-800 disabled:bg-maroon/70 text-ivory font-bold rounded-xl shadow-sacred hover:shadow-sacred-lg transition flex items-center justify-center gap-2 border border-gold/40 text-xs"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 text-gold-300 animate-spin" />
                    <span>Verifying Account...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4 text-gold-300" />
                    <span>Generate Password Reset Link</span>
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/customer/login"
                  className="text-xs text-brown/70 hover:text-maroon inline-flex items-center gap-1.5 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
