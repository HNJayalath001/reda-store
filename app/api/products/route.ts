import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/mongodb";
import { requireAdmin, isNextResponse } from "@/lib/auth/requireAdmin";
import { productSchema } from "@/lib/validations/product";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "25");
    const skip = (page - 1) * limit;
    const includeOutOfStock = searchParams.get("includeOutOfStock") === "true";

    const db = await getDb();
    const query: Record<string, unknown> = {};

    if (!includeOutOfStock) {
      // Show products with stockQty > 0 AND not manually marked out of stock
      query.$and = [
        { stockQty: { $gt: 0 } },
        { isOutOfStock: { $ne: true } },
      ];
    }

    if (search) {
      const searchQuery = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { brand: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ]
      };
      if (query.$and) {
        (query.$and as unknown[]).push(searchQuery);
      } else {
        Object.assign(query, searchQuery);
      }
    }

    if (category) query.category = category;

    const total = await db.collection("products").countDocuments(query);
    const products = await db.collection("products")
      .find(query, { projection: { gettingPrice: 0, sku: 0 } })
      .skip(skip).limit(limit).sort({ createdAt: -1 }).toArray();

    return NextResponse.json({
      products: products.map((p) => ({ ...p, _id: p._id.toString() })),
      total, page, limit
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const result = await requireAdmin(req);
  if (isNextResponse(result)) return result;

  try {
    const body = await req.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

    const db = await getDb();
    const existing = await db.collection("products").findOne({ sku: parsed.data.sku });
    if (existing) return NextResponse.json({ error: "SKU already exists" }, { status: 409 });

    const now = new Date();
    const insertResult = await db.collection("products").insertOne({ ...parsed.data, createdAt: now, updatedAt: now });

    await db.collection("logs").insertOne({
      action: "CREATE_PRODUCT", adminId: result.admin.adminId,
      data: { productId: insertResult.insertedId.toString(), name: parsed.data.name }, createdAt: now,
    });

    return NextResponse.json({ message: "Product created", id: insertResult.insertedId.toString() }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
