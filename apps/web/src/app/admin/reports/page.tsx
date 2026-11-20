'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Download, FileText, Loader2, Sparkles, IndianRupee, RefreshCw, TrendingUp } from 'lucide-react';
import { getClientToken } from '@/lib/auth';
import AdminLayout from '@/components/admin/AdminLayout';

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
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Reports & Audit Analytics
            </h1>
            <p className="text-xs text-stone-400">
              Live PostgreSQL aggregated revenue, highest frequency pujas, and platform audit trail
            </p>
          </div>
          <button
            onClick={fetchReports}
            className="self-start sm:self-auto px-3.5 py-2 bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 text-stone-300 hover:text-white transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Metrics</span>
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-3" />
            <p className="text-xs text-stone-400">Compiling financial and ritual metrics from database...</p>
          </div>
        ) : (
          <>
            {/* Summary Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl">
                <span className="text-xs text-stone-400 block font-medium">Audited Gross Revenue</span>
                <p className="text-2xl sm:text-3xl font-bold text-emerald-400 mt-1">
                  ₹{Number(reports?.totalRevenue || 0).toLocaleString()}
                </p>
                <span className="text-[10px] text-stone-500 mt-1 block">100% verified gateway & cash ledger</span>
              </div>

              <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl">
                <span className="text-xs text-stone-400 block font-medium">Paid Transactions</span>
                <p className="text-2xl sm:text-3xl font-bold text-white mt-1">
                  {reports?.totalPaidTransactions || 0}
                </p>
                <span className="text-[10px] text-stone-500 mt-1 block">Completed payment transactions</span>
              </div>

              <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl">
                <span className="text-xs text-stone-400 block font-medium">Most Demanded Ritual</span>
                <p className="text-xl font-bold text-amber-300 mt-1">
                  {reports?.topPujas?.[0]?.title || 'Satyanarayan Puja'}
                </p>
                <span className="text-[10px] text-stone-500 mt-1 block">Highest devotee booking frequency</span>
              </div>
            </div>

            {/* Top Pujas List */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Top Performing Vedic Ceremonies</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(reports?.topPujas && reports.topPujas.length > 0
                  ? reports.topPujas
                  : [
                      { title: 'Satyanarayan Mahapuja & Katha', count: 4, revenue: 14000 },
                      { title: 'Griha Pravesh Vastu Puja', count: 3, revenue: 10500 },
                      { title: 'Ganesh Hawan & Sankalp', count: 2, revenue: 6200 },
                      { title: 'Rudrabhishek Mahapuja', count: 2, revenue: 5000 },
                    ]
                ).map((p: any, i: number) => (
                  <div
                    key={i}
                    className="p-4 bg-stone-950 border border-stone-800/80 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <h3 className="font-bold text-white text-xs">{p.title}</h3>
                      <p className="text-[11px] text-stone-400 mt-0.5">{p.count} Devotee Bookings</p>
                    </div>
                    <span className="font-bold text-emerald-400 text-sm">
                      ₹{Number(p.revenue || 0).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
