import { cn } from "@/lib/utils/cn";

type BadgeProps = {
  children: React.ReactNode;
  className?: string;
};

export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-white/10 bg-white/6 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-white/72",
        className,
      )}
    >
      {children}
    </span>
  );
}
