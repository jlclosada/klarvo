import { site } from "@/lib/config";
import { cn } from "@/lib/utils";
import { CalendarCheck } from "lucide-react";
import Link from "next/link";

/** Logotipo de la marca. Isotipo (agenda con check) + wordmark. */
export function Logo({
  className,
  href = "/",
  compact = false,
}: {
  className?: string;
  href?: string;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label={site.name}
    >
      <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-ink-900 text-white shadow-soft transition-transform duration-300 group-hover:-rotate-6">
        <CalendarCheck className="h-5 w-5" strokeWidth={2.2} />
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-brand-500 ring-2 ring-white" />
      </span>
      {!compact && (
        <span className="text-lg font-semibold tracking-tight text-ink-900">
          Klar<span className="text-brand-600">vo</span>
        </span>
      )}
    </Link>
  );
}
