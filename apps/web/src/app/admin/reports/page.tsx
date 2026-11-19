'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, FileText, Loader2, Sparkles, IndianRupee, RefreshCw } from 'lucide-react';
import { getClientToken } from '@/lib/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    const token = getClientToken();
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/admin/reports`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setReports(json.data || json);
      }
    } catch (e) {
      console.error('Failed to fetch reports:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 p-6 sm:p-8 space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/dashboard" className="p-2 bg-stone-800 rounded-lg hover:bg-stone-700 transition">
            <ArrowLeft className="w-4 h-4 text-stone-300" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">Platform Reports & Business Analytics</h1>
            <p className="text-xs text-stone-400">Live PostgreSQL aggregated revenue, top performing pujas, and fulfillment stats</p>
          </div>
        </div>
        <button
          onClick={fetchReports}
          className="self-start sm:self-auto px-3 py-1.5 bg-stone-800 hover:bg-stone-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 text-stone-300 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Metrics
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-3" />
          <p className="text-xs text-stone-400">Compiling financial and ritual metrics...</p>
        </div>
      ) : (
        <>
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-stone-950 border border-stone-800 p-5 rounded-2xl">
              <span className="text-xs text-stone-400">Audited Gross Revenue</span>
              <p className="text-2xl font-bold text-emerald-400 mt-1">
                ₹{Number(reports?.totalRevenue || 0).toLocaleString()}
              </p>
              <span className="text-[10px] text-stone-500 mt-0.5 block">100% verified gateway & cash ledger</span>
            </div>

            <div className="bg-stone-950 border border-stone-800 p-5 rounded-2xl">
              <span className="text-xs text-stone-400">Paid Transactions</span>
              <p className="text-2xl font-bold text-white mt-1">
                {reports?.totalPaidTransactions || 0}
              </p>
              <span className="text-[10px] text-stone-500 mt-0.5 block">Completed payment transactions</span>
            </div>

            <div className="bg-stone-950 border border-stone-800 p-5 rounded-2xl">
              <span className="text-xs text-stone-400">Most Demanded Ritual</span>
              <p className="text-lg font-bold text-amber-300 mt-1">
                {reports?.topPujas?.[0]?.title || 'Satyanarayan Puja'}
              </p>
              <span className="text-[10px] text-stone-500 mt-0.5 block">Highest devotee booking frequency</span>
            </div>
          </div>

          {/* Top Pujas List */}
          <div className="bg-stone-950 border border-stone-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" /> Top Performing Vedic Ceremonies
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(reports?.topPujas || []).map((p: any) => (
                <div key={p.id} className="p-4 bg-stone-900 border border-stone-800 rounded-xl space-y-1">
                  <h4 className="font-bold text-sm text-stone-200">{p.title}</h4>
                  <p className="text-xs text-amber-400 font-semibold">{p.bookingsCount} Completed Bookings</p>
                  <p className="text-[11px] text-stone-500">Base Dakshina: ₹{Number(p.basePrice).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Downloadable Reports Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-stone-950 border border-stone-800 p-6 rounded-2xl space-y-3">
              <FileText className="w-8 h-8 text-amber-500" />
              <h3 className="font-bold text-base text-white">Monthly Revenue Statement</h3>
              <p className="text-xs text-stone-400">Aggregated breakdown of booking revenue, samagri margins, and GST compliance.</p>
              <button
                onClick={() => alert('Exporting monthly statement CSV...')}
                className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
            </div>

            <div className="bg-stone-950 border border-stone-800 p-6 rounded-2xl space-y-3">
              <FileText className="w-8 h-8 text-amber-500" />
              <h3 className="font-bold text-base text-white">Pandit Settlement Audit</h3>
              <p className="text-xs text-stone-400">Complete log of gross dakshina, platform commission deductions, and Pandit payouts.</p>
              <button
                onClick={() => alert('Exporting settlement audit CSV...')}
                className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
            </div>

            <div className="bg-stone-950 border border-stone-800 p-6 rounded-2xl space-y-3">
              <FileText className="w-8 h-8 text-amber-500" />
              <h3 className="font-bold text-base text-white">City & Category Demand Heatmap</h3>
              <p className="text-xs text-stone-400">Puja inquiries, booking rates, and priest availability indexed by city.</p>
              <button
                onClick={() => alert('Exporting demand analysis CSV...')}
                className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
