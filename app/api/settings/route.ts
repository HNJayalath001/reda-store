import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/mongodb";
import { requireAdmin, isNextResponse } from "@/lib/auth/requireAdmin";
import { settingsSchema } from "@/lib/validations/settings";
import { defaultSettings } from "@/lib/models/settings";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getDb();
    const settings = await db.collection("settings").findOne({});
    return NextResponse.json({ settings: settings || defaultSettings });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const result = await requireAdmin(req);
  if (isNextResponse(result)) return result;

  try {
    const body = await req.json();
    const parsed = settingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const db = await getDb();
    await db.collection("settings").updateOne({}, { $set: parsed.data }, { upsert: true });

    return NextResponse.json({ message: "Settings saved" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
