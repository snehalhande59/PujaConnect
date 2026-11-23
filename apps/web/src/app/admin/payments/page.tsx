'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
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
  ShieldCheck,
  Calendar,
  Eye,
  X,
  FileText,
} from 'lucide-react';
import { getClientToken } from '@/lib/auth';
import AdminLayout from '@/components/admin/AdminLayout';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null);

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

  // Strict financial calculation from actual records
  const successfulPayments = payments.filter((p) => p.paymentStatus === 'SUCCESS');
  const totalSettledRevenue = successfulPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const pendingPayments = payments.filter((p) => p.paymentStatus === 'PENDING');
  const totalPendingAmount = pendingPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const failedPayments = payments.filter((p) => p.paymentStatus === 'FAILED');
  const refundedPayments = payments.filter((p) => p.paymentStatus === 'REFUNDED');
  const totalRefundedAmount = refundedPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const razorpayPayments = successfulPayments.filter((p) => p.paymentMethod === 'RAZORPAY');
  const cashPayments = successfulPayments.filter((p) => p.paymentMethod === 'CASH');

  const filteredPayments = payments.filter((p) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      p.paymentNumber?.toLowerCase().includes(s) ||
      p.razorpayPaymentId?.toLowerCase().includes(s) ||
      p.booking?.bookingNumber?.toLowerCase().includes(s) ||
      p.order?.orderNumber?.toLowerCase().includes(s)
    );
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
              Payment & Finance Operations
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Live PostgreSQL payment transactions, Razorpay gateway logs, and Cash collections
            </p>
          </div>
          <button
            onClick={fetchPayments}
            className="self-start sm:self-auto px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-600' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Financial KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white border border-stone-200 rounded-2xl shadow-xs space-y-2">
            <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">
              Audited Gross Revenue
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
              ₹{totalSettledRevenue.toLocaleString()}
            </p>
            <div className="text-[11px] text-stone-500">
              <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                {successfulPayments.length} Paid Txns
              </span>
              <span className="ml-1">• PostgreSQL Verified</span>
            </div>
          </div>

          <div className="p-5 bg-white border border-stone-200 rounded-2xl shadow-xs space-y-2">
            <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">
              Pending Collections
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-600">
              ₹{totalPendingAmount.toLocaleString()}
            </p>
            <div className="text-[11px] text-stone-500">
              <span className="font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                {pendingPayments.length} Awaiting Payment
              </span>
              <span className="ml-1">• Not counted in revenue</span>
            </div>
          </div>

          <div className="p-5 bg-white border border-stone-200 rounded-2xl shadow-xs space-y-2">
            <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">
              Payment Gateway Ratio
            </span>
            <p className="text-base font-bold text-stone-900 mt-1">
              Razorpay: {razorpayPayments.length} • Cash: {cashPayments.length}
            </p>
            <div className="text-[11px] text-stone-500">
              Escrow release upon successful ceremony completion
            </div>
          </div>

          <div className="p-5 bg-white border border-stone-200 rounded-2xl shadow-xs space-y-2">
            <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">
              Failed / Refunded
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-rose-600">
              {failedPayments.length}
            </p>
            <div className="text-[11px] text-stone-500">
              <span>{refundedPayments.length} Refunded (₹{totalRefundedAmount.toLocaleString()})</span>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Payment #, Razorpay ID, Booking #..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-stone-300 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-600"
            />
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-stone-100 p-1 rounded-xl">
            {['ALL', 'SUCCESS', 'PENDING', 'FAILED', 'REFUNDED'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  statusFilter === s ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {s === 'ALL' ? `All (${payments.length})` : s}
              </button>
            ))}
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto mb-3" />
              <p className="text-xs text-stone-500">Loading payment ledger from PostgreSQL...</p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="py-16 text-center text-xs text-stone-500 space-y-2">
              <IndianRupee className="w-10 h-10 text-stone-300 mx-auto" />
              <p className="font-bold text-stone-800 text-sm">No payment records found</p>
              <p className="text-stone-400">No transactions match the selected filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-stone-50 text-stone-500 uppercase text-[10px] font-bold border-b border-stone-200 tracking-wider">
                  <tr>
                    <th className="p-4">Payment Number</th>
                    <th className="p-4">Reference</th>
                    <th className="p-4">Amount (INR)</th>
                    <th className="p-4">Payment Method</th>
                    <th className="p-4">Gateway Reference</th>
                    <th className="p-4">Payment Status</th>
                    <th className="p-4">Transaction Date</th>
                    <th className="p-4 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredPayments.map((p) => {
                    const isSuccess = p.paymentStatus === 'SUCCESS';
                    const isFailed = p.paymentStatus === 'FAILED';
                    const isPending = p.paymentStatus === 'PENDING';

                    return (
                      <tr key={p.id} className="hover:bg-stone-50/80 transition">
                        <td className="p-4 font-mono font-bold text-stone-900">
                          {p.paymentNumber || p.id.slice(0, 8)}
                        </td>

                        <td className="p-4">
                          {p.booking ? (
                            <span className="font-mono text-stone-800 block font-semibold">
                              Booking #{p.booking.bookingNumber}
                            </span>
                          ) : p.order ? (
                            <span className="font-mono text-stone-800 block font-semibold">
                              Order #{p.order.orderNumber}
                            </span>
                          ) : (
                            <span className="text-stone-400 italic">Direct Ritual</span>
                          )}
                        </td>

                        <td className="p-4 font-extrabold text-stone-900">
                          ₹{Number(p.amount || 0).toLocaleString()}
                        </td>

                        <td className="p-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-stone-100 text-stone-800 font-bold text-[11px]">
                            {p.paymentMethod === 'RAZORPAY' ? (
                              <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                            ) : (
                              <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                            )}
                            <span>{p.paymentMethod}</span>
                          </span>
                        </td>

                        <td className="p-4 font-mono text-[11px] text-stone-500">
                          {p.razorpayPaymentId || p.razorpayOrderId || 'Cash On Delivery'}
                        </td>

                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block ${
                              isSuccess
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : isFailed
                                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                : isPending
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-stone-100 text-stone-800 border border-stone-200'
                            }`}
                          >
                            {p.paymentStatus}
                          </span>
                        </td>

                        <td className="p-4 text-stone-500">
                          {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'N/A'}
                        </td>

                        <td className="p-4 text-right">
                          <button
                            onClick={() => setSelectedPayment(p)}
                            className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition"
                            title="View Transaction Breakdown"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl text-xs text-stone-800">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-600" /> Transaction Receipt
              </h3>
              <button onClick={() => setSelectedPayment(null)} className="text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">Payment Number:</span>
                <span className="font-mono font-bold text-stone-900">{selectedPayment.paymentNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">Amount Settled:</span>
                <span className="font-bold text-emerald-700 text-sm">₹{Number(selectedPayment.amount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">Status:</span>
                <span className="font-bold uppercase text-stone-900">{selectedPayment.paymentStatus}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">Method:</span>
                <span className="font-bold text-stone-900">{selectedPayment.paymentMethod}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">Gateway Order ID:</span>
                <span className="font-mono text-stone-700">{selectedPayment.razorpayOrderId || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">Gateway Payment ID:</span>
                <span className="font-mono text-stone-700">{selectedPayment.razorpayPaymentId || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-stone-500">Recorded Date:</span>
                <span className="text-stone-700">{selectedPayment.createdAt ? new Date(selectedPayment.createdAt).toLocaleString() : 'N/A'}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedPayment(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
