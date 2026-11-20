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
  const [activeTab, setActiveTab] = useState<'details' | 'bookings'>('details');

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

  const fetchCustomers = useCallback(async () => {
    const token = getClientToken();
    try {
      setLoading(true);
      const url = new URL(`${API_BASE_URL}/admin/customers`);
      if (search.trim()) url.searchParams.append('search', search.trim());

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
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
        const data = await res.json();
        const detail = data.data || data;
        setCustomerDetails(detail);
        setEditForm({
          firstName: detail.firstName || '',
          lastName: detail.lastName || '',
          phoneNumber: detail.user?.phoneNumber || '',
          city: detail.city || '',
          state: detail.state || '',
          pincode: detail.pincode || '',
          isActive: detail.user?.isActive !== false,
        });
      } else {
        // Fallback to basic customer data if detail endpoint is pending deploy
        setCustomerDetails(customer);
      }
    } catch (e) {
      console.error('Failed to fetch customer details:', e);
      setCustomerDetails(customer);
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
      setNotification(null);

      const res = await fetch(`${API_BASE_URL}/admin/customers/${selectedCustomerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        setNotification({ type: 'success', message: 'Devotee profile updated successfully in PostgreSQL!' });
        fetchCustomers();
        // Update local detail state
        if (customerDetails) {
          setCustomerDetails({
            ...customerDetails,
            ...editForm,
            user: {
              ...customerDetails.user,
              phoneNumber: editForm.phoneNumber,
              isActive: editForm.isActive,
            },
          });
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        setNotification({
          type: 'error',
          message: errJson.message || 'Failed to update devotee profile.',
        });
      }
    } catch (e: any) {
      setNotification({
        type: 'error',
        message: e?.message || 'Network error updating devotee.',
      });
    } finally {
      setSavingDetails(false);
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Customer Management
            </h1>
            <p className="text-xs text-stone-400">
              Devotee profiles, contact information, and total ritual bookings stored in PostgreSQL
            </p>
          </div>
          <button
            onClick={fetchCustomers}
            className="self-start sm:self-auto px-3.5 py-2 bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 text-stone-300 hover:text-white transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-stone-900/80 border border-stone-800 p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Registered Devotees</p>
              <p className="text-2xl font-extrabold text-white mt-1">{customers.length}</p>
            </div>
            <Users className="w-8 h-8 text-amber-500/40" />
          </div>

          <div className="bg-stone-900/80 border border-stone-800 p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Active Devotees</p>
              <p className="text-2xl font-extrabold text-emerald-400 mt-1">{activeCount}</p>
            </div>
            <UserCheck className="w-8 h-8 text-emerald-500/40" />
          </div>

          <div className="bg-stone-900/80 border border-stone-800 p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">With Bookings</p>
              <p className="text-2xl font-extrabold text-amber-400 mt-1">{withBookingsCount}</p>
            </div>
            <BookOpen className="w-8 h-8 text-amber-500/40" />
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search devotee by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-stone-900 border border-stone-800 rounded-xl text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-600"
            />
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-stone-900 border border-stone-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                statusFilter === 'ALL' ? 'bg-amber-600 text-white' : 'text-stone-400 hover:text-white'
              }`}
            >
              All ({customers.length})
            </button>
            <button
              onClick={() => setStatusFilter('ACTIVE')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                statusFilter === 'ACTIVE' ? 'bg-amber-600 text-white' : 'text-stone-400 hover:text-white'
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              onClick={() => setStatusFilter('INACTIVE')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                statusFilter === 'INACTIVE' ? 'bg-amber-600 text-white' : 'text-stone-400 hover:text-white'
              }`}
            >
              Suspended ({customers.length - activeCount})
            </button>
          </div>
        </div>

        {/* Notification Banner */}
        {notification && (
          <div
            className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
              notification.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-stone-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Customers Table */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-3" />
              <p className="text-xs text-stone-400">Loading devotees from PostgreSQL database...</p>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="py-16 text-center text-xs text-stone-400">
              <Users className="w-8 h-8 text-stone-600 mx-auto mb-2" />
              <p className="font-semibold text-stone-300">No registered customers found</p>
              <p className="text-[11px] text-stone-500 mt-1">Try another search or filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-300">
                <thead className="bg-stone-950 text-stone-400 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4">Devotee Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Phone</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Total Bookings</th>
                    <th className="p-4">Registered Date</th>
                    <th className="p-4">Last Active</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800">
                  {filteredCustomers.map((c) => {
                    const name = `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Devotee';
                    const email = c.user?.email || 'N/A';
                    const phone = c.user?.phoneNumber || 'N/A';
                    const city = c.city || 'India';
                    const isActive = c.user?.isActive !== false;
                    const bookingCount = c._count?.bookings || 0;
                    const regDate = c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A';
                    const lastActive = c.user?.updatedAt
                      ? new Date(c.user.updatedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
                      : regDate;

                    return (
                      <tr key={c.id} className="hover:bg-stone-800/50 transition">
                        <td className="p-4 font-bold text-white flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-amber-600/20 text-amber-300 font-bold flex items-center justify-center text-xs border border-amber-500/30 shrink-0">
                            {name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span>{name}</span>
                            <p className="text-[10px] font-mono text-stone-500 font-normal truncate max-w-[120px]">
                              {c.id.slice(0, 8)}...
                            </p>
                          </div>
                        </td>
                        <td className="p-4 text-stone-300">
                          <span className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                            <span className="font-mono text-[11px]">{email}</span>
                          </span>
                        </td>
                        <td className="p-4 text-stone-300">
                          <span className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                            <span className="font-mono text-[11px]">{phone}</span>
                          </span>
                        </td>
                        <td className="p-4 text-stone-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                            <span>{city}</span>
                          </span>
                        </td>
                        <td className="p-4">
                          {isActive ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                              <CheckCircle className="w-3 h-3" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-950/60 text-rose-400 border border-rose-800/40">
                              <XCircle className="w-3 h-3" />
                              Suspended
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-lg bg-stone-800 text-amber-300 font-bold text-xs border border-stone-700">
                            {bookingCount} {bookingCount === 1 ? 'Booking' : 'Bookings'}
                          </span>
                        </td>
                        <td className="p-4 text-stone-400">{regDate}</td>
                        <td className="p-4 text-amber-300/80 font-mono text-[11px]">{lastActive}</td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => openCustomerModal(c)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-semibold transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
              {/* Modal Header */}
              <div className="p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-600/20 text-amber-300 font-bold flex items-center justify-center text-sm border border-amber-500/40">
                    {(editForm.firstName || 'D').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <span>{editForm.firstName} {editForm.lastName}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-stone-800 text-stone-400 font-mono">
                        Devotee Profile
                      </span>
                    </h2>
                    <p className="text-xs text-stone-400 font-mono">{customerDetails?.user?.email || 'devotee'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCustomerId(null)}
                  className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Tabs */}
              <div className="flex border-b border-stone-800 bg-stone-900/50 px-5 pt-2 gap-4 text-xs">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`pb-2.5 font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'details'
                      ? 'border-amber-500 text-amber-400'
                      : 'border-transparent text-stone-400 hover:text-white'
                  }`}
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Profile & Settings</span>
                </button>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className={`pb-2.5 font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'bookings'
                      ? 'border-amber-500 text-amber-400'
                      : 'border-transparent text-stone-400 hover:text-white'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Ritual Bookings ({customerDetails?.bookings?.length || 0})</span>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 overflow-y-auto space-y-4 flex-1">
                {loadingDetails ? (
                  <div className="py-12 text-center">
                    <Loader2 className="w-6 h-6 text-amber-500 animate-spin mx-auto mb-2" />
                    <p className="text-xs text-stone-400">Loading devotee profile & bookings from database...</p>
                  </div>
                ) : activeTab === 'details' ? (
                  <form onSubmit={handleSaveCustomer} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-300 uppercase mb-1">First Name</label>
                        <input
                          type="text"
                          value={editForm.firstName}
                          onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                          className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                          placeholder="Devotee First Name"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-stone-300 uppercase mb-1">Last Name</label>
                        <input
                          type="text"
                          value={editForm.lastName}
                          onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                          className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                          placeholder="Devotee Last Name"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-300 uppercase mb-1">Email (Auth Login)</label>
                        <input
                          type="text"
                          disabled
                          value={customerDetails?.user?.email || ''}
                          className="w-full px-3 py-2 bg-stone-950/50 border border-stone-800 rounded-xl text-xs text-stone-400 font-mono cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-stone-300 uppercase mb-1">Phone Number</label>
                        <input
                          type="text"
                          value={editForm.phoneNumber}
                          onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                          className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                          placeholder="+919876543210"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-300 uppercase mb-1">City</label>
                        <input
                          type="text"
                          value={editForm.city}
                          onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                          className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                          placeholder="Pune / Mumbai"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-stone-300 uppercase mb-1">State</label>
                        <input
                          type="text"
                          value={editForm.state}
                          onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                          className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                          placeholder="Maharashtra"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-stone-300 uppercase mb-1">Pincode</label>
                        <input
                          type="text"
                          value={editForm.pincode}
                          onChange={(e) => setEditForm({ ...editForm, pincode: e.target.value })}
                          className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                          placeholder="411038"
                        />
                      </div>
                    </div>

                    {/* Account Status Toggle */}
                    <div className="pt-2 border-t border-stone-800 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-white">Account Status</p>
                        <p className="text-[11px] text-stone-400">
                          Allow devotee to book rituals, receive emails, and sign in to DevSutra
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditForm({ ...editForm, isActive: !editForm.isActive })}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                          editForm.isActive
                            ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-600/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {editForm.isActive ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Active Devotee</span>
                          </>
                        ) : (
                          <>
                            <UserX className="w-3.5 h-3.5" />
                            <span>Suspended</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="pt-4 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedCustomerId(null)}
                        className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-semibold transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={savingDetails}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                      >
                        {savingDetails ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                        <span>Save Profile Changes</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-3">
                    {(!customerDetails?.bookings || customerDetails.bookings.length === 0) ? (
                      <div className="py-8 text-center text-stone-500 text-xs">
                        <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No ritual bookings found for this devotee yet.</p>
                      </div>
                    ) : (
                      customerDetails.bookings.map((b: any) => (
                        <div
                          key={b.id}
                          className="p-3 bg-stone-950 border border-stone-800 rounded-xl space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white">{b.puja?.title || 'Vedic Puja'}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-600/20 text-amber-400 border border-amber-500/30">
                              {b.status}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-stone-400 text-[11px]">
                            <span>Slot: {b.bookingDate ? new Date(b.bookingDate).toLocaleDateString() : 'N/A'} ({b.bookingSlot || 'Morning'})</span>
                            <span className="font-bold text-amber-300">₹{b.totalPrice || b.basePrice || 0}</span>
                          </div>
                          {b.panditProfile && (
                            <p className="text-[11px] text-stone-400">
                              Assigned Pandit: <span className="text-stone-200">{b.panditProfile.firstName} {b.panditProfile.lastName}</span>
                            </p>
                          )}
                        </div>
                      ))
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
