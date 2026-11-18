import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/layout/Footer';
import { Calendar, Clock, MapPin, CheckCircle, Phone } from 'lucide-react';

export default function PanditBookingsPage() {
  const bookings = [
    {
      id: 'BK-2026-901',
      puja: 'Griha Pravesh Puja',
      devotee: 'Rahul Sharma',
      phone: '+91 9876543210',
      address: 'Flat 402, Lotus Tower, Sector 62, Noida',
      date: '24 Nov 2026',
      time: '09:30 AM',
      dakshina: '₹5,100',
      status: 'CONFIRMED',
    },
    {
      id: 'BK-2026-890',
      puja: 'Satyanarayan Puja & Katha',
      devotee: 'Vikram Mehta',
      phone: '+91 9811223344',
      address: 'Pocket A, Mayur Vihar Phase 1, Delhi',
      date: '19 Nov 2026',
      time: '04:00 PM',
      dakshina: '₹2,500',
      status: 'COMPLETED',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-maroon-950">Assigned Puja Bookings</h1>
          <p className="text-xs text-stone-500">Upcoming rituals, client addresses, and ceremony timestamps</p>
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
                <h3 className="text-base font-bold text-stone-900 mt-1">{b.puja}</h3>
                <p className="text-xs text-stone-600 mt-0.5">Devotee: <strong>{b.devotee}</strong> ({b.phone})</p>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-stone-500">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-saffron-600" /> {b.date}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-saffron-600" /> {b.time}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-saffron-600" /> {b.address}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-stone-400">Dakshina</span>
                <p className="text-lg font-bold text-maroon-900">{b.dakshina}</p>
                {b.status === 'CONFIRMED' && (
                  <button className="mt-2 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-sm transition">
                    Mark as Completed
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
