"use client";

import { Globe2, Link2, Mail } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CreatorProfile } from "@/lib/types";

type ProfileHeaderProps = {
  profile: CreatorProfile;
};

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const goals = profile.goals ?? (profile.goal ? [profile.goal] : []);

  return (
    <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03]">
      <div className="h-40 bg-[radial-gradient(circle_at_top_left,_rgba(121,82,255,0.55),_transparent_42%),linear-gradient(135deg,rgba(15,17,26,1),rgba(10,10,14,1))]" />
      <div className="flex flex-col gap-6 px-6 pb-6 sm:px-8">
        <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <Avatar src={profile.avatarUrl} alt={profile.displayName} size="xl" />
            <div className="pb-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-semibold tracking-tight text-white">
                  {profile.displayName}
                </h1>
                {profile.verified ? (
                  <Badge className="bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/20">
                    Verified
                  </Badge>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-white/50">@{profile.username}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary">Follow</Button>
            <Button>Message</Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-4">
            <p className="max-w-2xl text-sm leading-7 text-white/70">
              {profile.bio}
            </p>
            <div className="flex flex-wrap gap-2">
              {goals.map((goal) => (
                <Badge
                  key={goal}
                  className="border-white/10 bg-white/[0.05] text-white/65 ring-1 ring-white/10"
                >
                  {goal}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid gap-4 rounded-[1.5rem] border border-white/10 bg-black/25 p-4 text-sm text-white/65">
            <div className="flex items-center gap-3">
              <Mail className="size-4 text-white/40" />
              <span>{profile.contactEmail}</span>
            </div>
            {profile.websiteUrl ? (
              <div className="flex items-center gap-3">
                <Globe2 className="size-4 text-white/40" />
                <a
                  className="hover:text-white"
                  href={profile.websiteUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  {profile.websiteUrl.replace("https://", "")}
                </a>
              </div>
            ) : null}
            {profile.twitterUrl ? (
              <div className="flex items-center gap-3">
                <Link2 className="size-4 text-white/40" />
                <a
                  className="hover:text-white"
                  href={profile.twitterUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  X profile
                </a>
              </div>
            ) : null}
            {profile.linkedinUrl ? (
              <div className="flex items-center gap-3">
                <Link2 className="size-4 text-white/40" />
                <a
                  className="hover:text-white"
                  href={profile.linkedinUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  LinkedIn
                </a>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
