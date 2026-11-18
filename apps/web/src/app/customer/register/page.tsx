'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/layout/Footer';
import DevSutraLogo from '@/components/ui/DevSutraLogo';
import { registerCustomer } from '@/lib/auth';
import {
  UserPlus,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export default function CustomerRegisterPage() {
  const router = useRouter();

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status State
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validation
    if (!firstName.trim() || !lastName.trim()) {
      setErrorMessage('Please provide your complete first and last name.');
      return;
    }

    if (!email.trim()) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter your password.');
      return;
    }

    try {
      setLoading(true);
      const res = await registerCustomer({
        firstName,
        lastName,
        email,
        phoneNumber: phoneNumber.trim() || undefined,
        password,
      });

      if (res.success) {
        setSuccessMessage('Account registered successfully! Redirecting to your Devotee Dashboard...');
        setTimeout(() => {
          router.push('/customer/dashboard');
        }, 1000);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please review your information.');
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
                <span>Join the DevSutra Sacred Family</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-brown">
                Create Devotee Account
              </h1>
              <p className="text-xs text-brown/70 mt-1">
                Book verified Gurukul Pandits, schedule havans, and shop authentic puja samagri
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

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* First & Last Name */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-brown mb-1.5">First Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={loading}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-beige focus:outline-none focus:ring-2 focus:ring-maroon text-brown bg-ivory/30 placeholder-brown/40 text-xs disabled:opacity-60"
                />
              </div>
              <div>
                <label className="block font-semibold text-brown mb-1.5">Last Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sharma"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={loading}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-beige focus:outline-none focus:ring-2 focus:ring-maroon text-brown bg-ivory/30 placeholder-brown/40 text-xs disabled:opacity-60"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block font-semibold text-brown mb-1.5">Email Address</label>
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2.5 rounded-xl border border-beige focus:outline-none focus:ring-2 focus:ring-maroon text-brown bg-ivory/30 placeholder-brown/40 text-xs disabled:opacity-60"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block font-semibold text-brown mb-1.5">
                Mobile Number <span className="font-normal text-brown/50">(For booking SMS / WhatsApp)</span>
              </label>
              <input
                type="tel"
                placeholder="10-digit mobile number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2.5 rounded-xl border border-beige focus:outline-none focus:ring-2 focus:ring-maroon text-brown bg-ivory/30 placeholder-brown/40 text-xs disabled:opacity-60"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block font-semibold text-brown mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-2.5 pr-11 rounded-xl border border-beige focus:outline-none focus:ring-2 focus:ring-maroon text-brown bg-ivory/30 placeholder-brown/40 text-xs disabled:opacity-60"
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

            {/* Confirm Password */}
            <div>
              <label className="block font-semibold text-brown mb-1.5">Confirm Password</label>
              <input
                type="password"
                required
                autoComplete="new-password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2.5 rounded-xl border border-beige focus:outline-none focus:ring-2 focus:ring-maroon text-brown bg-ivory/30 placeholder-brown/40 text-xs disabled:opacity-60"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-maroon hover:bg-maroon-800 disabled:bg-maroon/70 text-ivory font-bold rounded-xl shadow-sacred hover:shadow-sacred-lg transition flex items-center justify-center gap-2 border border-gold/40 text-xs"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 text-gold-300 animate-spin" />
                  <span>Creating Sacred Account...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 text-gold-300" />
                  <span>Create Devotee Account</span>
                </>
              )}
            </button>
          </form>

          {/* Security info */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-brown/60 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-gold-600" />
            <span>Your personal details are securely stored under Sanatan confidentiality</span>
          </div>

          {/* Sign In link */}
          <div className="text-center text-xs text-brown/70 pt-4 border-t border-beige/60">
            Already have an account?{' '}
            <Link
              href="/customer/login"
              className="font-bold text-maroon hover:text-maroon-800 hover:underline"
            >
              Sign In to Your Account
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
