import { verifyToken, JWTPayload } from "./jwt";
import { NextRequest, NextResponse } from "next/server";

export async function requireAdmin(req: NextRequest): Promise<{ admin: JWTPayload } | NextResponse> {
  const token = req.cookies.get("admin_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  return { admin: payload };
}

export function isNextResponse(val: unknown): val is NextResponse {
  return val instanceof NextResponse;
}
