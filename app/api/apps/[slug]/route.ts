import { NextResponse } from "next/server";
import { getAppBySlug } from "@/lib/mock-data";
import { rankApps } from "@/lib/recommendation";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const app = rankApps().find((item) => item.slug === slug) ?? getAppBySlug(slug);
  if (!app) return NextResponse.json({ error: { code: "not_found", message: "App not found" } }, { status: 404 });
  return NextResponse.json({ data: app });
}
