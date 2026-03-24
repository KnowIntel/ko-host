// components/ui/Container.tsx
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/security";

type ContainerProps = HTMLAttributes<HTMLDivElement>;

export function Container({ className, ...props }: ContainerProps) {
  return (
    <div
      className={cn("w-full px-4", className)}
      {...props}
    />
  );
}