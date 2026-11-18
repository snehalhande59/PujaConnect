import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AdminBookingsPage() {
  const bookings = [
    { id: 'BK-2026-904', puja: 'Maha Rudrabhishek', customer: 'Amit Saxena', pandit: 'Pandit Rameshwar Shastri', date: '28 Nov 2026', amount: '₹4,100', status: 'PENDING' },
    { id: 'BK-2026-901', puja: 'Griha Pravesh Puja', customer: 'Rahul Sharma', pandit: 'Pandit Rameshwar Shastri', date: '24 Nov 2026', amount: '₹6,999', status: 'CONFIRMED' },
  ];

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 p-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/dashboard" className="p-2 bg-stone-800 rounded-lg hover:bg-stone-700">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">Platform Bookings Control</h1>
          <p className="text-xs text-stone-400">Monitor all scheduled, confirmed, and completed rituals nationwide</p>
        </div>
      </div>

      <div className="bg-stone-950 border border-stone-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-xs text-stone-300">
          <thead className="bg-stone-800 text-stone-400 uppercase text-[10px]">
            <tr>
              <th className="p-4">Booking ID</th>
              <th className="p-4">Puja</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Assigned Pandit</th>
              <th className="p-4">Date</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-800">
            {bookings.map((b) => (
              <tr key={b.id}>
                <td className="p-4 font-mono font-bold text-white">{b.id}</td>
                <td className="p-4 font-semibold">{b.puja}</td>
                <td className="p-4">{b.customer}</td>
                <td className="p-4">{b.pandit}</td>
                <td className="p-4">{b.date}</td>
                <td className="p-4 text-emerald-400 font-bold">{b.amount}</td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    b.status === 'CONFIRMED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {b.status}
                  </span>
                </td>
                <td className="p-4 text-right text-stone-400 hover:text-white cursor-pointer">Manage</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
