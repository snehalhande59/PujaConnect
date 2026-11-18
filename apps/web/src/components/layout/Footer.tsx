import Link from 'next/link';
import DevSutraLogo from '@/components/ui/DevSutraLogo';
import {
  ShieldCheck,
  MapPin,
  Mail,
  Phone,
  Heart,
  Sparkles,
  Facebook,
  Instagram,
  Youtube,
  Twitter,
  ArrowUpRight,
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-maroon-900 text-beige pt-16 pb-12 border-t-4 border-gold">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-maroon-800">
          {/* Brand Info & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <DevSutraLogo variant="dark" size="lg" showTagline={true} />
            </Link>
            <p className="text-xs text-beige/80 max-w-sm leading-relaxed font-sans mt-3">
              DevSutra bridges timeless Sanatan Vedic heritage with modern elegance. We connect devotees with verified Gurukul-credentialed Pandits and supply authentic, temple-grade Puja Samagri across India.
            </p>
            <div className="flex items-center gap-2 text-xs text-gold-300 font-medium pt-1 font-sans">
              <ShieldCheck className="w-4 h-4 text-gold" />
              <span>100% Certified Gurukul Pandits • Vedic Shastra Approved Vidhi</span>
            </div>

            {/* Social Media Links */}
            <div className="pt-2">
              <span className="text-[11px] uppercase tracking-wider text-gold-300 block mb-2 font-sans font-semibold">
                Connect With Our Spiritual Community
              </span>
              <div className="flex items-center gap-3">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="DevSutra Facebook"
                  className="w-8 h-8 rounded-full bg-maroon-800 hover:bg-gold/20 flex items-center justify-center text-beige hover:text-gold transition border border-gold/30"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="DevSutra Instagram"
                  className="w-8 h-8 rounded-full bg-maroon-800 hover:bg-gold/20 flex items-center justify-center text-beige hover:text-gold transition border border-gold/30"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="DevSutra YouTube"
                  className="w-8 h-8 rounded-full bg-maroon-800 hover:bg-gold/20 flex items-center justify-center text-beige hover:text-gold transition border border-gold/30"
                >
                  <Youtube className="w-4 h-4" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="DevSutra Twitter"
                  className="w-8 h-8 rounded-full bg-maroon-800 hover:bg-gold/20 flex items-center justify-center text-beige hover:text-gold transition border border-gold/30"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Puja Services */}
          <div>
            <h4 className="text-ivory font-brand font-bold text-sm tracking-wider uppercase mb-4 text-gold-200">
              Puja Services
            </h4>
            <ul className="space-y-2.5 text-xs font-sans text-beige/85">
              <li><Link href="/pujas" className="hover:text-gold-300 transition">Griha Pravesh Puja</Link></li>
              <li><Link href="/pujas" className="hover:text-gold-300 transition">Satyanarayan Katha</Link></li>
              <li><Link href="/pujas" className="hover:text-gold-300 transition">Maha Rudrabhishek</Link></li>
              <li><Link href="/pujas" className="hover:text-gold-300 transition">Vastu Shanti Puja</Link></li>
              <li><Link href="/pujas" className="hover:text-gold-300 transition">Navgraha Shanti</Link></li>
              <li><Link href="/pujas" className="hover:text-gold-300 transition">Vedic Vivah Sanskar</Link></li>
              <li><Link href="/pujas" className="hover:text-gold-300 transition">Purifying Havan</Link></li>
              <li><Link href="/pujas" className="hover:text-gold-300 transition">Maha Lakshmi Puja</Link></li>
            </ul>
          </div>

          {/* Quick Links & Portals */}
          <div>
            <h4 className="text-ivory font-brand font-bold text-sm tracking-wider uppercase mb-4 text-gold-200">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs font-sans text-beige/85">
              <li><Link href="/pandits" className="hover:text-gold-300 transition">Find a Pandit</Link></li>
              <li><Link href="/store" className="hover:text-gold-300 transition">Puja Samagri Store</Link></li>
              <li><Link href="/booking" className="hover:text-gold-300 transition">Book a Puja</Link></li>
              <li><Link href="/customer/login" className="hover:text-gold-300 transition">Customer Login</Link></li>
              <li>
                <Link href="/pandit/register" className="text-gold hover:text-gold-300 transition font-medium flex items-center gap-1">
                  <span>Pandit Registration</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </li>
              <li><Link href="/pandit/login" className="hover:text-gold-300 transition">Pandit Portal</Link></li>
              <li><Link href="/admin/login" className="hover:text-gold-300 transition">Admin Dashboard</Link></li>
              <li><Link href="/support/login" className="hover:text-gold-300 transition">Customer Support</Link></li>
            </ul>
          </div>

          {/* Contact Information & Support */}
          <div>
            <h4 className="text-ivory font-brand font-bold text-sm tracking-wider uppercase mb-4 text-gold-200">
              Contact Us
            </h4>
            <ul className="space-y-3 text-xs font-sans text-beige/85">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                <span>DevSutra Kendra, Connaught Place, New Delhi - 110001, India</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-gold shrink-0" />
                <span>+91 1800-DEV-SUTRA (Toll Free)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-gold shrink-0" />
                <span>seva@devsutra.com</span>
              </li>
              <li className="pt-2">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold/15 text-gold text-xs font-medium hover:bg-gold/25 transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Devotee Helpdesk 24x7
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs font-sans text-beige/70 gap-4">
          <p>© {new Date().getFullYear()} DevSutra Technologies Pvt. Ltd. All sacred rights reserved.</p>
          <div className="flex items-center gap-4 text-beige/80">
            <Link href="/privacy" className="hover:text-gold transition">Privacy Policy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-gold transition">Terms & Conditions</Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-gold transition">Support</Link>
          </div>
          <p className="flex items-center gap-1.5 text-gold-300">
            <span>Crafted with devotion for Sanatan traditions</span>
            <Heart className="w-3.5 h-3.5 text-saffron fill-saffron" />
          </p>
        </div>
      </div>
    </footer>
  );
}
