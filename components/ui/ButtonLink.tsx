// components/ui/ButtonLink.tsx
import Link from "next/link";
import { cn } from "@/lib/security";

type Variant = "primary" | "secondary" | "ghost";

const styles: Record<Variant, string> = {
  primary:
    "bg-neutral-900 text-white hover:bg-neutral-800 border border-neutral-900",
  secondary:
    "bg-white text-neutral-900 hover:bg-neutral-50 border border-neutral-300",
  ghost: "bg-transparent text-neutral-900 hover:bg-neutral-100 border border-transparent"
};

export function ButtonLink({
  href,
  children,
  variant = "primary"
}: {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-medium transition",
        styles[variant]
      )}
    >
      {children}
    </Link>
  );
}