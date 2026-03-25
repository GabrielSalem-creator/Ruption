"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, LayoutDashboard, LogIn, PlusSquare, Sparkles, UserCircle2 } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";

const nav = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/feed", label: "Feed", icon: Flame },
  { href: "/create", label: "Create", icon: PlusSquare },
  { href: "/profile/mira", label: "Profile", icon: UserCircle2 },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isRuntime = pathname.startsWith("/runtime/");
  const [sessionLabel, setSessionLabel] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/session")
      .then((response) => response.json())
      .then((payload) => setSessionLabel(payload.data?.user?.username ?? null))
      .catch(() => setSessionLabel(null));
  }, []);

  if (isRuntime) return <>{children}</>;

  return (
    <>
      <header className="top-nav">
        <div className="top-nav__inner">
          <Link className="brand" href="/">
            <span className="brand__mark"><Sparkles size={18} /></span>
            <span>Rupture</span>
          </Link>
          <nav className="nav-links">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));
              return <Link key={item.href} className="nav-pill" href={item.href} data-active={active}><Icon size={16} /><span>{item.label}</span></Link>;
            })}
            {sessionLabel ? <span className="nav-pill" data-active="false">@{sessionLabel}</span> : <Link className="nav-pill" href="/login" data-active={pathname === "/login"}><LogIn size={16} /><span>Sign in</span></Link>}
          </nav>
        </div>
      </header>
      <div className="page-shell shell-padding">{children}</div>
    </>
  );
}
