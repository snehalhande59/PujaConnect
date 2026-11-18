import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 p-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/dashboard" className="p-2 bg-stone-800 rounded-lg hover:bg-stone-700">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">System & Commission Settings</h1>
          <p className="text-xs text-stone-400">Configure marketplace commissions, Razorpay webhooks, and payout frequencies</p>
        </div>
      </div>

      <div className="max-w-2xl bg-stone-950 border border-stone-800 rounded-2xl p-6 space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-stone-300 mb-1">Standard Platform Commission (%)</label>
          <input
            type="number"
            defaultValue={10}
            className="w-full px-3.5 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-white"
          />
          <p className="text-[11px] text-stone-500 mt-1">Deducted automatically from Pandit Dakshina on completed rituals</p>
        </div>

        <div>
          <label className="block font-semibold text-stone-300 mb-1">Convenience Platform Fee (₹)</label>
          <input
            type="number"
            defaultValue={100}
            className="w-full px-3.5 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-white"
          />
        </div>

        <div>
          <label className="block font-semibold text-stone-300 mb-1">Razorpay Webhook Secret</label>
          <input
            type="password"
            defaultValue="whsec_prod_sample_key_pujaconnect"
            className="w-full px-3.5 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-white font-mono"
          />
        </div>

        <button
          type="button"
          className="mt-4 px-6 py-2.5 bg-saffron-600 hover:bg-saffron-500 text-white font-bold rounded-xl flex items-center gap-2"
        >
          <Save className="w-4 h-4" /> Save System Settings
        </button>
      </div>
    </div>
  );
}
