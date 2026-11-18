import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function SupportTicketsPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/support/dashboard" className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">All Support Tickets</h1>
          <p className="text-xs text-slate-400">Archived and active customer inquiry tickets</p>
        </div>
      </div>
      <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl text-xs text-slate-400">
        All active tickets are synchronized live from backend API support module.
      </div>
    </div>
  );
}
