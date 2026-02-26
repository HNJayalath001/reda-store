import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, isNextResponse } from "@/lib/auth/requireAdmin";
import { getDb } from "@/lib/db/mongodb";
import { toObjectId } from "@/lib/db/toObjectId";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const result = await requireAdmin(req);
  if (isNextResponse(result)) return result;

  // ✅ Fix: ensure ObjectId is NOT null
  const adminObjectId = toObjectId(result.admin.adminId);
  if (!adminObjectId) {
    return NextResponse.json({ error: "Invalid token admin id" }, { status: 401 });
  }

  const db = await getDb();
  const admin = await db.collection("admins").findOne(
    { _id: adminObjectId },
    { projection: { passwordHash: 0 } }
  );

  if (!admin) {
    return NextResponse.json({ error: "Admin not found" }, { status: 404 });
  }

  return NextResponse.json({
    admin: {
      id: admin._id.toString(),
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
  });
}