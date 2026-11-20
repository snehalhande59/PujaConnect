'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/layout/Footer';
import { POPULAR_PUJA_CATEGORIES_DATA, FEATURED_PANDITS_DATA } from '@/lib/cultural-images';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Package,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Award,
  CreditCard,
  ShoppingBag,
  Flame,
  UserCheck,
} from 'lucide-react';

function BookingContent() {
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);

  // Booking Form State
  const [selectedPujaSlug, setSelectedPujaSlug] = useState('griha-pravesh-puja');
  const [calMonthIndex, setCalMonthIndex] = useState<0 | 1>(0); // 0: Nov 2026, 1: Dec 2026
  const [selectedDay, setSelectedDay] = useState(20);
  const [pujaDate, setPujaDate] = useState('2026-11-20');
  const [timeSlot, setTimeSlot] = useState('09:30 AM (Shubh Choghadiya)');

  // Dynamic PostgreSQL Pandits & Pujas
  const [panditsList, setPanditsList] = useState<any[]>(FEATURED_PANDITS_DATA);
  const [pujasList, setPujasList] = useState<any[]>(POPULAR_PUJA_CATEGORIES_DATA);

  // Initialize from searchParams
  useEffect(() => {
    const serviceParam = searchParams.get('service') || searchParams.get('puja') || searchParams.get('slug');
    if (serviceParam) {
      const match = POPULAR_PUJA_CATEGORIES_DATA.find(p => p.slug === serviceParam || p.name.toLowerCase().includes(serviceParam.toLowerCase()));
      if (match) setSelectedPujaSlug(match.slug);
    }
    const panditParam = searchParams.get('panditId') || searchParams.get('pandit');
    if (panditParam) {
      setSelectedPanditId(panditParam);
    }
    const cityParam = searchParams.get('city');
    if (cityParam) setCity(cityParam);
    const dateParam = searchParams.get('date');
    if (dateParam && dateParam.includes('-')) {
      setPujaDate(dateParam);
      const parts = dateParam.split('-');
      if (parts.length === 3) {
        const d = parseInt(parts[2], 10);
        if (!isNaN(d)) setSelectedDay(d);
        if (parts[1] === '12') setCalMonthIndex(1);
        else setCalMonthIndex(0);
      }
    }

    // Fetch live Pandits from PostgreSQL
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    fetch(`${apiBase}/pandits`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        const data = json?.data || json;
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((p: any) => ({
            id: p.id,
            name: p.fullName || 'Vedic Pandit',
            avatarUrl: p.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
            city: p.city || 'Pune',
            experienceYears: p.experienceYears || 10,
            languages: Array.isArray(p.languages) ? p.languages : ['Marathi', 'Hindi', 'Sanskrit'],
            specializations: Array.isArray(p.specializations) ? p.specializations : ['Vedic Rituals'],
            baseDakshina: p.basePrice ? Number(p.basePrice) : 2100,
            isAvailableToday: p.isAvailable ?? true,
          }));
          setPanditsList(mapped);
        }
      })
      .catch(() => {});
  }, [searchParams]);

  // Custom Time AM/PM State
  const [useCustomTime, setUseCustomTime] = useState(false);
  const [customHour, setCustomHour] = useState('09');
  const [customMinute, setCustomMinute] = useState('30');
  const [customAmPm, setCustomAmPm] = useState<'AM' | 'PM'>('AM');

  const [addressLine, setAddressLine] = useState('Flat 402, Lotus Residency, Sector 62');
  const [city, setCity] = useState('Pune');
  const [pincode, setPincode] = useState('411005');
  const [selectedPanditId, setSelectedPanditId] = useState('pandit-1');
  const [includeSamagri, setIncludeSamagri] = useState(true);
  const [specialInstructions, setSpecialInstructions] = useState('');

  const handleSelectDay = (day: number) => {
    setSelectedDay(day);
    const mStr = calMonthIndex === 0 ? '11' : '12';
    const dStr = day < 10 ? `0${day}` : `${day}`;
    setPujaDate(`2026-${mStr}-${dStr}`);
  };

  const handleApplyCustomTime = (h: string, m: string, ampm: 'AM' | 'PM') => {
    setCustomHour(h);
    setCustomMinute(m);
    setCustomAmPm(ampm);
    setTimeSlot(`${h}:${m} ${ampm} (Custom Devotee Muhurat)`);
  };

  const selectedPuja =
    POPULAR_PUJA_CATEGORIES_DATA.find((p) => p.slug === selectedPujaSlug) ||
    POPULAR_PUJA_CATEGORIES_DATA[0];

  const selectedPandit =
    panditsList.find((p) => p.id === selectedPanditId) ||
    FEATURED_PANDITS_DATA.find((p) => p.id === selectedPanditId) ||
    panditsList[0] ||
    FEATURED_PANDITS_DATA[0];

  // Shastric calculation per selection
  const basePujaDakshina = 5100;
  const samagriCost = includeSamagri ? 1899 : 0;
  const platformSeva = 101; // Auspicious 101
  const totalAmount = basePujaDakshina + samagriCost + platformSeva;

  const stepsList = [
    { num: 1, title: 'Select Puja', icon: Flame },
    { num: 2, title: 'Date & Time', icon: Calendar },
    { num: 3, title: 'Location', icon: MapPin },
    { num: 4, title: 'Select Pandit', icon: Award },
    { num: 5, title: 'Samagri Choice', icon: ShoppingBag },
    { num: 6, title: 'Review Details', icon: CheckCircle2 },
    { num: 7, title: 'Proceed Payment', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-ivory text-brown font-sans">
      <Navbar />

      {/* Header Banner */}
      <div className="bg-maroon-900 text-ivory py-12 border-b border-gold/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-sacred-pattern opacity-10" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/15 border border-gold/40 text-gold-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>DevSutra Sacred Vedic Reservation</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-heading font-bold text-ivory">
            7-Step Puja Booking Journey
          </h1>
          <p className="text-xs sm:text-sm font-sans text-beige/85">
            Transparent Shastric Dakshina with verified Gurukul Pandits and doorstep temple-grade samagri.
          </p>
        </div>
      </div>

      {/* 7-Step Visual Progress Bar */}
      <div className="bg-white border-b border-beige py-4 sticky top-20 z-20 shadow-sm overflow-x-auto">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between min-w-[680px]">
          {stepsList.map((st) => (
            <div
              key={st.num}
              onClick={() => {
                // allow navigating to already completed steps
                if (st.num < currentStep) setCurrentStep(st.num);
              }}
              className={`flex items-center gap-2 cursor-pointer transition ${
                currentStep === st.num
                  ? 'text-maroon font-bold'
                  : currentStep > st.num
                  ? 'text-emerald-700'
                  : 'text-brown/40'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                  currentStep === st.num
                    ? 'bg-maroon text-ivory shadow-sacred'
                    : currentStep > st.num
                    ? 'bg-emerald-600 text-white'
                    : 'bg-beige/60 text-brown/60'
                }`}
              >
                {currentStep > st.num ? '✓' : st.num}
              </div>
              <span className="text-xs hidden sm:inline">{st.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Form Layout */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Wizard Form Area (2 cols) */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-beige shadow-sacred">
              {/* STEP 1: SELECT PUJA */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-heading font-bold text-lg text-maroon flex items-center gap-2">
                      <Flame className="w-5 h-5 text-saffron" />
                      Step 1: Select Sacred Ceremony
                    </h3>
                    <p className="text-xs text-brown/70 mt-1">
                      Choose from our accredited catalog of Vedic pujas and havans.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                    {POPULAR_PUJA_CATEGORIES_DATA.map((p) => (
                      <button
                        type="button"
                        key={p.slug}
                        onClick={() => setSelectedPujaSlug(p.slug)}
                        className={`p-3.5 rounded-2xl text-left border transition flex items-start gap-3 ${
                          selectedPujaSlug === p.slug
                            ? 'border-maroon bg-beige/30 ring-2 ring-maroon/20'
                            : 'border-beige hover:border-gold'
                        }`}
                      >
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-beige/40 shrink-0">
                          <Image src={p.image} alt={p.name} fill className="object-cover" sizes="48px" />
                        </div>
                        <div>
                          <p className="font-heading font-bold text-xs text-brown">{p.name}</p>
                          <p className="text-[10px] font-devanagari text-gold-700">{p.devanagari}</p>
                          <p className="text-[10px] text-brown/60 mt-0.5">{p.duration}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-beige flex justify-end">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="px-6 py-2.5 bg-maroon text-ivory font-semibold text-xs rounded-xl shadow-sacred hover:bg-maroon-800 transition flex items-center gap-2"
                    >
                      <span>Proceed to Date & Time</span>
                      <ArrowRight className="w-4 h-4 text-gold-300" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: INTERACTIVE VEDIC CALENDAR & AM/PM TIME SELECTOR */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-heading font-bold text-lg text-maroon flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-gold-600" />
                      Step 2: Select Auspicious Date & Muhurat
                    </h3>
                    <p className="text-xs text-brown/70 mt-1">
                      Choose an auspicious day from the Shastric calendar and pick preferred Choghadiya or custom AM/PM timing.
                    </p>
                  </div>

                  {/* Auspicious Selected Banner */}
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-maroon">
                        <Calendar className="w-5 h-5 text-amber-700" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">Selected Sacred Muhurat</p>
                        <p className="text-sm font-bold text-maroon">{pujaDate} • {timeSlot}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-maroon text-ivory text-xs font-bold">
                      शुभ मुहूर्त
                    </span>
                  </div>

                  {/* Interactive Month & Calendar Grid */}
                  <div className="p-5 bg-white rounded-2xl border border-beige shadow-sm space-y-4">
                    {/* Month Header Navigation */}
                    <div className="flex items-center justify-between pb-3 border-b border-beige">
                      <button
                        type="button"
                        onClick={() => setCalMonthIndex(0)}
                        disabled={calMonthIndex === 0}
                        className={`p-2 rounded-lg border border-beige hover:border-gold text-brown text-xs transition ${calMonthIndex === 0 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-ivory'}`}
                      >
                        ← Previous
                      </button>
                      <h4 className="font-heading font-bold text-base text-brown">
                        {calMonthIndex === 0 ? '2026 November' : '2026 December'}
                      </h4>
                      <button
                        type="button"
                        onClick={() => setCalMonthIndex(1)}
                        disabled={calMonthIndex === 1}
                        className={`p-2 rounded-lg border border-beige hover:border-gold text-brown text-xs transition ${calMonthIndex === 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-ivory'}`}
                      >
                        Next →
                      </button>
                    </div>

                    {/* Day Names Row */}
                    <div className="grid grid-cols-7 gap-1 text-center">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                        <span key={d} className="text-xs font-bold text-brown/60 py-1">
                          {d}
                        </span>
                      ))}
                    </div>

                    {/* Calendar Days Grid */}
                    <div className="space-y-1.5">
                      {(calMonthIndex === 0
                        ? [
                            [null, null, null, null, null, null, 1],
                            [2, 3, 4, 5, 6, 7, 8],
                            [9, 10, 11, 12, 13, 14, 15],
                            [16, 17, 18, 19, 20, 21, 22],
                            [23, 24, 25, 26, 27, 28, 29],
                            [30, null, null, null, null, null, null],
                          ]
                        : [
                            [null, 1, 2, 3, 4, 5, 6],
                            [7, 8, 9, 10, 11, 12, 13],
                            [14, 15, 16, 17, 18, 19, 20],
                            [21, 22, 23, 24, 25, 26, 27],
                            [28, 29, 30, 31, null, null, null],
                          ]
                      ).map((week, wIdx) => (
                        <div key={`w-${wIdx}`} className="grid grid-cols-7 gap-1 text-center">
                          {week.map((day, dIdx) => {
                            if (day === null) {
                              return <div key={`empty-${dIdx}`} className="h-10" />;
                            }

                            const isMuhurat = (calMonthIndex === 0
                              ? [5, 8, 12, 18, 19, 20, 21, 23, 24, 26, 28]
                              : [2, 5, 9, 11, 15, 19, 23, 27, 30]
                            ).includes(day);
                            const isSelected = selectedDay === day;
                            const isToday = calMonthIndex === 0 && day === 19;

                            return (
                              <button
                                type="button"
                                key={`d-${day}`}
                                onClick={() => handleSelectDay(day)}
                                className={`h-10 rounded-xl relative flex items-center justify-center text-xs font-semibold transition ${
                                  isSelected
                                    ? 'bg-maroon text-ivory font-bold shadow-md scale-105'
                                    : isToday
                                    ? 'border-2 border-amber-600 text-amber-900 bg-amber-50/50'
                                    : isMuhurat
                                    ? 'hover:bg-amber-100/60 text-emerald-800 font-bold'
                                    : 'hover:bg-ivory text-brown'
                                }`}
                              >
                                <span>{day}</span>
                                {isMuhurat && (
                                  <span
                                    className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${
                                      isSelected ? 'bg-white' : 'bg-emerald-600'
                                    }`}
                                  />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-center gap-6 pt-2 text-[11px] text-brown/60 border-t border-beige">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" /> Auspicious Muhurat Day
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-600 inline-block" /> Today
                      </span>
                    </div>
                  </div>

                  {/* Time Selector */}
                  <div className="p-5 bg-white rounded-2xl border border-beige shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-heading font-bold text-sm text-brown">Preferred Timing & Muhurat</h4>
                        <p className="text-[11px] text-brown/60">Choose a Vedic Choghadiya or customize exact AM/PM time</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setUseCustomTime(!useCustomTime)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1.5 ${
                          useCustomTime
                            ? 'bg-maroon text-ivory border-maroon'
                            : 'bg-ivory text-maroon border-gold hover:bg-gold/15'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>{useCustomTime ? 'Vedic Choghadiya Presets' : 'Custom AM / PM Picker'}</span>
                      </button>
                    </div>

                    {useCustomTime ? (
                      /* Custom AM/PM Picker */
                      <div className="p-4 bg-ivory rounded-xl border border-beige space-y-3">
                        <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-beige">
                          <span className="text-2xl font-mono font-bold text-maroon tracking-wider">
                            {customHour}:{customMinute}
                          </span>
                          <div className="flex gap-1 bg-ivory p-1 rounded-lg border border-beige">
                            <button
                              type="button"
                              onClick={() => handleApplyCustomTime(customHour, customMinute, 'AM')}
                              className={`px-3 py-1 rounded text-xs font-bold transition ${
                                customAmPm === 'AM' ? 'bg-maroon text-ivory' : 'text-brown hover:bg-beige'
                              }`}
                            >
                              AM
                            </button>
                            <button
                              type="button"
                              onClick={() => handleApplyCustomTime(customHour, customMinute, 'PM')}
                              className={`px-3 py-1 rounded text-xs font-bold transition ${
                                customAmPm === 'PM' ? 'bg-maroon text-ivory' : 'text-brown hover:bg-beige'
                              }`}
                            >
                              PM
                            </button>
                          </div>
                        </div>

                        <div>
                          <span className="text-[11px] font-semibold text-brown/80 block mb-1.5">Select Hour (तास):</span>
                          <div className="flex flex-wrap gap-1.5">
                            {['06', '07', '08', '09', '10', '11', '12', '01', '02', '03', '04', '05', '06', '07', '08'].map((h) => (
                              <button
                                type="button"
                                key={`h-${h}`}
                                onClick={() => handleApplyCustomTime(h, customMinute, customAmPm)}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                                  customHour === h
                                    ? 'bg-maroon text-ivory'
                                    : 'bg-white border border-beige hover:border-gold text-brown'
                                }`}
                              >
                                {h}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <span className="text-[11px] font-semibold text-brown/80 block mb-1.5">Select Minute (मिनिटे):</span>
                          <div className="flex gap-2">
                            {['00', '15', '30', '45'].map((m) => (
                              <button
                                type="button"
                                key={`m-${m}`}
                                onClick={() => handleApplyCustomTime(customHour, m, customAmPm)}
                                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                                  customMinute === m
                                    ? 'bg-maroon text-ivory'
                                    : 'bg-white border border-beige hover:border-gold text-brown'
                                }`}
                              >
                                :{m}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Vedic Choghadiya Presets */
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {[
                          { slot: '06:30 AM (Brahma Muhurat)', desc: 'Gayatri, Hawan & Anushthan' },
                          { slot: '08:30 AM (Shubh Choghadiya)', desc: 'Satyanarayan & Griha Pravesh' },
                          { slot: '10:00 AM (Amrit Muhurat)', desc: 'Supreme health & prosperity' },
                          { slot: '11:45 AM (Abhijit Muhurat)', desc: 'Vishnu blessed supreme muhurat' },
                          { slot: '02:30 PM (Labh Choghadiya)', desc: 'Commerce & wealth accumulation' },
                          { slot: '05:30 PM (Sandhya Godhuli)', desc: 'Evening lamp & Kuldevi aradhana' },
                          { slot: '07:15 PM (Pradosh Kaal)', desc: 'Shiva Rudrabhishek oblation' },
                        ].map((item) => (
                          <button
                            type="button"
                            key={item.slot}
                            onClick={() => {
                              setTimeSlot(item.slot);
                              const [h, rest] = item.slot.split(':');
                              const [m, ampm] = rest.split(' ');
                              setCustomHour(h);
                              setCustomMinute(m);
                              setCustomAmPm(ampm as 'AM' | 'PM');
                            }}
                            className={`p-3 rounded-xl text-left border transition ${
                              timeSlot.startsWith(item.slot.slice(0, 8))
                                ? 'border-maroon bg-gold/15 font-bold text-maroon shadow-sm'
                                : 'border-beige hover:border-gold/60 text-brown bg-ivory/40'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-brown flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                                {item.slot}
                              </span>
                            </div>
                            <p className="text-[10px] text-brown/60 mt-1">{item.desc}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-beige flex justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="px-5 py-2.5 border border-beige text-brown text-xs font-semibold rounded-xl"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="px-6 py-2.5 bg-maroon text-ivory font-semibold text-xs rounded-xl shadow-sacred hover:bg-maroon-800 transition flex items-center gap-2"
                    >
                      <span>Proceed to Location</span>
                      <ArrowRight className="w-4 h-4 text-gold-300" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: ENTER LOCATION */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-heading font-bold text-lg text-maroon flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-gold-600" />
                      Step 3: Enter Ceremony Location
                    </h3>
                    <p className="text-xs text-brown/70 mt-1">
                      Specify the residence, temple, or office venue for the Pandit&apos;s arrival.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-brown mb-1.5">
                        Address & Flat / House Number
                      </label>
                      <input
                        type="text"
                        value={addressLine}
                        onChange={(e) => setAddressLine(e.target.value)}
                        placeholder="House, street, apartment name, landmark"
                        className="w-full px-4 py-2.5 rounded-xl border border-beige bg-ivory text-xs text-brown font-sans focus:outline-none focus:ring-2 focus:ring-maroon"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-brown mb-1.5">City</label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-beige bg-ivory text-xs text-brown font-sans focus:outline-none focus:ring-2 focus:ring-maroon"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-brown mb-1.5">Postal PIN Code</label>
                        <input
                          type="text"
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-beige bg-ivory text-xs text-brown font-sans focus:outline-none focus:ring-2 focus:ring-maroon"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-beige flex justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="px-5 py-2.5 border border-beige text-brown text-xs font-semibold rounded-xl"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(4)}
                      className="px-6 py-2.5 bg-maroon text-ivory font-semibold text-xs rounded-xl shadow-sacred hover:bg-maroon-800 transition flex items-center gap-2"
                    >
                      <span>Proceed to Select Pandit</span>
                      <ArrowRight className="w-4 h-4 text-gold-300" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: SELECT PANDIT */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-heading font-bold text-lg text-maroon flex items-center gap-2">
                      <Award className="w-5 h-5 text-gold-600" />
                      Step 4: Select Your Verified Gurukul Pandit
                    </h3>
                    <p className="text-xs text-brown/70 mt-1">
                      Pick your preferred Acharya from our verified scholars available in {city}.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {panditsList.map((pandit) => (
                      <button
                        type="button"
                        key={pandit.id}
                        onClick={() => setSelectedPanditId(pandit.id)}
                        className={`w-full p-4 rounded-2xl text-left border transition flex items-center justify-between ${
                          selectedPanditId === pandit.id
                            ? 'border-maroon bg-beige/30 ring-2 ring-maroon/20'
                            : 'border-beige hover:border-gold'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-beige/30 border border-gold shrink-0">
                            <Image src={pandit.avatarUrl} alt={pandit.name} fill className="object-cover" sizes="56px" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-heading font-bold text-sm text-brown">{pandit.name}</h4>
                              <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            </div>
                            <p className="text-[11px] text-brown/70 italic">{pandit.title}</p>
                            <p className="text-[10px] text-gold-700 font-medium mt-0.5">{pandit.gurukulLineage}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            {pandit.experienceYears}+ Yrs Exp
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-beige flex justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="px-5 py-2.5 border border-beige text-brown text-xs font-semibold rounded-xl"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(5)}
                      className="px-6 py-2.5 bg-maroon text-ivory font-semibold text-xs rounded-xl shadow-sacred hover:bg-maroon-800 transition flex items-center gap-2"
                    >
                      <span>Proceed to Samagri Requirements</span>
                      <ArrowRight className="w-4 h-4 text-gold-300" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5: CHOOSE SAMAGRI REQUIREMENTS */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-heading font-bold text-lg text-maroon flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-gold-600" />
                      Step 5: Choose Samagri Requirements
                    </h3>
                    <p className="text-xs text-brown/70 mt-1">
                      Opt for our all-inclusive pure temple-grade samagri box or choose to arrange materials yourself.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div
                      onClick={() => setIncludeSamagri(true)}
                      className={`p-4 rounded-2xl border cursor-pointer transition flex items-start gap-4 ${
                        includeSamagri
                          ? 'border-maroon bg-beige/30 ring-2 ring-maroon/20'
                          : 'border-beige hover:border-gold'
                      }`}
                    >
                      <input
                        type="radio"
                        checked={includeSamagri}
                        onChange={() => setIncludeSamagri(true)}
                        className="mt-1 h-4 w-4 text-maroon focus:ring-maroon"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-heading font-bold text-sm text-brown">
                            Include Complete Temple-Grade Samagri Kit (+₹1,899)
                          </h4>
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-gold/20 text-gold-800 rounded">
                            Recommended
                          </span>
                        </div>
                        <p className="text-xs text-brown/70 mt-1 leading-relaxed">
                          Includes pure Gangajal, cow ghee, authentic 51-herb havan blend, unbroken akshat, mauli, supari, dry fruits, Janeu, and puja thali essentials delivered to your door.
                        </p>
                      </div>
                    </div>

                    <div
                      onClick={() => setIncludeSamagri(false)}
                      className={`p-4 rounded-2xl border cursor-pointer transition flex items-start gap-4 ${
                        !includeSamagri
                          ? 'border-maroon bg-beige/30 ring-2 ring-maroon/20'
                          : 'border-beige hover:border-gold'
                      }`}
                    >
                      <input
                        type="radio"
                        checked={!includeSamagri}
                        onChange={() => setIncludeSamagri(false)}
                        className="mt-1 h-4 w-4 text-maroon focus:ring-maroon"
                      />
                      <div>
                        <h4 className="font-heading font-bold text-sm text-brown">
                          I Will Arrange Puja Samagri Myself (₹0)
                        </h4>
                        <p className="text-xs text-brown/70 mt-1 leading-relaxed">
                          DevSutra will email you an itemized Shastric samagri checklist so you can procure ingredients from your local pooja bhandar.
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-brown mb-1.5">
                        Special Gotra or Family Vidhi Instructions (Optional)
                      </label>
                      <textarea
                        rows={2}
                        value={specialInstructions}
                        onChange={(e) => setSpecialInstructions(e.target.value)}
                        placeholder="Mention your Gotra, ancestral Kuldevi/Kuldevta, or specific language preferences..."
                        className="w-full px-4 py-2 rounded-xl border border-beige bg-ivory text-xs text-brown font-sans focus:outline-none focus:ring-2 focus:ring-maroon"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-beige flex justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(4)}
                      className="px-5 py-2.5 border border-beige text-brown text-xs font-semibold rounded-xl"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(6)}
                      className="px-6 py-2.5 bg-maroon text-ivory font-semibold text-xs rounded-xl shadow-sacred hover:bg-maroon-800 transition flex items-center gap-2"
                    >
                      <span>Proceed to Review Booking Details</span>
                      <ArrowRight className="w-4 h-4 text-gold-300" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 6: REVIEW BOOKING DETAILS */}
              {currentStep === 6 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-heading font-bold text-lg text-maroon flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      Step 6: Review Booking Details
                    </h3>
                    <p className="text-xs text-brown/70 mt-1">
                      Verify all sacred ceremony specifics before confirming your reservation.
                    </p>
                  </div>

                  <div className="p-5 bg-ivory rounded-2xl border border-beige space-y-3 text-xs">
                    <div className="flex justify-between border-b border-beige pb-2">
                      <span className="text-brown/70">Selected Ceremony:</span>
                      <span className="font-bold text-maroon">{selectedPuja.name} ({selectedPuja.devanagari})</span>
                    </div>
                    <div className="flex justify-between border-b border-beige pb-2">
                      <span className="text-brown/70">Date & Slot:</span>
                      <span className="font-semibold text-brown">{pujaDate} • {timeSlot}</span>
                    </div>
                    <div className="flex justify-between border-b border-beige pb-2">
                      <span className="text-brown/70">Venue Address:</span>
                      <span className="font-medium text-brown">{addressLine}, {city} - {pincode}</span>
                    </div>
                    <div className="flex justify-between border-b border-beige pb-2">
                      <span className="text-brown/70">Assigned Pandit:</span>
                      <span className="font-semibold text-brown">{selectedPandit.name} ({selectedPandit.gurukulLineage})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brown/70">Puja Samagri:</span>
                      <span className="font-semibold text-brown">
                        {includeSamagri ? 'Complete Pure Kit Included (Doorstep)' : 'Self-Arranged by Devotee'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-beige flex justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(5)}
                      className="px-5 py-2.5 border border-beige text-brown text-xs font-semibold rounded-xl"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(7)}
                      className="px-6 py-2.5 bg-maroon text-ivory font-semibold text-xs rounded-xl shadow-sacred hover:bg-maroon-800 transition flex items-center gap-2"
                    >
                      <span>Proceed to Step 7: Payment</span>
                      <ArrowRight className="w-4 h-4 text-gold-300" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 7: PROCEED TO PAYMENT */}
              {currentStep === 7 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-heading font-bold text-lg text-maroon flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-gold-600" />
                      Step 7: Proceed to Secure Payment
                    </h3>
                    <p className="text-xs text-brown/70 mt-1">
                      Complete your sacred booking through Razorpay with bank-grade encryption and escrow guarantee.
                    </p>
                  </div>

                  <div className="p-5 bg-beige/30 rounded-2xl border border-beige space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-brown font-medium">Total Payable Dakshina</span>
                      <span className="text-2xl font-heading font-bold text-maroon">
                        ₹{totalAmount.toLocaleString()}
                      </span>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-beige text-xs text-brown/75">
                      <p className="flex items-center gap-2 text-emerald-800 font-semibold">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        100% Escrow Milestone Protection
                      </p>
                      <p className="text-[11px] leading-relaxed">
                        Your payment is held securely in escrow and released to the Pandit only after the sacred ceremony is verified and concluded.
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-beige flex justify-between items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(6)}
                      className="px-5 py-2.5 border border-beige text-brown text-xs font-semibold rounded-xl"
                    >
                      Back
                    </button>
                    <Link
                      href={`/checkout?amount=${totalAmount}&puja=${selectedPuja.slug}&title=${encodeURIComponent(selectedPuja.name)}&panditId=${encodeURIComponent(selectedPandit.id)}&panditName=${encodeURIComponent(selectedPandit.name)}&date=${pujaDate}&slot=${encodeURIComponent(timeSlot)}&city=${encodeURIComponent(city)}&address=${encodeURIComponent(addressLine)}&pincode=${pincode}&samagri=${includeSamagri}`}
                      className="flex-1 py-3 bg-maroon hover:bg-maroon-800 text-ivory font-bold text-xs rounded-xl shadow-sacred transition flex items-center justify-center gap-2 border border-gold/40 text-center"
                    >
                      <CreditCard className="w-4 h-4 text-gold-300" />
                      <span>Confirm & Proceed to Payment</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dakshina Summary Sidebar (1 col) */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-3xl border border-beige shadow-sacred sticky top-28 space-y-5">
              <h4 className="font-heading font-bold text-sm text-brown border-b border-beige pb-3">
                Dakshina Summary
              </h4>

              <div className="space-y-3 text-xs text-brown/80 font-sans">
                <div className="flex justify-between">
                  <span>Puja Dakshina</span>
                  <span className="font-bold text-brown">₹{basePujaDakshina.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Temple Samagri Kit</span>
                  <span className="font-bold text-brown">₹{samagriCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>DevSutra Seva Sankalp</span>
                  <span className="font-bold text-brown">₹{platformSeva}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-beige flex justify-between items-baseline">
                <span className="text-xs font-bold text-brown">Total Dakshina</span>
                <span className="text-2xl font-heading font-bold text-maroon">
                  ₹{totalAmount.toLocaleString()}
                </span>
              </div>

              <div className="p-3.5 bg-ivory rounded-xl border border-beige text-[11px] text-brown/70 space-y-1.5">
                <p className="font-semibold text-maroon flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-gold-600" /> Verified DevSutra Guarantee:
                </p>
                <p>• Verified Gurukul Pandit with Shastra accreditation.</p>
                <p>• Punctual arrival at your chosen muhurat time.</p>
                <p>• 100% money-back if ceremony cannot be solemnized.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-ivory text-maroon">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-maroon border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-heading font-bold text-sm">॥ ॐ श्री गणेशाय नमः ॥ Loading Sacred Booking...</p>
        </div>
      </div>
    }>
      <BookingContent />
    </Suspense>
  );
}
