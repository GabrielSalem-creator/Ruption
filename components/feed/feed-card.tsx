"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Bookmark, Heart, MessageCircle, MoveUpRight, UserRound } from "lucide-react";

import type { AppRecord } from "@/lib/types";
import { AppPreviewShell } from "@/components/player/app-preview-shell";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type FeedCardProps = {
  app: AppRecord;
  prioritized?: boolean;
};

export function FeedCard({ app, prioritized = false }: FeedCardProps) {
  return (
    <motion.article
      layout
      className="relative flex min-h-[100svh] snap-start items-stretch justify-center px-4 py-4 sm:px-6"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="grid w-full max-w-7xl grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_88px]">
        <div className="relative overflow-hidden rounded-[32px] border border-white/12 bg-black/30 shadow-[0_40px_120px_rgba(0,0,0,0.45)]">
          <AppPreviewShell app={app} prioritized={prioritized} />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black via-black/65 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col gap-4 p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <Avatar
                src={app.creator.avatarUrl}
                alt={app.creator.username}
                fallback={app.creator.username.slice(0, 2).toUpperCase()}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-semibold text-white">
                    @{app.creator.username}
                  </span>
                  {app.creator.verified ? (
                    <Badge variant="glass" className="text-[10px] uppercase tracking-[0.18em]">
                      Verified
                    </Badge>
                  ) : null}
                </div>
                <p className="text-xs text-white/60">{app.creator.goal}</p>
              </div>
            </div>

            <div className="max-w-3xl space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="primary">{app.intentLabel}</Badge>
                <Badge variant="secondary">{app.category}</Badge>
                {app.metrics.healthScore ? (
                  <Badge variant="glass">Health {app.metrics.healthScore}</Badge>
                ) : null}
              </div>

              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  {app.title}
                </h2>
                <p className="mt-1 text-sm text-white/72 sm:text-base">{app.hook}</p>
              </div>

              <p className="max-w-2xl text-sm leading-6 text-white/70 sm:text-[15px]">
                {app.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {app.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    #{tag}
                  </Badge>
                ))}
              </div>

              <div className="pointer-events-auto flex flex-wrap gap-3 pt-1">
                <Button asChild size="lg">
                  <Link href={`/app/${app.slug}`}>Stabilize app</Link>
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <a href={app.appUrl} target="_blank" rel="noreferrer">
                    Open source app
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="z-20 flex flex-row gap-3 overflow-x-auto py-1 lg:flex-col lg:items-center lg:justify-end lg:overflow-visible lg:py-4">
          <ActionPill
            icon={<Heart className="size-5" />}
            label="Like"
            value={formatCount(app.metrics.likesCount)}
          />
          <ActionPill
            icon={<MessageCircle className="size-5" />}
            label="Comment"
            value={formatCount(app.metrics.commentsCount)}
          />
          <ActionPill
            icon={<Bookmark className="size-5" />}
            label="Save"
            value={formatCount(app.metrics.savesCount)}
          />
          <ActionPill icon={<UserRound className="size-5" />} label="Profile" value="View" />
          <ActionPill
            icon={<MoveUpRight className="size-5" />}
            label="Visit"
            value={new URL(app.appUrl).hostname.replace("www.", "")}
          />
        </div>
      </div>
    </motion.article>
  );
}

function ActionPill({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="flex min-w-[84px] items-center gap-3 rounded-full border border-white/10 bg-white/8 px-4 py-3 text-white backdrop-blur-xl lg:min-w-[88px] lg:flex-col lg:justify-center lg:gap-2 lg:rounded-[24px] lg:px-3"
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
      >
        <div className="grid size-10 place-items-center rounded-full bg-white/10">{icon}</div>
        <div className="space-y-0.5 lg:text-center">
          <div className="text-xs font-medium text-white/65">{label}</div>
          <div className="text-sm font-semibold text-white">{value}</div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function formatCount(value: number) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }

  return String(value);
}
