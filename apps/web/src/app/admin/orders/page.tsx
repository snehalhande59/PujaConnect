import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AdminOrdersPage() {
  const orders = [
    { id: 'ORD-8821', customer: 'Rahul Sharma', amount: '₹1,899', status: 'SHIPPED', awb: 'DELHIVERY-99882211', date: '15 Nov 2026' },
  ];

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 p-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/dashboard" className="p-2 bg-stone-800 rounded-lg hover:bg-stone-700">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">Samagri E-Commerce Orders</h1>
          <p className="text-xs text-stone-400">Order fulfillment, courier logistics tracking, and delivery updates</p>
        </div>
      </div>

      <div className="bg-stone-950 border border-stone-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-xs text-stone-300">
          <thead className="bg-stone-800 text-stone-400 uppercase text-[10px]">
            <tr>
              <th className="p-4">Order ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Total Amount</th>
              <th className="p-4">Status</th>
              <th className="p-4">Courier AWB</th>
              <th className="p-4">Date</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-800">
            {orders.map((o) => (
              <tr key={o.id}>
                <td className="p-4 font-mono font-bold text-white">{o.id}</td>
                <td className="p-4">{o.customer}</td>
                <td className="p-4 font-bold text-emerald-400">{o.amount}</td>
                <td className="p-4">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400">
                    {o.status}
                  </span>
                </td>
                <td className="p-4 font-mono text-stone-400">{o.awb}</td>
                <td className="p-4 text-stone-400">{o.date}</td>
                <td className="p-4 text-right text-stone-400 hover:text-white cursor-pointer">Update Status</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
