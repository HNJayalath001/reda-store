import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/mongodb";
import { toObjectId } from "@/lib/db/toObjectId";
import { requireAdmin, isNextResponse } from "@/lib/auth/requireAdmin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireAdmin(req);
  if (isNextResponse(result)) return result;

  try {
    const { id } = await params;
    const oid = toObjectId(id);
    if (!oid) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const db = await getDb();
    const product = await db.collection("products").findOne({ _id: oid });
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ product: { ...product, _id: product._id.toString() } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireAdmin(req);
  if (isNextResponse(result)) return result;

  try {
    const { id } = await params;
    const oid = toObjectId(id);
    if (!oid) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const body = await req.json();
    const allowed = ["stockQty", "sellingPrice", "gettingPrice"];
    const update: Record<string, unknown> = { updatedAt: new Date() };
    for (const key of allowed) {
      if (key in body) update[key] = body[key];
    }

    const db = await getDb();
    await db.collection("products").updateOne({ _id: oid }, { $set: update });

    await db.collection("logs").insertOne({
      action: "PATCH_PRODUCT",
      adminId: result.admin.adminId,
      data: { productId: id, update },
      createdAt: new Date(),
    });

    return NextResponse.json({ message: "Updated" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
