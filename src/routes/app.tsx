import { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { AppShell } from "@/components/layout/app-shell";
import { getAppBySlug, getAppsByProfile, getProfileByUsername, listFeedItems } from "@/lib/data";
import { FeedItem, Profile } from "@/lib/types";
import { AppDetailPage } from "@/pages/app-detail-page";
import { CreatePage } from "@/pages/create-page";
import { FeedPage } from "@/pages/feed-page";
import { HomePage } from "@/pages/home-page";
import { LoginPage } from "@/pages/login-page";
import { ProfilePage } from "@/pages/profile-page";
import { RegisterPage } from "@/pages/register-page";
import { RuntimePage } from "@/pages/runtime-page";
import { SearchPage } from "@/pages/search-page";

function useFeedData() {
  const [items, setItems] = useState<FeedItem[]>([]);
  useEffect(() => { listFeedItems().then(setItems); }, []);
  return items;
}

function HomeRoute() { const items = useFeedData(); return <HomePage items={items} />; }
function FeedRoute() { const items = useFeedData(); return <FeedPage items={items} />; }
function SearchRoute() { const items = useFeedData(); return <SearchPage items={items} />; }
function AppRoute() { const { slug } = useParams(); const [app, setApp] = useState<FeedItem | null>(null); useEffect(() => { if (slug) getAppBySlug(slug).then(setApp); }, [slug]); return app ? <AppDetailPage app={app} /> : <main><div className="panel"><p className="muted">Loading app...</p></div></main>; }
function ProfileRoute() { const { username } = useParams(); const [profile, setProfile] = useState<Profile | null>(null); const [apps, setApps] = useState<FeedItem[]>([]); useEffect(() => { if (!username) return; getProfileByUsername(username).then(setProfile); getAppsByProfile(username).then(setApps); }, [username]); return profile ? <ProfilePage profile={profile} apps={apps} /> : <main><div className="panel"><p className="muted">Loading profile...</p></div></main>; }

export function App() {
  const path = window.location.pathname;
  const isRuntime = useMemo(() => path.startsWith("/runtime/"), [path]);

  const routes = <Routes><Route path="/" element={<HomeRoute />} /><Route path="/feed" element={<FeedRoute />} /><Route path="/search" element={<SearchRoute />} /><Route path="/create" element={<CreatePage />} /><Route path="/login" element={<LoginPage />} /><Route path="/register" element={<RegisterPage />} /><Route path="/apps/:slug" element={<AppRoute />} /><Route path="/profile/:username" element={<ProfileRoute />} /><Route path="/runtime/:slug" element={<RuntimePage />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes>;

  if (isRuntime) return routes;
  return <AppShell>{routes}</AppShell>;
}
