'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, Loader2, Users, RefreshCw, Phone, Mail, MapPin, Calendar } from 'lucide-react';
import { getClientToken } from '@/lib/auth';
import AdminLayout from '@/components/admin/AdminLayout';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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

  return (
    <AdminLayout>
      <div className="space-y-6">
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

        {/* Search Input */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by devotee name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-stone-900 border border-stone-800 rounded-xl text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-600"
          />
        </div>

        {/* Customers Table */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-3" />
              <p className="text-xs text-stone-400">Loading customers from PostgreSQL database...</p>
            </div>
          ) : customers.length === 0 ? (
            <div className="py-16 text-center text-xs text-stone-400">
              <Users className="w-8 h-8 text-stone-600 mx-auto mb-2" />
              <p className="font-semibold text-stone-300">No registered customers found</p>
              <p className="text-[11px] text-stone-500 mt-1">Try another search term.</p>
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
                    <th className="p-4">Total Bookings</th>
                    <th className="p-4">Registered Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800">
                  {customers.map((c) => {
                    const name = `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Devotee';
                    const email = c.user?.email || 'N/A';
                    const phone = c.user?.phoneNumber || 'N/A';
                    const city = c.city || 'India';
                    const bookingCount = c._count?.bookings || 0;
                    const regDate = c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A';

                    return (
                      <tr key={c.id} className="hover:bg-stone-800/50 transition">
                        <td className="p-4 font-bold text-white flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-amber-600/20 text-amber-300 font-bold flex items-center justify-center text-xs border border-amber-500/30">
                            {name.charAt(0).toUpperCase()}
                          </div>
                          <span>{name}</span>
                        </td>
                        <td className="p-4 text-stone-300">
                          <span className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                            <span>{email}</span>
                          </span>
                        </td>
                        <td className="p-4 text-stone-300">
                          <span className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                            <span>{phone}</span>
                          </span>
                        </td>
                        <td className="p-4 text-stone-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                            <span>{city}</span>
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-lg bg-stone-800 text-amber-300 font-bold text-xs border border-stone-700">
                            {bookingCount} {bookingCount === 1 ? 'Booking' : 'Bookings'}
                          </span>
                        </td>
                        <td className="p-4 text-stone-400">{regDate}</td>
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
