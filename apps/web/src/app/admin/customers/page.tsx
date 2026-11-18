import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AdminCustomersPage() {
  const customers = [
    { id: 'c-1', name: 'Rahul Sharma', email: 'rahul.sharma@example.com', phone: '+91 9876543210', city: 'Noida', bookings: 4 },
    { id: 'c-2', name: 'Priya Iyer', email: 'priya.iyer@example.com', phone: '+91 9811223344', city: 'Bengaluru', bookings: 2 },
  ];

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 p-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/dashboard" className="p-2 bg-stone-800 rounded-lg hover:bg-stone-700">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">Customer Devotees</h1>
          <p className="text-xs text-stone-400">View registered customers and their booking histories</p>
        </div>
      </div>

      <div className="bg-stone-950 border border-stone-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-xs text-stone-300">
          <thead className="bg-stone-800 text-stone-400 uppercase text-[10px]">
            <tr>
              <th className="p-4">Customer Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Phone</th>
              <th className="p-4">City</th>
              <th className="p-4">Total Bookings</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-800">
            {customers.map((c) => (
              <tr key={c.id}>
                <td className="p-4 font-bold text-white">{c.name}</td>
                <td className="p-4">{c.email}</td>
                <td className="p-4">{c.phone}</td>
                <td className="p-4">{c.city}</td>
                <td className="p-4">{c.bookings} Bookings</td>
                <td className="p-4 text-right text-stone-400 hover:text-white cursor-pointer">Details</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
