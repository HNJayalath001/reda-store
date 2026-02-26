"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import Link from "next/link";

interface Product {
  _id: string; name: string; brand: string; category: string;
  sku: string; sellingPrice: number; stockQty: number; isOutOfStock?: boolean;
  imageFileIds: string[];
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState<string[]>([]);
  const [newCat, setNewCat] = useState("");
  const [addingCat, setAddingCat] = useState(false);
  const [showCatMgr, setShowCatMgr] = useState(false);
  const LIMIT = 30;

  const loadProducts = async (pg = 1, q = search) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(pg), limit: String(LIMIT), includeOutOfStock: "true", ...(q && { search: q }) });
    const res = await fetch(`/api/admin/products?${params}`);
    const data = await res.json();
    setProducts(data.products || []);
    setTotal(data.total || 0);
    setLoading(false);
  };

  const loadCategories = () => {
    fetch("/api/categories").then(r => r.json()).then(d => setCategories(d.categories || []));
  };

  useEffect(() => { loadProducts(); loadCategories(); }, []);

  const addCategory = async () => {
    if (!newCat.trim()) return;
    setAddingCat(true);
    await fetch("/api/categories", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCat.trim() }), credentials: "same-origin",
    });
    setNewCat(""); loadCategories(); setAddingCat(false);
  };

  const deleteCategory = async (name: string) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    await fetch("/api/categories", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }), credentials: "same-origin",
    });
    loadCategories();
  };

  const toggleStock = async (id: string, isOOS: boolean) => {
    await fetch(`/api/products/${id}/stock`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isOutOfStock: !isOOS }), credentials: "same-origin",
    });
    loadProducts(page);
  };

  const deleteProduct = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    loadProducts(page);
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Products ({total})</h1>
          <div className="flex gap-2">
            <button onClick={() => setShowCatMgr(v => !v)}
              className="btn-secondary text-sm flex items-center gap-1.5">
              🏷 {showCatMgr ? "Hide" : "Manage"} Categories
            </button>
            <Link href="/admin/products/new" className="btn-primary text-sm flex items-center gap-1.5">
              ➕ Add Product
            </Link>
          </div>
        </div>

        {/* Category manager */}
        {showCatMgr && (
          <div className="card border-2 border-blue-100 bg-blue-50">
            <h2 className="font-semibold text-blue-900 mb-3">📂 Category Management</h2>
            <div className="flex gap-2 mb-3">
              <input type="text" value={newCat} onChange={e => setNewCat(e.target.value)}
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addCategory())}
                placeholder="Type new category name…"
                className="flex-1 px-3 py-2 text-sm border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
              <button onClick={addCategory} disabled={addingCat}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg disabled:opacity-50">
                {addingCat ? "..." : "+ Add Category"}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <div key={cat} className="flex items-center gap-1.5 bg-white border border-blue-200 rounded-full px-3 py-1">
                  <span className="text-sm text-blue-800 font-medium">{cat}</span>
                  <button onClick={() => deleteCategory(cat)} className="text-red-400 hover:text-red-600 text-sm">×</button>
                </div>
              ))}
              {categories.length === 0 && <p className="text-sm text-gray-400">No categories yet</p>}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); loadProducts(1, e.target.value); }}
            placeholder="Search products by name, brand, SKU…"
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm" />
        </div>

        {/* Product table */}
        {loading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-2">📦</p>
            <p>No products found</p>
            <Link href="/admin/products/new" className="text-blue-600 text-sm mt-2 block hover:underline">+ Add your first product</Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs">Product</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs hidden md:table-cell">Category</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600 text-xs">Price</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600 text-xs">Stock</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600 text-xs">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map(p => {
                  const isOOS = p.isOutOfStock || p.stockQty <= 0;
                  return (
                    <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {p.imageFileIds.length > 0
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={`/api/images/${p.imageFileIds[0]}`} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                            : <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300 shrink-0">📦</div>
                          }
                          <div>
                            <p className="font-semibold text-gray-900 text-xs line-clamp-1">{p.name}</p>
                            <p className="text-gray-400 text-[10px]">{p.brand} · {p.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{p.category}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-xs font-bold text-blue-600">Rs. {p.sellingPrice.toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => toggleStock(p._id, !!p.isOutOfStock)}
                          title={isOOS ? "Mark In Stock" : "Mark Out of Stock"}
                          className={`text-xs font-bold px-2 py-0.5 rounded-full transition-colors ${
                            isOOS ? "bg-red-100 text-red-600 hover:bg-red-200" : "bg-green-100 text-green-700 hover:bg-green-200"
                          }`}>
                          {isOOS ? `OOS` : `${p.stockQty}`}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link href={`/admin/products/${p._id}`}
                            className="text-xs px-2.5 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-medium transition-colors">
                            Edit
                          </Link>
                          <a href={`/product/${p._id}`} target="_blank" rel="noopener noreferrer"
                            className="text-xs px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">
                            ↗
                          </a>
                          <button onClick={() => deleteProduct(p._id, p.name)}
                            className="text-xs px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg font-medium transition-colors">
                            Del
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

        {/* Pagination */}
        {total > LIMIT && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">Page {page} of {Math.ceil(total/LIMIT)}</p>
            <div className="flex gap-2">
              <button disabled={page===1} onClick={() => { const p=page-1; setPage(p); loadProducts(p); }}
                className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">← Prev</button>
              <button disabled={page*LIMIT>=total} onClick={() => { const p=page+1; setPage(p); loadProducts(p); }}
                className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Next →</button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
