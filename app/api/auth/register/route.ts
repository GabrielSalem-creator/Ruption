import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/lib/server/repository";

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as { username?: string; email?: string; password?: string; displayName?: string };
    const user = await registerUser({
      username: payload.username ?? "",
      email: payload.email ?? "",
      password: payload.password ?? "",
      displayName: payload.displayName ?? payload.username ?? "",
    });
    return NextResponse.json({ data: { user } }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: { code: "register_failed", message: error instanceof Error ? error.message : "Registration failed" } }, { status: 400 });
  }
}
