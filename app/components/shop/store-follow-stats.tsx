"use client";

type StoreFollowStatsProps = {
  followerCount: number;
  className?: string;
};

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 10_000) return `${Math.round(n / 1000)}k`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}

export function StoreFollowStats({ followerCount, className = "" }: StoreFollowStatsProps) {
  return (
    <p className={`text-sm text-zinc-500 ${className}`.trim()} aria-live="polite">
      <span className="font-semibold text-zinc-700">{formatCount(followerCount)}</span>
      <span className="text-zinc-500">
        {" "}
        {followerCount === 1 ? "seguidor" : "seguidores"}
      </span>
    </p>
  );
}
