'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Package, Plus, Sparkles, CheckCircle2, IndianRupee } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminProductsPage() {
  const products = [
    { name: 'Vedic Griha Pravesh Samagri Kit (60+ Sacred Items)', category: 'Puja Kits', price: '₹1,899', stock: 120, status: 'IN_STOCK' },
    { name: 'Satyanarayan Mahapuja Complete Samagri Box', category: 'Puja Kits', price: '₹1,499', stock: 85, status: 'IN_STOCK' },
    { name: 'Brass Sacred Pooja Thali Set (Panchpatra + Achmani)', category: 'Pooja Thali', price: '₹1,249', stock: 45, status: 'IN_STOCK' },
    { name: 'Pure Desi Cow Ghee Diya Wicks (Pack of 100)', category: 'Diya & Kapoor', price: '₹399', stock: 260, status: 'IN_STOCK' },
    { name: 'Bhimseni Pure Camphor (Flake Grade)', category: 'Diya & Kapoor', price: '₹299', stock: 180, status: 'IN_STOCK' },
    { name: 'Authentic Gangajal & Panchamrit Containers', category: 'Pavitra Jal', price: '₹199', stock: 320, status: 'IN_STOCK' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Samagri Products
            </h1>
            <p className="text-xs text-stone-400">
              Sacred Puja items inventory, kit components, stock counts, and fulfillment pricing
            </p>
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-300">
              <thead className="bg-stone-950 text-stone-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Product Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock Level</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800">
                {products.map((p) => (
                  <tr key={p.name} className="hover:bg-stone-800/50 transition">
                    <td className="p-4 font-bold text-white flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-600/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                        <Package className="w-4 h-4" />
                      </div>
                      <span>{p.name}</span>
                    </td>
                    <td className="p-4 text-stone-300">{p.category}</td>
                    <td className="p-4 font-bold text-amber-300">{p.price}</td>
                    <td className="p-4 font-semibold text-white">{p.stock} units</td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>In Stock</span>
                      </span>
                    </td>
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
