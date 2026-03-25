import { FeedList } from "@/components/feed/feed-list";
import { getFeedApps } from "@/lib/data/feed";

export default async function FeedPage() {
  const apps = await getFeedApps();

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">
              Rupture Feed
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
              Scroll live AI tools, not static content.
            </h1>
          </div>
          <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-medium text-emerald-200">
            v1 niche: AI agents and AI micro-tools
          </div>
        </div>

        <div className="grid gap-3 text-sm text-zinc-300 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-zinc-500">Feed target</p>
            <p className="mt-1 font-medium text-white">Sub-1s first useful render</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-zinc-500">App target</p>
            <p className="mt-1 font-medium text-white">Under 2s stabilized load</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-zinc-500">Quality rule</p>
            <p className="mt-1 font-medium text-white">No login walls, no broken embeds</p>
          </div>
        </div>
      </header>

      <FeedList apps={apps} />
    </main>
  );
}
