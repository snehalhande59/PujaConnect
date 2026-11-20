'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
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
} from 'lucide-react';
import { getClientToken } from '@/lib/auth';
import AdminLayout from '@/components/admin/AdminLayout';

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
        setMsg({ type: 'success', text: 'Vedic categories and default puja catalog successfully seeded!' });
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
        setMsg({ type: 'success', text: `Puja '${title}' successfully added to PostgreSQL database with complete ritual steps.` });
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Puja Management
            </h1>
            <p className="text-xs text-stone-400">
              Live Vedic rituals catalog, base dakshina, duration, and samagri kit fees in PostgreSQL
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchPujas}
              className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 text-stone-300 hover:text-white transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleInitializeCatalog}
              disabled={initializing}
              className="px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Sparkles className={`w-3.5 h-3.5 ${initializing ? 'animate-spin' : ''}`} />
              <span>{initializing ? 'Seeding Catalog...' : 'Seed Default Catalog'}</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold rounded-xl text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Puja</span>
            </button>
          </div>
        </div>

        {msg && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center justify-between ${
              msg.type === 'success'
                ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/80 border border-rose-500/40 text-rose-200'
            }`}
          >
            <span>{msg.text}</span>
            <button onClick={() => setMsg(null)} className="underline text-[10px] cursor-pointer">
              Dismiss
            </button>
          </div>
        )}

        {/* Pujas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full py-20 text-center">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-3" />
              <p className="text-xs text-stone-400">Loading rituals catalog from database...</p>
            </div>
          ) : pujas.length === 0 ? (
            <div className="col-span-full py-16 text-center text-xs text-stone-400">
              <Sparkles className="w-8 h-8 text-stone-600 mx-auto mb-2" />
              <p className="font-semibold text-stone-300">No rituals found</p>
              <p className="text-[11px] text-stone-500 mt-1">Click &apos;Add New Puja&apos; to create your first ritual catalog item.</p>
            </div>
          ) : (
            pujas.map((p) => (
              <div
                key={p.id}
                className="bg-stone-900 border border-stone-800 hover:border-amber-500/40 rounded-2xl p-5 space-y-4 shadow-sm transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-600/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                    ACTIVE
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-white text-base leading-snug">{p.title}</h3>
                  <p className="text-xs text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                    {p.description || 'Authentic Vedic ceremony performed by Gurukul-trained Purohits with complete Vidhi.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-stone-800 text-xs">
                  <div>
                    <span className="text-stone-500 text-[10px] block">Base Dakshina</span>
                    <span className="font-bold text-white text-sm">
                      ₹{Number(p.basePrice || 3501).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-500 text-[10px] block">Samagri Kit</span>
                    <span className="font-bold text-amber-300 text-sm">
                      ₹{Number(p.samagriPrice || 1100).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-800/60 text-[11px] text-stone-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-stone-500" />
                    <span>{p.durationMinutes || 120} Mins</span>
                  </span>
                  <span className="font-mono text-stone-500 text-[10px]">
                    /{p.slug}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Puja Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
                  <Sparkles className="w-5 h-5" />
                  <span>Add New Puja to Catalog</span>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreatePuja} className="space-y-4">
                <div>
                  <label className="text-xs text-stone-300 font-medium block mb-1">
                    Puja Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Navchandi Hawan & Mahapuja"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="text-xs text-stone-300 font-medium block mb-1">
                    Description & Shastric Significance
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Brief description of the ritual and auspicious occasions..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs text-stone-300 font-medium block mb-1">
                      Dakshina (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min={500}
                      value={basePrice}
                      onChange={(e) => setBasePrice(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-amber-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-stone-300 font-medium block mb-1">
                      Samagri Kit (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={samagriPrice}
                      onChange={(e) => setSamagriPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-amber-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-stone-300 font-medium block mb-1">
                      Duration (Mins)
                    </label>
                    <input
                      type="number"
                      min={30}
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-amber-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-stone-300 font-medium block mb-1">
                      Pandits Required
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={11}
                      value={requiredPandits}
                      onChange={(e) => setRequiredPandits(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-amber-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-stone-300 font-medium block mb-1">
                    Essential Puja Samagri List (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={samagriItems}
                    onChange={(e) => setSamagriItems(e.target.value)}
                    placeholder="Ganga Jal, Roli, Akshat, Supari, Hawan Samagri, Pure Ghee..."
                    className="w-full px-3.5 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="text-xs text-stone-300 font-medium block mb-1">
                    Authentic Ritual Execution Steps
                  </label>
                  <textarea
                    rows={4}
                    value={ritualSteps}
                    onChange={(e) => setRitualSteps(e.target.value)}
                    placeholder="1. Sankalpa & Kalash Sthapana&#10;2. Gauri Ganesh Pujan&#10;3. Navgraha Avahanam&#10;4. Mukhya Puja & Hawan&#10;5. Maha Aarti"
                    className="w-full px-3.5 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-600 font-mono text-[11px]"
                  />
                </div>

                <div className="pt-3 border-t border-stone-800 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold rounded-xl text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Save to PostgreSQL</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
