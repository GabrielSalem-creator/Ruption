import { Camera, ExternalLink, Save } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { getProfileByUsername, updateProfile, uploadAvatar } from "@/lib/data";
import { FeedItem, Profile } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";

export function ProfilePage({ profile, apps }: { profile: Profile; apps: FeedItem[] }) {
  const { user } = useAuth();
  const isOwner = user?.username === profile.username;
  const [draft, setDraft] = useState(profile);
  const [saving, setSaving] = useState(false);

  async function handleSaveProfile() {
    if (!isOwner) return;
    setSaving(true);
    try {
      await updateProfile(profile.id, draft);
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarUpload(file: File | null) {
    if (!file || !isOwner) return;
    const avatarUrl = await uploadAvatar(profile.id, file);
    setDraft((current) => ({ ...current, avatarUrl }));
    await updateProfile(profile.id, { avatarUrl });
  }

  return <main><div className="profile-stack"><section className="profile-hero"><div className="profile-hero__banner" style={{ background: draft.bannerGradient }}><label className="avatar avatar-upload" style={draft.avatarUrl ? { backgroundImage: `url(${draft.avatarUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { background: draft.avatarGradient }}>{!draft.avatarUrl ? draft.displayName.split(" ").map((part) => part[0]).join("") : <Camera size={18} />}<input accept="image/*" onChange={(event) => handleAvatarUpload(event.target.files?.[0] ?? null)} type="file" /></label></div><div className="profile-hero__content"><div className="split"><div><div className="row"><h1 style={{ margin: 0 }}>{draft.displayName}</h1>{draft.verified ? <span className="chip">Verified</span> : null}</div><p className="muted" style={{ marginTop: "0.35rem" }}>@{draft.username} · {draft.nicheFocus}</p></div><div className="row">{isOwner ? <button className="button" disabled={saving} onClick={handleSaveProfile} type="button"><Save size={16} /> {saving ? 'Saving...' : 'Save profile'}</button> : <a className="profile-action" href={`mailto:${draft.contactEmail}`}>Contact creator</a>}</div></div><div className="form-grid" style={{ marginTop: '1rem' }}><label className="label">Display name<input className="input" disabled={!isOwner} value={draft.displayName} onChange={(event) => setDraft({ ...draft, displayName: event.target.value })} /></label><label className="label">Website<input className="input" disabled={!isOwner} value={draft.websiteUrl ?? ''} onChange={(event) => setDraft({ ...draft, websiteUrl: event.target.value })} /></label><label className="label">Bio<textarea className="textarea" disabled={!isOwner} value={draft.bio} onChange={(event) => setDraft({ ...draft, bio: event.target.value })} /></label><label className="label">Goal<textarea className="textarea" disabled={!isOwner} value={draft.goal} onChange={(event) => setDraft({ ...draft, goal: event.target.value })} /></label></div><div className="stats-grid" style={{ marginTop: '1rem' }}><div className="stat-card"><div className="muted">Followers</div><strong>{draft.stats.followers}</strong></div><div className="stat-card"><div className="muted">Following</div><strong>{draft.stats.following}</strong></div><div className="stat-card"><div className="muted">Views</div><strong>{draft.stats.totalViews}</strong></div><div className="stat-card"><div className="muted">Avg session</div><strong>{draft.stats.avgSessionTimeSeconds}s</strong></div></div></div></section><section className="section-heading"><h2>Published apps</h2></section><section className="grid-2">{apps.map((app) => <div className="editor-card" key={app.id}><div className="split"><div><h3 style={{ margin: 0 }}>{app.title}</h3><p className="muted">{app.hook}</p></div><a className="ghost-button" href={app.appUrl} target="_blank" rel="noreferrer"><ExternalLink size={16} /> Open</a></div><div className="preview-device" style={{ minHeight: '18rem', marginTop: '1rem' }}><iframe src={app.appUrl} sandbox="allow-scripts allow-same-origin allow-forms" title={`${app.title} profile preview`} /></div><div className="row" style={{ marginTop: '1rem' }}>{app.tags.map((tag) => <span className="tag" key={tag}>#{tag}</span>)}</div></div>)}</section></div></main>;
}
