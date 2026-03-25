import { NextRequest, NextResponse } from "next/server";
import { loginUser } from "@/lib/server/repository";

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as { email?: string; password?: string };
  const user = await loginUser(payload.email ?? "", payload.password ?? "");
  if (!user) {
    return NextResponse.json({ error: { code: "invalid_credentials", message: "Invalid email or password" } }, { status: 401 });
  }
  return NextResponse.json({ data: { user } });
}
