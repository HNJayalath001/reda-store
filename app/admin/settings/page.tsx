"use client";


import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

interface Settings {
  siteName: string;
  whatsappNumber: string;
  bannerImages: string[];
  sliderImages: string[];
  address: string;
  email: string;
  footerText: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    siteName: "Reda Store",
    whatsappNumber: "+94721126526",
    bannerImages: [],
    sliderImages: [],
    address: "",
    email: "",
    footerText: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => { if (d.settings) setSettings(d.settings); setLoading(false); });
  }, []);

  const uploadImages = async (files: File[]): Promise<string[]> => {
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    const res = await fetch("/api/images/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload failed");
    return data.fileIds;
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const ids = await uploadImages([files[0]]);
    setSettings((prev) => ({ ...prev, bannerImages: [...ids] }));
  };

  const handleSliderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const ids = await uploadImages(files.slice(0, 5));
    setSettings((prev) => ({ ...prev, sliderImages: [...prev.sliderImages, ...ids].slice(0, 5) }));
  };

  const removeBanner = () => setSettings((prev) => ({ ...prev, bannerImages: [] }));
  const removeSlide = (id: string) => setSettings((prev) => ({ ...prev, sliderImages: prev.sliderImages.filter((s) => s !== id) }));

  const handleSave = async () => {
    setError("");
    setSaving(true);
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error); return; }
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  if (loading) {
    return <AdminLayout><div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

        <div className="space-y-6">
          {/* Site Info */}
          <div className="card space-y-4">
            <h2 className="font-semibold text-gray-900">Site Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
              <input type="text" value={settings.siteName} onChange={(e) => setSettings({ ...settings, siteName: e.target.value })} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
              <input type="text" value={settings.whatsappNumber} onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })} className="input" placeholder="+94721126526" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input type="text" value={settings.address} onChange={(e) => setSettings({ ...settings, address: e.target.value })} className="input" placeholder="Colombo, Sri Lanka" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={settings.email} onChange={(e) => setSettings({ ...settings, email: e.target.value })} className="input" placeholder="info@redastore.lk" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Footer Text</label>
              <input type="text" value={settings.footerText} onChange={(e) => setSettings({ ...settings, footerText: e.target.value })} className="input" placeholder="© 2026 Reda Store..." />
            </div>
          </div>

          {/* Banner */}
          <div className="card space-y-4">
            <h2 className="font-semibold text-gray-900">Homepage Banner</h2>
            <p className="text-xs text-gray-500">One banner image displayed at the top of the storefront</p>
            {settings.bannerImages.length > 0 ? (
              <div className="relative">
                <img src={`/api/images/${settings.bannerImages[0]}`} alt="Banner" className="w-full h-40 object-cover rounded-xl" />
                <button onClick={removeBanner} className="absolute top-2 right-2 bg-red-500 text-white text-xs px-3 py-1 rounded-lg">Remove</button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 cursor-pointer text-gray-400 hover:text-blue-500 transition-colors">
                <span className="text-3xl">🖼️</span>
                <span className="text-sm mt-2">Click to upload banner</span>
                <input type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />
              </label>
            )}
          </div>

          {/* Slider */}
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Image Slider</h2>
              <span className="text-xs text-gray-400">{settings.sliderImages.length}/5 images</span>
            </div>
            <p className="text-xs text-gray-500">Auto-rotating slideshow displayed below the banner</p>
            <div className="flex flex-wrap gap-3">
              {settings.sliderImages.map((id) => (
                <div key={id} className="relative">
                  <img src={`/api/images/${id}`} alt="" className="w-24 h-16 object-cover rounded-lg border border-gray-200" />
                  <button onClick={() => removeSlide(id)} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">×</button>
                </div>
              ))}
              {settings.sliderImages.length < 5 && (
                <label className="w-24 h-16 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 flex items-center justify-center cursor-pointer text-gray-400 hover:text-blue-500 text-2xl transition-colors">
                  +
                  <input type="file" accept="image/*" multiple onChange={handleSliderUpload} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">{error}</div>}
          {success && <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm">✅ Settings saved successfully!</div>}

          <button onClick={handleSave} disabled={saving} className="btn-primary w-full py-3">
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
