'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  RefreshCw,
  Search,
  Sparkles,
  User,
  IndianRupee,
  Calendar,
  AlertCircle,
  Star,
  Check,
  Trash2,
} from 'lucide-react';
import { getClientToken } from '@/lib/auth';
import AdminLayout from '@/components/admin/AdminLayout';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
  user?: {
    email?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
  };
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [onlyUnread, setOnlyUnread] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');

  const fetchNotifications = useCallback(async (isSilent = false) => {
    const token = getClientToken();
    try {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);

      const res = await fetch(`${API_BASE_URL}/admin/notifications?_t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const json = await res.json();
        const data = json.data?.notifications || json.notifications || json.data || [];
        const count = json.data?.unreadCount ?? json.unreadCount ?? 0;
        setNotifications(Array.isArray(data) ? data : []);
        setUnreadCount(typeof count === 'number' ? count : 0);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => fetchNotifications(true), 10000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    const token = getClientToken();
    try {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));

      await fetch(`${API_BASE_URL}/admin/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error('Failed to mark notification read:', err);
      fetchNotifications(true);
    }
  };

  const handleMarkAllRead = async () => {
    const token = getClientToken();
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);

      await fetch(`${API_BASE_URL}/admin/notifications/read-all`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error('Failed to mark all read:', err);
      fetchNotifications(true);
    }
  };

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      if (onlyUnread && n.isRead) return false;
      if (filterType !== 'ALL' && n.type?.toUpperCase() !== filterType.toUpperCase()) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const t = (n.title || '').toLowerCase();
        const m = (n.message || '').toLowerCase();
        if (!t.includes(q) && !m.includes(q)) return false;
      }
      return true;
    });
  }, [notifications, onlyUnread, filterType, search]);

  const renderIcon = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'BOOKING':
        return <Calendar className="w-5 h-5 text-amber-600" />;
      case 'PAYMENT':
        return <IndianRupee className="w-5 h-5 text-emerald-600" />;
      case 'REVIEW':
        return <Star className="w-5 h-5 text-amber-500 fill-amber-500" />;
      case 'CUSTOMER':
        return <User className="w-5 h-5 text-blue-600" />;
      default:
        return <Bell className="w-5 h-5 text-stone-600" />;
    }
  };

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center justify-center p-1.5 rounded-lg bg-amber-100 text-amber-800">
                <Bell className="w-5 h-5 text-amber-700" />
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                Enterprise Notification Center
              </h1>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white animate-pulse">
                  {unreadCount} Unread
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-stone-500">
              Live operational alerts, booking confirmations, payment verifications, and customer actions
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-semibold transition border border-amber-200"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark All Read</span>
              </button>
            )}

            <button
              onClick={() => fetchNotifications(false)}
              disabled={loading || refreshing}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition border border-stone-200"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-amber-600' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setOnlyUnread(!onlyUnread)}
              className={`px-3 py-1.5 rounded-xl border transition font-semibold ${
                onlyUnread
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              {onlyUnread ? 'Showing Unread' : 'Filter Unread'}
            </button>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 text-stone-800 font-medium focus:outline-amber-600"
            >
              <option value="ALL">All Categories</option>
              <option value="BOOKING">Sacred Bookings</option>
              <option value="PAYMENT">Finance & Payments</option>
              <option value="REVIEW">Devotee Reviews</option>
              <option value="CUSTOMER">Customer Directory</option>
              <option value="SYSTEM">System Alerts</option>
            </select>
          </div>

          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 placeholder-stone-400 focus:outline-amber-600"
            />
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="p-16 text-center bg-white rounded-2xl border border-stone-200">
            <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-stone-800">Synchronizing Notifications...</p>
            <p className="text-xs text-stone-500">Querying live PostgreSQL notifications</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-2xl border border-stone-200 text-stone-400">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-stone-800">No Notifications Found</p>
            <p className="text-xs text-stone-500 mt-0.5">
              {onlyUnread
                ? 'All operational alerts have been marked as read.'
                : 'No alerts matching your current filter.'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs divide-y divide-stone-100 overflow-hidden">
            {filtered.map((item) => (
              <div
                key={item.id}
                className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:bg-stone-50/80 ${
                  !item.isRead ? 'bg-amber-50/30' : ''
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                      !item.isRead ? 'bg-amber-100/70 border-amber-200' : 'bg-stone-100 border-stone-200'
                    }`}
                  >
                    {renderIcon(item.type)}
                  </div>

                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-sm text-stone-900 leading-snug">{item.title}</h4>
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" title="Unread" />
                      )}
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200">
                        {item.type || 'SYSTEM'}
                      </span>
                    </div>

                    <p className="text-xs text-stone-600 leading-relaxed">{item.message}</p>

                    <div className="flex items-center gap-3 text-[11px] text-stone-400 pt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(item.createdAt).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>

                      {item.user?.email && (
                        <span>Devotee: {item.user.email}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {item.link && (
                    <Link
                      href={item.link}
                      onClick={() => !item.isRead && handleMarkAsRead(item.id)}
                      className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <span>View Record</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}

                  {!item.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(item.id)}
                      className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-600 transition"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4 text-emerald-600" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
