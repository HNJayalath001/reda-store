import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/mongodb";
import { requireAdmin, isNextResponse } from "@/lib/auth/requireAdmin";
import { toObjectId } from "@/lib/db/toObjectId";
import { z } from "zod";

export const dynamic = "force-dynamic";

const feedbackSchema = z.object({
  name: z.string().min(1, "Name is required").max(80),
  message: z.string().min(5, "Message too short").max(1000),
  rating: z.number().int().min(1).max(5),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = feedbackSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    const db = await getDb();
    await db.collection("feedback").insertOne({ ...parsed.data, status: "pending", createdAt: new Date() });
    return NextResponse.json({ message: "Thank you for your feedback!" }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const adminView = searchParams.get("admin") === "true";

    if (adminView) {
      const result = await requireAdmin(req);
      if (isNextResponse(result)) return result;
      const db = await getDb();
      const all = await db.collection("feedback").find({}).sort({ createdAt: -1 }).limit(100).toArray();
      return NextResponse.json({ feedback: all.map((f) => ({ ...f, _id: f._id.toString() })) });
    }

    const db = await getDb();
    const approved = await db.collection("feedback").find({ status: "approved" }).sort({ createdAt: -1 }).limit(20).toArray();
    return NextResponse.json({ feedback: approved.map((f) => ({ ...f, _id: f._id.toString() })) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const result = await requireAdmin(req);
  if (isNextResponse(result)) return result;

  try {
    const body = await req.json();
    const { id, status } = body;
    if (!id || !["approved", "rejected", "pending"].includes(status)) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    const oid = toObjectId(id);
    if (!oid) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    const db = await getDb();
    await db.collection("feedback").updateOne({ _id: oid }, { $set: { status } });
    return NextResponse.json({ message: "Updated" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
