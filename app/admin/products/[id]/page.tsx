"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import Link from "next/link";

interface Product {
  _id: string;
  name: string; brand: string; category: string; sku: string; description: string;
  gettingPrice: number; sellingPrice: number; stockQty: number;
  imageFileIds: string[]; videoUrl?: string; isOutOfStock?: boolean;
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<Partial<Product>>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [stockSuccess, setStockSuccess] = useState("");
  const [restockQty, setRestockQty] = useState("");

  useEffect(() => {
    fetch(`/api/admin/products/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.product) { setProduct(d.product); setForm(d.product); }
        setFetching(false);
      });
    fetch("/api/categories")
      .then(r => r.json())
      .then(d => setCategories(d.categories || []));
  }, [id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const existingCount = (form.imageFileIds || []).length;
    if (existingCount + newImages.length + files.length > 5) {
      setError("Maximum 5 images total"); return;
    }
    setError("");
    const updated = [...newImages, ...files];
    setNewImages(updated);
    setPreviews(updated.map(f => URL.createObjectURL(f)));
  };

  const removeExistingImage = (fileId: string) => {
    setForm(prev => ({ ...prev, imageFileIds: (prev.imageFileIds || []).filter(id => id !== fileId) }));
  };

  // Toggle out-of-stock manually
  const toggleOutOfStock = async () => {
    const newVal = !form.isOutOfStock;
    const res = await fetch(`/api/products/${id}/stock`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isOutOfStock: newVal }),
      credentials: "same-origin",
    });
    if (res.ok) {
      setForm(prev => ({ ...prev, isOutOfStock: newVal }));
      setStockSuccess(newVal ? "Marked as out of stock" : "Marked as in stock");
      setTimeout(() => setStockSuccess(""), 3000);
    }
  };

  // Restock with qty
  const handleRestock = async () => {
    const qty = parseInt(restockQty);
    if (isNaN(qty) || qty < 1) { setError("Enter a valid restock quantity"); return; }
    const newQty = (form.stockQty || 0) + qty;
    const res = await fetch(`/api/products/${id}/stock`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stockQty: newQty }),
      credentials: "same-origin",
    });
    if (res.ok) {
      setForm(prev => ({ ...prev, stockQty: newQty, isOutOfStock: false }));
      setRestockQty("");
      setStockSuccess(`Restocked! New qty: ${newQty}`);
      setTimeout(() => setStockSuccess(""), 4000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      let allImageIds = [...(form.imageFileIds || [])];
      if (newImages.length > 0) {
        const fd = new FormData();
        newImages.forEach(img => fd.append("files", img));
        const uploadRes = await fetch("/api/images/upload", { method: "POST", body: fd });
        if (!uploadRes.ok) {
          const d = await uploadRes.json();
          setError(d.error || "Image upload failed"); setLoading(false); return;
        }
        const uploadData = await uploadRes.json();
        allImageIds = [...allImageIds, ...uploadData.fileIds].slice(0, 5);
      }
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, imageFileIds: allImageIds }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Update failed"); setLoading(false); return; }
      router.push("/admin/dashboard");
    } catch {
      setError("Something went wrong");
    }
    setLoading(false);
  };

  if (fetching) {
    return <AdminLayout><div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div></AdminLayout>;
  }
  if (!product) {
    return <AdminLayout><p className="text-red-600 text-center mt-10">Product not found</p></AdminLayout>;
  }

  const isOOS = form.isOutOfStock || (form.stockQty || 0) <= 0;
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/product/${id}` : `/product/${id}`;

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin/dashboard" className="text-gray-400 hover:text-gray-600">← Back</Link>
          <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
        </div>

        {/* Stock Management Card */}
        <div className={`card mb-4 border-2 ${isOOS ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-bold text-gray-900">Stock Status</h2>
              <p className={`text-sm font-semibold mt-0.5 ${isOOS ? "text-red-600" : "text-green-600"}`}>
                {isOOS ? "⛔ Out of Stock" : `✅ In Stock — ${form.stockQty} units`}
                {form.isOutOfStock && " (manually marked)"}
              </p>
            </div>
            <button onClick={toggleOutOfStock}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                form.isOutOfStock
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-red-500 hover:bg-red-600 text-white"
              }`}>
              {form.isOutOfStock ? "✅ Mark In Stock" : "⛔ Mark Out of Stock"}
            </button>
          </div>
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Add Restock Qty</label>
              <input type="number" min="1" value={restockQty}
                onChange={e => setRestockQty(e.target.value)}
                placeholder="e.g. 10"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button onClick={handleRestock}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors">
              + Restock
            </button>
          </div>
          {stockSuccess && (
            <p className="mt-2 text-sm font-medium text-green-700 bg-green-100 px-3 py-1.5 rounded-lg">✓ {stockSuccess}</p>
          )}
          {/* Share link */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-1">🔗 Unique product link</p>
            <div className="flex gap-2">
              <input readOnly value={shareUrl} className="flex-1 text-xs text-gray-600 bg-white border border-gray-200 rounded-lg px-2 py-1.5 truncate" />
              <button onClick={() => { navigator.clipboard.writeText(shareUrl); }}
                className="shrink-0 text-xs font-bold px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg">
                Copy
              </button>
              <a href={shareUrl} target="_blank" rel="noopener noreferrer"
                className="shrink-0 text-xs font-bold px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg">
                ↗
              </a>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card space-y-4">
            <h2 className="font-semibold text-gray-900">Product Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input type="text" required value={form.name || ""} onChange={e => setForm({...form,name:e.target.value})} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand *</label>
                <input type="text" required value={form.brand || ""} onChange={e => setForm({...form,brand:e.target.value})} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select value={form.category || ""} onChange={e => setForm({...form,category:e.target.value})} className="input">
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
                <input type="text" required value={form.sku || ""} onChange={e => setForm({...form,sku:e.target.value})} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Qty</label>
                <input type="number" required min="0" value={form.stockQty ?? ""} onChange={e => setForm({...form,stockQty:parseInt(e.target.value)})} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Getting Price (Rs.) *</label>
                <input type="number" required min="0" step="0.01" value={form.gettingPrice ?? ""} onChange={e => setForm({...form,gettingPrice:Number(e.target.value)})} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price (Rs.) *</label>
                <input type="number" required min="0" step="0.01" value={form.sellingPrice ?? ""} onChange={e => setForm({...form,sellingPrice:Number(e.target.value)})} className="input" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={3} value={form.description || ""} onChange={e => setForm({...form,description:e.target.value})} className="input resize-none" />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Images (max 5)</h2>
              <span className="text-xs text-gray-400">{(form.imageFileIds||[]).length+newImages.length}/5</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {(form.imageFileIds||[]).map(fileId => (
                <div key={fileId} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/api/images/${fileId}`} alt="" className="w-20 h-20 rounded-lg object-cover border border-gray-200" />
                  <button type="button" onClick={() => removeExistingImage(fileId)} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">×</button>
                </div>
              ))}
              {previews.map((src,i) => (
                <div key={`new-${i}`} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="w-20 h-20 rounded-lg object-cover border border-blue-300" />
                  <span className="absolute top-0 left-0 bg-blue-500 text-white text-xs px-1 rounded-tl-lg">New</span>
                </div>
              ))}
              {(form.imageFileIds||[]).length+newImages.length < 5 && (
                <label className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 flex items-center justify-center cursor-pointer text-gray-400 hover:text-blue-500">
                  <span className="text-2xl">+</span>
                  <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* Video URL */}
          <div className="card space-y-3">
            <h2 className="font-semibold text-gray-900">Product Video</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">YouTube URL (optional)</label>
              <input type="url" value={form.videoUrl || ""}
                onChange={e => setForm({...form,videoUrl:e.target.value})}
                placeholder="https://www.youtube.com/watch?v=..."
                className="input" />
              <p className="text-xs text-gray-400 mt-1">Paste any YouTube link — customers can watch the product video</p>
            </div>
            {form.videoUrl && (() => {
              const m = (form.videoUrl||"").match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
              return m ? (
                <div className="mt-2">
                  <p className="text-xs text-green-600 font-medium mb-2">✓ Valid YouTube URL detected</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`https://img.youtube.com/vi/${m[1]}/mqdefault.jpg`} alt="Video preview"
                    className="w-full h-32 object-cover rounded-lg" />
                </div>
              ) : <p className="text-xs text-orange-600">⚠ Could not detect YouTube video ID — check the URL</p>;
            })()}
          </div>

          {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">{error}</div>}

          <div className="flex gap-3">
            <Link href="/admin/dashboard" className="btn-secondary flex-1 text-center">Cancel</Link>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? "Saving..." : "Update Product"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
