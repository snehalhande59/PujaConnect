'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Plus,
  Loader2,
  Sparkles,
  RefreshCw,
  X,
  Clock,
  IndianRupee,
  Package,
  Layers,
  Check,
  CheckCircle2,
  AlertCircle,
  Edit,
  Eye,
} from 'lucide-react';
import { getClientToken } from '@/lib/auth';
import AdminLayout from '@/components/admin/AdminLayout';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://pujaconnect-api-he9b.onrender.com/api/v1';

export default function AdminPujasPage() {
  const [pujas, setPujas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryName, setCategoryName] = useState('Vedic Rituals');
  const [basePrice, setBasePrice] = useState(3501);
  const [samagriPrice, setSamagriPrice] = useState(1100);
  const [durationMinutes, setDurationMinutes] = useState(120);
  const [requiredPandits, setRequiredPandits] = useState(1);
  const [samagriItems, setSamagriItems] = useState('Ganga Jal, Roli, Akshat, Supari, Pure Ghee, Hawan Samagri, Dry Coconut, Dhoop');
  const [ritualSteps, setRitualSteps] = useState('1. Sankalpa & Kalash Sthapana\n2. Gauri Ganesh Pujan\n3. Navgraha Avahanam\n4. Mukhya Puja & Abhishek\n5. Hawan & Agni Ahuti\n6. Maha Aarti & Ashirwad');

  const fetchPujas = useCallback(async () => {
    const token = getClientToken();
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/admin/pujas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        const data = json.data?.pujas || json.pujas || json.data || [];
        setPujas(data);
      }
    } catch (e) {
      console.error('Failed to load pujas:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPujas();
  }, [fetchPujas]);

  const [initializing, setInitializing] = useState(false);

  const handleInitializeCatalog = async () => {
    const token = getClientToken();
    try {
      setInitializing(true);
      const res = await fetch(`${API_BASE_URL}/admin/catalog/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setMsg({ type: 'success', text: 'Vedic categories and default puja catalog successfully seeded in database!' });
        await fetchPujas();
      } else {
        const err = await res.json().catch(() => ({}));
        setMsg({ type: 'error', text: err.message || 'Initialization failed.' });
      }
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message || 'Error initializing catalog.' });
    } finally {
      setInitializing(false);
    }
  };

  const handleCreatePuja = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const token = getClientToken();
    try {
      setSaving(true);
      const fullDesc = `${description.trim()}\n\nRitual Steps:\n${ritualSteps.trim()}`.trim();
      const samagriList = samagriItems.split(',').map((s) => s.trim()).filter(Boolean);

      const res = await fetch(`${API_BASE_URL}/admin/pujas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          description: fullDesc,
          categoryName: categoryName || 'Vedic Rituals',
          basePrice: Number(basePrice),
          samagriPrice: Number(samagriPrice),
          durationMinutes: Number(durationMinutes),
          requiredPandits: Number(requiredPandits) || 1,
          requiredSamagri: samagriList,
          languages: ['Hindi', 'Sanskrit', 'Marathi', 'English'],
        }),
      });

      if (res.ok) {
        setMsg({ type: 'success', text: `Puja '${title}' successfully added to database.` });
        setShowAddModal(false);
        setTitle('');
        setDescription('');
        fetchPujas();
      } else {
        const err = await res.json();
        setMsg({ type: 'error', text: err.message || 'Failed to add puja.' });
      }
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message || 'Error creating puja.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
              Puja Catalog Management
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Live Vedic rituals catalog, base dakshina, duration, and samagri kit fees in PostgreSQL
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleInitializeCatalog}
              disabled={initializing}
              className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            >
              {initializing ? <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" /> : <Sparkles className="w-3.5 h-3.5 text-amber-600" />}
              <span>{initializing ? 'Seeding...' : 'Seed Default Catalog'}</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Puja</span>
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

        {/* Pujas Table */}
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto mb-3" />
              <p className="text-xs text-stone-500">Loading Vedic ceremonies from database...</p>
            </div>
          ) : pujas.length === 0 ? (
            <div className="py-16 text-center text-xs text-stone-500 space-y-2">
              <Sparkles className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <p className="font-bold text-stone-800 text-sm">No Pujas found in catalog</p>
              <p className="text-stone-400">Click &quot;Seed Default Catalog&quot; to populate authentic Vedic ceremonies.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-stone-50 text-stone-500 uppercase text-[10px] font-bold border-b border-stone-200 tracking-wider">
                  <tr>
                    <th className="p-4">Puja Title</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Base Dakshina</th>
                    <th className="p-4">Samagri Kit</th>
                    <th className="p-4">Duration</th>
                    <th className="p-4">Purohits Req.</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {pujas.map((p) => (
                    <tr key={p.id} className="hover:bg-stone-50/80 transition">
                      <td className="p-4 font-bold text-stone-900">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          <span>{p.title}</span>
                        </div>
                        <span className="text-[10px] font-mono text-stone-400 block mt-0.5">
                          slug: /{p.slug}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="px-2.5 py-0.5 rounded-lg bg-stone-100 text-stone-800 font-semibold text-[11px]">
                          {p.category?.name || 'Vedic Rituals'}
                        </span>
                      </td>

                      <td className="p-4 font-bold text-stone-900">
                        ₹{Number(p.basePrice || 0).toLocaleString()}
                      </td>

                      <td className="p-4 font-semibold text-emerald-700">
                        ₹{Number(p.samagriPrice || 0).toLocaleString()}
                      </td>

                      <td className="p-4 text-stone-600 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        <span>{p.durationMinutes} mins</span>
                      </td>

                      <td className="p-4 text-stone-900 font-semibold">
                        {p.requiredPandits} Pandit
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            p.isActive
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-stone-100 text-stone-600 border border-stone-200'
                          }`}
                        >
                          {p.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Puja Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl text-xs text-stone-800 my-8">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" /> Add New Vedic Puja Service
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePuja} className="space-y-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Puja Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Maha Ganapati Havan & Pujan"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Category Name</label>
                  <input
                    type="text"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Base Dakshina (₹) *</label>
                  <input
                    type="number"
                    required
                    value={basePrice}
                    onChange={(e) => setBasePrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Samagri Kit Price (₹)</label>
                  <input
                    type="number"
                    value={samagriPrice}
                    onChange={(e) => setSamagriPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Brief Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Significance and auspicious benefits of this ceremony..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Required Samagri Items (comma separated)</label>
                <input
                  type="text"
                  value={samagriItems}
                  onChange={(e) => setSamagriItems(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-600"
                />
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
                  <span>Save Puja to Catalog</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
