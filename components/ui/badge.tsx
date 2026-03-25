import { cn } from "@/lib/utils/cn";

type BadgeVariant = "default" | "primary" | "secondary" | "outline" | "success" | "glass";

type BadgeProps = {
  children: React.ReactNode;
  className?: string;
  variant?: BadgeVariant;
};

const badgeVariants: Record<BadgeVariant, string> = {
  default: "border-white/10 bg-white/6 text-white/72",
  primary: "border-cyan-400/20 bg-cyan-300/10 text-cyan-100",
  secondary: "border-white/10 bg-white/6 text-white/72",
  outline: "border-white/12 bg-transparent text-white/68",
  success: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  glass: "border-white/12 bg-black/25 text-white/76",
};

export function Badge({ children, className, variant = "default" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.18em]",
        badgeVariants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
