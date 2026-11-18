import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/layout/Footer';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-ivory text-brown">
      <Navbar />

      <div className="bg-sacred-pattern py-14 border-b border-beige text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-2">
          <span className="text-xs font-sans font-bold uppercase tracking-widest text-gold-600">
            Devotee Seva Desk
          </span>
          <h1 className="text-3xl sm:text-5xl font-heading font-bold text-brown">
            Get in Touch with DevSutra
          </h1>
          <p className="text-xs sm:text-sm font-sans text-brown/75 max-w-xl mx-auto pt-1">
            Have questions about auspicious muhurats, custom pujas, or Pandit bookings? Our seva team is here to assist you.
          </p>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 flex-1 font-sans">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <h2 className="text-2xl font-heading font-bold text-brown">We Are Here to Serve</h2>
            <p className="text-xs sm:text-sm text-brown/75 leading-relaxed">
              Reach out to our customer experience team for personalized guidance on auspicious dates, specialized homam, or corporate Vastu ceremonies.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3.5 p-5 bg-white rounded-2xl border border-beige shadow-sacred">
                <MapPin className="w-5 h-5 text-gold-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-brown">National Headquarters</h3>
                  <p className="text-xs text-brown/70 mt-0.5">DevSutra Kendra, Connaught Place, New Delhi - 110001, India</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-5 bg-white rounded-2xl border border-beige shadow-sacred">
                <Phone className="w-5 h-5 text-gold-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-brown">Toll-Free Helpline</h3>
                  <p className="text-xs text-brown/70 mt-0.5">+91 1800-DEV-SUTRA (Mon - Sun, 7:00 AM - 10:00 PM IST)</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-5 bg-white rounded-2xl border border-beige shadow-sacred">
                <Mail className="w-5 h-5 text-gold-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-brown">Official Communication</h3>
                  <p className="text-xs text-brown/70 mt-0.5">seva@devsutra.com / pandits@devsutra.com</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-beige shadow-sacred">
            <h3 className="text-lg font-heading font-bold text-brown mb-4">Send a Message</h3>
            <form className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-brown mb-1">Your Full Name</label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-beige focus:outline-none focus:ring-2 focus:ring-maroon text-brown bg-ivory/50"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-brown mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-beige focus:outline-none focus:ring-2 focus:ring-maroon text-brown bg-ivory/50"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-brown mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="10-digit mobile"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-beige focus:outline-none focus:ring-2 focus:ring-maroon text-brown bg-ivory/50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-brown mb-1">Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Griha Pravesh Muhurat Inquiry"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-beige focus:outline-none focus:ring-2 focus:ring-maroon text-brown bg-ivory/50"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-brown mb-1">Message Details</label>
                <textarea
                  rows={4}
                  placeholder="Describe your ritual requirements, city, or date queries..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-beige focus:outline-none focus:ring-2 focus:ring-maroon text-brown bg-ivory/50"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-maroon hover:bg-maroon-800 text-ivory font-semibold text-xs rounded-xl shadow-sacred transition flex items-center justify-center gap-2 border border-gold/40"
              >
                <Send className="w-4 h-4 text-gold-300" />
                <span>Submit Message</span>
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
