import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';

export default function AdminPujasPage() {
  const pujas = [
    { title: 'Griha Pravesh Puja', category: 'House Warming', price: '₹5,100', duration: '3.5 Hrs', pandits: 2 },
    { title: 'Satyanarayan Puja', category: 'Blessings', price: '₹2,500', duration: '2 Hrs', pandits: 1 },
    { title: 'Maha Rudrabhishek', category: 'Shiva Rites', price: '₹4,100', duration: '2.5 Hrs', pandits: 2 },
  ];

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/dashboard" className="p-2 bg-stone-800 rounded-lg hover:bg-stone-700">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">Puja Catalog Management</h1>
            <p className="text-xs text-stone-400">Add, edit and configure rituals, durations, samagri and pricing</p>
          </div>
        </div>
        <button className="px-4 py-2 bg-saffron-600 hover:bg-saffron-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Add New Puja
        </button>
      </div>

      <div className="bg-stone-950 border border-stone-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-xs text-stone-300">
          <thead className="bg-stone-800 text-stone-400 uppercase text-[10px]">
            <tr>
              <th className="p-4">Puja Title</th>
              <th className="p-4">Category</th>
              <th className="p-4">Base Dakshina</th>
              <th className="p-4">Duration</th>
              <th className="p-4">Required Pandits</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-800">
            {pujas.map((p, idx) => (
              <tr key={idx}>
                <td className="p-4 font-bold text-white">{p.title}</td>
                <td className="p-4">{p.category}</td>
                <td className="p-4 font-semibold text-emerald-400">{p.price}</td>
                <td className="p-4">{p.duration}</td>
                <td className="p-4">{p.pandits}</td>
                <td className="p-4 text-right text-stone-400 hover:text-white cursor-pointer">Edit</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
