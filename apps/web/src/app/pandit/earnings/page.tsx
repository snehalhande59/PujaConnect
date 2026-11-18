import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/layout/Footer';
import { IndianRupee, Download, CheckCircle2 } from 'lucide-react';

export default function PanditEarningsPage() {
  const payouts = [
    { id: 'PAY-1081', date: '01 Nov 2026', pujasCount: 8, gross: '₹38,000', platformFee: '₹3,800', netPayout: '₹34,200', status: 'SETTLED' },
    { id: 'PAY-1044', date: '01 Oct 2026', pujasCount: 11, gross: '₹51,500', platformFee: '₹5,150', netPayout: '₹46,350', status: 'SETTLED' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-maroon-950">Earnings & Payout Statements</h1>
          <p className="text-xs text-stone-500">Transparent breakdown of ritual dakshina, platform commissions, and bank settlements</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-sm">
            <span className="text-xs text-stone-500 font-medium">Lifetime Gross Earnings</span>
            <p className="text-2xl font-bold text-maroon-900 mt-1">₹3,42,000</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-sm">
            <span className="text-xs text-stone-500 font-medium">Pending Settlement</span>
            <p className="text-2xl font-bold text-saffron-600 mt-1">₹14,500</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-sm">
            <span className="text-xs text-stone-500 font-medium">Connected Bank Account</span>
            <p className="text-sm font-bold text-stone-900 mt-1">HDFC Bank (•••• 4921)</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-amber-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-stone-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-stone-900">Recent Monthly Payouts</h3>
            <button className="text-xs text-saffron-700 font-semibold flex items-center gap-1">
              <Download className="w-3.5 h-3.5" /> Download Tax Statement
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-600">
              <thead className="bg-amber-50/50 text-stone-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">Payout ID</th>
                  <th className="p-3.5">Settlement Date</th>
                  <th className="p-3.5">Pujas</th>
                  <th className="p-3.5">Gross Dakshina</th>
                  <th className="p-3.5">Platform Fee (10%)</th>
                  <th className="p-3.5">Net Transferred</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {payouts.map((p) => (
                  <tr key={p.id}>
                    <td className="p-3.5 font-mono font-bold text-stone-800">{p.id}</td>
                    <td className="p-3.5">{p.date}</td>
                    <td className="p-3.5">{p.pujasCount}</td>
                    <td className="p-3.5 font-medium">{p.gross}</td>
                    <td className="p-3.5 text-stone-400">{p.platformFee}</td>
                    <td className="p-3.5 font-bold text-emerald-700">{p.netPayout}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
