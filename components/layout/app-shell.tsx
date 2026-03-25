"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, LayoutDashboard, PlusSquare, Sparkles, UserCircle2 } from "lucide-react";
import { ReactNode } from "react";

const nav = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/feed", label: "Feed", icon: Flame },
  { href: "/create", label: "Create", icon: PlusSquare },
  { href: "/profile/mira", label: "Profile", icon: UserCircle2 },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isRuntime = pathname.startsWith("/runtime/");

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
              return (
                <Link key={item.href} className="nav-pill" href={item.href} data-active={active}>
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <div className="page-shell shell-padding">{children}</div>
    </>
  );
}
