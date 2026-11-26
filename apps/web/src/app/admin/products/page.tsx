'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Package,
  Plus,
  Sparkles,
  CheckCircle2,
  IndianRupee,
  Loader2,
  RefreshCw,
  Search,
  AlertTriangle,
  Edit,
  Trash2,
  X,
  Check,
  AlertCircle,
} from 'lucide-react';
import { getClientToken } from '@/lib/auth';
import AdminLayout from '@/components/admin/AdminLayout';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://pujaconnect-api-he9b.onrender.com/api/v1';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Puja Kits');
  const [price, setPrice] = useState(499);
  const [discountPrice, setDiscountPrice] = useState<number | undefined>(399);
  const [stockQuantity, setStockQuantity] = useState(100);
  const [description, setDescription] = useState('');

  // Quick edit stock state
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [editStock, setEditStock] = useState(0);
  const [editPrice, setEditPrice] = useState(0);

  const fetchProducts = useCallback(async () => {
    const token = getClientToken();
    try {
      setLoading(true);
      const url = new URL(`${API_BASE_URL}/admin/products`);
      if (search.trim()) url.searchParams.append('search', search.trim());
      if (categoryFilter !== 'ALL') url.searchParams.append('category', categoryFilter);

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        const data = json.data?.data || json.data || json || [];
        setProducts(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Failed to load products:', e);
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const token = getClientToken();
    try {
      setSaving(true);
      const res = await fetch(`${API_BASE_URL}/admin/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          category,
          price: Number(price),
          discountPrice: discountPrice ? Number(discountPrice) : undefined,
          stockQuantity: Number(stockQuantity),
          description: description.trim() || undefined,
        }),
      });

      if (res.ok) {
        setMsg({ type: 'success', text: `Product '${name}' added to inventory.` });
        setShowAddModal(false);
        setName('');
        setDescription('');
        fetchProducts();
      } else {
        const err = await res.json();
        setMsg({ type: 'error', text: err.message || 'Failed to create product.' });
      }
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message || 'Error creating product.' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const token = getClientToken();
    try {
      const res = await fetch(`${API_BASE_URL}/admin/products/${editingProduct.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          stockQuantity: Number(editStock),
          price: Number(editPrice),
        }),
      });

      if (res.ok) {
        setMsg({ type: 'success', text: `Product '${editingProduct.name}' updated.` });
        setEditingProduct(null);
        fetchProducts();
      }
    } catch (e: any) {
      alert(e.message || 'Error updating product.');
    }
  };

  const handleDeleteProduct = async (id: string, prodName: string) => {
    if (!confirm(`Are you sure you want to remove '${prodName}' from products?`)) return;

    const token = getClientToken();
    try {
      const res = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setMsg({ type: 'success', text: `Product '${prodName}' removed.` });
        fetchProducts();
      }
    } catch (e: any) {
      alert(e.message || 'Error deleting product.');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
              Samagri Products & Inventory
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Live sacred Puja items inventory, kit components, stock counts, and fulfillment pricing in PostgreSQL
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchProducts}
              className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-600' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>
        </div>

        {msg && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center justify-between shadow-xs ${
              msg.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-2">
              {msg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span className="font-medium">{msg.text}</span>
            </div>
            <button onClick={() => setMsg(null)} className="text-stone-400 hover:text-stone-700 font-bold">
              Dismiss
            </button>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search product by name, slug, or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-stone-300 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-600"
            />
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-stone-100 p-1 rounded-xl">
            {['ALL', 'Puja Kits', 'Puja Thali', 'Diya & Kapoor', 'Pavitra Jal'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  categoryFilter === cat ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto mb-3" />
              <p className="text-xs text-stone-500">Loading samagri inventory from database...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="py-16 text-center text-xs text-stone-500 space-y-2">
              <Package className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <p className="font-bold text-stone-800 text-sm">No products found</p>
              <p className="text-stone-400">Click &quot;Add Product&quot; to add sacred samagri items to catalog.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-stone-50 text-stone-500 uppercase text-[10px] font-bold border-b border-stone-200 tracking-wider">
                  <tr>
                    <th className="p-4">Product Name</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price (INR)</th>
                    <th className="p-4">Stock Level</th>
                    <th className="p-4">Stock Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {products.map((p) => {
                    const isLowStock = p.stockQuantity > 0 && p.stockQuantity < 20;
                    const isOutOfStock = p.stockQuantity <= 0;

                    return (
                      <tr key={p.id} className="hover:bg-stone-50/80 transition">
                        <td className="p-4 font-bold text-stone-900 flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
                            <Package className="w-4 h-4" />
                          </div>
                          <div>
                            <span>{p.name}</span>
                            <span className="text-[10px] font-mono text-stone-400 block mt-0.5">
                              slug: /{p.slug}
                            </span>
                          </div>
                        </td>

                        <td className="p-4 text-stone-600">
                          <span className="px-2.5 py-0.5 rounded-lg bg-stone-100 font-semibold text-[11px]">
                            {p.category}
                          </span>
                        </td>

                        <td className="p-4 font-bold text-stone-900">
                          ₹{Number(p.price || 0).toLocaleString()}
                          {p.discountPrice && (
                            <span className="text-[11px] text-stone-400 line-through ml-1.5 font-normal">
                              ₹{Number(p.discountPrice).toLocaleString()}
                            </span>
                          )}
                        </td>

                        <td className="p-4 font-bold text-stone-900">
                          {p.stockQuantity} units
                        </td>

                        <td className="p-4">
                          {isOutOfStock ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                              <X className="w-3 h-3 text-rose-600" />
                              Out of Stock
                            </span>
                          ) : isLowStock ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              Low Stock ({p.stockQuantity})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              In Stock
                            </span>
                          )}
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setEditStock(p.stockQuantity || 0);
                                setEditPrice(Number(p.price || 0));
                              }}
                              className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition"
                              title="Update Stock & Price"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id, p.name)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg transition"
                              title="Delete Product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Quick Edit Stock Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl text-xs text-stone-800">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-sm text-stone-900">
                Update Inventory: {editingProduct.name}
              </h3>
              <button onClick={() => setEditingProduct(null)} className="text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateStock} className="space-y-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Available Stock Quantity *</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={editStock}
                  onChange={(e) => setEditStock(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Selling Price (₹) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={editPrice}
                  onChange={(e) => setEditPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold"
                >
                  Update Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl text-xs text-stone-800 my-8">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-600" /> Add Sacred Samagri Item
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Pure Desi Cow Ghee Diya Wicks (100 Pcs)"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-600 bg-white"
                  >
                    <option value="Puja Kits">Puja Kits</option>
                    <option value="Puja Thali">Puja Thali</option>
                    <option value="Diya & Kapoor">Diya & Kapoor</option>
                    <option value="Pavitra Jal">Pavitra Jal</option>
                    <option value="Idols & Photos">Idols & Photos</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Discount Price (₹)</label>
                  <input
                    type="number"
                    value={discountPrice || ''}
                    onChange={(e) => setDiscountPrice(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Purified sacred items for authentic Vedic rituals..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition flex items-center gap-1.5"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Check className="w-4 h-4" />}
                  <span>Save Product</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
