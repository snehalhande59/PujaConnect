'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/layout/Footer';
import DevSutraLogo from '@/components/ui/DevSutraLogo';
import { Shield, Lock, CreditCard, AlertCircle } from 'lucide-react';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const amount = searchParams.get('amount') || '7100';

  return (
    <div className="bg-white rounded-3xl p-8 sm:p-10 border border-beige shadow-sacred-lg space-y-6 font-sans">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-ivory border border-gold flex items-center justify-center text-maroon shadow-sm">
          <Lock className="w-6 h-6 text-gold-600" />
        </div>
        <h1 className="text-2xl font-heading font-bold text-brown">DevSutra Secure Gateway</h1>
        <p className="text-xs text-brown/70">256-bit Encrypted Escrow Transaction</p>
      </div>

      <div className="p-5 bg-ivory rounded-2xl border border-beige flex items-center justify-between">
        <span className="text-xs text-brown/70 font-medium">Payable Dakshina:</span>
        <span className="text-2xl font-heading font-bold text-maroon">₹{parseInt(amount, 10).toLocaleString()}</span>
      </div>

      <div className="space-y-3 text-xs">
        <div className="p-4 rounded-xl border border-maroon bg-beige/20 transition cursor-pointer flex items-center gap-3">
          <input type="radio" name="paymentMethod" defaultChecked className="text-maroon focus:ring-maroon" />
          <CreditCard className="w-5 h-5 text-gold-600" />
          <div>
            <p className="font-bold text-brown">UPI / QR Code / Netbanking / Cards</p>
            <p className="text-[11px] text-brown/65">Instant verification via Razorpay Test Gateway</p>
          </div>
        </div>
      </div>

      <div className="p-4 bg-beige/35 rounded-xl border border-beige text-[11px] text-brown/80 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-gold-600 shrink-0 mt-0.5" />
        <span>
          <strong>Cryptographic Verification Note:</strong> Real payments require backend Razorpay key secrets. Payment signatures are verified strictly on the NestJS backend API.
        </span>
      </div>

      <button
        type="button"
        className="w-full py-3.5 bg-maroon hover:bg-maroon-800 text-ivory font-semibold text-xs rounded-xl shadow-sacred transition flex items-center justify-center gap-2 border border-gold/40"
      >
        <Shield className="w-4 h-4 text-gold-300" />
        <span>Pay ₹{parseInt(amount, 10).toLocaleString()} via Razorpay</span>
      </button>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-ivory text-brown">
      <Navbar />

      <main className="max-w-xl mx-auto px-4 py-16 flex-1 w-full">
        <Suspense fallback={<div className="text-center py-12 text-sm text-brown/60">Loading secure checkout...</div>}>
          <CheckoutContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
