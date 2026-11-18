import Link from 'next/link';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/layout/Footer';
import { Calendar, Clock, MapPin } from 'lucide-react';

export default function CustomerBookingsPage() {
  const bookings = [
    {
      id: 'BK-2026-001',
      pujaName: 'Griha Pravesh Puja & Vastu Havan',
      panditName: 'Pandit Rameshwar Shastri',
      date: '24 Nov 2026',
      timeSlot: '09:30 AM',
      city: 'Noida',
      totalAmount: '₹6,999',
      status: 'CONFIRMED',
    },
    {
      id: 'BK-2026-002',
      pujaName: 'Shri Satyanarayan Puja',
      panditName: 'Acharya Vidyadhar Joshi',
      date: '12 Oct 2026',
      timeSlot: '05:00 PM',
      city: 'Delhi',
      totalAmount: '₹3,499',
      status: 'COMPLETED',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-maroon-950">My Puja Bookings</h1>
            <p className="text-xs text-stone-500">Track current and past ritual appointments</p>
          </div>
          <Link
            href="/pujas"
            className="px-4 py-2 bg-saffron-600 hover:bg-saffron-500 text-white text-xs font-bold rounded-xl shadow transition"
          >
            Book Another Puja
          </Link>
        </div>

        <div className="space-y-4">
          {bookings.map((b) => (
            <div key={b.id} className="bg-white p-6 rounded-2xl border border-amber-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-stone-400">{b.id}</span>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    b.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-700'
                  }`}>
                    {b.status}
                  </span>
                </div>
                <h3 className="text-base font-bold text-stone-900 mt-1">{b.pujaName}</h3>
                <p className="text-xs text-stone-500">Pandit: <strong>{b.panditName}</strong></p>
                <div className="flex items-center gap-4 mt-2 text-xs text-stone-600">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-saffron-600" /> {b.date}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-saffron-600" /> {b.timeSlot}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-saffron-600" /> {b.city}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-stone-400">Total Dakshina</span>
                <p className="text-lg font-bold text-maroon-900">{b.totalAmount}</p>
                <button className="mt-2 px-3 py-1.5 border border-stone-200 text-stone-700 hover:border-maroon-700 text-xs font-semibold rounded-lg">
                  View Receipt
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
