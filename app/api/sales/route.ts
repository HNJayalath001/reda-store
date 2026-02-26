import { NextRequest, NextResponse } from "next/server";
import { Db } from "mongodb";

import { getDb } from "@/lib/db/mongodb";
import { requireAdmin, isNextResponse } from "@/lib/auth/requireAdmin";
import { saleSchema } from "@/lib/validations/sale";
import { toObjectId } from "@/lib/db/toObjectId";

export const dynamic = "force-dynamic";

async function generateBillNo(db: Db): Promise<string> {
  const count = await db.collection("sales").countDocuments();
  const pad = String(count + 1).padStart(5, "0");
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `REDA-${date}-${pad}`;
}

export async function GET(req: NextRequest) {
  const result = await requireAdmin(req);
  if (isNextResponse(result)) return result;

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    const db = await getDb();
    const sales = await db
      .collection("sales")
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await db.collection("sales").countDocuments();

    return NextResponse.json({
      sales: sales.map((s) => ({ ...s, _id: s._id.toString() })),
      total,
      page,
      limit,
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
    const parsed = saleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Invalid data" },
        { status: 400 }
      );
    }

    const { items, discount, discountType, paymentMethod } = parsed.data;
    const db = await getDb();

    // ✅ Pre-validate and store ObjectIds once
    const validatedItems = items.map((item) => ({
      item,
      oid: toObjectId(item.productId),
    }));

    // ✅ Validate stock BEFORE creating sale
    for (const v of validatedItems) {
      if (!v.oid) {
        return NextResponse.json(
          { error: `Invalid product ID: ${v.item.productId}` },
          { status: 400 }
        );
      }

      const product = await db.collection("products").findOne({ _id: v.oid });
      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${v.item.productId}` },
          { status: 404 }
        );
      }

      if ((product as any).stockQty < v.item.qty) {
        return NextResponse.json(
          { error: `Insufficient stock for: ${(product as any).name}` },
          { status: 400 }
        );
      }
    }

    const subtotal = items.reduce((s, i) => s + i.subtotal, 0);

    const discountAmount =
      discountType === "percent"
        ? Math.round((subtotal * discount) / 100)
        : discount;

    const total = Math.max(0, subtotal - discountAmount);
    const totalCost = items.reduce((s, i) => s + i.gettingPrice * i.qty, 0);
    const profit = total - totalCost;

    const billNo = await generateBillNo(db);
    const now = new Date();

    const insertResult = await db.collection("sales").insertOne({
      billNo,
      items,
      subtotal,
      discount,
      discountType,
      discountAmount,
      total,
      totalCost,
      profit,
      paymentMethod,
      type: "SALE",
      createdBy: result.admin.adminId,
      createdAt: now,
    });

    // ✅ Deduct stock (oid is guaranteed not null because we checked)
    for (const v of validatedItems) {
      await db.collection("products").updateOne(
        { _id: v.oid! },
        { $inc: { stockQty: -v.item.qty }, $set: { updatedAt: now } }
      );
    }

    await db.collection("logs").insertOne({
      action: "CREATE_SALE",
      adminId: result.admin.adminId,
      data: {
        saleId: insertResult.insertedId.toString(),
        billNo,
        total,
      },
      createdAt: now,
    });

    return NextResponse.json(
      {
        message: "Sale created",
        saleId: insertResult.insertedId.toString(),
        billNo,
        total,
        profit,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}