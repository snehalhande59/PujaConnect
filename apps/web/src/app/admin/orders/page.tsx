'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Truck,
  CheckCircle2,
  Clock,
  Loader2,
  RefreshCw,
  Search,
  MapPin,
  Package,
  Edit,
  X,
  Check,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { getClientToken } from '@/lib/auth';
import AdminLayout from '@/components/admin/AdminLayout';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://pujaconnect-api-he9b.onrender.com/api/v1';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Edit Tracking Modal
  const [editingOrder, setEditingOrder] = useState<any | null>(null);
  const [inspectingOrder, setInspectingOrder] = useState<any | null>(null);
  const [trackingNumber, setTrackingNumber] = useState('');

  const fetchOrders = useCallback(async () => {
    const token = getClientToken();
    try {
      setLoading(true);
      const url = new URL(`${API_BASE_URL}/admin/orders`);
      if (search.trim()) url.searchParams.append('search', search.trim());
      if (statusFilter !== 'ALL') url.searchParams.append('status', statusFilter);

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        const data = json.data?.data || json.data || json || [];
        setOrders(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Failed to load orders:', e);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const token = getClientToken();
    try {
      const res = await fetch(`${API_BASE_URL}/admin/orders/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setMsg({ type: 'success', text: `Order status changed to ${newStatus}.` });
        fetchOrders();
      } else {
        const err = await res.json();
        setMsg({ type: 'error', text: err.message || 'Failed to update status.' });
      }
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message || 'Error updating order.' });
    }
  };

  const handleUpdateTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    const token = getClientToken();
    try {
      const res = await fetch(`${API_BASE_URL}/admin/orders/${editingOrder.id}/tracking`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ trackingNumber: trackingNumber.trim() }),
      });

      if (res.ok) {
        setMsg({ type: 'success', text: `Tracking number updated for Order #${editingOrder.orderNumber}.` });
        setEditingOrder(null);
        fetchOrders();
      }
    } catch (e: any) {
      alert(e.message || 'Error updating tracking.');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
              Orders & Logistics Fulfillment
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Live samagri kit orders dispatch, courier logistics tracking, and delivery timelines from PostgreSQL
            </p>
          </div>

          <button
            onClick={fetchOrders}
            className="self-start sm:self-auto px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-600' : ''}`} />
            <span>Refresh</span>
          </button>
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

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Order #, Customer, or Tracking #..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-stone-300 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-600"
            />
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-stone-100 p-1 rounded-xl">
            {['ALL', 'PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  statusFilter === s ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {s === 'ALL' ? `All (${orders.length})` : s}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto mb-3" />
              <p className="text-xs text-stone-500">Loading fulfillment orders from database...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-16 text-center text-xs text-stone-500 space-y-2">
              <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <p className="font-bold text-stone-800 text-sm">No e-commerce orders found</p>
              <p className="text-stone-400">Customer samagri orders placed through cart will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-stone-50 text-stone-500 uppercase text-[10px] font-bold border-b border-stone-200 tracking-wider">
                  <tr>
                    <th className="p-4">Order ID</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Total Amount</th>
                    <th className="p-4">Payment & Gateway</th>
                    <th className="p-4">Delivery City</th>
                    <th className="p-4">AWB Tracking</th>
                    <th className="p-4">Fulfillment Status</th>
                    <th className="p-4">Order Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {orders.map((o) => {
                    const custName = o.customerProfile
                      ? `${o.customerProfile.firstName} ${o.customerProfile.lastName}`
                      : 'Customer';
                    const city = o.shippingAddress?.city || 'India';

                    return (
                      <tr key={o.id} className="hover:bg-stone-50/80 transition">
                        <td className="p-4 font-mono font-bold text-stone-900">
                          {o.orderNumber || o.id.slice(0, 8)}
                        </td>

                        <td className="p-4">
                          <span className="font-bold text-stone-900 block">{custName}</span>
                          <span className="text-[11px] text-stone-400">{o.customerProfile?.user?.email || ''}</span>
                        </td>

                        <td className="p-4 font-extrabold text-stone-900">
                          ₹{Number(o.totalAmount || 0).toLocaleString()}
                        </td>

                        <td className="p-4">
                          {o.payments && o.payments.length > 0 ? (
                            <div>
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  o.payments[0].paymentStatus === 'SUCCESS'
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                    : o.payments[0].paymentStatus === 'FAILED'
                                    ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                                }`}
                              >
                                {o.payments[0].paymentStatus === 'SUCCESS' ? 'PAID' : o.payments[0].paymentStatus}
                              </span>
                              <span className="text-[10px] text-stone-400 font-mono block mt-0.5">
                                {o.payments[0].paymentNumber || o.payments[0].paymentMethod || 'Razorpay'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-stone-400 italic">COD / Direct</span>
                          )}
                        </td>

                        <td className="p-4 text-stone-600">
                          {city}
                        </td>

                        <td className="p-4 font-mono text-[11px]">
                          {o.trackingNumber ? (
                            <span className="flex items-center gap-1.5 text-stone-800 font-semibold">
                              <Truck className="w-3.5 h-3.5 text-amber-600" />
                              <span>{o.trackingNumber}</span>
                            </span>
                          ) : (
                            <span className="text-stone-400 italic">Unassigned</span>
                          )}
                        </td>

                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              o.status === 'DELIVERED'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : o.status === 'SHIPPED'
                                ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                : o.status === 'CANCELLED'
                                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {o.status === 'DELIVERED' ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Clock className="w-3 h-3 text-amber-600" />
                            )}
                            <span>{o.status}</span>
                          </span>
                        </td>

                        <td className="p-4 text-stone-500">
                          {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : 'N/A'}
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setInspectingOrder(o)}
                              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-[10px] font-bold inline-flex items-center gap-1"
                              title="Inspect Full Order"
                            >
                              <Eye className="w-3 h-3 text-amber-700" />
                              <span>Inspect</span>
                            </button>

                            <button
                              onClick={() => {
                                setEditingOrder(o);
                                setTrackingNumber(o.trackingNumber || '');
                              }}
                              className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 rounded-lg text-[10px] font-bold"
                              title="Update Courier AWB"
                            >
                              Track AWB
                            </button>

                            {o.status !== 'DELIVERED' && o.status !== 'CANCELLED' && (
                              <button
                                onClick={() => handleUpdateStatus(o.id, o.status === 'SHIPPED' ? 'DELIVERED' : 'SHIPPED')}
                                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10px] font-bold"
                              >
                                {o.status === 'SHIPPED' ? 'Mark Delivered' : 'Dispatch'}
                              </button>
                            )}
                          </div>
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

      {/* Edit Tracking Modal */}
      {editingOrder && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl text-xs text-stone-800">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-600" /> Courier AWB Tracking
              </h3>
              <button onClick={() => setEditingOrder(null)} className="text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-stone-600">
              Update Delhivery, BlueDart, DTDC, or Speed Post tracking number for Order #{editingOrder.orderNumber}:
            </p>

            <form onSubmit={handleUpdateTracking} className="space-y-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">AWB Tracking Number *</label>
                <input
                  type="text"
                  required
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. DELHIVERY-99882211"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-600 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold"
                >
                  Save Tracking Number
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspect Full Order Modal */}
      {inspectingOrder && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl text-xs text-stone-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
                  Shop Order Fulfillment Record
                </span>
                <h3 className="font-bold text-base text-stone-900">
                  Order #{inspectingOrder.orderNumber || inspectingOrder.id}
                </h3>
              </div>
              <button
                onClick={() => setInspectingOrder(null)}
                className="p-1 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status & Amount Summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                <span className="text-[11px] text-stone-500 block">Fulfillment Status</span>
                <span className="font-bold text-xs uppercase px-2 py-0.5 rounded-full inline-block bg-amber-100 text-amber-800">
                  {inspectingOrder.status}
                </span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                <span className="text-[11px] text-stone-500 block">Total Order Amount</span>
                <span className="font-extrabold text-base text-stone-900 block">
                  ₹{Number(inspectingOrder.totalAmount || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Customer & Shipping Details */}
            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
              <span className="font-bold text-stone-900 block">Customer & Delivery Address</span>
              <p className="font-semibold text-stone-800">
                {inspectingOrder.customerProfile?.firstName} {inspectingOrder.customerProfile?.lastName}
              </p>
              <p className="text-stone-600 font-mono text-[11px]">{inspectingOrder.customerProfile?.user?.email}</p>
              <p className="text-stone-600 font-mono text-[11px]">{inspectingOrder.customerProfile?.user?.phoneNumber}</p>
              <p className="text-stone-700 text-xs pt-1 border-t border-stone-200">
                📍 {inspectingOrder.shippingAddress?.addressLine1 || 'Shipping Address'},{' '}
                {inspectingOrder.shippingAddress?.city || 'Pune'} - {inspectingOrder.shippingAddress?.pincode || ''}
              </p>
            </div>

            {/* Payment Details */}
            <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-1.5">
              <span className="font-bold text-emerald-900 block">Payment Verification</span>
              {inspectingOrder.payments && inspectingOrder.payments.length > 0 ? (
                <div className="space-y-1 text-emerald-950">
                  <div className="flex justify-between items-center">
                    <span className="font-bold">Status: {inspectingOrder.payments[0].paymentStatus}</span>
                    <span className="font-mono text-[11px] font-bold">₹{inspectingOrder.payments[0].amount}</span>
                  </div>
                  <p className="font-mono text-[11px]">Ref: {inspectingOrder.payments[0].paymentNumber}</p>
                  <p className="text-[11px]">Method: {inspectingOrder.payments[0].paymentMethod || 'Razorpay UPI'}</p>
                </div>
              ) : (
                <p className="text-stone-500 italic">No online payment recorded (COD or Direct Checkout)</p>
              )}
            </div>

            {/* Items List */}
            <div className="space-y-2">
              <span className="font-bold text-stone-900 block">Ordered Samagri & Puja Items</span>
              {Array.isArray(inspectingOrder.orderItems) && inspectingOrder.orderItems.length > 0 ? (
                <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden">
                  {inspectingOrder.orderItems.map((item: any) => (
                    <div key={item.id} className="p-2.5 flex items-center justify-between bg-white text-xs">
                      <div>
                        <p className="font-bold text-stone-900">{item.product?.name || 'Vedic Samagri'}</p>
                        <p className="text-stone-400 text-[10px]">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-bold text-stone-800">
                        ₹{(Number(item.price || 0) * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-stone-400 italic">Complete Pure Samagri Kit Included with Ceremony</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-stone-100">
              <div className="flex items-center gap-1.5">
                {inspectingOrder.status !== 'DELIVERED' && (
                  <button
                    onClick={() => {
                      handleUpdateStatus(inspectingOrder.id, inspectingOrder.status === 'SHIPPED' ? 'DELIVERED' : 'SHIPPED');
                      setInspectingOrder(null);
                    }}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold"
                  >
                    {inspectingOrder.status === 'SHIPPED' ? 'Mark Delivered' : 'Dispatch Order'}
                  </button>
                )}
              </div>
              <button
                onClick={() => setInspectingOrder(null)}
                className="px-4 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-semibold"
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
