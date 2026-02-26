import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/mongodb";
import { requireAdmin, isNextResponse } from "@/lib/auth/requireAdmin";
import { toObjectId } from "@/lib/db/toObjectId";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.string().min(1).max(80),
  phone: z.string().min(1).max(30),
  itemName: z.string().min(2).max(200),
  details: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    const db = await getDb();
    await db.collection("stockRequests").insertOne({ ...parsed.data, status: "pending", createdAt: new Date() });
    return NextResponse.json({ message: "Request submitted!" }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const isPublic = searchParams.get("public") === "true";

  if (!isPublic) {
    const result = await requireAdmin(req);
    if (isNextResponse(result)) return result;
  }

  try {
    const db = await getDb();
    const query = isPublic ? { status: "pending" } : {};
    const requests = await db.collection("stockRequests").find(query).sort({ createdAt: -1 }).limit(isPublic ? 6 : 200).toArray();
    return NextResponse.json({ requests: requests.map(r => ({ ...r, _id: r._id.toString() })) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const result = await requireAdmin(req);
  if (isNextResponse(result)) return result;
  try {
    const { id, status } = await req.json();
    if (!id || !["pending","fulfilled","rejected"].includes(status)) return NextResponse.json({ error: "Invalid" }, { status: 400 });
    const oid = toObjectId(id);
    if (!oid) return NextResponse.json({ error: "Bad ID" }, { status: 400 });
    const db = await getDb();
    await db.collection("stockRequests").updateOne({ _id: oid }, { $set: { status, updatedAt: new Date() } });
    return NextResponse.json({ message: "Updated" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
