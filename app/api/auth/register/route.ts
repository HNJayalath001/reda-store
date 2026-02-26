import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/mongodb";
import { hashPassword } from "@/lib/auth/password";
import { signToken } from "@/lib/auth/jwt";
import { registerSchema } from "@/lib/validations/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { name, email, password, role, registerCode } = parsed.data;

    if (registerCode !== process.env.ADMIN_REGISTER_CODE) {
      return NextResponse.json({ error: "Invalid register code" }, { status: 403 });
    }

    const db = await getDb();
    const existing = await db.collection("admins").findOne({ email });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const result = await db.collection("admins").insertOne({
      name, email, passwordHash, role, createdAt: new Date(),
    });

    const token = await signToken({ adminId: result.insertedId.toString(), email, role });

    const response = NextResponse.json({ ok: true, message: "Registered successfully" });
    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
