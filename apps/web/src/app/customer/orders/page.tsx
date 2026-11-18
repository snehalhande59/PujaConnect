import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/layout/Footer';
import { Package, Truck, CheckCircle2 } from 'lucide-react';

export default function CustomerOrdersPage() {
  const orders = [
    {
      id: 'ORD-8821',
      date: '15 Nov 2026',
      totalAmount: '₹1,899',
      status: 'SHIPPED',
      item: 'Complete Vedic Griha Pravesh Samagri Kit (36 Items)',
      trackingNumber: 'DELHIVERY-99882211',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-maroon-950">My Samagri Orders</h1>
          <p className="text-xs text-stone-500">Track shipment and delivery of pure puja essentials</p>
        </div>

        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="bg-white p-6 rounded-2xl border border-amber-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-stone-400">{o.id}</span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 flex items-center gap-1">
                    <Truck className="w-3 h-3" /> {o.status}
                  </span>
                </div>
                <h3 className="text-base font-bold text-stone-900 mt-1">{o.item}</h3>
                <p className="text-xs text-stone-500 mt-1">Ordered on: {o.date} • AWB: {o.trackingNumber}</p>
              </div>

              <div className="text-right">
                <span className="text-xs text-stone-400">Total Amount</span>
                <p className="text-lg font-bold text-maroon-900">{o.totalAmount}</p>
                <button className="mt-2 px-3 py-1.5 bg-saffron-600 hover:bg-saffron-700 text-white text-xs font-semibold rounded-lg">
                  Track Package
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
