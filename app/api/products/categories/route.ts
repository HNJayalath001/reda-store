import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/mongodb";

export async function GET() {
  try {
    const db = await getDb();
    // Get distinct categories only from products that have stock
    const categories = await db.collection("products").distinct("category", { stockQty: { $gt: 0 } });
    // Sort alphabetically
    categories.sort();
    return NextResponse.json({ categories });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ categories: [] });
  }
}
