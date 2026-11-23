'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Download,
  FileText,
  Loader2,
  Sparkles,
  IndianRupee,
  RefreshCw,
  TrendingUp,
  Calendar,
  CheckCircle2,
  BarChart3,
} from 'lucide-react';
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

  // Export CSV Helper
  const exportToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      alert('No records available to export.');
      return;
    }
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map((row) =>
        headers
          .map((fieldName) => {
            let val = row[fieldName];
            if (val === null || val === undefined) return '""';
            if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
            return `"${String(val).replace(/"/g, '""')}"`;
          })
          .join(',')
      ),
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportRecentBookings = () => {
    if (!reports?.recentBookings || reports.recentBookings.length === 0) {
      alert('No booking records to export.');
      return;
    }
    const formatted = reports.recentBookings.map((b: any) => ({
      BookingNumber: b.bookingNumber,
      Devotee: b.customerProfile ? `${b.customerProfile.firstName} ${b.customerProfile.lastName}` : 'N/A',
      Purohit: b.panditProfile?.fullName || 'Unassigned',
      Puja: b.puja?.title || 'Ritual',
      City: b.city,
      Amount: b.totalAmount,
      Status: b.status,
      CreatedAt: b.createdAt,
    }));
    exportToCSV(formatted, 'devsutra_bookings_report');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
              Business Intelligence & Audit Reports
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Live PostgreSQL aggregated revenue, highest frequency pujas, and platform audit trail
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchReports}
              className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-600' : ''}`} />
              <span>Refresh Metrics</span>
            </button>

            <button
              onClick={handleExportRecentBookings}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-24 text-center bg-white rounded-2xl border border-stone-200 shadow-xs">
            <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto mb-3" />
            <p className="text-xs text-stone-500">Compiling financial and ritual metrics from PostgreSQL...</p>
          </div>
        ) : (
          <>
            {/* Summary Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-stone-200 p-5 rounded-2xl shadow-xs space-y-2">
                <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">
                  Audited Gross Revenue
                </span>
                <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
                  ₹{Number(reports?.totalRevenue || 0).toLocaleString()}
                </p>
                <span className="text-[11px] text-stone-500 block">
                  100% verified gateway & cash ledger
                </span>
              </div>

              <div className="bg-white border border-stone-200 p-5 rounded-2xl shadow-xs space-y-2">
                <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">
                  Paid Transactions
                </span>
                <p className="text-2xl sm:text-3xl font-extrabold text-stone-900">
                  {reports?.totalPaidTransactions || 0}
                </p>
                <span className="text-[11px] text-stone-500 block">
                  Completed payment transactions in database
                </span>
              </div>

              <div className="bg-white border border-stone-200 p-5 rounded-2xl shadow-xs space-y-2">
                <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">
                  Most Demanded Ritual
                </span>
                <p className="text-xl font-bold text-amber-800">
                  {reports?.topPujas?.[0]?.title || 'None logged yet'}
                </p>
                <span className="text-[11px] text-stone-500 block">
                  Highest devotee booking frequency
                </span>
              </div>
            </div>

            {/* Top Pujas List */}
            <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Top Performing Vedic Ceremonies</span>
                  </h2>
                  <p className="text-xs text-stone-500">Rituals with highest customer booking demand</p>
                </div>
              </div>

              {reports?.topPujas && reports.topPujas.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reports.topPujas.map((p: any, i: number) => (
                    <div
                      key={p.id || i}
                      className="p-4 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <h3 className="font-bold text-stone-900 text-xs">{p.title}</h3>
                        <p className="text-[11px] text-stone-500 mt-0.5">{p.bookingsCount} Devotee Bookings</p>
                      </div>
                      <span className="font-extrabold text-emerald-700 text-sm">
                        ₹{Number(p.basePrice || 0).toLocaleString()} base
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-stone-400 bg-stone-50 rounded-xl border border-stone-100">
                  No bookings logged for ceremony frequency ranking yet.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
