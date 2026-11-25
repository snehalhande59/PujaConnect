'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Check,
  X,
  ShieldCheck,
  Search,
  Filter,
  Eye,
  Loader2,
  FileText,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Award,
  DollarSign,
  UserCheck,
  UserX,
  Clock,
  Sparkles,
  CheckCircle2,
  XCircle,
  Star,
} from 'lucide-react';
import { getSavedUserProfile, getClientToken, AuthUser } from '@/lib/auth';
import AdminLayout from '@/components/admin/AdminLayout';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export default function AdminPanditsPage() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<AuthUser | null>(null);
  const [authorized, setAuthorized] = useState(false);

  // Filters & State
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Data
  const [pandits, setPandits] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [bannerMessage, setBannerMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal State: Add / Edit Pandit
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPanditId, setEditingPanditId] = useState<string | null>(null);
  const [modalForm, setModalForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    experienceYears: 10,
    languages: 'Marathi, Hindi, Sanskrit',
    specializations: 'Satyanarayan Mahapuja, Griha Pravesh, Ganesh Hawan',
    city: 'Pune',
    state: 'Maharashtra',
    basePrice: 2100,
    bio: 'Vedic scholar with traditional Gurukul training and authentic Vidhi execution.',
    isAvailable: true,
  });

  // Modal State: View Bookings
  const [showBookingsModal, setShowBookingsModal] = useState(false);
  const [selectedPanditForBookings, setSelectedPanditForBookings] = useState<any | null>(null);
  const [panditBookings, setPanditBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Rejection Dialog State
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchPandits = useCallback(async () => {
    const token = getClientToken();
    if (!token) return;

    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (cityFilter.trim()) params.append('city', cityFilter.trim());
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const res = await fetch(`${API_BASE_URL}/admin/pandits?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch pandits list.');
      }

      const resData = await res.json();
      const payload = resData.data?.data || resData.data || [];
      const total = resData.data?.total ?? resData.meta?.total ?? payload.length;
      const pages = resData.data?.totalPages ?? resData.meta?.totalPages ?? Math.ceil(total / limit);

      setPandits(payload);
      setTotalCount(total);
      setTotalPages(pages || 1);
    } catch (err: any) {
      console.error(err);
      setBannerMessage({ type: 'error', text: err.message || 'Error loading pandits.' });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery, cityFilter, page, limit]);

  useEffect(() => {
    const profile = getSavedUserProfile();
    if (!profile || profile.role !== 'ADMIN') {
      router.push('/admin/login');
      return;
    }
    setAdminUser(profile);
    setAuthorized(true);
  }, [router]);

  useEffect(() => {
    if (authorized) {
      fetchPandits();
    }
  }, [authorized, fetchPandits]);

  // Open Edit Modal
  const openEditModal = (p: any) => {
    setIsEditing(true);
    setEditingPanditId(p.id);
    setModalForm({
      fullName: p.fullName || `${p.user?.firstName || ''} ${p.user?.lastName || ''}`.trim(),
      email: p.user?.email || '',
      phoneNumber: p.user?.phoneNumber || '',
      experienceYears: p.experienceYears || 10,
      languages: Array.isArray(p.languages) ? p.languages.join(', ') : '',
      specializations: Array.isArray(p.specializations) ? p.specializations.join(', ') : '',
      city: p.city || 'Pune',
      state: p.state || 'Maharashtra',
      basePrice: Number(p.basePrice) || 2100,
      bio: p.bio || '',
      isAvailable: p.isAvailable ?? true,
    });
    setShowAddEditModal(true);
  };

  // Open Add Modal
  const openAddModal = () => {
    setIsEditing(false);
    setEditingPanditId(null);
    setModalForm({
      fullName: '',
      email: '',
      phoneNumber: '+91 ',
      experienceYears: 10,
      languages: 'Marathi, Hindi, Sanskrit',
      specializations: 'Satyanarayan Mahapuja, Griha Pravesh, Ganesh Hawan',
      city: 'Pune',
      state: 'Maharashtra',
      basePrice: 2100,
      bio: 'Vedic scholar with traditional Gurukul training and authentic Vidhi execution.',
      isAvailable: true,
    });
    setShowAddEditModal(true);
  };

  // Submit Add / Edit Form
  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getClientToken();
    if (!token) return;

    try {
      setActionLoading('form-submit');
      const payload: any = {
        fullName: modalForm.fullName.trim(),
        experienceYears: Number(modalForm.experienceYears),
        languages: modalForm.languages.split(',').map((s) => s.trim()).filter(Boolean),
        specializations: modalForm.specializations.split(',').map((s) => s.trim()).filter(Boolean),
        city: modalForm.city.trim(),
        state: modalForm.state.trim(),
        basePrice: Number(modalForm.basePrice),
        bio: modalForm.bio.trim(),
        isAvailable: modalForm.isAvailable,
      };

      if (isEditing && editingPanditId) {
        if (modalForm.email.trim()) payload.email = modalForm.email.trim();
        if (modalForm.phoneNumber.trim()) payload.phoneNumber = modalForm.phoneNumber.trim();

        const res = await fetch(`${API_BASE_URL}/admin/pandits/${editingPanditId}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Failed to update pandit profile.');
        }

        setBannerMessage({ type: 'success', text: `Pt. ${modalForm.fullName} updated successfully.` });
      } else {
        payload.email = modalForm.email.trim();
        payload.phoneNumber = modalForm.phoneNumber.trim();

        const res = await fetch(`${API_BASE_URL}/admin/pandits`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Failed to register pandit.');
        }

        setBannerMessage({ type: 'success', text: `Pt. ${modalForm.fullName} registered and verified successfully.` });
      }

      setShowAddEditModal(false);
      await fetchPandits();
    } catch (err: any) {
      alert(err.message || 'Error processing request.');
    } finally {
      setActionLoading(null);
    }
  };

  // Toggle Pandit Active Availability
  const handleToggleStatus = async (p: any) => {
    const token = getClientToken();
    if (!token) return;
    const newStatus = !p.isAvailable;
    const name = `Pt. ${p.fullName || 'Purohit'}`;

    try {
      setActionLoading(p.id);
      const res = await fetch(`${API_BASE_URL}/admin/pandits/${p.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isAvailable: newStatus }),
      });

      if (!res.ok) {
        throw new Error('Failed to change pandit status.');
      }

      setBannerMessage({
        type: 'success',
        text: `${name} is now ${newStatus ? 'ACTIVE & Available for customer bookings' : 'INACTIVE (Hidden from booking list)'}.`,
      });
      await fetchPandits();
    } catch (err: any) {
      setBannerMessage({ type: 'error', text: err.message || 'Status update failed.' });
    } finally {
      setActionLoading(null);
    }
  };

  // View Pandit Bookings
  const handleViewBookings = async (p: any) => {
    const token = getClientToken();
    if (!token) return;

    setSelectedPanditForBookings(p);
    setShowBookingsModal(true);
    setLoadingBookings(true);
    setPanditBookings([]);

    try {
      const res = await fetch(`${API_BASE_URL}/admin/pandits/${p.id}/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const bookingsList = data.data?.data || data.data || [];
        setPanditBookings(bookingsList);
      }
    } catch (err) {
      console.warn('Failed to load pandit bookings:', err);
    } finally {
      setLoadingBookings(false);
    }
  };

  // Approve / Verify Pandit
  const handleApprove = async (id: string, name: string) => {
    const token = getClientToken();
    if (!token) return;

    try {
      setActionLoading(id);
      const res = await fetch(`${API_BASE_URL}/admin/pandits/${id}/verify`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Approval failed.');
      }

      setBannerMessage({ type: 'success', text: `${name} has been verified and published.` });
      await fetchPandits();
    } catch (err: any) {
      setBannerMessage({ type: 'error', text: err.message || 'Approval failed.' });
    } finally {
      setActionLoading(null);
    }
  };

  // Submit Rejection
  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) {
      alert('Please provide a specific rejection reason.');
      return;
    }
    const token = getClientToken();
    if (!token || !rejectId) return;

    try {
      setActionLoading(rejectId);
      const res = await fetch(`${API_BASE_URL}/admin/pandits/${rejectId}/reject`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: rejectReason.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Rejection failed.');
      }

      setBannerMessage({ type: 'success', text: 'Pandit application rejected. Notification sent.' });
      setRejectId(null);
      setRejectReason('');
      await fetchPandits();
    } catch (err: any) {
      alert(err.message || 'Rejection failed.');
    } finally {
      setActionLoading(null);
    }
  };

  // Delete / Deactivate Pandit
  const handleDeletePandit = async (p: any) => {
    const name = `Pt. ${p.fullName || 'Purohit'}`;
    if (!confirm(`Are you sure you want to deactivate and remove ${name} from active Purohits?`)) return;

    const token = getClientToken();
    if (!token) return;

    try {
      setActionLoading(p.id);
      const res = await fetch(`${API_BASE_URL}/admin/pandits/${p.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error('Failed to delete pandit.');
      }

      setBannerMessage({ type: 'success', text: `${name} has been deactivated.` });
      await fetchPandits();
    } catch (err: any) {
      setBannerMessage({ type: 'error', text: err.message || 'Deletion failed.' });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
              Pandit Verification & Directory
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Live Vedic purohit roster, Shastric credentials verification, availability, and onboarding
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchPandits()}
              className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-stone-200 shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-600' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Pandit</span>
            </button>
          </div>
        </div>

        {bannerMessage && (
          <div
            className={`p-4 rounded-xl text-xs flex items-center justify-between shadow-xs ${
              bannerMessage.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-2">
              {bannerMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span className="font-medium">{bannerMessage.text}</span>
            </div>
            <button onClick={() => setBannerMessage(null)} className="text-stone-500 hover:text-stone-800 text-xs font-bold">
              Dismiss
            </button>
          </div>
        )}

        {/* Status Tabs Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 bg-white p-2 rounded-2xl border border-stone-200 shadow-xs">
          {[
            { key: 'ALL', label: 'All Pandits' },
            { key: 'PENDING', label: 'Pending Approval' },
            { key: 'VERIFIED', label: 'Approved / Verified' },
            { key: 'REJECTED', label: 'Rejected' },
            { key: 'SUSPENDED', label: 'Suspended' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setStatusFilter(tab.key as any);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                statusFilter === tab.key
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & City Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 flex-1 min-w-[280px]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search pandit name, phone, email, specializations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchPandits()}
                className="w-full bg-white border border-stone-300 rounded-xl pl-9 pr-4 py-2 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-600"
              />
            </div>

            <div className="relative w-44">
              <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Filter city..."
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchPandits()}
                className="w-full bg-white border border-stone-300 rounded-xl pl-9 pr-4 py-2 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-600"
              />
            </div>
          </div>

          <div className="text-stone-500 font-medium">
            Showing <span className="font-bold text-stone-900">{pandits.length}</span> of{' '}
            <span className="font-bold text-stone-900">{totalCount}</span> Pandits
          </div>
        </div>

        {/* Pandits Table */}
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto mb-3" />
              <p className="text-xs text-stone-500">Loading Pandit records from PostgreSQL...</p>
            </div>
          ) : pandits.length === 0 ? (
            <div className="py-16 text-center text-xs text-stone-500 space-y-2">
              <ShieldCheck className="w-10 h-10 text-stone-300 mx-auto" />
              <p className="font-bold text-stone-700 text-sm">No Pandit records found</p>
              <p className="text-stone-400 max-w-sm mx-auto">
                No Pandits match the current filter ({statusFilter}). Newly registered Pandits from the mobile app or website will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-stone-50 text-stone-500 uppercase text-[10px] font-bold border-b border-stone-200 tracking-wider">
                  <tr>
                    <th className="p-4">Pandit Name & City</th>
                    <th className="p-4">Contact Info</th>
                    <th className="p-4">Exp & Base Fee</th>
                    <th className="p-4">Verification</th>
                    <th className="p-4">Availability</th>
                    <th className="p-4">Bookings & Rating</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {pandits.map((p) => {
                    const fullName = p.fullName || `${p.user?.firstName || ''} ${p.user?.lastName || ''}`.trim() || 'Vedic Purohit';
                    const rating = Number(p.averageRating || 0).toFixed(1);
                    const bookingCount = p._count?.bookings ?? 0;

                    return (
                      <tr key={p.id} className="hover:bg-stone-50/80 transition">
                        <td className="p-4">
                          <Link href={`/admin/pandits/${p.id}`} className="font-bold text-stone-900 hover:text-amber-700 text-sm block">
                            Pt. {fullName}
                          </Link>
                          <div className="flex items-center gap-1.5 text-stone-500 text-[11px] mt-0.5">
                            <MapPin className="w-3 h-3 text-stone-400" />
                            <span>{p.city}, {p.state}</span>
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="font-medium text-stone-800">{p.user?.email || 'N/A'}</div>
                          <div className="text-[11px] text-stone-500 mt-0.5">{p.user?.phoneNumber || 'N/A'}</div>
                        </td>

                        <td className="p-4">
                          <div className="font-semibold text-stone-900">{p.experienceYears || 1} Yrs Exp</div>
                          <div className="text-amber-700 font-bold text-[11px] mt-0.5">
                            ₹{Number(p.basePrice || 0).toLocaleString()} base
                          </div>
                        </td>

                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block ${
                              p.verificationStatus === 'VERIFIED'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : p.verificationStatus === 'REJECTED'
                                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                : p.verificationStatus === 'SUSPENDED'
                                ? 'bg-stone-100 text-stone-800 border border-stone-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {p.verificationStatus}
                          </span>
                        </td>

                        <td className="p-4">
                          <button
                            onClick={() => handleToggleStatus(p)}
                            disabled={actionLoading === p.id}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition ${
                              p.isAvailable
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                                : 'bg-stone-100 text-stone-600 border border-stone-200 hover:bg-stone-200'
                            }`}
                          >
                            {p.isAvailable ? 'AVAILABLE' : 'OFFLINE'}
                          </button>
                        </td>

                        <td className="p-4">
                          <div className="font-semibold text-stone-900">{bookingCount} Bookings</div>
                          <div className="flex items-center gap-1 text-[11px] text-amber-600 mt-0.5">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            <span className="font-bold text-stone-800">{rating}</span>
                            <span className="text-stone-400">({p.totalReviews || 0})</span>
                          </div>
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {p.verificationStatus === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => handleApprove(p.id, fullName)}
                                  disabled={actionLoading === p.id}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] transition cursor-pointer"
                                  title="Approve & Verify Pandit"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => {
                                    setRejectId(p.id);
                                    setRejectReason('');
                                  }}
                                  disabled={actionLoading === p.id}
                                  className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-[10px] transition border border-rose-200 cursor-pointer"
                                  title="Reject Pandit Application"
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            <Link
                              href={`/admin/pandits/${p.id}`}
                              className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition"
                              title="Full Profile & Documents"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Link>

                            <button
                              onClick={() => openEditModal(p)}
                              className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition"
                              title="Edit Pandit Profile"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleViewBookings(p)}
                              className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition"
                              title="View Pandit Bookings"
                            >
                              <Calendar className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeletePandit(p)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition border border-rose-200"
                              title="Deactivate Pandit"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-600">
              <span>
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 disabled:opacity-50 font-semibold"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 disabled:opacity-50 font-semibold"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {rejectId && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl text-xs text-stone-800">
            <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-600" /> Reject Pandit Registration
            </h3>
            <p className="text-stone-600">
              Please enter the official reason for rejection. This reason is stored in the audit record and communicated to the applicant.
            </p>
            <textarea
              rows={3}
              required
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Identity documents unreadable, or missing Gurukul ordination certificate..."
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-600"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectId(null)}
                className="px-3.5 py-1.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={actionLoading === rejectId}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Pandit Modal */}
      {showAddEditModal && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl text-xs text-stone-800 my-8">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                {isEditing ? 'Edit Pandit Profile' : 'Direct Pandit Registration & Verification'}
              </h3>
              <button onClick={() => setShowAddEditModal(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={modalForm.fullName}
                  onChange={(e) => setModalForm({ ...modalForm, fullName: e.target.value })}
                  placeholder="Pt. Ramesh Shastri"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={modalForm.email}
                    onChange={(e) => setModalForm({ ...modalForm, email: e.target.value })}
                    placeholder="pandit@devsutra.in"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={modalForm.phoneNumber}
                    onChange={(e) => setModalForm({ ...modalForm, phoneNumber: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={modalForm.city}
                    onChange={(e) => setModalForm({ ...modalForm, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={modalForm.state}
                    onChange={(e) => setModalForm({ ...modalForm, state: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Base Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={modalForm.basePrice}
                    onChange={(e) => setModalForm({ ...modalForm, basePrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Specializations (comma separated)</label>
                <input
                  type="text"
                  value={modalForm.specializations}
                  onChange={(e) => setModalForm({ ...modalForm, specializations: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Languages (comma separated)</label>
                <input
                  type="text"
                  value={modalForm.languages}
                  onChange={(e) => setModalForm({ ...modalForm, languages: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Bio / Shastric Background</label>
                <textarea
                  rows={2}
                  value={modalForm.bio}
                  onChange={(e) => setModalForm({ ...modalForm, bio: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddEditModal(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === 'form-submit'}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition flex items-center gap-1.5"
                >
                  {actionLoading === 'form-submit' ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>{isEditing ? 'Save Profile Changes' : 'Register & Verify Pandit'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Bookings Modal */}
      {showBookingsModal && selectedPanditForBookings && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 max-w-2xl w-full space-y-4 shadow-xl text-xs text-stone-800 my-8">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-stone-900">
                  Bookings for Pt. {selectedPanditForBookings.fullName}
                </h3>
                <p className="text-[11px] text-stone-500">Historical ceremonies assigned to this purohit</p>
              </div>
              <button onClick={() => setShowBookingsModal(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            {loadingBookings ? (
              <div className="py-12 text-center text-stone-500">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-600" />
                Loading bookings...
              </div>
            ) : panditBookings.length === 0 ? (
              <div className="py-12 text-center text-stone-400">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                No bookings assigned to this Pandit yet.
              </div>
            ) : (
              <div className="overflow-x-auto max-h-80 overflow-y-auto">
                <table className="w-full text-left text-xs text-stone-700">
                  <thead className="bg-stone-50 text-stone-500 uppercase text-[10px] font-bold border-b border-stone-200">
                    <tr>
                      <th className="p-3">Booking #</th>
                      <th className="p-3">Ceremony</th>
                      <th className="p-3">Devotee</th>
                      <th className="p-3">Muhurat Date</th>
                      <th className="p-3">Fee</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {panditBookings.map((b) => (
                      <tr key={b.id}>
                        <td className="p-3 font-mono font-bold text-stone-900">{b.bookingNumber}</td>
                        <td className="p-3 font-semibold text-stone-900">{b.puja?.title || 'Ritual'}</td>
                        <td className="p-3">
                          {b.customerProfile ? `${b.customerProfile.firstName} ${b.customerProfile.lastName}` : 'Devotee'}
                        </td>
                        <td className="p-3">{b.pujaDate ? new Date(b.pujaDate).toLocaleDateString() : 'N/A'}</td>
                        <td className="p-3 font-bold text-stone-900">₹{Number(b.totalAmount || 0).toLocaleString()}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-800">
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
