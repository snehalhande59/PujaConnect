import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AdminPaymentsPage() {
  const payments = [
    { id: 'PAY-RZP-9921', bookingId: 'BK-2026-901', amount: '₹6,999', gateway: 'Razorpay', status: 'SUCCESS', date: '17 Nov 2026' },
    { id: 'PAY-RZP-9918', bookingId: 'BK-2026-890', amount: '₹2,500', gateway: 'Razorpay', status: 'SUCCESS', date: '16 Nov 2026' },
  ];

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 p-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/dashboard" className="p-2 bg-stone-800 rounded-lg hover:bg-stone-700">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">Payment Transactions & Webhooks</h1>
          <p className="text-xs text-stone-400">Backend cryptographic signature verification & Razorpay logs</p>
        </div>
      </div>

      <div className="bg-stone-950 border border-stone-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-xs text-stone-300">
          <thead className="bg-stone-800 text-stone-400 uppercase text-[10px]">
            <tr>
              <th className="p-4">Payment Ref</th>
              <th className="p-4">Booking / Order Ref</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Gateway</th>
              <th className="p-4">Status</th>
              <th className="p-4">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-800">
            {payments.map((p) => (
              <tr key={p.id}>
                <td className="p-4 font-mono font-bold text-white">{p.id}</td>
                <td className="p-4 font-mono">{p.bookingId}</td>
                <td className="p-4 font-bold text-emerald-400">{p.amount}</td>
                <td className="p-4">{p.gateway}</td>
                <td className="p-4">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                    {p.status}
                  </span>
                </td>
                <td className="p-4 text-stone-400">{p.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
