'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Truck, CheckCircle2, Clock } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminOrdersPage() {
  const orders = [
    { id: 'ORD-8821', customer: 'Rahul Sharma', amount: '₹1,899', status: 'SHIPPED', awb: 'DELHIVERY-99882211', city: 'Pune', date: '18 Nov 2026' },
    { id: 'ORD-8822', customer: 'Snehal Hande', amount: '₹3,099', status: 'DELIVERED', awb: 'BLUEDART-11029381', city: 'Pune', date: '19 Nov 2026' },
    { id: 'ORD-8823', customer: 'Aarav Sharma', amount: '₹1,499', status: 'PROCESSING', awb: 'EKART-84729102', city: 'Mumbai', date: '20 Nov 2026' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Orders & Fulfillment
          </h1>
          <p className="text-xs text-stone-400">
            Samagri kit orders dispatch, courier logistics tracking, and delivery timelines
          </p>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-300">
              <thead className="bg-stone-950 text-stone-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Devotee Customer</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">City</th>
                  <th className="p-4">Courier AWB Tracking</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Order Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-stone-800/50 transition">
                    <td className="p-4 font-mono font-bold text-amber-400">{o.id}</td>
                    <td className="p-4 font-bold text-white">{o.customer}</td>
                    <td className="p-4 font-semibold text-white">{o.amount}</td>
                    <td className="p-4 text-stone-300">{o.city}</td>
                    <td className="p-4 font-mono text-stone-400 text-[11px] flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-stone-500" />
                      <span>{o.awb}</span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          o.status === 'DELIVERED'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                            : o.status === 'SHIPPED'
                            ? 'bg-blue-950 text-blue-300 border border-blue-500/30'
                            : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {o.status === 'DELIVERED' ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Clock className="w-3 h-3 text-amber-400" />
                        )}
                        <span>{o.status}</span>
                      </span>
                    </td>
                    <td className="p-4 text-stone-400">{o.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
