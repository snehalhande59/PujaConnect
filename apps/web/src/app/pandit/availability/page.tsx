import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/layout/Footer';
import { Calendar, Clock, Check, Plus } from 'lucide-react';

export default function PanditAvailabilityPage() {
  const days = [
    { day: 'Monday', active: true, slots: ['08:00 AM - 12:00 PM', '04:00 PM - 08:00 PM'] },
    { day: 'Tuesday', active: true, slots: ['08:00 AM - 12:00 PM', '04:00 PM - 08:00 PM'] },
    { day: 'Wednesday', active: true, slots: ['08:00 AM - 12:00 PM', '04:00 PM - 08:00 PM'] },
    { day: 'Thursday', active: true, slots: ['07:00 AM - 01:00 PM'] },
    { day: 'Friday', active: true, slots: ['08:00 AM - 12:00 PM', '04:00 PM - 08:00 PM'] },
    { day: 'Saturday', active: true, slots: ['07:00 AM - 02:00 PM', '04:00 PM - 09:00 PM'] },
    { day: 'Sunday', active: true, slots: ['06:30 AM - 02:00 PM', '04:00 PM - 09:00 PM'] },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-maroon-950">Availability Calendar</h1>
            <p className="text-xs text-stone-500">Configure your active days and time slots to prevent double-booking</p>
          </div>
          <button className="px-4 py-2 bg-saffron-600 hover:bg-saffron-700 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Add Date Exception
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-amber-100 divide-y divide-stone-100 shadow-sm">
          {days.map((item) => (
            <div key={item.day} className="p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  defaultChecked={item.active}
                  className="rounded text-saffron-600 focus:ring-saffron-500"
                />
                <span className="text-sm font-bold text-stone-900 w-28">{item.day}</span>
                <div className="flex flex-wrap gap-2">
                  {item.slots.map((s, idx) => (
                    <span key={idx} className="text-xs px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200/60 rounded-md">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <button className="text-xs text-stone-400 hover:text-saffron-700 font-medium">Edit</button>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
