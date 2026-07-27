import * as React from "react";
import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-[20px] border border-paper-border bg-paper-card p-4 text-base text-ink-text placeholder:text-ink-text-muted focus:outline-none focus:ring-2 focus:ring-clarity resize-none",
        className
      )}
      {...props}
    />
  );
}
