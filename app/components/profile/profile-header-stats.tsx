"use client";

import { useEffect, useState, type ReactNode } from "react";
import { fetchStoreFollowState } from "@/src/services/store-follows";

const statValueClass =
  "flex h-8 min-w-[1.25ch] items-end justify-start tabular-nums text-xl font-semibold leading-none text-zinc-900 sm:h-9 sm:min-w-[1.5ch] sm:text-3xl max-lg:justify-center";
const statLabelClass =
  "mt-1 max-w-[9rem] text-center text-xs font-medium leading-snug text-zinc-500 sm:max-w-none sm:text-left sm:text-sm";

type ProfileHeaderStatsProps = {
  publicationCount: number;
  storeUserId: string;
  showStoreFollowers: boolean;
  followersLabel: string;
};

function StatBlock({ value, label, withDivider }: { value: ReactNode; label: string; withDivider?: boolean }) {
  return (
    <div
      className={`flex shrink-0 flex-col items-start max-lg:items-center ${
        withDivider ? "ml-8 border-l border-zinc-200 pl-10 sm:ml-10 sm:pl-12 lg:ml-12 lg:pl-14" : ""
      }`}
    >
      <span className={statValueClass}>{value}</span>
      <span className={statLabelClass}>{label}</span>
    </div>
  );
}

export function ProfileHeaderStats({
  publicationCount,
  storeUserId,
  showStoreFollowers,
  followersLabel,
}: ProfileHeaderStatsProps) {
  const [followerCount, setFollowerCount] = useState<number | null>(null);

  useEffect(() => {
    if (!showStoreFollowers) return;
    let cancelled = false;
    void fetchStoreFollowState(storeUserId, null).then((state) => {
      if (!cancelled) setFollowerCount(state.followerCount);
    });
    return () => {
      cancelled = true;
    };
  }, [storeUserId, showStoreFollowers]);

  const followerDisplay = followerCount === null ? "—" : followerCount;

  return (
    <div className="flex flex-row flex-nowrap items-end justify-center lg:justify-start">
      <StatBlock value={publicationCount} label="Publicaciones" />
      {showStoreFollowers ? (
        <StatBlock value={followerDisplay} label={followersLabel} withDivider />
      ) : null}
    </div>
  );
}
