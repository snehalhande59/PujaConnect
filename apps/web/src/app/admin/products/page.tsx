import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';

export default function AdminProductsPage() {
  const products = [
    { name: 'Vedic Griha Pravesh Samagri Kit', category: 'Puja Kits', price: '₹1,899', stock: 120, status: 'IN_STOCK' },
    { name: 'Brass Pooja Thali Set', category: 'Pooja Thali', price: '₹1,249', stock: 45, status: 'IN_STOCK' },
    { name: 'Desi Cow Ghee Diya Wicks', category: 'Diya', price: '₹399', stock: 260, status: 'IN_STOCK' },
  ];

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/dashboard" className="p-2 bg-stone-800 rounded-lg hover:bg-stone-700">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">Puja Samagri Inventory</h1>
            <p className="text-xs text-stone-400">Manage catalog products, stock levels, and kit components</p>
          </div>
        </div>
        <button className="px-4 py-2 bg-saffron-600 hover:bg-saffron-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <div className="bg-stone-950 border border-stone-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-xs text-stone-300">
          <thead className="bg-stone-800 text-stone-400 uppercase text-[10px]">
            <tr>
              <th className="p-4">Product Name</th>
              <th className="p-4">Category</th>
              <th className="p-4">Retail Price</th>
              <th className="p-4">Available Stock</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-800">
            {products.map((p, idx) => (
              <tr key={idx}>
                <td className="p-4 font-bold text-white">{p.name}</td>
                <td className="p-4">{p.category}</td>
                <td className="p-4 font-bold text-emerald-400">{p.price}</td>
                <td className="p-4">{p.stock} units</td>
                <td className="p-4">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                    {p.status}
                  </span>
                </td>
                <td className="p-4 text-right text-stone-400 hover:text-white cursor-pointer">Edit</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
