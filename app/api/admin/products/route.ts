import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/mongodb";
import { requireAdmin, isNextResponse } from "@/lib/auth/requireAdmin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const result = await requireAdmin(req);
  if (isNextResponse(result)) return result;

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const outOfStock = searchParams.get("outOfStock") === "true";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    const db = await getDb();
    const query: Record<string, unknown> = {};

    if (outOfStock) query.stockQty = { $lte: 0 };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
      ];
    }
    if (category) query.category = category;

    const total = await db.collection("products").countDocuments(query);
    const products = await db.collection("products").find(query).skip(skip).limit(limit).sort({ createdAt: -1 }).toArray();
    const mapped = products.map((p) => ({ ...p, _id: p._id.toString() }));
    return NextResponse.json({ products: mapped, total, page, limit });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
