"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Check, Globe, Sparkles, Wand2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const intentOptions = ["Tool", "Agent", "Utility", "Experiment"];
const categoryOptions = [
  "Writing",
  "Research",
  "Automation",
  "Productivity",
  "Education",
  "Coding Assist",
];

export function CreatePostForm() {
  const [url, setUrl] = useState("https://example-ai-tool.com");
  const [title, setTitle] = useState("Prompt Refiner");
  const [description, setDescription] = useState(
    "Refines messy prompts into structured prompts with constraints, output formats, and examples.",
  );
  const [hook, setHook] = useState("Turn vague prompts into usable AI instructions.");
  const [resourcesNeeded, setResourcesNeeded] = useState(
    "Looking for distribution partners and UX feedback.",
  );
  const [contactInfo, setContactInfo] = useState("contact@promptrefiner.ai");
  const [selectedIntent, setSelectedIntent] = useState("Tool");
  const [selectedCategory, setSelectedCategory] = useState("Writing");
  const [tags, setTags] = useState(["prompting", "llm", "writing"]);

  const previewDomain = useMemo(() => {
    try {
      return new URL(url).hostname;
    } catch {
      return "Invalid URL";
    }
  }, [url]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-6">
        <Card className="p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl border border-white/12 bg-white/6 p-3 text-white">
              <Globe className="size-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Step 1 — Paste app URL</p>
              <p className="text-sm text-white/60">
                Start with the live app. Rupture validates embeddability and fetches metadata.
              </p>
            </div>
          </div>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-white/80">App URL</span>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full rounded-2xl border border-white/12 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-400"
            />
          </label>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Badge variant="outline">HTTPS required</Badge>
            <Badge variant="outline">No login wall</Badge>
            <Badge variant="outline">Load target under 2s</Badge>
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl border border-white/12 bg-white/6 p-3 text-white">
              <Sparkles className="size-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Step 2 — Describe the app clearly</p>
              <p className="text-sm text-white/60">
                The hook, description, audience, and support needs shape ranking and creator conversion.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-white/80">Title</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-2xl border border-white/12 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-400"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-white/80">One-line hook</span>
              <input
                value={hook}
                onChange={(e) => setHook(e.target.value)}
                className="w-full rounded-2xl border border-white/12 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-400"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-white/80">Description</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-32 w-full rounded-2xl border border-white/12 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-400"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <span className="text-sm font-medium text-white/80">Intent label</span>
                <div className="flex flex-wrap gap-2">
                  {intentOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setSelectedIntent(option)}
                      className={`rounded-full px-4 py-2 text-sm transition ${
                        selectedIntent === option
                          ? "bg-white text-black"
                          : "border border-white/12 bg-white/5 text-white/70 hover:bg-white/10"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium text-white/80">Category</span>
                <div className="flex flex-wrap gap-2">
                  {categoryOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setSelectedCategory(option)}
                      className={`rounded-full px-4 py-2 text-sm transition ${
                        selectedCategory === option
                          ? "bg-violet-500 text-white"
                          : "border border-white/12 bg-white/5 text-white/70 hover:bg-white/10"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl border border-white/12 bg-white/6 p-3 text-white">
              <Wand2 className="size-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Step 3 — Add support and collaboration hooks</p>
              <p className="text-sm text-white/60">
                Give users a reason to contact you and signal how they can help.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-white/80">Resources needed</span>
              <textarea
                value={resourcesNeeded}
                onChange={(e) => setResourcesNeeded(e.target.value)}
                className="min-h-24 w-full rounded-2xl border border-white/12 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-400"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-white/80">Contact info</span>
              <input
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                className="w-full rounded-2xl border border-white/12 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-400"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag}>#{tag}</Badge>
              ))}
              <button
                type="button"
                onClick={() => setTags((current) => [...current, "automation"])}
                className="rounded-full border border-dashed border-white/15 px-4 py-2 text-sm text-white/60 transition hover:border-white/30 hover:text-white"
              >
                + add tag
              </button>
            </div>
          </div>
        </Card>
      </div>

      <Card className="sticky top-6 h-fit p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white">Live publish preview</p>
            <p className="text-sm text-white/60">What creators and moderators will see first.</p>
          </div>
          <Badge variant="outline">{previewDomain}</Badge>
        </div>

        <div className="overflow-hidden rounded-[28px] border border-white/12 bg-black/60">
          <div className="aspect-[9/16] bg-[radial-gradient(circle_at_top,#3b2a67_0%,#121117_40%,#09090c_100%)] p-5">
            <div className="flex h-full flex-col justify-between rounded-[24px] border border-white/10 bg-black/25 p-5 shadow-[0_40px_80px_rgba(0,0,0,0.45)]">
              <div className="flex items-center justify-between text-xs text-white/50">
                <span>Preview mode</span>
                <span>Stabilize on tap</span>
              </div>
              <div className="space-y-4">
                <div className="h-40 rounded-[22px] border border-white/10 bg-white/5" />
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge>{selectedIntent}</Badge>
                    <Badge variant="outline">{selectedCategory}</Badge>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">{title}</h3>
                    <p className="mt-1 text-sm text-white/70">{hook}</p>
                  </div>
                  <p className="text-sm leading-6 text-white/62">{description}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/45">Collaboration ask</p>
                  <p className="mt-2 text-sm text-white/75">{resourcesNeeded}</p>
                </div>
                <Button className="w-full justify-between">
                  Publish to Rupture
                  <ArrowRight className="size-4" />
                </Button>
                <div className="flex items-center gap-2 text-xs text-emerald-300/80">
                  <Check className="size-3.5" />
                  Auto-checks: URL, metadata, renderability, moderation
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
