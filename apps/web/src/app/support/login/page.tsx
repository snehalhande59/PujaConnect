import Link from 'next/link';
import DevSutraLogo from '@/components/ui/DevSutraLogo';
import { LifeBuoy, LogIn, ArrowLeft } from 'lucide-react';

export default function SupportLoginPage() {
  return (
    <div className="min-h-screen bg-deep-maroon flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-maroon-900 border border-gold/30 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <DevSutraLogo variant="dark" size="lg" showTagline={false} />
          </div>
          <h1 className="text-2xl font-heading font-bold text-ivory tracking-tight">Devotee Seva Desk</h1>
          <p className="text-xs text-beige/70">Customer grievances, muhurat alterations, and priest coordination</p>
        </div>

        <form className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-beige mb-1">Staff Work Email</label>
            <input
              type="email"
              placeholder="agent@devsutra.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-maroon-950 border border-gold/30 text-ivory focus:outline-none focus:ring-2 focus:ring-gold"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-beige mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl bg-maroon-950 border border-gold/30 text-ivory focus:outline-none focus:ring-2 focus:ring-gold"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-maroon hover:bg-maroon-800 text-ivory font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 border border-gold/50"
          >
            <LogIn className="w-4 h-4 text-gold-300" />
            <span>Sign In to Seva Desk</span>
          </button>
        </form>

        <div className="text-center text-xs text-beige/60 pt-2 border-t border-maroon-800">
          <Link href="/" className="inline-flex items-center gap-1.5 hover:text-ivory transition">
            <ArrowLeft className="w-3.5 h-3.5" /> Return to DevSutra Home
          </Link>
        </div>
      </div>
    </div>
  );
}
