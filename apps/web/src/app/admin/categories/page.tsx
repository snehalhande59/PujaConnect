'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Layers, Plus, Sparkles, FolderTree } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminCategoriesPage() {
  const categories = [
    { name: 'Griha Pravesh Puja', slug: 'griha-pravesh-puja', totalPujas: 4, desc: 'House warming and Vastu consecration ceremonies' },
    { name: 'Satyanarayan Puja', slug: 'satyanarayan-puja', totalPujas: 3, desc: 'Sacred Katha and family prosperity vows' },
    { name: 'Ganesh Puja & Hawan', slug: 'ganesh-puja', totalPujas: 3, desc: 'Auspicious beginnings and hurdle removal' },
    { name: 'Vastu Shanti', slug: 'vastu-shanti', totalPujas: 2, desc: 'Harmonizing residential and commercial spaces' },
    { name: 'Navgraha Shanti', slug: 'navgraha-shanti', totalPujas: 3, desc: 'Planetary pacification and dosha alleviation' },
    { name: 'Rudrabhishek', slug: 'rudrabhishek', totalPujas: 2, desc: 'Sacred Shiva Abhishek with Vedic chanting' },
    { name: 'Wedding & Vivah Sanskar', slug: 'marriage-puja', totalPujas: 5, desc: 'Complete Marathi and Vedic marriage rituals' },
    { name: 'Maha Yagya & Havan', slug: 'havan', totalPujas: 4, desc: 'Purification through sacred fire offerings' },
    { name: 'Mangal Dosh Nivarana', slug: 'mangal-dosh-puja', totalPujas: 2, desc: 'Astrological remedy and matrimonial peace' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Puja Categories
            </h1>
            <p className="text-xs text-stone-400">
              Taxonomy classification, auspicious occasions, and SEO slugs for Vedic rituals
            </p>
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-300">
              <thead className="bg-stone-950 text-stone-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Category Name</th>
                  <th className="p-4">URL Slug</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Active Rituals</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800">
                {categories.map((c) => (
                  <tr key={c.slug} className="hover:bg-stone-800/50 transition">
                    <td className="p-4 font-bold text-white flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-600/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                        <FolderTree className="w-4 h-4" />
                      </div>
                      <span>{c.name}</span>
                    </td>
                    <td className="p-4 font-mono text-stone-400 text-[11px]">/{c.slug}</td>
                    <td className="p-4 text-stone-300">{c.desc}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-lg bg-stone-800 text-amber-300 font-bold text-xs border border-stone-700">
                        {c.totalPujas} Rituals
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
