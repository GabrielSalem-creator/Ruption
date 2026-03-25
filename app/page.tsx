import Link from "next/link";
import { ArrowRight, Bot, Layers3, Sparkles, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";

const pillars = [
  {
    title: "Live execution first",
    description:
      "Rupture is not a video app. The embedded product is the content, and stabilized mode is the core interaction state.",
    icon: Zap,
  },
  {
    title: "Quality-gated discovery",
    description:
      "Only fast, usable AI agents and AI micro-tools should enter the feed. Slow, gated, or broken apps are filtered hard.",
    icon: Layers3,
  },
  {
    title: "Creator-native distribution",
    description:
      "Profiles, remix lineage, collaboration hooks, and analytics turn discovery into a real growth channel for builders.",
    icon: Sparkles,
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(110,168,255,0.20),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(113,44,249,0.18),transparent_25%),#050816] text-white">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 md:px-8">
        <header className="flex items-center justify-between border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
              <Bot className="h-5 w-5 text-cyan-200" />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight">Rupture</p>
              <p className="text-sm text-white/55">AI agents in motion</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button asChild variant="ghost">
              <Link href="/create">Create post</Link>
            </Button>
            <Button asChild>
              <Link href="/feed">
                Open feed
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </header>

        <section className="grid flex-1 items-center gap-14 py-14 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100">
              <span className="h-2 w-2 rounded-full bg-cyan-300" />
              Discovery engine for interactive apps
            </div>

            <div className="space-y-5">
              <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.06em] text-white md:text-7xl">
                Scroll live AI products. Tap to stabilize. Use them instantly.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-white/65 md:text-xl">
                Rupture turns app discovery into a full-screen, high-signal feed where
                the app itself is the content. No login walls. No dead embeds. No
                static content unless it is the fallback.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href="/feed">Enter the feed</Link>
              </Button>
              <Button asChild size="lg" variant="ghost">
                <Link href="/create">Publish an app</Link>
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {pillars.map((pillar) => {
                const Icon = pillar.icon;

                return (
                  <div
                    key={pillar.title}
                    className="rounded-3xl border border-white/10 bg-white/6 p-5 backdrop-blur"
                  >
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                      <Icon className="h-5 w-5 text-cyan-200" />
                    </div>
                    <p className="mb-2 text-base font-medium text-white">{pillar.title}</p>
                    <p className="text-sm leading-6 text-white/60">{pillar.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -left-6 top-10 h-24 w-24 rounded-full bg-cyan-300/20 blur-3xl" />
            <div className="absolute -right-8 bottom-8 h-24 w-24 rounded-full bg-violet-400/20 blur-3xl" />

            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/7 shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-xl">
              <div className="border-b border-white/10 px-5 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">For You</p>
                    <p className="text-xs text-white/45">AI agents & micro-tools</p>
                  </div>
                  <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
                    live feed
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-5">
                {[1, 2].map((index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0b1021]"
                  >
                    <div className="aspect-[9/16] bg-[linear-gradient(180deg,rgba(94,234,212,0.18),rgba(6,8,22,0.9)),linear-gradient(135deg,#12182f,#090d1e)] p-4">
                      <div className="h-full rounded-[1.25rem] border border-white/10 bg-black/35 p-4">
                        <div className="mb-3 flex items-center justify-between text-xs text-white/55">
                          <span>Interactive preview</span>
                          <span>tap to stabilize</span>
                        </div>
                        <div className="grid gap-3">
                          <div className="h-16 rounded-2xl bg-white/8" />
                          <div className="grid grid-cols-2 gap-3">
                            <div className="h-20 rounded-2xl bg-white/10" />
                            <div className="h-20 rounded-2xl bg-cyan-300/12" />
                          </div>
                          <div className="h-32 rounded-3xl bg-white/6" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium text-white">
                            {index === 1 ? "Meeting Agent" : "Prompt Refiner"}
                          </p>
                          <p className="text-xs text-white/55">
                            {index === 1 ? "@auralabs" : "@promptpilot"}
                          </p>
                        </div>
                        <div className="text-right text-xs text-white/45">
                          <p>2.1k saves</p>
                          <p>31s avg session</p>
                        </div>
                      </div>
                      <div className="flex gap-2 text-[11px] text-white/55">
                        <span className="rounded-full border border-white/10 px-2 py-1">
                          {index === 1 ? "agent" : "tool"}
                        </span>
                        <span className="rounded-full border border-white/10 px-2 py-1">
                          ai_tool
                        </span>
                        <span className="rounded-full border border-white/10 px-2 py-1">
                          lightning-fast
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
