
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/mongodb";
import { requireAdmin, isNextResponse } from "@/lib/auth/requireAdmin";

export const dynamic = "force-dynamic";

type CustomCategoryDoc = { name: string };

export async function GET() {
  try {
    const db = await getDb();

    const fromProducts = await db
      .collection("products")
      .distinct("category", { stockQty: { $gt: 0 } });

    // ✅ Fix: type the collection so TS knows "name" exists
    const custom = await db
      .collection<CustomCategoryDoc>("customCategories")
      .find({}, { projection: { name: 1 } })
      .toArray();

    const customNames = custom.map((c) => c.name);

    // make sure categories are strings only + remove empty
    const all = Array.from(
      new Set(
        [...fromProducts, ...customNames]
          .filter((x): x is string => typeof x === "string")
          .map((x) => x.trim())
          .filter(Boolean)
      )
    ).sort();

    return NextResponse.json({ categories: all });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ categories: [] }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  const result = await requireAdmin(req);
  if (isNextResponse(result)) return result;

  try {
    const body = await req.json().catch(() => ({}));
    const name = typeof body?.name === "string" ? body.name.trim() : "";

    if (!name) {
      return NextResponse.json({ error: "Name required" }, { status: 400 });
    }

    const db = await getDb();

    await db
      .collection<CustomCategoryDoc>("customCategories")
      .updateOne({ name }, { $set: { name } }, { upsert: true });

    return NextResponse.json({ message: "Added" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const result = await requireAdmin(req);
  if (isNextResponse(result)) return result;

  try {
    const body = await req.json().catch(() => ({}));
    const name = typeof body?.name === "string" ? body.name.trim() : "";

    if (!name) {
      return NextResponse.json({ error: "Name required" }, { status: 400 });
    }

    const db = await getDb();

    await db
      .collection<CustomCategoryDoc>("customCategories")
      .deleteOne({ name });

    return NextResponse.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}