import { NextResponse } from "next/server";
import { getAppBySlug } from "@/lib/server/repository";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const app = await getAppBySlug(slug);
  if (!app) return NextResponse.json({ error: { code: "not_found", message: "App not found" } }, { status: 404 });
  return NextResponse.json({ data: app });
}
