import Link from 'next/link';
import { ArrowLeft, Download, FileText } from 'lucide-react';

export default function AdminReportsPage() {
  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 p-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/dashboard" className="p-2 bg-stone-800 rounded-lg hover:bg-stone-700">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">Platform Reports & Business Analytics</h1>
          <p className="text-xs text-stone-400">Download audited statements, revenue metrics, and Pandit payouts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-stone-950 border border-stone-800 p-6 rounded-2xl space-y-3">
          <FileText className="w-8 h-8 text-saffron-500" />
          <h3 className="font-bold text-base text-white">Monthly Revenue Report</h3>
          <p className="text-xs text-stone-400">Aggregated breakdown of booking revenue, samagri margins, and GST compliance.</p>
          <button className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>

        <div className="bg-stone-950 border border-stone-800 p-6 rounded-2xl space-y-3">
          <FileText className="w-8 h-8 text-saffron-500" />
          <h3 className="font-bold text-base text-white">Pandit Settlement Audit</h3>
          <p className="text-xs text-stone-400">Complete log of gross dakshina, 10% platform commission deductions, and bank payouts.</p>
          <button className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>

        <div className="bg-stone-950 border border-stone-800 p-6 rounded-2xl space-y-3">
          <FileText className="w-8 h-8 text-saffron-500" />
          <h3 className="font-bold text-base text-white">City & Category Demand</h3>
          <p className="text-xs text-stone-400">Heatmap of puja inquiries, fulfillment rates, and priest availability by city.</p>
          <button className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>
    </div>
  );
}
