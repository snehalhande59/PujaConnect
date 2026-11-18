'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/layout/Footer';
import DevSutraLogo from '@/components/ui/DevSutraLogo';
import { ShieldCheck, CheckCircle, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { registerPandit } from '@/lib/auth';

export default function PanditRegisterPage() {
  const router = useRouter();

  // Form State
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [experienceYears, setExperienceYears] = useState(5);
  const [city, setCity] = useState('');
  const [state, setState] = useState('Uttar Pradesh');
  const [languages, setLanguages] = useState('Hindi, Sanskrit');
  const [specializations, setSpecializations] = useState('Griha Pravesh, Satyanarayan Puja, Rudrabhishek');
  const [basePrice, setBasePrice] = useState(2100);
  const [bio, setBio] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Parse languages & specializations arrays
    const langArray = languages
      .split(',')
      .map((l) => l.trim())
      .filter(Boolean);
    const specArray = specializations
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (langArray.length === 0) {
      setErrorMessage('Please provide at least one spoken language.');
      return;
    }

    if (specArray.length === 0) {
      setErrorMessage('Please specify at least one ritual specialization.');
      return;
    }

    try {
      setLoading(true);
      const res = await registerPandit({
        fullName,
        phoneNumber,
        email,
        password,
        experienceYears: Number(experienceYears) || 1,
        city,
        state,
        languages: langArray,
        specializations: specArray,
        basePrice: Number(basePrice) || undefined,
        bio: bio.trim() || undefined,
      });

      if (res.success) {
        // Redirect to verification document upload page
        router.push('/pandit/verification');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please check the provided information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-ivory text-brown">
      <Navbar />

      <main className="flex-1 py-14 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full font-sans">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-beige shadow-sacred-lg space-y-8">
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <DevSutraLogo variant="icon" size="lg" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-brown">
              Vedic Pandit Onboarding & Verification
            </h1>
            <p className="text-xs text-brown/70 max-w-md mx-auto">
              Join DevSutra&apos;s network of verified Vedic scholars. All accounts are verified by our Admin team before going live on the public marketplace.
            </p>
          </div>

          <div className="p-4 bg-beige/40 rounded-xl border border-beige text-xs text-brown/85 flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-gold-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-brown block">Verification Assurance:</strong>
              <span>
                After submitting this profile, you will upload your Aadhaar card and Gurukul/Vedic credentials to complete verification.
              </span>
            </div>
          </div>

          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p>{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 text-xs">
            {/* Step 1: Personal & Contact Information */}
            <div className="space-y-3">
              <h3 className="text-sm font-heading font-bold text-maroon border-b border-beige/60 pb-2">
                1. Personal & Contact Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-brown mb-1">
                    Full Name (with Title, e.g. Pt. Rameshwar Shastri)
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Pt. Rameshwar Shastri"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-beige bg-ivory/40 text-brown focus:outline-none focus:ring-2 focus:ring-maroon"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-brown mb-1">
                    Mobile Number (10 digits)
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="9876543210"
                    maxLength={10}
                    pattern="[6-9][0-9]{9}"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-beige bg-ivory/40 text-brown focus:outline-none focus:ring-2 focus:ring-maroon"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-brown mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="shastri@devsutra.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-beige bg-ivory/40 text-brown focus:outline-none focus:ring-2 focus:ring-maroon"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-brown mb-1">Create Password (min. 8 characters)</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    minLength={8}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-beige bg-ivory/40 text-brown focus:outline-none focus:ring-2 focus:ring-maroon"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Vedic Qualifications & Experience */}
            <div className="space-y-3">
              <h3 className="text-sm font-heading font-bold text-maroon border-b border-beige/60 pb-2">
                2. Vedic Qualifications & Location
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-brown mb-1">Years of Vedic Experience</label>
                  <input
                    type="number"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(Number(e.target.value))}
                    min={1}
                    max={60}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-beige bg-ivory/40 text-brown focus:outline-none focus:ring-2 focus:ring-maroon"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-brown mb-1">Base Dakshina / Rate (₹ per Puja)</label>
                  <input
                    type="number"
                    value={basePrice}
                    onChange={(e) => setBasePrice(Number(e.target.value))}
                    min={500}
                    step={100}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-beige bg-ivory/40 text-brown focus:outline-none focus:ring-2 focus:ring-maroon"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-brown mb-1">Primary City of Service</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Varanasi, Pune, Delhi NCR"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-beige bg-ivory/40 text-brown focus:outline-none focus:ring-2 focus:ring-maroon"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-brown mb-1">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Uttar Pradesh, Maharashtra"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-beige bg-ivory/40 text-brown focus:outline-none focus:ring-2 focus:ring-maroon"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-brown mb-1">
                    Languages Spoken (comma separated)
                  </label>
                  <input
                    type="text"
                    value={languages}
                    onChange={(e) => setLanguages(e.target.value)}
                    placeholder="Hindi, Sanskrit, Marathi, English"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-beige bg-ivory/40 text-brown focus:outline-none focus:ring-2 focus:ring-maroon"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-brown mb-1">
                    Specializations & Rituals (comma separated)
                  </label>
                  <input
                    type="text"
                    value={specializations}
                    onChange={(e) => setSpecializations(e.target.value)}
                    placeholder="Griha Pravesh, Satyanarayan, Rudrabhishek, Navgraha Shanti"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-beige bg-ivory/40 text-brown focus:outline-none focus:ring-2 focus:ring-maroon"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-brown mb-1">
                    Vedic Background & Biography
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Mention your Gurukul education, Veda lineage (e.g. Rigveda/Yajurveda), and years of traditional ritual practice..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-beige bg-ivory/40 text-brown focus:outline-none focus:ring-2 focus:ring-maroon"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-maroon hover:bg-maroon-800 disabled:opacity-60 text-ivory font-bold rounded-xl shadow-sacred transition flex items-center justify-center gap-2 border border-gold/40 cursor-pointer text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 text-gold-300 animate-spin" />
                  <span>Registering Profile...</span>
                </>
              ) : (
                <>
                  <span>Continue to Document Upload</span>
                  <ArrowRight className="w-4 h-4 text-gold-300" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-brown/70 pt-2 border-t border-beige/60">
            Already have a Pandit account?{' '}
            <Link href="/pandit/login" className="font-bold text-maroon hover:text-maroon-800">
              Sign In to Pandit Portal
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
