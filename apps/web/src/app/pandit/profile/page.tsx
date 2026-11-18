import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/layout/Footer';
import { ShieldCheck, Save, FileText } from 'lucide-react';

export default function PanditProfilePage() {
  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-maroon-950">Pandit Profile & Credentials</h1>
          <p className="text-xs text-stone-500">Manage your marketplace presentation, certifications, and offered rituals</p>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-amber-100 shadow-sm space-y-6 text-xs">
          <div className="flex items-center gap-4 border-b border-stone-100 pb-6">
            <img
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80"
              alt="Avatar"
              className="w-20 h-20 rounded-2xl object-cover border-2 border-saffron-500"
            />
            <div>
              <h3 className="text-base font-bold text-stone-900">Pandit Rameshwar Shastri</h3>
              <p className="text-stone-500">Verification Status: <span className="text-emerald-700 font-bold">VERIFIED</span></p>
              <button className="mt-2 px-3 py-1 border border-stone-200 rounded-lg text-stone-700 hover:border-saffron-500 text-[11px] font-semibold">
                Change Photo
              </button>
            </div>
          </div>

          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Full Name</label>
                <input type="text" defaultValue="Pandit Rameshwar Shastri" className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-stone-900" />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">City of Service</label>
                <input type="text" defaultValue="Delhi NCR" className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-stone-900" />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Bio / Vedic Background</label>
              <textarea
                rows={3}
                defaultValue="Graduated from Sampurnanand Sanskrit Vishwavidyalaya, Varanasi. Specialized in Shuklayajurveda and Vedic architectural harmonization."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-stone-900"
              />
            </div>

            <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-stone-500">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Identity & Degree documents verified on 10 Aug 2026</span>
              </div>
              <button
                type="button"
                className="px-6 py-2.5 bg-saffron-600 hover:bg-saffron-700 text-white font-bold rounded-xl shadow transition flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" /> Save Profile
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
