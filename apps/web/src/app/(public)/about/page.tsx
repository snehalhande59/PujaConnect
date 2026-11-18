import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/layout/Footer';
import DevSutraLogo from '@/components/ui/DevSutraLogo';
import { ShieldCheck, Heart, Award, Sparkles } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-ivory text-brown">
      <Navbar />

      <div className="bg-sacred-pattern py-16 border-b border-beige text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <span className="text-xs font-sans font-bold uppercase tracking-widest text-gold-600">
            DevSutra Philosophy
          </span>
          <h1 className="text-3xl sm:text-5xl font-heading font-bold text-brown">
            Preserving Sacred Sanatan Vedic Traditions
          </h1>
          <p className="text-brown/80 font-sans text-sm sm:text-base max-w-2xl mx-auto leading-relaxed pt-1">
            DevSutra was born from a desire to make authentic, ritualistic Hindu ceremonies accessible, transparent, and spiritually elevating for every devotee in modern India.
          </p>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 space-y-12 font-sans">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-beige shadow-sacred space-y-6 text-brown/85 leading-relaxed text-sm sm:text-base">
          <div className="flex items-center gap-3">
            <DevSutraLogo variant="icon" size="sm" />
            <h2 className="text-2xl font-heading font-bold text-brown">Who We Are</h2>
          </div>
          <p>
            <strong>DevSutra</strong> is India&apos;s independent spiritual technology platform dedicated to connecting families with authenticated, certified Vedic Pandits and providing pure, temple-grade samagri. We bridge ancient Vedic wisdom with modern technological convenience.
          </p>
          <p>
            Whether moving into a new home, solemnizing a marriage, welcoming a newborn child, or seeking planetary peace, we ensure that every ritual is conducted strictly in accordance with Shastras by Gurukul-trained priests with pure devotion and complete vidhi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-7 rounded-2xl border border-beige shadow-sacred text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-xl bg-ivory text-maroon border border-gold flex items-center justify-center mb-3">
              <ShieldCheck className="w-6 h-6 text-gold-600" />
            </div>
            <h3 className="font-heading font-bold text-base text-brown">Rigorous Verification</h3>
            <p className="text-xs text-brown/70 leading-relaxed">
              Every Pandit undergoes identity checks, Vedic credential verification, and continuous devotee feedback reviews.
            </p>
          </div>

          <div className="bg-white p-7 rounded-2xl border border-beige shadow-sacred text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-xl bg-ivory text-maroon border border-gold flex items-center justify-center mb-3">
              <Award className="w-6 h-6 text-gold-600" />
            </div>
            <h3 className="font-heading font-bold text-base text-brown">100% Purity Guaranteed</h3>
            <p className="text-xs text-brown/70 leading-relaxed">
              Every ingredient in our samagri kits is ethically sourced, unadulterated, and inspected for ceremonial sanctity.
            </p>
          </div>

          <div className="bg-white p-7 rounded-2xl border border-beige shadow-sacred text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-xl bg-ivory text-maroon border border-gold flex items-center justify-center mb-3">
              <Heart className="w-6 h-6 text-gold-600" />
            </div>
            <h3 className="font-heading font-bold text-base text-brown">Respectful Dakshina</h3>
            <p className="text-xs text-brown/70 leading-relaxed">
              We empower traditional priests with honorable livelihoods, direct devotee bookings, and transparent earnings.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
