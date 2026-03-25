export async function GET() {
  return Response.json({
    ok: true,
    service: "rupture-web",
    timestamp: new Date().toISOString(),
  });
}
