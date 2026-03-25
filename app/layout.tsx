import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles } from "lucide-react";

import "./globals.css";

export const metadata: Metadata = {
  title: "Rupture",
  description: "Discover and interact with live AI apps in a scrollable feed.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(123,97,255,0.16),_transparent_30%),radial-gradient(circle_at_bottom,_rgba(0,255,200,0.08),_transparent_30%),#06070b]">
          <header className="sticky top-0 z-50 border-b border-white/10 bg-black/30 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-lg font-semibold tracking-tight text-white">
                    Rupture
                  </div>
                  <div className="text-xs text-white/50">
                    Discovery engine for live apps
                  </div>
                </div>
              </Link>

              <nav className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1">
                {[
                  { href: "/feed", label: "Feed" },
                  { href: "/create", label: "Create" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-full px-4 py-2 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </header>

          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
