import { NextRequest, NextResponse } from "next/server";
import { rankApps } from "@/lib/recommendation";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tag = searchParams.get("tag");
  const intentLabel = searchParams.get("intentLabel");
  const items = rankApps().filter((item) => (tag ? item.tags.includes(tag) : true) && (intentLabel ? item.intentLabel === intentLabel : true));
  return NextResponse.json({ data: { items }, meta: { count: items.length } });
}
