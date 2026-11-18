import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';

export default function AdminCategoriesPage() {
  const categories = [
    { name: 'Griha Pravesh Puja', slug: 'griha-pravesh-puja', totalPujas: 4 },
    { name: 'Satyanarayan Puja', slug: 'satyanarayan-puja', totalPujas: 2 },
    { name: 'Ganesh Puja', slug: 'ganesh-puja', totalPujas: 3 },
    { name: 'Vastu Shanti', slug: 'vastu-shanti', totalPujas: 2 },
    { name: 'Navgraha Shanti', slug: 'navgraha-shanti', totalPujas: 3 },
    { name: 'Rudrabhishek', slug: 'rudrabhishek', totalPujas: 2 },
    { name: 'Marriage Puja', slug: 'marriage-puja', totalPujas: 5 },
    { name: 'Havan', slug: 'havan', totalPujas: 4 },
    { name: 'Mangal Dosh Puja', slug: 'mangal-dosh-puja', totalPujas: 2 },
  ];

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/dashboard" className="p-2 bg-stone-800 rounded-lg hover:bg-stone-700">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">Puja Categories</h1>
            <p className="text-xs text-stone-400">Manage category taxonomy, images, and SEO slugs</p>
          </div>
        </div>
        <button className="px-4 py-2 bg-saffron-600 hover:bg-saffron-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="bg-stone-950 border border-stone-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-xs text-stone-300">
          <thead className="bg-stone-800 text-stone-400 uppercase text-[10px]">
            <tr>
              <th className="p-4">Category Name</th>
              <th className="p-4">URL Slug</th>
              <th className="p-4">Active Rituals</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-800">
            {categories.map((c, i) => (
              <tr key={i}>
                <td className="p-4 font-bold text-white">{c.name}</td>
                <td className="p-4 font-mono text-stone-400">{c.slug}</td>
                <td className="p-4">{c.totalPujas} Pujas</td>
                <td className="p-4 text-right text-stone-400 hover:text-white cursor-pointer">Edit</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
