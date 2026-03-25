"use client";

import { UserRound } from "lucide-react";

type AvatarProps = {
  src?: string | null;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  fallback?: string;
};

const sizeMap = {
  sm: "h-9 w-9",
  md: "h-12 w-12",
  lg: "h-16 w-16",
  xl: "h-24 w-24",
};

export function Avatar({ src, alt, size = "md", fallback }: AvatarProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-full border border-white/10 bg-white/5 ${sizeMap[size]}`}
      aria-label={alt}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <>
          {fallback ? (
            <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-white/70">
              {fallback}
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-white/55">
              <UserRound className="h-1/2 w-1/2" />
            </div>
          )}
        </>
      )}
    </div>
  );
}
