"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import Link from "next/link";

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<string[]>([]);
  const [newCat, setNewCat] = useState("");
  const [addingCat, setAddingCat] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", brand: "", category: "", sku: "", description: "",
    gettingPrice: "", sellingPrice: "", stockQty: "0",
    videoUrl: "", isOutOfStock: false,
  });

  useEffect(() => {
    fetch("/api/categories").then(r => r.json()).then(d => {
      const cats = d.categories || [];
      setCategories(cats);
      if (cats.length > 0) setForm(prev => ({ ...prev, category: cats[0] }));
    });
  }, []);

  const addCategory = async () => {
    if (!newCat.trim()) return;
    setAddingCat(true);
    const res = await fetch("/api/categories", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCat.trim() }),
      credentials: "same-origin",
    });
    if (res.ok) {
      const updated = [...categories, newCat.trim()].sort();
      setCategories(updated);
      setForm(prev => ({ ...prev, category: newCat.trim() }));
      setNewCat("");
    }
    setAddingCat(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 5) { setError("Maximum 5 images"); return; }
    setError("");
    const updated = [...images, ...files];
    setImages(updated);
    setPreviews(updated.map(f => URL.createObjectURL(f)));
  };

  const removeImage = (i: number) => {
    const updated = images.filter((_,idx) => idx !== i);
    setImages(updated);
    setPreviews(updated.map(f => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      let imageFileIds: string[] = [];
      if (images.length > 0) {
        const fd = new FormData();
        images.forEach(img => fd.append("files", img));
        const uploadRes = await fetch("/api/images/upload", { method: "POST", body: fd });
        if (!uploadRes.ok) {
          const d = await uploadRes.json();
          setError(d.error || "Upload failed"); setLoading(false); return;
        }
        const uploadData = await uploadRes.json();
        imageFileIds = uploadData.fileIds;
      }

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name, brand: form.brand, category: form.category,
          sku: form.sku, description: form.description,
          gettingPrice: Number(form.gettingPrice), sellingPrice: Number(form.sellingPrice),
          stockQty: parseInt(form.stockQty), imageFileIds,
          videoUrl: form.videoUrl, isOutOfStock: form.isOutOfStock,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to create product"); setLoading(false); return; }
      router.push("/admin/dashboard");
    } catch {
      setError("Something went wrong");
    }
    setLoading(false);
  };

  const ytId = form.videoUrl ? (form.videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/) || [])[1] : null;

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin/dashboard" className="text-gray-400 hover:text-gray-600">← Back</Link>
          <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card space-y-4">
            <h2 className="font-semibold text-gray-900">Product Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input type="text" required value={form.name} onChange={e => setForm({...form,name:e.target.value})} className="input" placeholder="e.g. Toyota Corolla Brake Pad" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand *</label>
                <input type="text" required value={form.brand} onChange={e => setForm({...form,brand:e.target.value})} className="input" placeholder="e.g. Nissin" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <div className="flex gap-2">
                  <select value={form.category} onChange={e => setForm({...form,category:e.target.value})} className="input flex-1">
                    {categories.length === 0 && <option value="">— Add a category below —</option>}
                    {categories.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                {/* Add category inline */}
                <div className="flex gap-2 mt-1.5">
                  <input type="text" value={newCat} onChange={e => setNewCat(e.target.value)}
                    placeholder="New category name"
                    className="flex-1 text-xs px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  <button type="button" onClick={addCategory} disabled={addingCat}
                    className="text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50">
                    {addingCat ? "..." : "+ Add"}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
                <input type="text" required value={form.sku} onChange={e => setForm({...form,sku:e.target.value})} className="input" placeholder="e.g. BRK-001" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Qty</label>
                <input type="number" min="0" value={form.stockQty} onChange={e => setForm({...form,stockQty:e.target.value})} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Getting Price (Rs.) *</label>
                <input type="number" required min="0" step="0.01" value={form.gettingPrice} onChange={e => setForm({...form,gettingPrice:e.target.value})} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price (Rs.) *</label>
                <input type="number" required min="0" step="0.01" value={form.sellingPrice} onChange={e => setForm({...form,sellingPrice:e.target.value})} className="input" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={3} value={form.description} onChange={e => setForm({...form,description:e.target.value})} className="input resize-none" />
              </div>
              <div className="col-span-2 flex items-center gap-3">
                <input type="checkbox" id="oos" checked={form.isOutOfStock}
                  onChange={e => setForm({...form,isOutOfStock:e.target.checked})}
                  className="w-4 h-4 accent-red-500" />
                <label htmlFor="oos" className="text-sm text-gray-700">Mark as Out of Stock immediately</label>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="card space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Images (max 5)</h2>
              <span className="text-xs text-gray-400">{images.length}/5</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {previews.map((src,i) => (
                <div key={i} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="w-20 h-20 rounded-lg object-cover border border-blue-300" />
                  <button type="button" onClick={() => removeImage(i)} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">×</button>
                </div>
              ))}
              {images.length < 5 && (
                <label className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 flex items-center justify-center cursor-pointer text-gray-400 hover:text-blue-500">
                  <span className="text-2xl">+</span>
                  <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* Video */}
          <div className="card space-y-3">
            <h2 className="font-semibold text-gray-900">Product Video (optional)</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">YouTube URL</label>
              <input type="url" value={form.videoUrl}
                onChange={e => setForm({...form,videoUrl:e.target.value})}
                placeholder="https://www.youtube.com/watch?v=..."
                className="input" />
              <p className="text-xs text-gray-400 mt-1">Customers can watch the video on the product page</p>
            </div>
            {ytId && (
              <div>
                <p className="text-xs text-green-600 font-medium mb-2">✓ Valid YouTube URL</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} alt="Video preview" className="w-full h-32 object-cover rounded-lg" />
              </div>
            )}
          </div>

          {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">{error}</div>}

          <div className="flex gap-3">
            <Link href="/admin/dashboard" className="btn-secondary flex-1 text-center">Cancel</Link>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? "Creating..." : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
