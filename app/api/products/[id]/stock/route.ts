import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/mongodb";
import { toObjectId } from "@/lib/db/toObjectId";
import { requireAdmin, isNextResponse } from "@/lib/auth/requireAdmin";

export const dynamic = "force-dynamic";

// PATCH /api/products/[id]/stock — toggle out-of-stock OR restock
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireAdmin(req);
  if (isNextResponse(result)) return result;

  try {
    const { id } = await params;
    const oid = toObjectId(id);
    if (!oid) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const body = await req.json();
    const db = await getDb();

    const update: Record<string, unknown> = { updatedAt: new Date() };

    if (typeof body.isOutOfStock === "boolean") {
      update.isOutOfStock = body.isOutOfStock;
    }
    if (typeof body.stockQty === "number") {
      update.stockQty = body.stockQty;
      update.isOutOfStock = false; // restocking clears the manual out-of-stock flag
    }

    const updateResult = await db.collection("products").updateOne(
      { _id: oid },
      { $set: update }
    );
    if (updateResult.matchedCount === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ message: "Stock updated" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
