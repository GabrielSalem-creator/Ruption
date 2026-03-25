import { NextRequest, NextResponse } from "next/server";
import { runPreflight } from "@/lib/server/preflight";

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as { url?: string };
  return NextResponse.json({ data: runPreflight(payload.url ?? "") });
}
