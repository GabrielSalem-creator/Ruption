import { NextResponse } from "next/server";
import { getSession } from "@/lib/server/repository";

export async function GET() {
  return NextResponse.json({ data: { user: await getSession() } });
}
