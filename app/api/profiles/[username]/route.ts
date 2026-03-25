import { NextResponse } from "next/server";
import { getAppsByProfile, getProfileByUsername } from "@/lib/mock-data";

export async function GET(_: Request, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const profile = getProfileByUsername(username);
  if (!profile) return NextResponse.json({ error: { code: "not_found", message: "Profile not found" } }, { status: 404 });
  return NextResponse.json({ data: { profile, apps: getAppsByProfile(username) } });
}
