import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/mongodb";
import { toObjectId } from "@/lib/db/toObjectId";
import { requireAdmin, isNextResponse } from "@/lib/auth/requireAdmin";
import { updateProductSchema } from "@/lib/validations/product";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const oid = toObjectId(id);
    if (!oid) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    const db = await getDb();
    const product = await db.collection("products").findOne({ _id: oid }, { projection: { gettingPrice: 0, sku: 0 } });
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ product: { ...product, _id: product._id.toString() } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireAdmin(req);
  if (isNextResponse(result)) return result;

  try {
    const { id } = await params;
    const oid = toObjectId(id);
    if (!oid) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const body = await req.json();
    const parsed = updateProductSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

    const db = await getDb();
    const updateResult = await db.collection("products").updateOne({ _id: oid }, { $set: { ...parsed.data, updatedAt: new Date() } });
    if (updateResult.matchedCount === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await db.collection("logs").insertOne({ action: "UPDATE_PRODUCT", adminId: result.admin.adminId, data: { productId: id }, createdAt: new Date() });

    return NextResponse.json({ message: "Product updated" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireAdmin(req);
  if (isNextResponse(result)) return result;

  if (result.admin.role !== "OWNER" && result.admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const oid = toObjectId(id);
    if (!oid) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    const db = await getDb();
    await db.collection("products").deleteOne({ _id: oid });
    await db.collection("logs").insertOne({ action: "DELETE_PRODUCT", adminId: result.admin.adminId, data: { productId: id }, createdAt: new Date() });
    return NextResponse.json({ message: "Product deleted" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
