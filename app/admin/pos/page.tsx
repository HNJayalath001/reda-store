"use client";


import { useEffect, useState, useRef } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

interface Product {
  _id: string; name: string; brand: string; sku: string;
  sellingPrice: number; gettingPrice: number; stockQty: number; imageFileIds: string[];
}

interface CartItem {
  productId: string; productName: string; sku: string;
  qty: number; unitPrice: number; gettingPrice: number; subtotal: number;
}

interface Bill {
  billNo: string; total: number; profit: number; saleId: string;
}

function formatRs(n: number) { return `Rs. ${n.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`; }

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<"flat" | "percent">("flat");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "online">("cash");
  const [loading, setLoading] = useState(false);
  const [bill, setBill] = useState<Bill | null>(null);
  const [error, setError] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (search.length < 1) { setProducts([]); return; }
    const timeout = setTimeout(async () => {
      const res = await fetch(`/api/admin/products?search=${encodeURIComponent(search)}&limit=8`);
      const data = await res.json();
      setProducts(data.products || []);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product._id);
      if (existing) {
        if (existing.qty >= product.stockQty) return prev;
        return prev.map((i) =>
          i.productId === product._id
            ? { ...i, qty: i.qty + 1, subtotal: (i.qty + 1) * i.unitPrice }
            : i
        );
      }
      return [...prev, {
        productId: product._id,
        productName: product.name,
        sku: product.sku,
        qty: 1,
        unitPrice: product.sellingPrice,
        gettingPrice: product.gettingPrice,
        subtotal: product.sellingPrice,
      }];
    });
    setSearch("");
    setProducts([]);
    searchRef.current?.focus();
  };

  const updateQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((i) => i.productId !== productId));
    } else {
      setCart((prev) => prev.map((i) =>
        i.productId === productId ? { ...i, qty, subtotal: qty * i.unitPrice } : i
      ));
    }
  };

  const subtotal = cart.reduce((s, i) => s + i.subtotal, 0);
  const discountAmount = discountType === "percent"
    ? Math.round((subtotal * discount) / 100)
    : discount;
  const total = Math.max(0, subtotal - discountAmount);

  const handleSell = async () => {
    if (cart.length === 0) { setError("Cart is empty"); return; }
    setError("");
    setLoading(true);

    const res = await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: cart, discount, discountType, paymentMethod }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Sale failed");
      return;
    }

    setBill({ billNo: data.billNo, total: data.total, profit: data.profit, saleId: data.saleId });
    setCart([]);
    setDiscount(0);
  };

  const printBill = () => window.print();

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">POS – Point of Sale</h1>
        <p className="text-gray-500 text-sm mb-6">Search product → Add to cart → Sell</p>

        {bill && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-8 text-center shadow-2xl">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">✅</div>
              <h2 className="text-xl font-bold text-gray-900">Sale Complete!</h2>
              <p className="text-gray-500 text-sm mt-1">Bill No: <strong className="text-gray-900">{bill.billNo}</strong></p>
              <div className="mt-4 bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Total Collected</span><span className="font-bold text-green-600">{formatRs(bill.total)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Profit</span><span className="font-bold text-blue-600">{formatRs(bill.profit)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Payment</span><span className="capitalize">{paymentMethod}</span></div>
              </div>
              <div className="mt-6 flex gap-3">
                <button onClick={printBill} className="btn-secondary flex-1 text-sm">🖨️ Print</button>
                <button onClick={() => setBill(null)} className="btn-primary flex-1 text-sm">New Sale</button>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left: Search + Cart */}
          <div className="lg:col-span-3 space-y-4">
            {/* Search */}
            <div className="card">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Product</label>
              <div className="relative">
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input pr-10"
                  placeholder="Type product name, brand, or SKU..."
                  autoFocus
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              </div>
              {products.length > 0 && (
                <div className="mt-2 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  {products.map((p) => (
                    <button
                      key={p._id}
                      onClick={() => addToCart(p)}
                      disabled={p.stockQty <= 0}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-0 text-left disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {p.imageFileIds.length > 0 ? (
                        <img src={`/api/images/${p.imageFileIds[0]}`} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">📦</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.brand} · SKU: {p.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-blue-600">{formatRs(p.sellingPrice)}</p>
                        <p className={`text-xs ${p.stockQty <= 0 ? "text-red-500" : "text-green-600"}`}>
                          {p.stockQty <= 0 ? "Out of stock" : `${p.stockQty} pcs`}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Cart */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Cart ({cart.length} items)</h2>
                {cart.length > 0 && (
                  <button onClick={() => setCart([])} className="text-xs text-red-500 hover:text-red-700">Clear all</button>
                )}
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-4xl mb-2">🛒</p>
                  <p className="text-sm">Cart is empty. Search and add products above.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div key={item.productId} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
                        <p className="text-xs text-gray-400">{formatRs(item.unitPrice)} × {item.qty}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQty(item.productId, item.qty - 1)} className="w-7 h-7 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 flex items-center justify-center font-bold">−</button>
                        <span className="w-8 text-center text-sm font-semibold">{item.qty}</span>
                        <button onClick={() => updateQty(item.productId, item.qty + 1)} className="w-7 h-7 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 flex items-center justify-center font-bold">+</button>
                      </div>
                      <p className="w-24 text-right font-bold text-sm text-gray-900">{formatRs(item.subtotal)}</p>
                      <button onClick={() => updateQty(item.productId, 0)} className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Bill Summary */}
          <div className="lg:col-span-2">
            <div className="card sticky top-6 space-y-4">
              <h2 className="font-bold text-gray-900 text-lg">Bill Summary</h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">{formatRs(subtotal)}</span>
                </div>

                {/* Discount */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Discount</label>
                  <div className="flex gap-2">
                    <div className="flex border border-gray-200 rounded-lg overflow-hidden text-xs">
                      <button
                        onClick={() => setDiscountType("flat")}
                        className={`px-3 py-1.5 font-medium ${discountType === "flat" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
                      >Rs.</button>
                      <button
                        onClick={() => setDiscountType("percent")}
                        className={`px-3 py-1.5 font-medium ${discountType === "percent" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
                      >%</button>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={discount || ""}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      className="input flex-1 text-sm"
                      placeholder="0"
                    />
                  </div>
                  {discountAmount > 0 && (
                    <p className="text-xs text-green-600 mt-1">− {formatRs(discountAmount)} discount applied</p>
                  )}
                </div>

                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Discount</span>
                  <span className="text-red-500">− {formatRs(discountAmount)}</span>
                </div>

                <div className="flex justify-between py-3 bg-blue-50 rounded-xl px-3 -mx-3">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-blue-600 text-lg">{formatRs(total)}</span>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["cash", "card", "online"] as const).map((method) => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2 rounded-lg text-xs font-medium capitalize transition-colors border ${
                        paymentMethod === method
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      {method === "cash" ? "💵 " : method === "card" ? "💳 " : "📱 "}{method}
                    </button>
                  ))}
                </div>
              </div>

              {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-xs">{error}</div>}

              <button
                onClick={handleSell}
                disabled={loading || cart.length === 0}
                className="btn-primary w-full py-3 text-base"
              >
                {loading ? "Processing..." : `✓ Sell – ${formatRs(total)}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
