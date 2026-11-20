import Link from 'next/link';
import DevSutraLogo from '@/components/ui/DevSutraLogo';
import { LifeBuoy, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

export default function SupportDashboardPage() {
  const tickets = [
    { id: 'TCK-201', devotee: 'Sunil Nair', bookingId: 'DS-2026-904', issue: 'Request to reschedule Griha Pravesh muhurat by 1 hour', priority: 'HIGH', status: 'OPEN', date: '10 mins ago' },
    { id: 'TCK-198', devotee: 'Kavita Chawla', bookingId: 'DS-2026-880', issue: 'Samagri parcel address clarification in Sector 50', priority: 'MEDIUM', status: 'IN_PROGRESS', date: '2 hours ago' },
  ];

  return (
    <div className="min-h-screen bg-deep-maroon text-beige flex flex-col font-sans">
      <header className="h-16 border-b border-gold/30 bg-maroon-900 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DevSutraLogo variant="icon" size="sm" showTagline={false} />
          <span className="font-heading font-bold text-sm tracking-wide text-ivory border-l border-gold/30 pl-3">
            DevSutra Devotee Seva Helpdesk
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-beige/70">Staff: <strong>Devotee Seva Tier 1</strong></span>
          <Link href="/" className="px-3 py-1.5 rounded-lg bg-maroon-950 hover:bg-maroon-800 text-ivory border border-gold/30 transition">
            Exit
          </Link>
        </div>
      </header>

      <main className="p-8 max-w-7xl mx-auto w-full space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-maroon-900 border border-gold/30 p-5 rounded-2xl shadow-sacred">
            <span className="text-xs text-beige/70">Open Seva Tickets</span>
            <p className="text-2xl font-heading font-bold text-gold-300 mt-1">3 Pending</p>
          </div>
          <div className="bg-maroon-900 border border-gold/30 p-5 rounded-2xl shadow-sacred">
            <span className="text-xs text-beige/70">In Progress</span>
            <p className="text-2xl font-heading font-bold text-blue-300 mt-1">2 Assigned</p>
          </div>
          <div className="bg-maroon-900 border border-gold/30 p-5 rounded-2xl shadow-sacred">
            <span className="text-xs text-beige/70">Resolved Today</span>
            <p className="text-2xl font-heading font-bold text-emerald-400 mt-1">18 Closed</p>
          </div>
        </div>

        <div className="bg-maroon-900 border border-gold/30 rounded-2xl overflow-hidden shadow-sacred">
          <div className="p-4 border-b border-maroon-800 font-heading font-bold text-sm text-ivory">
            Live Ticket Queue
          </div>
          <table className="w-full text-left text-xs text-beige/85">
            <thead className="bg-maroon-950 text-gold-300 uppercase text-[10px]">
              <tr>
                <th className="p-3.5">Ticket ID</th>
                <th className="p-3.5">Devotee</th>
                <th className="p-3.5">Booking Ref</th>
                <th className="p-3.5">Subject</th>
                <th className="p-3.5">Priority</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-maroon-800">
              {tickets.map((t) => (
                <tr key={t.id}>
                  <td className="p-3.5 font-mono font-bold text-ivory">{t.id}</td>
                  <td className="p-3.5 font-medium text-ivory">{t.devotee}</td>
                  <td className="p-3.5 font-mono text-gold-300">{t.bookingId}</td>
                  <td className="p-3.5">{t.issue}</td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      t.priority === 'HIGH' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="p-3.5">{t.status}</td>
                  <td className="p-3.5 text-right">
                    <button className="px-3 py-1 bg-maroon hover:bg-maroon-800 text-ivory rounded text-xs font-bold border border-gold/40">
                      Resolve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
