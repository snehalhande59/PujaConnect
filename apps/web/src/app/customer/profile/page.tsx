'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/layout/Footer';
import { getSavedUserProfile, getClientToken, AuthUser } from '@/lib/auth';
import { User, MapPin, Mail, Phone, Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export default function CustomerProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    city: 'Pune',
    state: 'Maharashtra',
    addressLine1: '',
    pincode: '',
  });

  useEffect(() => {
    const profile = getSavedUserProfile();
    if (!profile) {
      router.push('/customer/login');
      return;
    }
    setUser(profile);
    setForm((prev) => ({
      ...prev,
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      email: profile.email || '',
      phoneNumber: profile.phoneNumber || '',
    }));

    // Fetch full profile from API if authenticated
    const token = getClientToken();
    if (token) {
      fetch(`${API_BASE_URL}/customers/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            const customer = data.data || data;
            const primaryAddr = customer.addresses?.[0];
            setForm({
              firstName: customer.firstName || profile.firstName || '',
              lastName: customer.lastName || profile.lastName || '',
              email: customer.user?.email || profile.email || '',
              phoneNumber: customer.user?.phoneNumber || profile.phoneNumber || '',
              city: primaryAddr?.city || customer.city || 'Pune',
              state: primaryAddr?.state || customer.state || 'Maharashtra',
              addressLine1: primaryAddr?.addressLine1 || '',
              pincode: primaryAddr?.pincode || customer.pincode || '',
            });
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getClientToken();
    if (!token) return;

    try {
      setSaving(true);
      setMessage(null);

      const res = await fetch(`${API_BASE_URL}/customers/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
        }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Devotee profile updated successfully!' });
      } else {
        const err = await res.json().catch(() => ({}));
        setMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: e?.message || 'Network error updating profile.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-ivory text-brown">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-8">
          <Loader2 className="w-8 h-8 text-gold-600 animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-ivory text-brown font-sans">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-6">
        <div>
          <h1 className="text-2xl font-bold font-heading text-maroon">Profile & Addresses</h1>
          <p className="text-xs text-brown/70">Manage your contact details and default ritual venues</p>
        </div>

        {message && (
          <div
            className={`p-3.5 rounded-xl border flex items-center gap-2 text-xs ${
              message.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-beige shadow-sacred space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-brown mb-1">First Name</label>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-beige bg-ivory/50 text-brown focus:outline-none focus:border-gold focus:bg-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-brown mb-1">Last Name</label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-beige bg-ivory/50 text-brown focus:outline-none focus:border-gold focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-brown mb-1">Email Address (Sign In ID)</label>
                <input
                  type="email"
                  value={form.email}
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-xl border border-beige bg-beige/30 text-brown/60 font-mono cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block font-semibold text-brown mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={form.phoneNumber}
                  onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                  placeholder="+919876543210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-beige bg-ivory/50 text-brown focus:outline-none focus:border-gold focus:bg-white"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-beige space-y-3">
              <h3 className="text-sm font-bold font-heading text-maroon">Puja Venue / Location</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-brown mb-1">City</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-beige bg-ivory/50 text-brown focus:outline-none focus:border-gold focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-brown mb-1">State</label>
                  <input
                    type="text"
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-beige bg-ivory/50 text-brown focus:outline-none focus:border-gold focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-brown mb-1">PIN Code</label>
                  <input
                    type="text"
                    value={form.pincode}
                    onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                    placeholder="411038"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-beige bg-ivory/50 text-brown focus:outline-none focus:border-gold focus:bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-maroon hover:bg-maroon-800 text-ivory font-bold text-xs rounded-xl shadow-sacred transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
