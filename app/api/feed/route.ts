import { NextRequest, NextResponse } from "next/server";
import { listFeedItems } from "@/lib/server/repository";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tag = searchParams.get("tag");
  const intentLabel = searchParams.get("intentLabel");
  const items = (await listFeedItems()).filter((item) => (tag ? item.tags.includes(tag) : true) && (intentLabel ? item.intentLabel === intentLabel : true));
  return NextResponse.json({ data: { items }, meta: { count: items.length } });
}
