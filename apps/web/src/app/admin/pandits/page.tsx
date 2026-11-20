'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  X,
  ShieldCheck,
  Search,
  Filter,
  Eye,
  Loader2,
  FileText,
  AlertCircle,
  ExternalLink,
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
} from 'lucide-react';
import DevSutraLogo from '@/components/ui/DevSutraLogo';
import { getSavedUserProfile, getClientToken, AuthUser } from '@/lib/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export default function AdminPanditsPage() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<AuthUser | null>(null);
  const [authorized, setAuthorized] = useState(false);

  // Filters & State
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'VERIFIED' | 'PENDING' | 'REJECTED'>('ALL');
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
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    experienceYears: 10,
    languages: 'Marathi, Hindi, Sanskrit',
    specializations: 'Satyanarayan Mahapuja, Griha Pravesh, Ganesh Hawan',
    city: 'Pune',
    state: 'Maharashtra',
    address: 'Shivaji Nagar, Pune',
    basePrice: 2100,
    bio: 'Vedic scholar with traditional Gurukul training and authentic Vidhi execution.',
    serviceAreas: 'Pune, Pimpri-Chinchwad, Surrounding regions',
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
        headers: { Authorization: `Bearer ${token}` },
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
      setBannerMessage({ type: 'error', text: err.message || 'Error loading directory.' });
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

  // Handle Add Pandit Submit
  const handleSavePandit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getClientToken();
    if (!token) return;

    try {
      setActionLoading('saving_pandit');
      const payload = {
        firstName: modalForm.firstName.trim(),
        lastName: modalForm.lastName.trim(),
        email: modalForm.email.trim(),
        phoneNumber: modalForm.phoneNumber.trim(),
        experienceYears: Number(modalForm.experienceYears) || 0,
        languages: modalForm.languages.split(',').map((s) => s.trim()).filter(Boolean),
        specializations: modalForm.specializations.split(',').map((s) => s.trim()).filter(Boolean),
        city: modalForm.city.trim(),
        state: modalForm.state.trim(),
        address: modalForm.address.trim(),
        basePrice: Number(modalForm.basePrice) || 2100,
        bio: modalForm.bio.trim(),
        serviceAreas: modalForm.serviceAreas.split(',').map((s) => s.trim()).filter(Boolean),
        isAvailable: modalForm.isAvailable,
      };

      const url = isEditing && editingPanditId
        ? `${API_BASE_URL}/admin/pandits/${editingPanditId}`
        : `${API_BASE_URL}/admin/pandits`;
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || (isEditing ? 'Failed to update pandit' : 'Failed to create pandit'));
      }

      setBannerMessage({
        type: 'success',
        text: isEditing
          ? `Pt. ${payload.firstName} ${payload.lastName} updated successfully in PostgreSQL!`
          : `New Pandit Pt. ${payload.firstName} ${payload.lastName} registered and activated successfully!`,
      });
      setShowAddEditModal(false);
      setIsEditing(false);
      setEditingPanditId(null);
      await fetchPandits();
    } catch (err: any) {
      setBannerMessage({ type: 'error', text: err.message || 'Operation failed.' });
    } finally {
      setActionLoading(null);
    }
  };

  // Open Edit Modal
  const openEditModal = (p: any) => {
    setIsEditing(true);
    setEditingPanditId(p.id);
    setModalForm({
      firstName: p.user?.firstName || '',
      lastName: p.user?.lastName || '',
      email: p.user?.email || '',
      phoneNumber: p.user?.phoneNumber || '',
      experienceYears: p.experienceYears || 10,
      languages: Array.isArray(p.languages) ? p.languages.join(', ') : '',
      specializations: Array.isArray(p.specializations) ? p.specializations.join(', ') : '',
      city: p.city || 'Pune',
      state: p.state || 'Maharashtra',
      address: p.address || '',
      basePrice: p.basePrice || 2100,
      bio: p.bio || '',
      serviceAreas: Array.isArray(p.serviceAreas) ? p.serviceAreas.join(', ') : '',
      isAvailable: p.isAvailable ?? true,
    });
    setShowAddEditModal(true);
  };

  // Open Add Modal
  const openAddModal = () => {
    setIsEditing(false);
    setEditingPanditId(null);
    setModalForm({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '+91 ',
      experienceYears: 10,
      languages: 'Marathi, Hindi, Sanskrit',
      specializations: 'Satyanarayan Mahapuja, Griha Pravesh, Ganesh Hawan',
      city: 'Pune',
      state: 'Maharashtra',
      address: 'Shivaji Nagar, Pune',
      basePrice: 2100,
      bio: 'Vedic scholar with traditional Gurukul training and authentic Vidhi execution.',
      serviceAreas: 'Pune, Pimpri-Chinchwad, Surrounding regions',
      isAvailable: true,
    });
    setShowAddEditModal(true);
  };

  // Toggle Pandit Active Availability
  const handleToggleStatus = async (p: any) => {
    const token = getClientToken();
    if (!token) return;
    const newStatus = !p.isAvailable;
    const name = `Pt. ${p.user?.firstName || 'Purohit'} ${p.user?.lastName || ''}`.trim();

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

  // Delete Pandit
  const handleDeletePandit = async (p: any) => {
    const name = `Pt. ${p.user?.firstName || 'Purohit'} ${p.user?.lastName || ''}`.trim();
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

  if (!authorized) {
    return (
      <div className="min-h-screen bg-deep-maroon flex items-center justify-center p-4 text-beige">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-maroon text-beige font-sans flex flex-col">
      {/* Top Header */}
      <header className="h-16 border-b border-gold/30 bg-maroon-900 px-6 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/dashboard"
            className="p-2 rounded-xl bg-maroon-950 hover:bg-maroon-800 text-ivory border border-gold/30 transition"
            title="Return to Admin Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <DevSutraLogo variant="dark" size="sm" showTagline={false} />
          <span className="font-heading font-bold text-sm tracking-wide text-ivory border-l border-gold/30 pl-3">
            Admin Pandit Management & Directory
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <button
            onClick={openAddModal}
            className="px-3.5 py-2 bg-gradient-to-r from-gold to-orange-500 hover:from-gold-300 hover:to-orange-400 text-maroon-950 font-bold rounded-lg shadow-md transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Pandit</span>
          </button>

          <button
            onClick={() => fetchPandits()}
            className="px-3 py-1.5 bg-maroon-950 hover:bg-maroon-800 text-beige hover:text-ivory rounded-lg border border-gold/30 transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* Banner Alert Message */}
        {bannerMessage && (
          <div
            className={`p-4 rounded-xl border flex items-center justify-between text-sm ${
              bannerMessage.type === 'success'
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {bannerMessage.type === 'success' ? (
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              )}
              <span>{bannerMessage.text}</span>
            </div>
            <button
              onClick={() => setBannerMessage(null)}
              className="text-xs opacity-75 hover:opacity-100 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Directory Controls Bar */}
        <div className="p-4 rounded-2xl bg-maroon-900/60 border border-gold/20 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-[280px]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gold/60" />
              <input
                type="text"
                placeholder="Search pandit name, phone, email, specializations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchPandits()}
                className="w-full bg-maroon-950 border border-gold/30 rounded-xl pl-9 pr-4 py-2 text-sm text-ivory placeholder-beige/40 focus:outline-none focus:border-gold"
              />
            </div>

            <div className="relative w-44">
              <MapPin className="w-4 h-4 absolute left-3 top-3 text-gold/60" />
              <input
                type="text"
                placeholder="City (e.g. Pune)"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchPandits()}
                className="w-full bg-maroon-950 border border-gold/30 rounded-xl pl-9 pr-3 py-2 text-sm text-ivory placeholder-beige/40 focus:outline-none focus:border-gold"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-beige/70 font-medium">Status:</span>
            {(['ALL', 'VERIFIED', 'PENDING', 'REJECTED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide border transition ${
                  statusFilter === st
                    ? 'bg-gold text-maroon-950 border-gold shadow-sm'
                    : 'bg-maroon-950/80 text-beige/80 border-gold/20 hover:border-gold/50'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Total Pandits Count Banner */}
        <div className="flex items-center justify-between text-xs text-beige/70 px-1">
          <span>
            Total Pandits in PostgreSQL:{' '}
            <strong className="text-gold font-bold">{totalCount}</strong> Purohits
          </span>
          <span>
            Page {page} of {totalPages}
          </span>
        </div>

        {/* Pandits Grid / Table */}
        {loading ? (
          <div className="py-24 text-center">
            <Loader2 className="w-8 h-8 text-gold animate-spin mx-auto mb-3" />
            <p className="text-xs text-beige/70">Querying verified Vedic scholars from PostgreSQL database...</p>
          </div>
        ) : pandits.length === 0 ? (
          <div className="py-20 text-center bg-maroon-900/40 rounded-2xl border border-gold/20 p-8">
            <ShieldCheck className="w-12 h-12 text-gold/40 mx-auto mb-3" />
            <h3 className="font-heading font-bold text-ivory text-base mb-1">No Purohits Found</h3>
            <p className="text-xs text-beige/70 max-w-md mx-auto mb-4">
              No Pandits match your current search or status filter. Click below to register and manage a new Pandit.
            </p>
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-gold hover:bg-gold-300 text-maroon-950 font-bold rounded-xl text-xs transition inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Pandit</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pandits.map((p) => {
              const fullName = p.fullName || `Pt. ${p.user?.firstName || 'Purohit'} ${p.user?.lastName || ''}`.trim();
              const isVerified = p.verificationStatus === 'VERIFIED';
              const isAvailable = p.isAvailable !== false;

              return (
                <div
                  key={p.id}
                  className="p-5 rounded-2xl bg-maroon-900/60 border border-gold/30 hover:border-gold/60 transition shadow-lg flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Top Row: Name, Status & Availability */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-heading font-bold text-ivory text-base">{fullName}</h4>
                          {isVerified ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 border border-emerald-500/40 text-emerald-300">
                              <ShieldCheck className="w-3 h-3 text-emerald-400" />
                              VERIFIED
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 border border-amber-500/40 text-amber-300">
                              PENDING
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gold/90 font-medium mt-0.5">
                          {p.experienceYears || 10}+ Years Vedic Vidhi • {p.city || 'Pune'}, {p.state || 'Maharashtra'}
                        </p>
                      </div>

                      {/* Active Status Badge */}
                      <button
                        onClick={() => handleToggleStatus(p)}
                        disabled={actionLoading === p.id}
                        title="Click to toggle availability"
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition flex items-center gap-1 ${
                          isAvailable
                            ? 'bg-emerald-900/50 text-emerald-300 border-emerald-500/30 hover:bg-emerald-800/60'
                            : 'bg-rose-900/50 text-rose-300 border-rose-500/30 hover:bg-rose-800/60'
                        }`}
                      >
                        {isAvailable ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                        <span>{isAvailable ? 'Active' : 'Inactive'}</span>
                      </button>
                    </div>

                    {/* Contact Info */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-beige/80 bg-maroon-950/60 p-2.5 rounded-xl border border-gold/10">
                      <div className="flex items-center gap-1.5 truncate">
                        <Phone className="w-3.5 h-3.5 text-gold shrink-0" />
                        <span className="truncate">{p.user?.phoneNumber || '+91 9822012345'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <Mail className="w-3.5 h-3.5 text-gold shrink-0" />
                        <span className="truncate">{p.user?.email || 'vedic@devsutra.com'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate col-span-2">
                        <DollarSign className="w-3.5 h-3.5 text-gold shrink-0" />
                        <span>Base Dakshina: </span>
                        <strong className="text-gold font-bold">₹{p.basePrice || 2100}</strong>
                      </div>
                    </div>

                    {/* Specializations & Languages */}
                    <div className="space-y-1.5 text-xs">
                      <div className="flex flex-wrap gap-1">
                        {(p.specializations || ['Satyanarayan', 'Griha Pravesh']).slice(0, 3).map((sp: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-gold/10 border border-gold/30 text-gold-200 text-[11px]"
                          >
                            {sp}
                          </span>
                        ))}
                      </div>

                      <p className="text-[11px] text-beige/70">
                        <span className="text-gold/80 font-medium">Languages: </span>
                        {Array.isArray(p.languages) ? p.languages.join(', ') : 'Marathi, Hindi, Sanskrit'}
                      </p>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="pt-3 border-t border-gold/20 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleViewBookings(p)}
                      className="px-3 py-1.5 bg-maroon-950 hover:bg-maroon-800 text-beige hover:text-ivory rounded-lg text-xs border border-gold/30 transition flex items-center gap-1"
                    >
                      <Calendar className="w-3.5 h-3.5 text-gold" />
                      <span>Booking History</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {!isVerified && (
                        <button
                          onClick={() => handleApprove(p.id, fullName)}
                          disabled={actionLoading === p.id}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-xs transition flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Verify</span>
                        </button>
                      )}

                      <button
                        onClick={() => openEditModal(p)}
                        className="px-2.5 py-1.5 bg-maroon-950 hover:bg-maroon-800 text-gold rounded-lg text-xs border border-gold/30 transition flex items-center gap-1"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleDeletePandit(p)}
                        className="p-1.5 text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 rounded-lg border border-rose-500/20 transition"
                        title="Deactivate / Delete Pandit"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2 rounded-lg bg-maroon-900 border border-gold/30 text-beige disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-beige/80">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-2 rounded-lg bg-maroon-900 border border-gold/30 text-beige disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>

      {/* ----------------------------------------------------------------- */}
      {/* MODAL 1: ADD / EDIT PANDIT MODAL */}
      {/* ----------------------------------------------------------------- */}
      {showAddEditModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-maroon-900 border border-gold/40 rounded-3xl p-6 max-w-2xl w-full my-8 text-beige shadow-2xl relative">
            <button
              onClick={() => setShowAddEditModal(false)}
              className="absolute top-5 right-5 text-beige/60 hover:text-ivory"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-gold" />
              <h3 className="font-heading font-bold text-lg text-ivory">
                {isEditing ? 'Edit Pandit Details' : 'Add New Vedic Pandit (Admin Controlled)'}
              </h3>
            </div>
            <p className="text-xs text-beige/70 mb-5">
              Admin manages all Pandit credentials, specialization, pricing, and availability directly in PostgreSQL. Pandits do not require separate login or self-registration.
            </p>

            <form onSubmit={handleSavePandit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gold/90 font-medium mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={modalForm.firstName}
                    onChange={(e) => setModalForm({ ...modalForm, firstName: e.target.value })}
                    placeholder="e.g. Radheshyam"
                    className="w-full bg-maroon-950 border border-gold/30 rounded-xl px-3 py-2 text-ivory focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-gold/90 font-medium mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={modalForm.lastName}
                    onChange={(e) => setModalForm({ ...modalForm, lastName: e.target.value })}
                    placeholder="e.g. Joshi"
                    className="w-full bg-maroon-950 border border-gold/30 rounded-xl px-3 py-2 text-ivory focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gold/90 font-medium mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={modalForm.email}
                    onChange={(e) => setModalForm({ ...modalForm, email: e.target.value })}
                    placeholder="e.g. radheshyam.joshi@devsutra.com"
                    className="w-full bg-maroon-950 border border-gold/30 rounded-xl px-3 py-2 text-ivory focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-gold/90 font-medium mb-1">Mobile Number (+91) *</label>
                  <input
                    type="text"
                    required
                    value={modalForm.phoneNumber}
                    onChange={(e) => setModalForm({ ...modalForm, phoneNumber: e.target.value })}
                    placeholder="e.g. +91 9822012345"
                    className="w-full bg-maroon-950 border border-gold/30 rounded-xl px-3 py-2 text-ivory focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-gold/90 font-medium mb-1">Experience (Years) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={modalForm.experienceYears}
                    onChange={(e) => setModalForm({ ...modalForm, experienceYears: Number(e.target.value) })}
                    className="w-full bg-maroon-950 border border-gold/30 rounded-xl px-3 py-2 text-ivory focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-gold/90 font-medium mb-1">Base Dakshina (₹) *</label>
                  <input
                    type="number"
                    min="500"
                    step="100"
                    required
                    value={modalForm.basePrice}
                    onChange={(e) => setModalForm({ ...modalForm, basePrice: Number(e.target.value) })}
                    className="w-full bg-maroon-950 border border-gold/30 rounded-xl px-3 py-2 text-ivory focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-gold/90 font-medium mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={modalForm.city}
                    onChange={(e) => setModalForm({ ...modalForm, city: e.target.value })}
                    placeholder="e.g. Pune"
                    className="w-full bg-maroon-950 border border-gold/30 rounded-xl px-3 py-2 text-ivory focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gold/90 font-medium mb-1">Languages (comma separated)</label>
                  <input
                    type="text"
                    value={modalForm.languages}
                    onChange={(e) => setModalForm({ ...modalForm, languages: e.target.value })}
                    placeholder="e.g. Marathi, Hindi, Sanskrit, English"
                    className="w-full bg-maroon-950 border border-gold/30 rounded-xl px-3 py-2 text-ivory focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-gold/90 font-medium mb-1">Specializations (comma separated)</label>
                  <input
                    type="text"
                    value={modalForm.specializations}
                    onChange={(e) => setModalForm({ ...modalForm, specializations: e.target.value })}
                    placeholder="e.g. Satyanarayan Puja, Griha Pravesh, Hawan"
                    className="w-full bg-maroon-950 border border-gold/30 rounded-xl px-3 py-2 text-ivory focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gold/90 font-medium mb-1">Full Address / Location</label>
                <input
                  type="text"
                  value={modalForm.address}
                  onChange={(e) => setModalForm({ ...modalForm, address: e.target.value })}
                  placeholder="e.g. Shivaji Nagar, Near JM Road, Pune - 411005"
                  className="w-full bg-maroon-950 border border-gold/30 rounded-xl px-3 py-2 text-ivory focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-gold/90 font-medium mb-1">Purohit Bio / Gurukul Credentials</label>
                <textarea
                  rows={2}
                  value={modalForm.bio}
                  onChange={(e) => setModalForm({ ...modalForm, bio: e.target.value })}
                  placeholder="Describe Vedic education, Shastra vidhi expertise, etc."
                  className="w-full bg-maroon-950 border border-gold/30 rounded-xl px-3 py-2 text-ivory focus:outline-none focus:border-gold"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="modalIsAvailable"
                  checked={modalForm.isAvailable}
                  onChange={(e) => setModalForm({ ...modalForm, isAvailable: e.target.checked })}
                  className="w-4 h-4 rounded text-gold focus:ring-0 cursor-pointer"
                />
                <label htmlFor="modalIsAvailable" className="cursor-pointer text-ivory font-medium">
                  Active & Available for Devotee Bookings immediately
                </label>
              </div>

              <div className="pt-4 border-t border-gold/20 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddEditModal(false)}
                  className="px-4 py-2 bg-maroon-950 hover:bg-maroon-800 text-beige rounded-xl border border-gold/30"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === 'saving_pandit'}
                  className="px-5 py-2 bg-gradient-to-r from-gold to-orange-500 hover:from-gold-300 hover:to-orange-400 text-maroon-950 font-bold rounded-xl transition flex items-center gap-1.5 shadow-md"
                >
                  {actionLoading === 'saving_pandit' && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isEditing ? 'Save Changes' : 'Create & Activate Pandit'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* MODAL 2: PANDIT BOOKING HISTORY MODAL */}
      {/* ----------------------------------------------------------------- */}
      {showBookingsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-maroon-900 border border-gold/40 rounded-3xl p-6 max-w-3xl w-full my-8 text-beige shadow-2xl relative">
            <button
              onClick={() => setShowBookingsModal(false)}
              className="absolute top-5 right-5 text-beige/60 hover:text-ivory"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-gold" />
              <h3 className="font-heading font-bold text-lg text-ivory">
                Booking History for Pt.{' '}
                {selectedPanditForBookings?.user?.firstName || ''}{' '}
                {selectedPanditForBookings?.user?.lastName || ''}
              </h3>
            </div>
            <p className="text-xs text-beige/70 mb-4">
              Real bookings recorded in PostgreSQL assigned to this Pandit.
            </p>

            {loadingBookings ? (
              <div className="py-12 text-center">
                <Loader2 className="w-6 h-6 text-gold animate-spin mx-auto mb-2" />
                <p className="text-xs text-beige/70">Loading assigned booking records...</p>
              </div>
            ) : panditBookings.length === 0 ? (
              <div className="py-12 text-center bg-maroon-950/60 rounded-2xl border border-gold/20 p-6">
                <Calendar className="w-8 h-8 text-gold/40 mx-auto mb-2" />
                <p className="text-xs text-beige/80">No bookings currently assigned to this Pandit.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
                {panditBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-3.5 rounded-xl bg-maroon-950 border border-gold/20 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-gold font-bold">{b.bookingNumber || b.id.slice(0, 8)}</span>
                        <span className="font-heading font-bold text-ivory">{b.puja?.title || 'Vedic Ritual'}</span>
                      </div>
                      <p className="text-beige/70 text-[11px] mt-0.5">
                        Date: {new Date(b.pujaDate).toLocaleDateString()} • Slot: {b.pujaTimeSlot} • Venue: {b.venueCity}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gold/10 text-gold border border-gold/30">
                        {b.status}
                      </span>
                      <p className="text-xs font-bold text-ivory mt-1">₹{b.totalAmount}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4 border-t border-gold/20 mt-4 text-right">
              <button
                onClick={() => setShowBookingsModal(false)}
                className="px-4 py-2 bg-maroon-950 hover:bg-maroon-800 text-beige rounded-xl border border-gold/30 text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
