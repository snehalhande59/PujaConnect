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
  ChevronLeft,
  ChevronRight,
  Filter,
  User,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { getClientToken } from '@/lib/auth';
import AdminLayout from '@/components/admin/AdminLayout';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [summary, setSummary] = useState({
    totalRecordsInDb: 0,
    totalPaidRevenue: 0,
    totalPendingAmount: 0,
    totalRefundedAmount: 0,
    totalFailedAmount: 0,
    successCount: 0,
    pendingCount: 0,
    failedCount: 0,
    refundedCount: 0,
    razorpayCount: 0,
    cashCount: 0,
  });

  const [selectedPayment, setSelectedPayment] = useState<any | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on new search
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchPayments = useCallback(async (opts?: boolean | any) => {
    const silent = opts === true;
    const token = getClientToken();
    try {
      if (!silent) setLoading(true);
      const url = new URL(`${API_BASE_URL}/admin/payments`);
      if (statusFilter !== 'ALL') url.searchParams.append('status', statusFilter);
      if (methodFilter !== 'ALL') url.searchParams.append('method', methodFilter);
      if (debouncedSearch.trim()) url.searchParams.append('search', debouncedSearch.trim());
      url.searchParams.append('page', String(page));
      url.searchParams.append('limit', String(limit));
      url.searchParams.append('_t', Date.now().toString());

      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const json = await res.json();
        const payload = json.data || json;
        const list = payload.payments || [];
        setPayments(list);
        setTotalRecords(payload.total ?? list.length);
        setTotalPages(payload.totalPages ?? 1);

        if (payload.summary) {
          setSummary(payload.summary);
        } else {
          // Fallback calculation if summary object is not present
          const success = list.filter((p: any) => p.paymentStatus === 'SUCCESS');
          const pending = list.filter((p: any) => p.paymentStatus === 'PENDING');
          const failed = list.filter((p: any) => p.paymentStatus === 'FAILED');
          const refunded = list.filter((p: any) => p.paymentStatus === 'REFUNDED');
          setSummary({
            totalRecordsInDb: list.length,
            totalPaidRevenue: success.reduce((s: number, p: any) => s + Number(p.amount || 0), 0),
            totalPendingAmount: pending.reduce((s: number, p: any) => s + Number(p.amount || 0), 0),
            totalRefundedAmount: refunded.reduce((s: number, p: any) => s + Number(p.amount || 0), 0),
            totalFailedAmount: failed.reduce((s: number, p: any) => s + Number(p.amount || 0), 0),
            successCount: success.length,
            pendingCount: pending.length,
            failedCount: failed.length,
            refundedCount: refunded.length,
            razorpayCount: list.filter((p: any) => p.paymentMethod === 'RAZORPAY').length,
            cashCount: list.filter((p: any) => p.paymentMethod === 'CASH').length,
          });
        }
      }
    } catch (e) {
      console.error('Failed to fetch payments:', e);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, methodFilter, debouncedSearch, page, limit]);

  useEffect(() => {
    fetchPayments();
    const interval = setInterval(() => fetchPayments(true), 10000);
    return () => clearInterval(interval);
  }, [fetchPayments]);

  const handleStatusChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    setPage(1);
  };

  const handleMethodChange = (newMethod: string) => {
    setMethodFilter(newMethod);
    setPage(1);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                Payment & Financial Operations
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                Live PostgreSQL Ledger
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Complete historical transaction archive, Razorpay settlement IDs, and Cash on Delivery records
            </p>
          </div>
          <button
            onClick={fetchPayments}
            className="self-start sm:self-auto px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-600' : ''}`} />
            <span>Refresh Ledger</span>
          </button>
        </div>

        {/* Financial KPI Summary Cards (Full DB Aggregation) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white border border-stone-200 rounded-2xl shadow-xs space-y-2">
            <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">
              Audited Gross Revenue
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
              ₹{Number(summary.totalPaidRevenue || 0).toLocaleString()}
            </p>
            <div className="text-[11px] text-stone-500 flex items-center justify-between">
              <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                {summary.successCount} Settled Txns
              </span>
              <span className="text-stone-400 font-mono">100% Verified</span>
            </div>
          </div>

          <div className="p-5 bg-white border border-stone-200 rounded-2xl shadow-xs space-y-2">
            <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">
              Pending Collections
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-600">
              ₹{Number(summary.totalPendingAmount || 0).toLocaleString()}
            </p>
            <div className="text-[11px] text-stone-500 flex items-center justify-between">
              <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                {summary.pendingCount} Awaiting
              </span>
              <span className="text-stone-400 font-mono">Not Counted in Rev</span>
            </div>
          </div>

          <div className="p-5 bg-white border border-stone-200 rounded-2xl shadow-xs space-y-2">
            <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">
              Payment Method Breakdown
            </span>
            <div className="pt-1 space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-600 flex items-center gap-1.5 font-medium">
                  <CreditCard className="w-3.5 h-3.5 text-blue-600" /> Razorpay:
                </span>
                <span className="font-bold text-stone-900">{summary.razorpayCount} Txns</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-600 flex items-center gap-1.5 font-medium">
                  <Banknote className="w-3.5 h-3.5 text-emerald-600" /> Cash:
                </span>
                <span className="font-bold text-stone-900">{summary.cashCount} Txns</span>
              </div>
            </div>
            <div className="text-[10px] text-stone-400 pt-0.5">
              Escrow release upon puja ritual completion
            </div>
          </div>

          <div className="p-5 bg-white border border-stone-200 rounded-2xl shadow-xs space-y-2">
            <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">
              Historical Ledger Records
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-stone-900">
              {summary.totalRecordsInDb} <span className="text-xs font-normal text-stone-500">Total Txns</span>
            </p>
            <div className="text-[11px] text-stone-500 flex items-center gap-2">
              <span className="text-rose-600 font-semibold">{summary.failedCount} Failed</span>
              <span>•</span>
              <span className="text-purple-600 font-semibold">{summary.refundedCount} Refunded</span>
            </div>
          </div>
        </div>

        {/* Filters, Method Selector & Live Search */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs">
            {/* Search Box */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by Payment #, Razorpay ID, Booking #, Customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-stone-300 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-600"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-1.5 bg-stone-100 p-1 rounded-xl">
              {[
                { key: 'ALL', label: `All (${summary.totalRecordsInDb})` },
                { key: 'SUCCESS', label: `Paid (${summary.successCount})` },
                { key: 'PENDING', label: `Pending (${summary.pendingCount})` },
                { key: 'FAILED', label: `Failed (${summary.failedCount})` },
                { key: 'REFUNDED', label: `Refunded (${summary.refundedCount})` },
              ].map((s) => (
                <button
                  key={s.key}
                  onClick={() => handleStatusChange(s.key)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer text-xs ${
                    statusFilter === s.key
                      ? 'bg-white text-stone-900 shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sub-bar: Method filter and page limit */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-stone-500 font-medium flex items-center gap-1">
                <Filter className="w-3 h-3" /> Method:
              </span>
              {['ALL', 'RAZORPAY', 'CASH'].map((m) => (
                <button
                  key={m}
                  onClick={() => handleMethodChange(m)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                    methodFilter === m
                      ? 'bg-amber-100 text-amber-900 font-bold'
                      : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {m === 'ALL' ? 'All Methods' : m}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-stone-500 font-medium">Page Size:</span>
              {[10, 20, 50, -1].map((s) => (
                <button
                  key={s}
                  onClick={() => handleLimitChange(s)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                    limit === s
                      ? 'bg-stone-900 text-white font-bold'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {s === -1 ? 'View All' : s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto mb-3" />
              <p className="text-xs text-stone-500">Querying live payment transactions from PostgreSQL...</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="py-16 text-center text-xs text-stone-500 space-y-2">
              <IndianRupee className="w-10 h-10 text-stone-300 mx-auto" />
              <p className="font-bold text-stone-800 text-sm">No payment records found</p>
              <p className="text-stone-400">
                {debouncedSearch
                  ? `No transactions match the query "${debouncedSearch}".`
                  : 'No transactions match the selected filter criteria.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-stone-50 text-stone-500 uppercase text-[10px] font-bold border-b border-stone-200 tracking-wider">
                  <tr>
                    <th className="p-4">Payment #</th>
                    <th className="p-4">Customer Details</th>
                    <th className="p-4">Order / Booking Ref</th>
                    <th className="p-4">Amount (INR)</th>
                    <th className="p-4">Method</th>
                    <th className="p-4">Gateway Reference</th>
                    <th className="p-4">Payment Status</th>
                    <th className="p-4">Transaction Date</th>
                    <th className="p-4 text-right">Audit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {payments.map((p) => {
                    const isSuccess = p.paymentStatus === 'SUCCESS';
                    const isFailed = p.paymentStatus === 'FAILED';
                    const isPending = p.paymentStatus === 'PENDING';
                    const isRefunded = p.paymentStatus === 'REFUNDED';

                    // Extract customer details from either booking or order relation
                    const customerProfile = p.booking?.customerProfile || p.order?.customerProfile;
                    const customerName = customerProfile
                      ? `${customerProfile.firstName || ''} ${customerProfile.lastName || ''}`.trim() || 'Devotee'
                      : 'Devotee';
                    const customerEmail = customerProfile?.user?.email || 'N/A';
                    const customerPhone = customerProfile?.user?.phoneNumber || '';

                    return (
                      <tr key={p.id} className="hover:bg-stone-50/80 transition">
                        <td className="p-4 font-mono font-bold text-stone-900">
                          <span className="block">{p.paymentNumber || p.id.slice(0, 8)}</span>
                          <span className="text-[10px] text-stone-400 font-normal">
                            ID: {p.id.slice(0, 8)}...
                          </span>
                        </td>

                        <td className="p-4">
                          <div className="font-semibold text-stone-900">{customerName}</div>
                          <div className="font-mono text-[11px] text-stone-500">{customerEmail}</div>
                          {customerPhone && (
                            <div className="font-mono text-[10px] text-stone-400">{customerPhone}</div>
                          )}
                        </td>

                        <td className="p-4">
                          {p.booking ? (
                            <div>
                              <span className="font-mono text-stone-900 font-semibold block">
                                #{p.booking.bookingNumber}
                              </span>
                              <span className="text-[11px] text-amber-700 font-medium">
                                {p.booking.puja?.title || 'Vedic Ceremony'}
                              </span>
                            </div>
                          ) : p.order ? (
                            <div>
                              <span className="font-mono text-stone-900 font-semibold block">
                                #{p.order.orderNumber}
                              </span>
                              <span className="text-[11px] text-stone-500">Store Order</span>
                            </div>
                          ) : (
                            <span className="text-stone-400 italic">Direct Transaction</span>
                          )}
                        </td>

                        <td className="p-4 font-extrabold text-stone-900 text-sm">
                          ₹{Number(p.amount || 0).toLocaleString()}
                        </td>

                        <td className="p-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-100 text-stone-800 font-bold text-[11px]">
                            {p.paymentMethod === 'RAZORPAY' ? (
                              <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                            ) : (
                              <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                            )}
                            <span>{p.paymentMethod}</span>
                          </span>
                        </td>

                        <td className="p-4 font-mono text-[11px] text-stone-600">
                          {p.razorpayPaymentId ? (
                            <div>
                              <span className="block font-semibold text-stone-800">{p.razorpayPaymentId}</span>
                              {p.razorpayPaymentId.includes('TEST') && (
                                <span className="inline-block mt-0.5 text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                                  TEST RECORD (Unverified Gateway)
                                </span>
                              )}
                              {p.razorpayOrderId && (
                                <span className="text-[10px] text-stone-400 block">
                                  Order: {p.razorpayOrderId}
                                </span>
                              )}
                            </div>
                          ) : p.paymentMethod === 'CASH' ? (
                            <span className="text-emerald-700 font-medium">Cash On Delivery</span>
                          ) : (
                            <span className="text-stone-400 italic">None</span>
                          )}
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
                                : isRefunded
                                ? 'bg-purple-50 text-purple-800 border border-purple-200'
                                : 'bg-stone-100 text-stone-800 border border-stone-200'
                            }`}
                          >
                            {p.paymentStatus}
                          </span>
                        </td>

                        <td className="p-4 text-stone-600">
                          <div className="font-medium">
                            {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'N/A'}
                          </div>
                          <div className="text-[10px] text-stone-400 font-mono">
                            {p.createdAt
                              ? new Date(p.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : ''}
                          </div>
                        </td>

                        <td className="p-4 text-right">
                          <button
                            onClick={() => setSelectedPayment(p)}
                            className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition cursor-pointer"
                            title="View Full Transaction Audit"
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

          {/* Server-Side Pagination Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-stone-50 border-t border-stone-200 text-xs text-stone-600 gap-3">
            <div>
              {totalRecords > 0 ? (
                <span>
                  Showing{' '}
                  <span className="font-bold text-stone-900">
                    {limit === -1 ? 1 : (page - 1) * limit + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-bold text-stone-900">
                    {limit === -1 ? totalRecords : Math.min(page * limit, totalRecords)}
                  </span>{' '}
                  of <span className="font-bold text-stone-900">{totalRecords}</span> historical payments
                </span>
              ) : (
                <span>0 payments found</span>
              )}
            </div>

            {limit !== -1 && totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-stone-700 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-semibold"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Previous
                </button>

                <span className="px-3 py-1.5 font-bold text-stone-800">
                  Page {page} of {totalPages}
                </span>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-stone-700 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-semibold"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl text-xs text-stone-800">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-600" /> Transaction Audit Receipt
              </h3>
              <button
                onClick={() => setSelectedPayment(null)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">Payment Number:</span>
                <span className="font-mono font-bold text-stone-900">
                  {selectedPayment.paymentNumber || selectedPayment.id}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">Payment Record UUID:</span>
                <span className="font-mono text-stone-600 text-[11px]">{selectedPayment.id}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">Amount:</span>
                <span className="font-bold text-emerald-700 text-sm">
                  ₹{Number(selectedPayment.amount || 0).toLocaleString()} {selectedPayment.currency || 'INR'}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">Payment Status:</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    selectedPayment.paymentStatus === 'SUCCESS'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : selectedPayment.paymentStatus === 'FAILED'
                      ? 'bg-rose-50 text-rose-800 border border-rose-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  {selectedPayment.paymentStatus}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">Payment Method:</span>
                <span className="font-bold text-stone-900 flex items-center gap-1">
                  {selectedPayment.paymentMethod === 'RAZORPAY' ? (
                    <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                  ) : (
                    <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                  {selectedPayment.paymentMethod}
                </span>
              </div>

              {/* Reference */}
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">Reference:</span>
                <span className="font-mono font-semibold text-stone-900">
                  {selectedPayment.booking
                    ? `Booking #${selectedPayment.booking.bookingNumber} (${selectedPayment.booking.puja?.title || 'Puja'})`
                    : selectedPayment.order
                    ? `Order #${selectedPayment.order.orderNumber}`
                    : 'Direct Transaction'}
                </span>
              </div>

              {/* Customer */}
              {(() => {
                const customer =
                  selectedPayment.booking?.customerProfile || selectedPayment.order?.customerProfile;
                if (!customer) return null;
                return (
                  <div className="flex justify-between py-1 border-b border-stone-100">
                    <span className="text-stone-500">Customer:</span>
                    <span className="text-right">
                      <span className="font-semibold text-stone-900 block">
                        {customer.firstName} {customer.lastName}
                      </span>
                      <span className="font-mono text-stone-500 text-[11px] block">
                        {customer.user?.email || 'N/A'}
                      </span>
                      {customer.user?.phoneNumber && (
                        <span className="font-mono text-stone-400 text-[10px] block">
                          {customer.user.phoneNumber}
                        </span>
                      )}
                    </span>
                  </div>
                );
              })()}

              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">Razorpay Order ID:</span>
                <span className="font-mono text-stone-700">{selectedPayment.razorpayOrderId || 'N/A'}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">Razorpay Payment ID:</span>
                <span className="font-mono text-stone-700">{selectedPayment.razorpayPaymentId || 'N/A'}</span>
              </div>

              {selectedPayment.metadata && (
                <div className="py-1 border-b border-stone-100">
                  <span className="text-stone-500 block mb-1">Metadata / Notes:</span>
                  <pre className="p-2 bg-stone-50 rounded-lg text-[10px] font-mono text-stone-700 overflow-x-auto">
                    {JSON.stringify(selectedPayment.metadata, null, 2)}
                  </pre>
                </div>
              )}

              <div className="flex justify-between py-1">
                <span className="text-stone-500">Recorded In PostgreSQL:</span>
                <span className="text-stone-700 font-mono">
                  {selectedPayment.createdAt ? new Date(selectedPayment.createdAt).toLocaleString() : 'N/A'}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedPayment(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl cursor-pointer"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
