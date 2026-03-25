import Link from "next/link";
import { notFound } from "next/navigation";
import { getAppsByProfile, getProfileByUsername } from "@/lib/server/repository";

export const dynamic = "force-dynamic";

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const profile = await getProfileByUsername(username);
  if (!profile) notFound();
  const profileApps = await getAppsByProfile(username);
  return <main><section className="profile-hero"><div className="profile-hero__banner" style={{ background: profile.bannerGradient }}><div className="avatar" style={{ background: profile.avatarGradient }}>{profile.displayName.split(" ").map((part) => part[0]).join("")}</div></div><div className="profile-hero__content"><div className="split"><div><div className="row"><h1 style={{ margin: 0 }}>{profile.displayName}</h1>{profile.verified ? <span className="chip">Verified</span> : null}</div><p className="muted" style={{ marginTop: "0.35rem" }}>@{profile.username} · {profile.nicheFocus}</p></div><a className="button" href={`mailto:${profile.contactEmail}`}>Contact creator</a></div><p>{profile.bio}</p><p className="muted">{profile.goal}</p><div className="stats-grid"><div className="stat-card"><div className="muted">Followers</div><strong>{profile.stats.followers}</strong></div><div className="stat-card"><div className="muted">Following</div><strong>{profile.stats.following}</strong></div><div className="stat-card"><div className="muted">Views</div><strong>{profile.stats.totalViews}</strong></div><div className="stat-card"><div className="muted">Avg session</div><strong>{profile.stats.avgSessionTimeSeconds}s</strong></div></div></div></section><div className="section-heading"><h2>Published apps</h2></div><div className="grid-3">{profileApps.map((app) => <div className="panel" key={app.id}><div className="row"><span className="chip">{app.intentLabel}</span><span className="chip">v{app.version}</span></div><h3 style={{ marginTop: "0.75rem" }}>{app.title}</h3><p className="muted">{app.hook}</p><div className="row">{app.tags.map((tag) => <span className="tag" key={tag}>#{tag}</span>)}</div><div className="split" style={{ marginTop: "1rem" }}><span className="muted">{app.stats.views.toLocaleString()} views</span><Link className="ghost-button" href={`/apps/${app.slug}`}>Open</Link></div></div>)}</div></main>;
}
