import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-paper-border/70 px-3 py-1 font-mono text-[11px] uppercase tracking-wide text-ink-text-muted",
        className
      )}
      {...props}
    />
  );
}
