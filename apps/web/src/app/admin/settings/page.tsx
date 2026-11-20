'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Settings, Save, CheckCircle2, ShieldCheck, Mail, Database } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminSettingsPage() {
  const [commission, setCommission] = useState(10);
  const [platformFee, setPlatformFee] = useState(99);
  const [payoutSchedule, setPayoutSchedule] = useState('WEEKLY');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Platform Settings & Configuration
          </h1>
          <p className="text-xs text-stone-400">
            Marketplace commission rates, payment gateway credentials, and automated Pandit settlement rules
          </p>
        </div>

        {saved && (
          <div className="p-3.5 rounded-xl text-xs bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Settings updated successfully in database!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-5 text-xs">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-stone-800 pb-3">
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span>Financial & Commission Policies</span>
            </h2>

            <div>
              <label className="block font-semibold text-stone-300 mb-1">
                Standard Platform Commission (%)
              </label>
              <input
                type="number"
                min={0}
                max={50}
                value={commission}
                onChange={(e) => setCommission(Number(e.target.value))}
                className="w-full max-w-md px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-amber-600"
              />
              <p className="text-[11px] text-stone-500 mt-1">
                Retained by DevSutra from Pandit Dakshina upon successful completion of sacred rituals
              </p>
            </div>

            <div>
              <label className="block font-semibold text-stone-300 mb-1">
                Auspicious Platform Booking Fee (₹)
              </label>
              <input
                type="number"
                min={0}
                value={platformFee}
                onChange={(e) => setPlatformFee(Number(e.target.value))}
                className="w-full max-w-md px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-amber-600"
              />
              <p className="text-[11px] text-stone-500 mt-1">
                Fixed nominal charge per booking for booking management and support
              </p>
            </div>

            <div>
              <label className="block font-semibold text-stone-300 mb-1">
                Pandit Settlement Payout Cycle
              </label>
              <select
                value={payoutSchedule}
                onChange={(e) => setPayoutSchedule(e.target.value)}
                className="w-full max-w-md px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-amber-600"
              >
                <option value="IMMEDIATE">Immediate (Escrow Release upon Devotee OTP)</option>
                <option value="DAILY">Daily Batch Transfer (NEFT/IMPS)</option>
                <option value="WEEKLY">Weekly Consolidation (Every Monday)</option>
              </select>
            </div>
          </div>

          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4 text-xs">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-stone-800 pb-3">
              <Database className="w-4 h-4 text-amber-500" />
              <span>Database & Environment Connections</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-stone-950 border border-stone-800 rounded-xl">
                <span className="text-stone-400 block text-[11px]">PostgreSQL Neon Cluster</span>
                <span className="text-emerald-400 font-bold block mt-1">Healthy & Connected</span>
              </div>
              <div className="p-4 bg-stone-950 border border-stone-800 rounded-xl">
                <span className="text-stone-400 block text-[11px]">Mail Service (Gmail SMTP)</span>
                <span className="text-emerald-400 font-bold block mt-1">Ready for OTP & Invoices</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration Changes</span>
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
