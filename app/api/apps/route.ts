import { NextRequest, NextResponse } from "next/server";
import { createApp } from "@/lib/server/repository";
import { runPreflight } from "@/lib/server/preflight";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const preflight = runPreflight(payload.appUrl ?? "");
    const app = await createApp({
      title: payload.title,
      hook: payload.hook,
      description: payload.description,
      appUrl: payload.appUrl,
      tags: payload.tags ?? [],
      category: payload.category,
      intentLabel: payload.intentLabel,
      whatItDoes: payload.whatItDoes,
      whoItsFor: payload.whoItsFor,
      resourcesNeeded: payload.resourcesNeeded,
      contactInfo: payload.contactInfo,
      lookingForDevs: Boolean(payload.lookingForDevs),
      lookingForDesigners: Boolean(payload.lookingForDesigners),
      lookingForFunding: Boolean(payload.lookingForFunding),
      previewMode: preflight.fallbackMode === "interactive" ? "sandbox" : "static",
      preflight,
    });
    return NextResponse.json({ data: app }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: { code: "create_failed", message: error instanceof Error ? error.message : "Could not create app" } }, { status: 400 });
  }
}
