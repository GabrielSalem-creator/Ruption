import { notFound } from "next/navigation";

import { ProfileHeader } from "@/components/profile/profile-header";
import { FeedCard } from "@/components/feed/feed-card";
import { getMockProfileByUsername, getMockUserApps } from "@/lib/data/mock-data";

type ProfilePageProps = {
  params: Promise<{ username: string }>;
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const profile = getMockProfileByUsername(username);

  if (!profile) {
    notFound();
  }

  const apps = getMockUserApps(username);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <ProfileHeader profile={profile} />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Published apps</h2>
            <p className="text-sm text-zinc-400">
              Live cards from this creator&apos;s public catalog.
            </p>
          </div>
          <div className="text-sm text-zinc-500">{apps.length} apps</div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {apps.map((app, index) => (
            <FeedCard key={app.id} app={app} prioritized={index === 0} />
          ))}
        </div>
      </section>
    </main>
  );
}
