"use client";

import { motion } from "framer-motion";
import { ExternalLink, Info, Maximize2, PlayCircle } from "lucide-react";

import type { AppRecord } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type AppPreviewShellProps = {
  app: AppRecord;
  interactive?: boolean;
};

export function AppPreviewShell({
  app,
  interactive = false,
}: AppPreviewShellProps) {
  return (
    <motion.div
      initial={{ opacity: 0.92, scale: 0.985 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      className="relative overflow-hidden rounded-[28px] border border-white/10 bg-black/60 shadow-[0_40px_90px_-50px_rgba(114,100,255,0.65)]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(118,87,255,0.2),transparent_40%),linear-gradient(180deg,rgba(7,8,18,0.25)_0%,rgba(7,8,18,0.7)_100%)]" />
      <div className="relative aspect-[9/16] w-full">
        <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/72">
              {interactive ? "stabilized" : "preview"}
            </span>
            <Badge variant="outline" className="bg-black/25">
              {app.intentLabel}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full bg-black/35"
            >
              <Info className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full bg-black/35"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute inset-6 rounded-[22px] border border-white/10 bg-white/5 backdrop-blur-sm" />
          <div className="absolute inset-x-8 top-20 h-14 rounded-2xl border border-white/10 bg-black/40 px-4 py-3">
            <div className="h-2 w-24 rounded-full bg-white/15" />
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="h-2 rounded-full bg-fuchsia-400/40" />
              <div className="h-2 rounded-full bg-cyan-300/35" />
              <div className="h-2 rounded-full bg-emerald-300/30" />
            </div>
          </div>

          <div className="absolute inset-x-10 top-40 grid gap-3">
            <div className="rounded-3xl border border-white/10 bg-black/45 p-4">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-fuchsia-500/60 to-indigo-400/60" />
                <div className="space-y-2">
                  <div className="h-2 w-28 rounded-full bg-white/20" />
                  <div className="h-2 w-20 rounded-full bg-white/10" />
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/45 p-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="h-2 w-12 rounded-full bg-white/15" />
                  <div className="mt-3 h-8 rounded-2xl bg-gradient-to-r from-fuchsia-500/35 to-violet-400/15" />
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="h-2 w-14 rounded-full bg-white/15" />
                  <div className="mt-3 h-8 rounded-2xl bg-gradient-to-r from-cyan-400/30 to-blue-400/15" />
                </div>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="absolute bottom-9 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-black/60 px-4 py-2 text-sm text-white/80 shadow-lg shadow-black/40"
          >
            {interactive ? (
              <>
                <Maximize2 className="h-4 w-4 text-fuchsia-300" />
                interaction locked
              </>
            ) : (
              <>
                <PlayCircle className="h-4 w-4 text-fuchsia-300" />
                tap to stabilize
              </>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
