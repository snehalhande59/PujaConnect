import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/layout/Footer';
import { User, MapPin, Mail, Phone, Save } from 'lucide-react';

export default function CustomerProfilePage() {
  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-maroon-950">Profile & Addresses</h1>
          <p className="text-xs text-stone-500">Manage your contact details and default puja venues</p>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-amber-100 shadow-sm space-y-6">
          <form className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">First Name</label>
                <input
                  type="text"
                  defaultValue="Rahul"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-stone-900"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Last Name</label>
                <input
                  type="text"
                  defaultValue="Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-stone-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Email Address</label>
                <input
                  type="email"
                  defaultValue="rahul.sharma@example.com"
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-100 bg-stone-50 text-stone-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  defaultValue="+91 9876543210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-stone-900"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100">
              <h3 className="text-sm font-bold text-stone-900 mb-3">Saved Puja Venue Address</h3>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Street Address / Apartment</label>
                <input
                  type="text"
                  defaultValue="Flat 402, Lotus Tower, Sector 62"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-stone-900"
                />
              </div>
              <div className="grid grid-cols-3 gap-3 mt-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">City</label>
                  <input
                    type="text"
                    defaultValue="Noida"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">State</label>
                  <input
                    type="text"
                    defaultValue="Uttar Pradesh"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">PIN Code</label>
                  <input
                    type="text"
                    defaultValue="201301"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-stone-900"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="button"
                className="px-6 py-2.5 bg-saffron-600 hover:bg-saffron-700 text-white font-bold rounded-xl shadow transition flex items-center gap-2"
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
