import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ExternalLink, Flag, Info, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AppPreviewShell } from "@/components/player/app-preview-shell";
import { getAppBySlug } from "@/lib/data/feed";

type AppDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function AppDetailPage({ params }: AppDetailPageProps) {
  const { slug } = await params;
  const app = await getAppBySlug(slug);

  if (!app) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.18),transparent_30%),#050816] px-4 py-8 text-white md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Button asChild variant="ghost" className="text-white/78 hover:text-white">
            <Link href="/feed">
              <ChevronLeft className="size-4" />
              Back to feed
            </Link>
          </Button>

          <div className="flex gap-3">
            <Button asChild variant="secondary">
              <a href={app.appUrl} target="_blank" rel="noreferrer">
                Open original
                <ExternalLink className="size-4" />
              </a>
            </Button>
            <Button variant="ghost" className="text-white/80">
              <Flag className="size-4" />
              Report
            </Button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
          <div className="min-h-[72vh]">
            <AppPreviewShell app={app} interactive />
          </div>

          <div className="space-y-6">
            <Card className="space-y-4 p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{app.intentLabel}</Badge>
                    <Badge>{app.category.replace("_", " ")}</Badge>
                    {app.isVerified ? <Badge variant="success">verified</Badge> : null}
                  </div>
                  <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-white">{app.title}</h1>
                    <p className="mt-2 text-base text-white/70">{app.hook}</p>
                  </div>
                </div>
              </div>

              <p className="text-sm leading-7 text-white/72">{app.description}</p>

              <div className="grid grid-cols-2 gap-3">
                <Metric label="Views" value={Intl.NumberFormat().format(app.metrics.viewsCount)} />
                <Metric label="Saves" value={Intl.NumberFormat().format(app.metrics.savesCount)} />
                <Metric
                  label="Avg. session"
                  value={`${app.metrics.avgSessionTimeSeconds.toFixed(1)}s`}
                />
                <Metric label="Bounce rate" value={`${Math.round(app.metrics.bounceRate * 100)}%`} />
              </div>
            </Card>

            <Card className="space-y-4 p-6">
              <div className="flex items-center gap-2 text-sm font-medium text-white">
                <Info className="size-4 text-fuchsia-300" />
                App metadata
              </div>

              <div className="space-y-3 text-sm text-white/72">
                <div>
                  <div className="mb-1 text-[11px] uppercase tracking-[0.22em] text-white/42">Target user</div>
                  <p>{app.targetUser}</p>
                </div>
                <div>
                  <div className="mb-1 text-[11px] uppercase tracking-[0.22em] text-white/42">Problem solved</div>
                  <p>{app.problemStatement}</p>
                </div>
                <div>
                  <div className="mb-1 text-[11px] uppercase tracking-[0.22em] text-white/42">Resources needed</div>
                  <p>{app.resourcesNeeded}</p>
                </div>
                <div>
                  <div className="mb-1 text-[11px] uppercase tracking-[0.22em] text-white/42">Contact</div>
                  <p>{app.contactInfo}</p>
                </div>
              </div>
            </Card>

            <Card className="space-y-4 p-6">
              <div className="flex items-center gap-2 text-sm font-medium text-white">
                <Sparkles className="size-4 text-cyan-300" />
                Recommendation signals
              </div>
              <div className="grid grid-cols-2 gap-3">
                {app.tags.map((tag) => (
                  <div key={tag} className="rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-3 text-sm text-white/74">
                    #{tag}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
      <div className="text-[11px] uppercase tracking-[0.18em] text-white/42">{label}</div>
      <div className="mt-2 text-xl font-semibold text-white">{value}</div>
    </div>
  );
}
