import bcrypt from "bcryptjs";
import { JWTPayload, SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { appConfig } from "@/lib/env";

const secret = new TextEncoder().encode(appConfig.authSecret);

export interface SessionUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
}

type SessionPayload = JWTPayload & SessionUser;

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(user: SessionUser) {
  const payload: SessionPayload = {
    id: user.id,
    username: user.username,
    email: user.email,
    displayName: user.displayName,
  };

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifySessionToken(token: string) {
  const verified = await jwtVerify(token, secret);
  const payload = verified.payload as SessionPayload;
  return {
    id: payload.id,
    username: payload.username,
    email: payload.email,
    displayName: payload.displayName,
  } satisfies SessionUser;
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(appConfig.authCookieName)?.value;
  if (!token) return null;
  try {
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}
