'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, IndianRupee, RefreshCw, CheckCircle2, Clock, XCircle, Search } from 'lucide-react';
import { getClientToken } from '@/lib/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchPayments = useCallback(async () => {
    const token = getClientToken();
    try {
      setLoading(true);
      const url = new URL(`${API_BASE_URL}/admin/payments`);
      if (statusFilter !== 'ALL') url.searchParams.append('status', statusFilter);

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        const data = json.data?.payments || json.payments || json.data || [];
        setPayments(data);
      }
    } catch (e) {
      console.error('Failed to fetch payments:', e);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const totalAmount = payments
    .filter((p) => p.paymentStatus === 'SUCCESS')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 p-6 sm:p-8 space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/dashboard" className="p-2 bg-stone-800 rounded-lg hover:bg-stone-700 transition">
            <ArrowLeft className="w-4 h-4 text-stone-300" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">Payment Transactions & Gateway Logs</h1>
            <p className="text-xs text-stone-400">Live PostgreSQL transaction logs, Razorpay order IDs and Cash collection</p>
          </div>
        </div>
        <button
          onClick={fetchPayments}
          className="self-start sm:self-auto px-3 py-1.5 bg-stone-800 hover:bg-stone-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 text-stone-300 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-stone-950 border border-stone-800 rounded-xl">
          <span className="text-xs text-stone-400">Total Settled Revenue</span>
          <p className="text-2xl font-bold text-emerald-400 mt-1">₹{totalAmount.toLocaleString()}</p>
        </div>
        <div className="p-4 bg-stone-950 border border-stone-800 rounded-xl">
          <span className="text-xs text-stone-400">Total Logged Transactions</span>
          <p className="text-2xl font-bold text-white mt-1">{payments.length}</p>
        </div>
        <div className="p-4 bg-stone-950 border border-stone-800 rounded-xl">
          <span className="text-xs text-stone-400">Supported Gateways</span>
          <p className="text-sm font-bold text-amber-300 mt-1">Razorpay / UPI / Cash After Puja</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {['ALL', 'SUCCESS', 'PENDING', 'FAILED'].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              statusFilter === s
                ? 'bg-amber-600 text-white'
                : 'bg-stone-950 text-stone-400 hover:bg-stone-800 border border-stone-800'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Payments Table */}
      <div className="bg-stone-950 border border-stone-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-3" />
            <p className="text-xs text-stone-400">Loading transactions from database...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="py-16 text-center text-xs text-stone-400">
            <IndianRupee className="w-8 h-8 text-stone-600 mx-auto mb-2" />
            <p className="font-semibold text-stone-300">No payment transactions found</p>
            <p className="text-[11px] text-stone-500 mt-1">Payments made through the checkout will automatically appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-300">
              <thead className="bg-stone-800 text-stone-400 uppercase text-[10px]">
                <tr>
                  <th className="p-4">Payment Ref</th>
                  <th className="p-4">Booking Ref</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Payment Method</th>
                  <th className="p-4">Gateway Order / Txn ID</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800">
                {payments.map((p) => {
                  const bookingRef = p.booking?.bookingNumber || p.bookingId || 'N/A';
                  const isSuccess = p.paymentStatus === 'SUCCESS';
                  const isPending = p.paymentStatus === 'PENDING';

                  return (
                    <tr key={p.id} className="hover:bg-stone-900/60 transition">
                      <td className="p-4 font-mono font-bold text-white">{p.paymentNumber}</td>
                      <td className="p-4 font-mono text-amber-300">{bookingRef}</td>
                      <td className="p-4 font-bold text-emerald-400">₹{Number(p.amount).toLocaleString()}</td>
                      <td className="p-4 font-semibold text-stone-200">{p.paymentMethod}</td>
                      <td className="p-4 font-mono text-[11px] text-stone-400">
                        {p.razorpayPaymentId || p.razorpayOrderId || 'Local Ref'}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isSuccess
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : isPending
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {p.paymentStatus}
                        </span>
                      </td>
                      <td className="p-4 text-stone-400">{new Date(p.createdAt).toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
