import { SignJWT, jwtVerify } from "jose";

export interface JWTPayload {
  adminId: string;
  email: string;
  role: string;
}

function getSecret(): Uint8Array {
  const s = process.env.JWT_SECRET || "fallback_secret_change_in_production";
  return new TextEncoder().encode(s);
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      adminId: payload.adminId as string,
      email: payload.email as string,
      role: payload.role as string,
    };
  } catch {
    return null;
  }
}
