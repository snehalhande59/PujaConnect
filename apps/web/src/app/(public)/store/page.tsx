'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/layout/Footer';
import { PUJA_SAMAGRI_STORE_DATA } from '@/lib/cultural-images';
import {
  ShoppingBag,
  ShieldCheck,
  Filter,
  Search,
  Sparkles,
  Plus,
  CheckCircle,
  Truck,
  RotateCcw,
  Eye,
} from 'lucide-react';

export default function StorePage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedItem, setAddedItem] = useState<string | null>(null);

  const categories = [
    'All',
    'Puja Thali',
    'Kalash',
    'Diya',
    'Incense Sticks',
    'Camphor',
    'Rudraksha',
    'Puja Kits',
    'Havan Samagri',
    'Religious Books',
    'Festival Decoration Items',
  ];

  const filteredProducts = PUJA_SAMAGRI_STORE_DATA.filter((p) => {
    const categoryMatch = selectedCategory === 'All' || p.category === selectedCategory;
    const searchMatch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.devanagariName.includes(searchQuery) ||
      p.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && searchMatch;
  });

  const handleAddToCart = (productName: string) => {
    setAddedItem(productName);
    setTimeout(() => setAddedItem(null), 3000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-ivory text-brown">
      <Navbar />

      {/* Cart Toast Notification */}
      {addedItem && (
        <div className="fixed bottom-6 right-6 z-50 bg-maroon text-ivory px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-gold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-ivory">Added to Cart</p>
            <p className="text-[11px] text-beige/80">{addedItem}</p>
          </div>
          <Link
            href="/checkout"
            className="ml-2 px-3 py-1 bg-gold text-maroon text-xs font-bold rounded-lg hover:bg-gold-300 transition"
          >
            Checkout
          </Link>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-maroon-900 text-ivory py-16 border-b border-gold/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-sacred-pattern opacity-10" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/15 border border-gold/40 text-gold-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>DevSutra Sacred Store</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-heading font-bold text-ivory">
              Pure Temple-Grade Puja Samagri
            </h1>
            <p className="text-xs sm:text-sm font-sans text-beige/85 leading-relaxed pt-1">
              Shop authentic brassware, pure herbal dhoop, A2 cow ghee wicks, lab-certified Nepali Rudraksha, and all-in-one Shastric kits. 100% pure and unadulterated.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Category Filters */}
      <div className="border-b border-beige bg-white sticky top-20 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-gold-600 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search samagri, kits, books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-ivory border border-beige rounded-xl text-xs font-sans text-brown placeholder-brown/50 focus:outline-none focus:ring-2 focus:ring-maroon"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            <span className="text-xs font-semibold text-brown/70 flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5 text-gold-600" /> Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition ${
                  selectedCategory === cat
                    ? 'bg-maroon text-ivory'
                    : 'bg-ivory text-brown hover:bg-beige/60 border border-beige'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Trust Badges Bar */}
      <div className="bg-beige/30 border-b border-beige py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-around gap-4 text-xs font-sans text-brown/80">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-gold-600" />
            <span>100% Shastra Pure Ingredients</span>
          </div>
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-gold-600" />
            <span>Pan-India Safe Doorstep Delivery</span>
          </div>
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-gold-600" />
            <span>Hassle-Free Replacement for Sacred Items</span>
          </div>
        </div>
      </div>

      {/* Product Cards Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 font-sans">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl overflow-hidden border border-beige hover:border-gold/60 shadow-sacred hover:shadow-sacred-lg transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="relative h-48 w-full bg-beige/30 overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 20vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-2.5 right-2.5 px-2 py-0.5 text-[10px] font-semibold bg-emerald-700 text-white rounded-md">
                    {product.stockAvailability}
                  </span>
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 text-[10px] font-devanagari text-white bg-black/60 rounded backdrop-blur-sm">
                    {product.devanagariName}
                  </span>
                </div>

                <div className="p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gold-700 mb-1">
                    {product.category}
                  </p>
                  <h3 className="font-heading font-bold text-sm text-brown line-clamp-1 group-hover:text-maroon transition">
                    {product.name}
                  </h3>
                  <p className="mt-1 text-xs text-brown/70 line-clamp-2 leading-relaxed">
                    {product.desc}
                  </p>

                  <div className="mt-3 pt-2 border-t border-beige">
                    <p className="text-[10px] text-brown/60 italic line-clamp-1">
                      {product.materialGrade}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0">
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddToCart(product.name)}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-maroon text-ivory hover:bg-maroon-800 text-xs font-semibold transition duration-200 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5 text-gold-300" />
                    <span>Add to Cart</span>
                  </button>
                  <Link
                    href={`/checkout?item=${product.id}`}
                    aria-label={`Buy ${product.name} directly`}
                    className="p-2 rounded-xl bg-ivory text-brown hover:text-maroon border border-beige hover:border-maroon transition"
                    title="Direct Checkout"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
