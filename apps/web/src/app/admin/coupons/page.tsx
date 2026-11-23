'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Tag,
  Plus,
  Loader2,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Calendar,
  Percent,
  IndianRupee,
  Trash2,
  Edit,
  X,
  Check,
  AlertCircle,
} from 'lucide-react';
import { getClientToken } from '@/lib/auth';
import AdminLayout from '@/components/admin/AdminLayout';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'PCT' | 'FLAT'>('PCT');
  const [discountValue, setDiscountValue] = useState(10);
  const [minSpend, setMinSpend] = useState<number | undefined>(2000);
  const [maxDiscount, setMaxDiscount] = useState<number | undefined>(500);
  const [validUntil, setValidUntil] = useState('2026-12-31');
  const [usageLimit, setUsageLimit] = useState<number | undefined>(100);

  const fetchCoupons = useCallback(async () => {
    const token = getClientToken();
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/admin/coupons`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        const data = json.data || json || [];
        setCoupons(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Failed to load coupons:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    const token = getClientToken();
    try {
      setSaving(true);
      const payload: any = {
        code: code.toUpperCase().trim(),
        validFrom: new Date().toISOString(),
        validUntil: new Date(validUntil).toISOString(),
        usageLimit: usageLimit ? Number(usageLimit) : undefined,
        minSpend: minSpend ? Number(minSpend) : undefined,
      };

      if (discountType === 'PCT') {
        payload.discountPct = Number(discountValue);
        payload.maxDiscount = maxDiscount ? Number(maxDiscount) : undefined;
      } else {
        payload.discountAmount = Number(discountValue);
      }

      const res = await fetch(`${API_BASE_URL}/admin/coupons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setMsg({ type: 'success', text: `Coupon '${code.toUpperCase()}' created successfully.` });
        setShowAddModal(false);
        setCode('');
        fetchCoupons();
      } else {
        const err = await res.json();
        setMsg({ type: 'error', text: err.message || 'Failed to create coupon.' });
      }
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message || 'Error creating coupon.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCoupon = async (id: string, promoCode: string) => {
    if (!confirm(`Are you sure you want to delete coupon '${promoCode}'?`)) return;

    const token = getClientToken();
    try {
      const res = await fetch(`${API_BASE_URL}/admin/coupons/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setMsg({ type: 'success', text: `Coupon '${promoCode}' removed.` });
        fetchCoupons();
      }
    } catch (e: any) {
      alert(e.message || 'Error deleting coupon.');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
              Coupons & Promotional Marketing
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Live discount promo codes, percentage or flat cash deductions, and seasonal festival offers in PostgreSQL
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchCoupons}
              className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-600' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Coupon</span>
            </button>
          </div>
        </div>

        {msg && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center justify-between shadow-xs ${
              msg.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-2">
              {msg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span className="font-medium">{msg.text}</span>
            </div>
            <button onClick={() => setMsg(null)} className="text-stone-400 hover:text-stone-700 font-bold">
              Dismiss
            </button>
          </div>
        )}

        {/* Coupons Table */}
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto mb-3" />
              <p className="text-xs text-stone-500">Loading coupons from database...</p>
            </div>
          ) : coupons.length === 0 ? (
            <div className="py-16 text-center text-xs text-stone-500 space-y-2">
              <Tag className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <p className="font-bold text-stone-800 text-sm">No promotional coupons found</p>
              <p className="text-stone-400">Click &quot;Create Coupon&quot; to offer festival discounts to devotees.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-stone-50 text-stone-500 uppercase text-[10px] font-bold border-b border-stone-200 tracking-wider">
                  <tr>
                    <th className="p-4">Coupon Code</th>
                    <th className="p-4">Discount Value</th>
                    <th className="p-4">Min Spend</th>
                    <th className="p-4">Times Used</th>
                    <th className="p-4">Valid Until</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {coupons.map((c) => (
                    <tr key={c.id} className="hover:bg-stone-50/80 transition">
                      <td className="p-4">
                        <span className="font-mono font-extrabold text-amber-700 text-sm tracking-wider bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 inline-block">
                          {c.code}
                        </span>
                      </td>

                      <td className="p-4 font-bold text-stone-900">
                        {c.discountPct ? `${Number(c.discountPct)}% OFF` : `₹${Number(c.discountAmount)} FLAT`}
                        {c.maxDiscount && (
                          <span className="text-[11px] text-stone-400 font-normal block">
                            Max: ₹{Number(c.maxDiscount)}
                          </span>
                        )}
                      </td>

                      <td className="p-4 font-semibold text-stone-700">
                        {c.minSpend ? `₹${Number(c.minSpend)}` : 'No minimum'}
                      </td>

                      <td className="p-4 text-stone-800">
                        {c.timesUsed || 0} {c.usageLimit ? `/ ${c.usageLimit}` : 'uses'}
                      </td>

                      <td className="p-4 text-stone-500">
                        {c.validUntil ? new Date(c.validUntil).toLocaleDateString() : 'N/A'}
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            c.isActive
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-stone-100 text-stone-600 border border-stone-200'
                          }`}
                        >
                          {c.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteCoupon(c.id, c.code)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg transition"
                          title="Delete Coupon"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Coupon Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl text-xs text-stone-800">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-amber-600" /> Create Festival Coupon
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. DIWALI2026"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-600 font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-600 bg-white"
                  >
                    <option value="PCT">Percentage (%)</option>
                    <option value="FLAT">Flat Cash (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Value {discountType === 'PCT' ? '(%)' : '(₹)'} *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Minimum Spend (₹)</label>
                  <input
                    type="number"
                    value={minSpend || ''}
                    onChange={(e) => setMinSpend(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Valid Until *</label>
                  <input
                    type="date"
                    required
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition flex items-center gap-1.5"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Check className="w-4 h-4" />}
                  <span>Save Coupon</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
