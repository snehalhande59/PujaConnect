'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/layout/Footer';
import { Calendar, Clock, MapPin, Download, CheckCircle2 } from 'lucide-react';

export default function CustomerBookingsPage() {
  const [allBookings, setAllBookings] = useState<any[]>([]);

  useEffect(() => {
    const defaultBookings = [
      {
        id: 'DS-928114-101',
        pujaName: 'Griha Pravesh Puja & Vastu Havan',
        panditName: 'Pt. Radheshyam Joshi',
        date: '24 Nov 2026',
        timeSlot: '09:30 AM',
        city: 'Pune',
        totalAmount: '₹6,999',
        status: 'CONFIRMED',
      },
      {
        id: 'DS-821034-202',
        pujaName: 'Satyanarayan Mahapuja & Katha',
        panditName: 'Acharya Devendra Shastri',
        date: '12 Oct 2026',
        timeSlot: '05:00 PM',
        city: 'Mumbai',
        totalAmount: '₹3,499',
        status: 'COMPLETED',
      },
    ];

    try {
      const stored = localStorage.getItem('devsutra_web_bookings');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const formatted = parsed.map((b) => ({
            id: b.bookingNumber || b.id,
            pujaName: b.puja?.title || b.pujaTitle || 'Sacred Vedic Ceremony',
            panditName: b.panditProfile?.fullName || 'Pt. Radheshyam Joshi (Gurukul Certified)',
            date: b.pujaDate || 'Selected Date',
            timeSlot: b.pujaTimeSlot || 'Morning Muhurat',
            city: b.city || 'Pune',
            totalAmount: `₹${Number(b.totalAmount || 5100).toLocaleString()}`,
            status: b.status || 'CONFIRMED',
          }));
          setAllBookings([...formatted, ...defaultBookings]);
          return;
        }
      }
    } catch {
      // ignore
    }

    setAllBookings(defaultBookings);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-ivory text-brown">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-heading text-maroon">My Sacred Puja Bookings</h1>
            <p className="text-xs text-brown/70">माझ्या पूजा • Track upcoming rituals, purohit assignments & receipts</p>
          </div>
          <Link
            href="/pujas"
            className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-maroon hover:from-amber-700 hover:to-maroon-800 text-ivory text-xs font-bold rounded-xl shadow transition self-start sm:self-auto"
          >
            + Book Another Puja
          </Link>
        </div>

        <div className="space-y-4">
          {allBookings.map((b) => (
            <div
              key={b.id}
              className="bg-white p-6 rounded-2xl border border-beige hover:border-gold/60 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition"
            >
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-maroon bg-gold/15 px-2.5 py-0.5 rounded-md">
                    Ref #{b.id}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      b.status === 'CONFIRMED'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : b.status === 'COMPLETED'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {b.status}
                  </span>
                </div>
                <h3 className="text-base font-bold font-heading text-brown mt-1.5">{b.pujaName}</h3>
                <p className="text-xs text-brown/70 mt-0.5">
                  Assigned Pandit: <strong className="text-maroon">{b.panditName}</strong>
                </p>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-brown/80 font-sans">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" /> {b.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600" /> {b.timeSlot}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-600" /> {b.city}
                  </span>
                </div>
              </div>

              <div className="text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-beige">
                <span className="text-[11px] text-brown/50 block">Dakshina</span>
                <p className="text-lg font-bold text-maroon">{b.totalAmount}</p>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="mt-2 px-3 py-1.5 border border-beige hover:border-gold text-maroon hover:bg-gold/10 text-xs font-semibold rounded-lg flex items-center gap-1.5 sm:ml-auto transition"
                >
                  <Download className="w-3.5 h-3.5 text-saffron" />
                  <span>View Receipt</span>
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
