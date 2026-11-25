'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar as CalendarIcon,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  MapPin,
  Phone,
  Mail,
  IndianRupee,
  Filter,
  CheckCircle2,
  Clock3,
  XCircle,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Search,
  ExternalLink,
  ShieldCheck,
  Eye,
  X,
} from 'lucide-react';
import { getClientToken } from '@/lib/auth';
import AdminLayout from '@/components/admin/AdminLayout';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

interface Pandit {
  id: string;
  fullName: string;
  avatarUrl?: string;
  city?: string;
  experienceYears?: number;
  verificationStatus?: string;
}

interface Booking {
  id: string;
  bookingNumber?: string;
  pujaDate: string;
  pujaTimeSlot?: string;
  pujaLanguage?: string;
  venueAddress?: string;
  city?: string;
  pincode?: string;
  totalAmount?: number | string;
  status: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt?: string;
  customerProfile?: {
    firstName?: string;
    lastName?: string;
    user?: {
      email?: string;
      phoneNumber?: string;
    };
  };
  panditProfile?: {
    id: string;
    fullName?: string;
    avatarUrl?: string;
    city?: string;
    user?: {
      email?: string;
      phoneNumber?: string;
    };
  };
  puja?: {
    id: string;
    title: string;
    durationMinutes?: number;
    basePrice?: number;
  };
  payments?: Array<{
    id: string;
    amount: number | string;
    status: string;
    transactionId?: string;
    paymentMethod?: string;
  }>;
}

export default function AdminCalendarPage() {
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedPanditId, setSelectedPanditId] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [pandits, setPandits] = useState<Pandit[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activeBookingDetail, setActiveBookingDetail] = useState<Booking | null>(null);

  // Fetch verified pandits
  const fetchPandits = useCallback(async () => {
    const token = getClientToken();
    try {
      const res = await fetch(`${API_BASE_URL}/admin/pandits?limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        let list: any[] = [];
        if (Array.isArray(json)) list = json;
        else if (Array.isArray(json.data?.pandits)) list = json.data.pandits;
        else if (Array.isArray(json.pandits)) list = json.pandits;
        else if (Array.isArray(json.data?.data)) list = json.data.data;
        else if (Array.isArray(json.data)) list = json.data;
        setPandits(list);
      }
    } catch (err) {
      console.error('Failed to load pandits for calendar:', err);
      setPandits([]);
    }
  }, []);

  // Fetch all bookings
  const fetchBookings = useCallback(async (isSilent = false) => {
    const token = getClientToken();
    try {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);

      const url = new URL(`${API_BASE_URL}/admin/bookings`);
      url.searchParams.append('limit', '250');
      url.searchParams.append('_t', Date.now().toString());

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        let list: any[] = [];
        if (Array.isArray(json)) list = json;
        else if (Array.isArray(json.data?.bookings)) list = json.data.bookings;
        else if (Array.isArray(json.bookings)) list = json.bookings;
        else if (Array.isArray(json.data?.data)) list = json.data.data;
        else if (Array.isArray(json.data)) list = json.data;
        setBookings(list);
      }
    } catch (err) {
      console.error('Failed to load bookings for calendar:', err);
      setBookings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPandits();
    fetchBookings();
    const interval = setInterval(() => fetchBookings(true), 12000);
    return () => clearInterval(interval);
  }, [fetchPandits, fetchBookings]);

  // Date Navigation Helpers
  const handlePrev = () => {
    const d = new Date(selectedDate);
    if (viewMode === 'daily') d.setDate(d.getDate() - 1);
    else if (viewMode === 'weekly') d.setDate(d.getDate() - 7);
    else d.setMonth(d.getMonth() - 1);
    setSelectedDate(d);
  };

  const handleNext = () => {
    const d = new Date(selectedDate);
    if (viewMode === 'daily') d.setDate(d.getDate() + 1);
    else if (viewMode === 'weekly') d.setDate(d.getDate() + 7);
    else d.setMonth(d.getMonth() + 1);
    setSelectedDate(d);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  // Filter Bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // Pandit filter
      if (selectedPanditId !== 'ALL' && b.panditProfile?.id !== selectedPanditId) {
        return false;
      }
      // Status filter
      if (statusFilter !== 'ALL' && b.status?.toUpperCase() !== statusFilter.toUpperCase()) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const devoteeName = `${b.customerProfile?.firstName || ''} ${b.customerProfile?.lastName || ''}`.toLowerCase();
        const panditName = (b.panditProfile?.fullName || '').toLowerCase();
        const pujaTitle = (b.puja?.title || '').toLowerCase();
        const bookingNum = (b.bookingNumber || b.id || '').toLowerCase();
        const city = (b.city || '').toLowerCase();
        if (
          !devoteeName.includes(q) &&
          !panditName.includes(q) &&
          !pujaTitle.includes(q) &&
          !bookingNum.includes(q) &&
          !city.includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [bookings, selectedPanditId, statusFilter, searchQuery]);

  // Helper: check if a date string matches a given day YYYY-MM-DD
  const isSameDay = (dateStr: string, targetDate: Date) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return (
      d.getFullYear() === targetDate.getFullYear() &&
      d.getMonth() === targetDate.getMonth() &&
      d.getDate() === targetDate.getDate()
    );
  };

  // Start & End of current week (Monday to Sunday)
  const weekDays = useMemo(() => {
    const curr = new Date(selectedDate);
    const day = curr.getDay();
    // distance to Monday (if Sunday (0), distance is -6)
    const diff = curr.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(curr.setDate(diff));

    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(monday);
      nextDay.setDate(monday.getDate() + i);
      days.push(nextDay);
    }
    return days;
  }, [selectedDate]);

  // Days of current month
  const monthDays = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Day of week of 1st day (0 is Sun, 1 is Mon)
    let startDayOfWeek = firstDay.getDay();
    // Convert to Monday = 0
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    const days: Array<{ date: Date; isCurrentMonth: boolean }> = [];

    // Prev month padding
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      days.push({ date: d, isCurrentMonth: false });
    }

    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

    // Next month padding to fill grid
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }

    return days;
  }, [selectedDate]);

  // Quick stats
  const stats = useMemo(() => {
    const confirmed = filteredBookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'ACCEPTED').length;
    const pending = filteredBookings.filter((b) => b.status === 'PENDING').length;
    const completed = filteredBookings.filter((b) => b.status === 'COMPLETED').length;
    const cancelled = filteredBookings.filter((b) => b.status === 'CANCELLED').length;
    const totalVolume = filteredBookings.reduce((sum, b) => sum + Number(b.totalAmount || 0), 0);
    return { total: filteredBookings.length, confirmed, pending, completed, cancelled, totalVolume };
  }, [filteredBookings]);

  // Status badge styling
  const renderStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
      case 'ACCEPTED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Confirmed
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock3 className="w-3 h-3 text-amber-600" /> Pending
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Sparkles className="w-3 h-3 text-blue-600" /> Completed
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700 border border-stone-200">
            {status}
          </span>
        );
    }
  };

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Top Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center justify-center p-1.5 rounded-lg bg-amber-100 text-amber-800">
                <CalendarDays className="w-5 h-5 text-amber-700" />
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                Pandit Schedule & Ceremonial Calendar
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-stone-500">
              Live Vedic scheduling, daily/weekly/monthly ceremony rosters, and pandit availability
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-semibold">
              <button
                onClick={() => setViewMode('daily')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  viewMode === 'daily'
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Daily
              </button>
              <button
                onClick={() => setViewMode('weekly')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  viewMode === 'weekly'
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setViewMode('monthly')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  viewMode === 'monthly'
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Monthly
              </button>
            </div>

            <button
              onClick={() => fetchBookings(false)}
              disabled={loading || refreshing}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition border border-stone-200"
              title="Refresh calendar"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-amber-600' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Date Navigator & Filters Bar */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Date Navigation Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                className="p-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 transition"
                title="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleToday}
                className="px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-stone-800 transition"
              >
                Today
              </button>
              <button
                onClick={handleNext}
                className="p-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 transition"
                title="Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="ml-2 font-bold text-sm sm:text-base text-stone-900">
                {viewMode === 'daily' &&
                  selectedDate.toLocaleDateString('en-IN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                {viewMode === 'weekly' && (
                  <span>
                    Week of {weekDays[0].toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} –{' '}
                    {weekDays[6].toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                )}
                {viewMode === 'monthly' &&
                  selectedDate.toLocaleDateString('en-IN', {
                    month: 'long',
                    year: 'numeric',
                  })}
              </div>

              {/* Jump to Date Input */}
              <input
                type="date"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => {
                  if (e.target.value) {
                    setSelectedDate(new Date(e.target.value));
                  }
                }}
                className="ml-auto lg:ml-3 text-xs border border-stone-200 rounded-lg px-2.5 py-1 text-stone-700 focus:outline-amber-600"
              />
            </div>

            {/* Pandit & Status Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Pandit Selector */}
              <select
                value={selectedPanditId}
                onChange={(e) => setSelectedPanditId(e.target.value)}
                className="text-xs bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800 font-medium focus:outline-amber-600"
              >
                <option value="ALL">All Verified Scholars ({Array.isArray(pandits) ? pandits.length : 0})</option>
                {Array.isArray(pandits) &&
                  pandits.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName || 'Pt. Vedic Shastri'} ({p.city || 'Maharashtra'})
                    </option>
                  ))}
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800 font-medium focus:outline-amber-600"
              >
                <option value="ALL">All Statuses</option>
                <option value="CONFIRMED">Confirmed / Accepted</option>
                <option value="PENDING">Pending Approval</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              {/* Devotee / Booking Search */}
              <div className="relative min-w-[180px]">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter devotee, puja..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 placeholder-stone-400 focus:outline-amber-600"
                />
              </div>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-3 border-t border-stone-100 text-xs">
            <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
              <span className="text-stone-500 text-[11px] block">Roster Ceremonies</span>
              <span className="text-base font-bold text-stone-900">{stats.total}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
              <span className="text-emerald-700 text-[11px] block font-medium">Confirmed Slots</span>
              <span className="text-base font-bold text-emerald-900">{stats.confirmed}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-100">
              <span className="text-amber-700 text-[11px] block font-medium">Pending Requests</span>
              <span className="text-base font-bold text-amber-900">{stats.pending}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100">
              <span className="text-blue-700 text-[11px] block font-medium">Completed Vidhis</span>
              <span className="text-base font-bold text-blue-900">{stats.completed}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-100">
              <span className="text-rose-700 text-[11px] block font-medium">Released / Cancelled</span>
              <span className="text-base font-bold text-rose-900">{stats.cancelled}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200">
              <span className="text-amber-800 text-[11px] block font-medium">Dakshina Volume</span>
              <span className="text-base font-bold text-amber-900">₹{stats.totalVolume.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* CALENDAR VIEWS */}
        {loading ? (
          <div className="p-16 text-center bg-white rounded-2xl border border-stone-200">
            <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-stone-800">Synchronizing Vedic Schedule...</p>
            <p className="text-xs text-stone-500">Querying live PostgreSQL bookings and scholar calendars</p>
          </div>
        ) : (
          <>
            {/* 1. DAILY VIEW */}
            {viewMode === 'daily' && (
              <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
                <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-amber-700" />
                    <h3 className="font-bold text-sm text-stone-900">
                      Ceremony Timeline for{' '}
                      {selectedDate.toLocaleDateString('en-IN', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </h3>
                  </div>
                  <span className="text-xs font-semibold text-stone-500">
                    {filteredBookings.filter((b) => isSameDay(b.pujaDate, selectedDate)).length} Scheduled
                  </span>
                </div>

                {filteredBookings.filter((b) => isSameDay(b.pujaDate, selectedDate)).length === 0 ? (
                  <div className="p-16 text-center text-stone-400">
                    <CalendarDays className="w-10 h-10 mx-auto mb-2 text-stone-300" />
                    <p className="text-sm font-semibold text-stone-700">No Ceremonies Scheduled for this Date</p>
                    <p className="text-xs text-stone-500 mt-1">
                      Pandits are available for booking. Select a different date or clear your filters.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-stone-100">
                    {filteredBookings
                      .filter((b) => isSameDay(b.pujaDate, selectedDate))
                      .map((booking) => (
                        <div
                          key={booking.id}
                          onClick={() => setActiveBookingDetail(booking)}
                          className="p-4 hover:bg-stone-50 transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          <div className="flex items-start gap-4">
                            {/* Time Slot Pill */}
                            <div className="min-w-[120px] text-center p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                              <span className="text-[10px] text-amber-700 font-bold block uppercase tracking-wider">
                                Time Slot
                              </span>
                              <span className="text-xs font-extrabold text-stone-900 block mt-0.5">
                                {booking.pujaTimeSlot || 'Morning Muhurth'}
                              </span>
                            </div>

                            {/* Booking & Puja Details */}
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-extrabold text-sm text-stone-900">
                                  {booking.puja?.title || 'Vedic Ceremony'}
                                </span>
                                {renderStatusBadge(booking.status)}
                                <span className="text-[11px] text-stone-400 font-mono">
                                  #{booking.bookingNumber || booking.id.slice(0, 8)}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-600">
                                <span className="flex items-center gap-1 font-medium text-stone-800">
                                  <User className="w-3.5 h-3.5 text-stone-400" />
                                  Devotee: {booking.customerProfile?.firstName || 'Devotee'}{' '}
                                  {booking.customerProfile?.lastName || ''}
                                </span>
                                {booking.customerProfile?.user?.phoneNumber && (
                                  <span className="flex items-center gap-1 text-stone-500">
                                    <Phone className="w-3.5 h-3.5 text-stone-400" />
                                    {booking.customerProfile.user.phoneNumber}
                                  </span>
                                )}
                                <span className="flex items-center gap-1 text-stone-500">
                                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                                  {booking.city || 'Pune'}, {booking.venueAddress || 'Family Residence'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Pandit & Dakshina Block */}
                          <div className="flex items-center justify-between md:justify-end gap-6 pt-2 md:pt-0 border-t md:border-t-0 border-stone-100">
                            <div className="flex items-center gap-2 text-right">
                              {booking.panditProfile?.avatarUrl ? (
                                <img
                                  src={booking.panditProfile.avatarUrl}
                                  alt={booking.panditProfile.fullName || 'Pandit'}
                                  className="w-9 h-9 rounded-full object-cover border border-amber-200"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                                  Pt
                                </div>
                              )}
                              <div className="text-left">
                                <span className="text-xs font-bold text-stone-900 block">
                                  {booking.panditProfile?.fullName || 'Assigned Vedic Pandit'}
                                </span>
                                <span className="text-[11px] text-stone-500 block">
                                  {booking.panditProfile?.city || 'Pune'} Scholar
                                </span>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="text-xs font-bold text-stone-900 block">
                                ₹{Number(booking.totalAmount || 0).toLocaleString('en-IN')}
                              </span>
                              <span
                                className={`text-[10px] font-bold block ${
                                  booking.payments?.[0]?.status === 'COMPLETED' || booking.status === 'CONFIRMED'
                                    ? 'text-emerald-700'
                                    : 'text-amber-700'
                                }`}
                              >
                                {booking.payments?.[0]?.status === 'COMPLETED' ? 'PAID' : 'PAYMENT PENDING'}
                              </span>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveBookingDetail(booking);
                              }}
                              className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-600 transition"
                              title="View details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* 2. WEEKLY VIEW */}
            {viewMode === 'weekly' && (
              <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-stone-200">
                  {weekDays.map((dayDate, i) => {
                    const dayBookings = filteredBookings.filter((b) => isSameDay(b.pujaDate, dayDate));
                    const isToday = isSameDay(new Date().toISOString(), dayDate);

                    return (
                      <div key={i} className="min-h-[480px] flex flex-col bg-stone-50/40">
                        {/* Day Column Header */}
                        <div
                          className={`p-3 text-center border-b border-stone-200 ${
                            isToday ? 'bg-amber-100/70 border-b-amber-300' : 'bg-stone-50'
                          }`}
                        >
                          <span className="text-[11px] font-bold text-stone-500 block uppercase">
                            {dayDate.toLocaleDateString('en-IN', { weekday: 'short' })}
                          </span>
                          <span
                            className={`inline-block text-sm font-extrabold mt-0.5 px-2 py-0.5 rounded-full ${
                              isToday ? 'bg-amber-700 text-white' : 'text-stone-900'
                            }`}
                          >
                            {dayDate.getDate()}
                          </span>
                          <span className="text-[10px] text-stone-400 block mt-0.5">
                            {dayBookings.length} {dayBookings.length === 1 ? 'Ceremony' : 'Ceremonies'}
                          </span>
                        </div>

                        {/* Bookings List for Day */}
                        <div className="p-2 space-y-2 flex-1 overflow-y-auto">
                          {dayBookings.length === 0 ? (
                            <div className="h-full flex items-center justify-center p-4 text-center">
                              <span className="text-[11px] text-stone-400 italic">No bookings</span>
                            </div>
                          ) : (
                            dayBookings.map((b) => (
                              <div
                                key={b.id}
                                onClick={() => setActiveBookingDetail(b)}
                                className="p-2.5 bg-white rounded-xl border border-stone-200 hover:border-amber-400 hover:shadow-xs transition cursor-pointer space-y-1.5"
                              >
                                <div className="flex items-center justify-between gap-1">
                                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                    {b.pujaTimeSlot || 'Morning'}
                                  </span>
                                  {renderStatusBadge(b.status)}
                                </div>

                                <div className="font-bold text-xs text-stone-900 leading-snug line-clamp-2">
                                  {b.puja?.title || 'Vedic Ritual'}
                                </div>

                                <div className="text-[11px] text-stone-600 flex items-center gap-1">
                                  <User className="w-3 h-3 text-stone-400 shrink-0" />
                                  <span className="truncate">
                                    {b.customerProfile?.firstName || 'Devotee'} {b.customerProfile?.lastName || ''}
                                  </span>
                                </div>

                                <div className="text-[11px] font-medium text-amber-900 pt-1 border-t border-stone-100 flex items-center justify-between">
                                  <span className="truncate text-stone-700">
                                    Pt. {b.panditProfile?.fullName?.replace(/^Pt\.\s*/i, '') || 'Assigned'}
                                  </span>
                                  <span className="font-bold">₹{Number(b.totalAmount || 0)}</span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. MONTHLY VIEW */}
            {viewMode === 'monthly' && (
              <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
                {/* Day of Week Headers */}
                <div className="grid grid-cols-7 bg-stone-50 border-b border-stone-200 text-center py-2.5 text-xs font-bold text-stone-600">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 divide-x divide-y divide-stone-200">
                  {monthDays.map(({ date: dayDate, isCurrentMonth }, idx) => {
                    const dayBookings = filteredBookings.filter((b) => isSameDay(b.pujaDate, dayDate));
                    const isToday = isSameDay(new Date().toISOString(), dayDate);

                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          setSelectedDate(dayDate);
                          setViewMode('daily');
                        }}
                        className={`min-h-[110px] p-2 flex flex-col justify-between hover:bg-amber-50/40 transition cursor-pointer ${
                          !isCurrentMonth ? 'bg-stone-50/50 text-stone-300' : 'bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                              isToday
                                ? 'bg-amber-700 text-white'
                                : isCurrentMonth
                                ? 'text-stone-800'
                                : 'text-stone-400'
                            }`}
                          >
                            {dayDate.getDate()}
                          </span>

                          {dayBookings.length > 0 && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                              {dayBookings.length}
                            </span>
                          )}
                        </div>

                        {/* Booking Preview Pills */}
                        <div className="space-y-1 mt-1">
                          {dayBookings.slice(0, 2).map((b) => (
                            <div
                              key={b.id}
                              className={`text-[10px] px-1.5 py-0.5 rounded truncate font-medium ${
                                b.status === 'CONFIRMED' || b.status === 'ACCEPTED'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : b.status === 'CANCELLED'
                                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                  : 'bg-amber-50 text-amber-800 border border-amber-200'
                              }`}
                            >
                              {b.pujaTimeSlot ? `${b.pujaTimeSlot.split(' ')[0]} ` : ''}
                              {b.puja?.title || 'Ceremony'}
                            </div>
                          ))}
                          {dayBookings.length > 2 && (
                            <span className="text-[10px] text-stone-400 font-semibold block text-center">
                              +{dayBookings.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* DETAILED BOOKING MODAL */}
        {activeBookingDetail && (
          <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-stone-200 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl text-xs text-stone-800 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
                    Ceremonial Booking Details
                  </span>
                  <h3 className="font-bold text-base text-stone-900">
                    {activeBookingDetail.puja?.title || 'Vedic Ceremony'}
                  </h3>
                  <span className="text-[11px] text-stone-500 font-mono">
                    ID: #{activeBookingDetail.bookingNumber || activeBookingDetail.id}
                  </span>
                </div>
                <button
                  onClick={() => setActiveBookingDetail(null)}
                  className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Status & Date Highlights */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                  <span className="text-[11px] text-stone-500 block">Booking Status</span>
                  {renderStatusBadge(activeBookingDetail.status)}
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                  <span className="text-[11px] text-stone-500 block">Ceremony Date & Slot</span>
                  <span className="font-bold text-stone-900 block">
                    {new Date(activeBookingDetail.pujaDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  <span className="text-amber-700 font-semibold text-[11px] block">
                    {activeBookingDetail.pujaTimeSlot || 'Morning Muhurth'}
                  </span>
                </div>
              </div>

              {/* Assigned Pandit */}
              <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200 space-y-2">
                <span className="text-[10px] font-bold uppercase text-amber-800 block">
                  Assigned Vedic Scholar / Purohit
                </span>
                <div className="flex items-center gap-3">
                  {activeBookingDetail.panditProfile?.avatarUrl ? (
                    <img
                      src={activeBookingDetail.panditProfile.avatarUrl}
                      alt="Pandit"
                      className="w-10 h-10 rounded-full object-cover border border-amber-300"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center text-xs">
                      Pt
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-sm text-stone-900">
                      {activeBookingDetail.panditProfile?.fullName || 'Pt. Devendra Shastri'}
                    </h4>
                    <span className="text-[11px] text-stone-600 block">
                      📍 {activeBookingDetail.panditProfile?.city || 'Pune'} Scholar
                    </span>
                  </div>
                </div>
              </div>

              {/* Devotee Info & Venue */}
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <span className="text-[10px] font-bold uppercase text-stone-500 block">Devotee & Sacred Venue</span>
                <div className="space-y-1 text-stone-700">
                  <p className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-stone-400" />
                    <span className="font-semibold text-stone-900">
                      {activeBookingDetail.customerProfile?.firstName || 'Devotee'}{' '}
                      {activeBookingDetail.customerProfile?.lastName || ''}
                    </span>
                  </p>
                  {activeBookingDetail.customerProfile?.user?.phoneNumber && (
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-stone-400" />
                      <span>{activeBookingDetail.customerProfile.user.phoneNumber}</span>
                    </p>
                  )}
                  {activeBookingDetail.customerProfile?.user?.email && (
                    <p className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-stone-400" />
                      <span>{activeBookingDetail.customerProfile.user.email}</span>
                    </p>
                  )}
                  <p className="flex items-center gap-2 pt-1 border-t border-stone-200">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    <span>
                      {activeBookingDetail.venueAddress || 'Customer Residence'}, {activeBookingDetail.city || 'Pune'} -{' '}
                      {activeBookingDetail.pincode || '411038'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Financial & Dakshina Summary */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-stone-500 block">Total Dakshina & Samagri</span>
                  <span className="text-base font-bold text-stone-900">
                    ₹{Number(activeBookingDetail.totalAmount || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-stone-500 block">Payment Status</span>
                  <span
                    className={`font-bold ${
                      activeBookingDetail.payments?.[0]?.status === 'COMPLETED'
                        ? 'text-emerald-700'
                        : 'text-amber-700'
                    }`}
                  >
                    {activeBookingDetail.payments?.[0]?.status === 'COMPLETED' ? 'PAID' : 'PENDING'}
                  </span>
                </div>
              </div>

              {/* Cancellation Reason if Cancelled */}
              {activeBookingDetail.status === 'CANCELLED' && (
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-800">
                  <span className="font-bold text-[11px] block">Cancellation Reason:</span>
                  <p className="text-xs mt-0.5">
                    {activeBookingDetail.cancellationReason || 'Cancelled by devotee from dashboard/app'}
                  </p>
                </div>
              )}

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-stone-200">
                <Link
                  href="/admin/bookings"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-800"
                >
                  <span>Open in Booking Operations</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>

                <button
                  onClick={() => setActiveBookingDetail(null)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-semibold transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
