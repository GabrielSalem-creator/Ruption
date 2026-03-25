"use client";

import { AnimatePresence, motion } from "framer-motion";

import type { AppCard } from "@/lib/types";
import { FeedCard } from "@/components/feed/feed-card";

type FeedListProps = {
  apps: AppCard[];
};

export function FeedList({ apps }: FeedListProps) {
  return (
    <div className="flex snap-y snap-mandatory flex-col gap-6 pb-10">
      <AnimatePresence initial={false}>
        {apps.map((app, index) => (
          <motion.div
            key={app.id}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.04 }}
          >
            <FeedCard app={app} prioritized={index === 0} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
