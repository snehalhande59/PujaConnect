'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Loader2,
  IndianRupee,
  RefreshCw,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  CreditCard,
  Banknote,
  Smartphone,
} from 'lucide-react';
import { getClientToken } from '@/lib/auth';
import AdminLayout from '@/components/admin/AdminLayout';

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
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Payment Management
            </h1>
            <p className="text-xs text-stone-400">
              Live PostgreSQL payment transactions, Razorpay gateway logs, and Cash collections
            </p>
          </div>
          <button
            onClick={fetchPayments}
            className="self-start sm:self-auto px-3.5 py-2 bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 text-stone-300 hover:text-white transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 bg-stone-900 border border-stone-800 rounded-2xl">
            <span className="text-xs text-stone-400 block font-medium">Total Settled Revenue</span>
            <p className="text-2xl sm:text-3xl font-bold text-emerald-400 mt-1">
              ₹{totalAmount.toLocaleString()}
            </p>
            <span className="text-[10px] text-stone-500 mt-1 block">From verified ritual transactions</span>
          </div>
          <div className="p-5 bg-stone-900 border border-stone-800 rounded-2xl">
            <span className="text-xs text-stone-400 block font-medium">Logged Transactions</span>
            <p className="text-2xl sm:text-3xl font-bold text-white mt-1">{payments.length}</p>
            <span className="text-[10px] text-stone-500 mt-1 block">In PostgreSQL database</span>
          </div>
          <div className="p-5 bg-stone-900 border border-stone-800 rounded-2xl">
            <span className="text-xs text-stone-400 block font-medium">Escrow Protection</span>
            <p className="text-sm font-bold text-amber-300 mt-2 flex items-center gap-1.5">
              <span>Razorpay / UPI / Cash After Puja</span>
            </p>
            <span className="text-[10px] text-stone-500 mt-1 block">Released upon ceremony conclusion</span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2">
          {['ALL', 'SUCCESS', 'PENDING', 'FAILED'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                statusFilter === s
                  ? 'bg-amber-600 text-white'
                  : 'bg-stone-900 text-stone-400 hover:text-white hover:bg-stone-800 border border-stone-800'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Payments Table */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-3" />
              <p className="text-xs text-stone-400">Loading payment ledger from PostgreSQL...</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="py-16 text-center text-xs text-stone-400">
              <IndianRupee className="w-8 h-8 text-stone-600 mx-auto mb-2" />
              <p className="font-semibold text-stone-300">No payment records found</p>
              <p className="text-[11px] text-stone-500 mt-1">Check database transactions or adjust filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-300">
                <thead className="bg-stone-950 text-stone-400 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4">Transaction Reference</th>
                    <th className="p-4">Booking Number</th>
                    <th className="p-4">Dakshina Amount</th>
                    <th className="p-4">Payment Method</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800">
                  {payments.map((p) => {
                    const isSuccess = p.paymentStatus === 'SUCCESS';
                    const isPending = p.paymentStatus === 'PENDING';
                    const createdDate = p.createdAt ? new Date(p.createdAt).toLocaleString() : 'N/A';

                    return (
                      <tr key={p.id} className="hover:bg-stone-800/50 transition">
                        <td className="p-4">
                          <span className="font-mono text-amber-400 font-bold block">
                            {p.transactionId || p.razorpayPaymentId || p.id.slice(0, 12)}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-stone-300">
                          {p.booking?.bookingNumber || p.bookingId?.slice(0, 8) || 'N/A'}
                        </td>
                        <td className="p-4 font-bold text-white">
                          ₹{Number(p.amount || 0).toLocaleString()}
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded-lg bg-stone-800 text-stone-300 border border-stone-700 text-[10px] font-semibold">
                            {p.paymentMethod || 'ONLINE'}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isSuccess
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                                : isPending
                                ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                                : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                            }`}
                          >
                            {isSuccess ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Clock className="w-3 h-3 text-amber-400" />
                            )}
                            <span>{p.paymentStatus}</span>
                          </span>
                        </td>
                        <td className="p-4 text-stone-400">{createdDate}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
