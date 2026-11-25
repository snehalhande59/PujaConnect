'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  Loader2,
  Users,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  X,
  UserCheck,
  UserX,
  BookOpen,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { getClientToken } from '@/lib/auth';
import AdminLayout from '@/components/admin/AdminLayout';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Modal / Detail state
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customerDetails, setCustomerDetails] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [savingDetails, setSavingDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'bookings' | 'security'>('details');
  const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(null);
  const [bookingStatusMap, setBookingStatusMap] = useState<Record<string, { status: string; reason: string }>>({});

  // Edit form state
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    city: '',
    state: '',
    pincode: '',
    isActive: true,
  });

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchCustomers = useCallback(async (opts?: boolean | any) => {
    const silent = opts === true;
    const token = getClientToken();
    try {
      if (!silent) setLoading(true);
      const url = new URL(`${API_BASE_URL}/admin/customers`);
      if (search.trim()) url.searchParams.append('search', search.trim());
      url.searchParams.append('_t', Date.now().toString());

      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const json = await res.json();
        const data = json.data?.customers || json.customers || json.data || [];
        setCustomers(data);
      }
    } catch (e) {
      console.error('Failed to fetch customers:', e);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchCustomers();
    const interval = setInterval(() => fetchCustomers(true), 10000);
    return () => clearInterval(interval);
  }, [fetchCustomers]);

  // Open customer details
  const openCustomerModal = async (customer: any) => {
    setSelectedCustomerId(customer.id);
    setActiveTab('details');
    setCustomerDetails(null);
    setEditForm({
      firstName: customer.firstName || '',
      lastName: customer.lastName || '',
      phoneNumber: customer.user?.phoneNumber || '',
      city: customer.city || '',
      state: customer.state || '',
      pincode: customer.pincode || '',
      isActive: customer.user?.isActive !== false,
    });

    const token = getClientToken();
    try {
      setLoadingDetails(true);
      const res = await fetch(`${API_BASE_URL}/admin/customers/${customer.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setCustomerDetails(json.data || json);
      }
    } catch (e) {
      console.error('Failed to load customer details:', e);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Save customer edits
  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) return;

    const token = getClientToken();
    try {
      setSavingDetails(true);
      const res = await fetch(`${API_BASE_URL}/admin/customers/${selectedCustomerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        setNotification({ type: 'success', message: 'Customer record updated successfully.' });
        setSelectedCustomerId(null);
        fetchCustomers();
      } else {
        const err = await res.json();
        setNotification({ type: 'error', message: err.message || 'Failed to update customer.' });
      }
    } catch (e: any) {
      setNotification({ type: 'error', message: e.message || 'Error updating customer.' });
    } finally {
      setSavingDetails(false);
    }
  };

  // Update customer booking status & message (Confirm, In-Progress, Complete, Cancel)
  const handleUpdateBookingStatus = async (bookingId: string) => {
    const entry = bookingStatusMap[bookingId];
    if (!entry || !entry.status) {
      setNotification({ type: 'error', message: 'Please select a target status.' });
      return;
    }

    const token = getClientToken();
    try {
      setUpdatingBookingId(bookingId);
      const res = await fetch(`${API_BASE_URL}/admin/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: entry.status,
          reason: entry.reason || `Status updated to ${entry.status} by Admin`,
        }),
      });

      if (res.ok) {
        setNotification({
          type: 'success',
          message: `Booking #${bookingId.slice(0, 8)} status updated to ${entry.status} successfully.`,
        });
        // Refresh customer details to show updated status
        if (selectedCustomerId) {
          const custRes = await fetch(`${API_BASE_URL}/admin/customers/${selectedCustomerId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (custRes.ok) {
            const json = await custRes.json();
            setCustomerDetails(json.data || json);
          }
        }
      } else {
        const err = await res.json();
        setNotification({
          type: 'error',
          message: err.message || 'Failed to update booking status.',
        });
      }
    } catch (e: any) {
      setNotification({
        type: 'error',
        message: e.message || 'Error updating booking status.',
      });
    } finally {
      setUpdatingBookingId(null);
    }
  };

  // Filter customers by status
  const filteredCustomers = customers.filter((c) => {
    if (statusFilter === 'ACTIVE') return c.user?.isActive !== false;
    if (statusFilter === 'INACTIVE') return c.user?.isActive === false;
    return true;
  });

  const activeCount = customers.filter((c) => c.user?.isActive !== false).length;
  const withBookingsCount = customers.filter((c) => (c._count?.bookings || 0) > 0).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
              Customer & Devotee Directory
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Live devotee profiles, contact information, addresses, and total ritual bookings stored in PostgreSQL
            </p>
          </div>
          <button
            onClick={fetchCustomers}
            className="self-start sm:self-auto px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-600' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-stone-200 p-5 rounded-2xl flex items-center justify-between shadow-xs">
            <div>
              <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Registered Devotees</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">{customers.length}</p>
              <span className="text-[11px] text-stone-400 mt-0.5 block">Mobile app & web clients</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-stone-200 p-5 rounded-2xl flex items-center justify-between shadow-xs">
            <div>
              <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Active Devotees</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">{activeCount}</p>
              <span className="text-[11px] text-stone-400 mt-0.5 block">Authorized to book rituals</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-stone-200 p-5 rounded-2xl flex items-center justify-between shadow-xs">
            <div>
              <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">With Completed Bookings</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-1">{withBookingsCount}</p>
              <span className="text-[11px] text-stone-400 mt-0.5 block">Placed at least 1 ceremony</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search devotee by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-stone-300 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-600"
            />
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-stone-100 p-1 rounded-xl">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                statusFilter === 'ALL' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All ({customers.length})
            </button>
            <button
              onClick={() => setStatusFilter('ACTIVE')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                statusFilter === 'ACTIVE' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              onClick={() => setStatusFilter('INACTIVE')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                statusFilter === 'INACTIVE' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Suspended ({customers.length - activeCount})
            </button>
          </div>
        </div>

        {/* Notification Banner */}
        {notification && (
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between text-xs shadow-xs ${
              notification.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span className="font-medium">{notification.message}</span>
            </div>
            <button onClick={() => setNotification(null)} className="text-stone-400 hover:text-stone-700">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Customers Table */}
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto mb-3" />
              <p className="text-xs text-stone-500">Loading devotees from PostgreSQL database...</p>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="py-16 text-center text-xs text-stone-500">
              <Users className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <p className="font-bold text-stone-800 text-sm">No registered customers found</p>
              <p className="text-stone-400 mt-1">Try another search or filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-stone-50 text-stone-500 uppercase text-[10px] font-bold border-b border-stone-200 tracking-wider">
                  <tr>
                    <th className="p-4">Devotee Name</th>
                    <th className="p-4">Registered Email</th>
                    <th className="p-4">Phone Number</th>
                    <th className="p-4">City</th>
                    <th className="p-4">Account Status</th>
                    <th className="p-4">Total Bookings</th>
                    <th className="p-4">Registered Date</th>
                    <th className="p-4">Last Login Activity</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredCustomers.map((c) => {
                    const name = `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Devotee';
                    const email = c.user?.email || 'N/A';
                    const phone = c.user?.phoneNumber || 'N/A';
                    const city = c.city || 'India';
                    const isActive = c.user?.isActive !== false;
                    const bookingCount = c._count?.bookings || 0;
                    const regDate = c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A';
                    const hasLogin = Boolean(c.lastLoginAt);

                    return (
                      <tr key={c.id} className="hover:bg-stone-50/80 transition">
                        <td className="p-4 font-bold text-stone-900 flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-700 font-bold flex items-center justify-center text-xs border border-amber-200 shrink-0">
                            {name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="block">{name}</span>
                            <span className="text-[10px] font-mono text-stone-400 font-normal">
                              {c.id.slice(0, 8)}...
                            </span>
                          </div>
                        </td>

                        <td className="p-4">
                          <span className="font-mono text-stone-800 text-[11px]">{email}</span>
                        </td>

                        <td className="p-4">
                          <span className="font-mono text-stone-800 text-[11px]">{phone}</span>
                        </td>

                        <td className="p-4 text-stone-600">
                          <span>{city}</span>
                        </td>

                        <td className="p-4">
                          {isActive ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                              <XCircle className="w-3 h-3 text-rose-600" />
                              Suspended
                            </span>
                          )}
                        </td>

                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-lg bg-stone-100 text-amber-800 font-bold text-xs border border-stone-200">
                            {bookingCount} {bookingCount === 1 ? 'Booking' : 'Bookings'}
                          </span>
                        </td>

                        <td className="p-4 text-stone-500 font-mono text-[11px]">{regDate}</td>

                        <td className="p-4">
                          {hasLogin ? (
                            <div>
                              <span className="block font-semibold text-stone-800 text-[11px]">
                                {new Date(c.lastLoginAt).toLocaleDateString()}
                              </span>
                              <div className="flex items-center gap-1 text-[10px] text-stone-400 font-mono">
                                <span>
                                  {new Date(c.lastLoginAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                                <span className="px-1 py-0.2 rounded bg-amber-50 text-amber-800 font-bold text-[9px] border border-amber-200">
                                  {c.lastLoginMethod || 'OTP'}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-stone-400 text-[11px] italic">No login recorded</span>
                          )}
                        </td>

                        <td className="p-4 text-right">
                          <button
                            onClick={() => openCustomerModal(c)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 rounded-xl text-xs font-semibold transition cursor-pointer shadow-2xs"
                          >
                            <Eye className="w-3.5 h-3.5 text-stone-500" />
                            <span>View / Edit</span>
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

        {/* Devotee Details & Edit Modal */}
        {selectedCustomerId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
            <div className="bg-white border border-stone-200 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-xs text-stone-800">
              {/* Modal Header */}
              <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-700 font-bold flex items-center justify-center text-sm border border-amber-200">
                    {(editForm.firstName || 'D').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                      <span>{editForm.firstName} {editForm.lastName}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-stone-200 text-stone-700 font-mono">
                        Devotee Profile
                      </span>
                    </h2>
                    <p className="text-xs text-stone-500 font-mono">{customerDetails?.user?.email || 'N/A'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCustomerId(null)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Tabs */}
              <div className="flex border-b border-stone-200 bg-white px-5 pt-2 gap-4 text-xs">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`pb-2.5 font-bold border-b-2 transition cursor-pointer ${
                    activeTab === 'details'
                      ? 'border-amber-600 text-amber-700'
                      : 'border-transparent text-stone-500 hover:text-stone-900'
                  }`}
                >
                  Personal & Profile Details
                </button>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className={`pb-2.5 font-bold border-b-2 transition cursor-pointer ${
                    activeTab === 'bookings'
                      ? 'border-amber-600 text-amber-700'
                      : 'border-transparent text-stone-500 hover:text-stone-900'
                  }`}
                >
                  Booking History ({customerDetails?.bookings?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`pb-2.5 font-bold border-b-2 transition cursor-pointer ${
                    activeTab === 'security'
                      ? 'border-amber-600 text-amber-700'
                      : 'border-transparent text-stone-500 hover:text-stone-900'
                  }`}
                >
                  Login & Security Audit ({customerDetails?.loginHistory?.length || 0})
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto flex-1">
                {loadingDetails ? (
                  <div className="py-12 text-center">
                    <Loader2 className="w-6 h-6 text-amber-600 animate-spin mx-auto mb-2" />
                    <p className="text-xs text-stone-400">Loading full devotee profile from database...</p>
                  </div>
                ) : activeTab === 'details' ? (
                  <form onSubmit={handleSaveCustomer} className="space-y-4">
                    {/* Database Identity & Login Audit Banner */}
                    <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-2 text-xs">
                      <div className="flex justify-between items-center pb-1.5 border-b border-stone-200/60">
                        <span className="text-stone-500">Account Registration Date:</span>
                        <span className="font-mono font-semibold text-stone-800">
                          {customerDetails?.createdAt
                            ? new Date(customerDetails.createdAt).toLocaleString()
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-stone-500">Last Verified Login Activity:</span>
                        {customerDetails?.lastLoginAt ? (
                          <span className="font-mono font-semibold text-emerald-800 flex items-center gap-1.5">
                            <span>{new Date(customerDetails.lastLoginAt).toLocaleString()}</span>
                            <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-900 font-bold text-[9px] uppercase border border-emerald-300">
                              {customerDetails.lastLoginMethod}
                            </span>
                          </span>
                        ) : (
                          <span className="text-stone-400 italic">No login event recorded in PostgreSQL database</span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">First Name *</label>
                        <input
                          type="text"
                          required
                          value={editForm.firstName}
                          onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-600"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Last Name</label>
                        <input
                          type="text"
                          value={editForm.lastName}
                          onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={editForm.phoneNumber}
                        onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                        placeholder="+91 9876543210"
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-600"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">City</label>
                        <input
                          type="text"
                          value={editForm.city}
                          onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-600"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">State</label>
                        <input
                          type="text"
                          value={editForm.state}
                          onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-600"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Pincode</label>
                        <input
                          type="text"
                          value={editForm.pincode}
                          onChange={(e) => setEditForm({ ...editForm, pincode: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">Account Status</label>
                      <select
                        value={editForm.isActive ? 'ACTIVE' : 'INACTIVE'}
                        onChange={(e) => setEditForm({ ...editForm, isActive: e.target.value === 'ACTIVE' })}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-600 bg-white"
                      >
                        <option value="ACTIVE">Active (Allowed to sign in & book)</option>
                        <option value="INACTIVE">Suspended (Blocked from placing bookings)</option>
                      </select>
                    </div>

                    {/* Saved Addresses */}
                    {customerDetails?.addresses && customerDetails.addresses.length > 0 && (
                      <div className="pt-2">
                        <label className="block font-semibold text-stone-700 mb-2">Saved Addresses</label>
                        <div className="space-y-2">
                          {customerDetails.addresses.map((addr: any) => (
                            <div key={addr.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                              <p className="font-bold text-stone-900">{addr.fullName} • {addr.phoneNumber}</p>
                              <p className="text-stone-600">{addr.addressLine1}, {addr.addressLine2 || ''} {addr.landmark || ''}</p>
                              <p className="text-stone-500 font-mono">{addr.city}, {addr.state} - {addr.pincode}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                      <button
                        type="button"
                        onClick={() => setSelectedCustomerId(null)}
                        className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={savingDetails}
                        className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition flex items-center gap-1.5"
                      >
                        {savingDetails ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : null}
                        <span>Save Customer Changes</span>
                      </button>
                    </div>
                  </form>
                ) : activeTab === 'bookings' ? (
                  <div className="space-y-4">
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                      <p className="font-bold">Customer Order & Ceremony Management</p>
                      <p className="text-[11px] text-amber-800">
                        Confirm bookings, update ritual progress, mark completed with devotee messages, or cancel ceremonies directly in PostgreSQL.
                      </p>
                    </div>

                    {customerDetails?.bookings && customerDetails.bookings.length > 0 ? (
                      <div className="space-y-3">
                        {customerDetails.bookings.map((b: any) => {
                          const currentSelected = bookingStatusMap[b.id] || { status: b.status, reason: '' };
                          const isUpdating = updatingBookingId === b.id;

                          return (
                            <div key={b.id} className="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs space-y-3">
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-stone-900">{b.bookingNumber}</span>
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                        b.status === 'COMPLETED'
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : b.status === 'CONFIRMED'
                                          ? 'bg-blue-100 text-blue-800'
                                          : b.status === 'IN_PROGRESS'
                                          ? 'bg-amber-100 text-amber-800'
                                          : b.status === 'CANCELLED'
                                          ? 'bg-rose-100 text-rose-800'
                                          : 'bg-stone-100 text-stone-800'
                                      }`}
                                    >
                                      {b.status}
                                    </span>
                                  </div>
                                  <p className="text-stone-800 font-semibold text-sm mt-0.5">{b.puja?.title || 'Vedic Ceremony'}</p>
                                  <p className="text-stone-500 text-[11px] mt-0.5">
                                    📅 {b.pujaDate ? new Date(b.pujaDate).toLocaleDateString() : 'N/A'} • ⏰ {b.pujaTimeSlot || 'Morning'} • Pt. {b.panditProfile?.fullName || 'Awaiting Pandit'}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-extrabold text-stone-900 text-base">₹{Number(b.totalAmount || 0).toLocaleString()}</p>
                                  <p className="text-[10px] text-stone-400">Total Dakshina</p>
                                </div>
                              </div>

                              {/* Interactive Admin Status & Message Controls */}
                              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2 text-xs">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  <div>
                                    <label className="block font-semibold text-stone-700 mb-1">Update Status (प्रगती बदला)</label>
                                    <select
                                      value={currentSelected.status}
                                      onChange={(e) =>
                                        setBookingStatusMap({
                                          ...bookingStatusMap,
                                          [b.id]: { ...currentSelected, status: e.target.value },
                                        })
                                      }
                                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-stone-900 bg-white font-medium"
                                    >
                                      <option value="CONFIRMED">CONFIRMED (ऑर्डर कन्फर्म)</option>
                                      <option value="IN_PROGRESS">IN_PROGRESS (पूजा चालू / प्रगतीपथावर)</option>
                                      <option value="COMPLETED">COMPLETED (पूजा विधी पूर्ण)</option>
                                      <option value="CANCELLED">CANCELLED (बुकिंग रद्द)</option>
                                      <option value="PENDING">PENDING (प्रलंबित)</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block font-semibold text-stone-700 mb-1">Status Note / Devotee Message</label>
                                    <input
                                      type="text"
                                      placeholder="e.g. Guruji confirmed. Samagri kit dispatched."
                                      value={currentSelected.reason}
                                      onChange={(e) =>
                                        setBookingStatusMap({
                                          ...bookingStatusMap,
                                          [b.id]: { ...currentSelected, reason: e.target.value },
                                        })
                                      }
                                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-stone-900 bg-white"
                                    />
                                  </div>
                                </div>

                                <div className="flex justify-end pt-1">
                                  <button
                                    type="button"
                                    disabled={isUpdating}
                                    onClick={() => handleUpdateBookingStatus(b.id)}
                                    className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                                  >
                                    {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin text-white" /> : null}
                                    <span>Apply & Update Booking Status</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-center py-8 text-stone-400">No booking records found for this customer.</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-xl text-xs text-amber-900 space-y-1">
                      <p className="font-bold">Cryptographically Verified Login Audit Trail</p>
                      <p className="text-amber-800 text-[11px]">
                        Below are the authentic session authentications recorded in PostgreSQL for this devotee account.
                      </p>
                    </div>

                    {customerDetails?.loginHistory && customerDetails.loginHistory.length > 0 ? (
                      <div className="space-y-2">
                        {customerDetails.loginHistory.map((l: any) => (
                          <div
                            key={l.id}
                            className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-stone-900 text-xs">
                                  {new Date(l.timestamp).toLocaleDateString()} at{' '}
                                  {new Date(l.timestamp).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                  {l.method === 'PASSWORD' ? 'Password Auth' : 'Email OTP Verified'}
                                </span>
                              </div>
                              <p className="text-stone-500 font-mono text-[11px] mt-0.5">
                                Channel: {l.channel}
                              </p>
                            </div>
                            <span className="text-[10px] font-mono text-stone-400">ID: {l.id.slice(0, 8)}...</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-10 text-center text-xs text-stone-400 space-y-1">
                        <p className="font-semibold text-stone-600">No Historical Logins Stored in Database</p>
                        <p className="text-stone-400 max-w-sm mx-auto">
                          Prior to audit recording, login events for this account were not persisted in PostgreSQL.
                          Future sign-ins will automatically log verified sessions here.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
