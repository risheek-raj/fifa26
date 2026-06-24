"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Bracket" },
  { href: "/groups", label: "Groups" },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 mt-3">
      {links.map(({ href, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              active
                ? "bg-accent/15 text-accent border border-accent/30"
                : "text-muted hover:text-foreground hover:bg-surface-hover"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

interface LiveBadgeProps {
  source?: "espn" | "seed";
  updatedAt?: string;
  hasLive?: boolean;
}

export function LiveBadge({ source, updatedAt, hasLive }: LiveBadgeProps) {
  const time = updatedAt
    ? new Date(updatedAt).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {hasLive && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-semibold">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
          LIVE
        </span>
      )}
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs font-semibold">
        {source === "espn" ? (
          <>
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            ESPN · {time ?? "synced"}
          </>
        ) : (
          "Seed data"
        )}
      </span>
    </div>
  );
}
