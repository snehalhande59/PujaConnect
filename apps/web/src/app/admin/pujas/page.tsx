'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Loader2, Sparkles, RefreshCw, X } from 'lucide-react';
import { getClientToken } from '@/lib/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export default function AdminPujasPage() {
  const [pujas, setPujas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState(3501);
  const [samagriPrice, setSamagriPrice] = useState(1100);
  const [durationMinutes, setDurationMinutes] = useState(120);

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

  const handleCreatePuja = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const token = getClientToken();
    try {
      setSaving(true);
      const res = await fetch(`${API_BASE_URL}/admin/pujas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          basePrice: Number(basePrice),
          samagriPrice: Number(samagriPrice),
          durationMinutes: Number(durationMinutes),
          languages: ['Hindi', 'Sanskrit', 'Marathi'],
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
    <div className="min-h-screen bg-stone-900 text-stone-100 p-6 sm:p-8 space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/dashboard" className="p-2 bg-stone-800 rounded-lg hover:bg-stone-700 transition">
            <ArrowLeft className="w-4 h-4 text-stone-300" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">Puja Catalog Management</h1>
            <p className="text-xs text-stone-400">Live rituals catalog, pricing, duration, and samagri kit fees</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchPujas}
            className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 text-stone-300 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition"
          >
            <Plus className="w-4 h-4" /> Add New Puja
          </button>
        </div>
      </div>

      {msg && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center justify-between ${
            msg.type === 'success' ? 'bg-emerald-950/80 border border-emerald-600 text-emerald-200' : 'bg-rose-950/80 border border-rose-600 text-rose-200'
          }`}
        >
          <span>{msg.text}</span>
          <button onClick={() => setMsg(null)} className="underline text-[10px]">Dismiss</button>
        </div>
      )}

      {/* Pujas Table */}
      <div className="bg-stone-950 border border-stone-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-3" />
            <p className="text-xs text-stone-400">Loading rituals from database...</p>
          </div>
        ) : pujas.length === 0 ? (
          <div className="py-16 text-center text-xs text-stone-400">
            <Sparkles className="w-8 h-8 text-stone-600 mx-auto mb-2" />
            <p className="font-semibold text-stone-300">No rituals found in catalog</p>
            <p className="text-[11px] text-stone-500 mt-1">Click &quot;Add New Puja&quot; to configure your first ceremony.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-300">
              <thead className="bg-stone-800 text-stone-400 uppercase text-[10px]">
                <tr>
                  <th className="p-4">Puja Title</th>
                  <th className="p-4">Slug / Ref</th>
                  <th className="p-4">Base Dakshina</th>
                  <th className="p-4">Samagri Fee</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800">
                {pujas.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-900/60 transition">
                    <td className="p-4">
                      <p className="font-bold text-white">{p.title}</p>
                      <p className="text-[11px] text-stone-400 line-clamp-1">{p.description}</p>
                    </td>
                    <td className="p-4 font-mono text-stone-400">{p.slug}</td>
                    <td className="p-4 font-bold text-emerald-400">₹{Number(p.basePrice).toLocaleString()}</td>
                    <td className="p-4 font-semibold text-amber-300">₹{Number(p.samagriPrice || 0).toLocaleString()}</td>
                    <td className="p-4 text-stone-300">{p.durationMinutes} Mins</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-stone-800 text-stone-500'
                      }`}>
                        {p.isActive ? 'Active' : 'Unpublished'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Puja Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-stone-950 border border-stone-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-bold text-white text-base">Add New Sacred Ceremony</h3>
              <button onClick={() => setShowAddModal(false)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePuja} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-stone-400 font-semibold mb-1">Puja Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Navgrah Shanti Hawan"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-stone-200 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-stone-400 font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Ceremony purpose and Shastric significance..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-stone-200 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-stone-400 font-semibold mb-1">Base Dakshina (₹)</label>
                  <input
                    type="number"
                    min="500"
                    value={basePrice}
                    onChange={(e) => setBasePrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-stone-200 focus:outline-none focus:border-amber-600"
                  />
                </div>
                <div>
                  <label className="block text-stone-400 font-semibold mb-1">Samagri Kit (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={samagriPrice}
                    onChange={(e) => setSamagriPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-stone-200 focus:outline-none focus:border-amber-600"
                  />
                </div>
                <div>
                  <label className="block text-stone-400 font-semibold mb-1">Duration (Min)</label>
                  <input
                    type="number"
                    min="30"
                    step="15"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-stone-200 focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-stone-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-stone-800 text-stone-400 rounded-xl hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{saving ? 'Saving...' : 'Save to Catalog'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
