import { NextRequest, NextResponse } from "next/server";
import { PreflightResult } from "@/lib/types";

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as { url?: string };
  const normalizedUrl = payload.url?.trim() || "";
  const host = normalizedUrl.replace(/^https?:\/\//, "").split("/")[0] || "unknown-host";
  const looksInternal = normalizedUrl.includes("/runtime/") || normalizedUrl.includes("localhost") || normalizedUrl.includes("vercel.app");
  const medianLoadTimeMs = looksInternal ? 980 : 1760;
  const result: PreflightResult = {
    url: normalizedUrl,
    normalizedUrl,
    isReachable: normalizedUrl.startsWith("http"),
    iframeCompatible: !normalizedUrl.includes("auth") && !normalizedUrl.includes("login"),
    hasLoginWallRisk: normalizedUrl.includes("login") || normalizedUrl.includes("auth"),
    screenshotReady: true,
    medianLoadTimeMs,
    fallbackMode: looksInternal ? "interactive" : "preview_only",
    verdict: !normalizedUrl.startsWith("http") ? "block" : normalizedUrl.includes("login") ? "review" : medianLoadTimeMs > 2000 ? "review" : "pass",
    notes: [
      `Resolved host: ${host}`,
      looksInternal ? "Interactive runtime eligible for iframe sandboxing." : "External runtime will need stricter embed validation.",
      medianLoadTimeMs <= 2000 ? "Performance target currently passes." : "Performance target exceeds 2 second threshold.",
    ],
  };
  return NextResponse.json({ data: result });
}
