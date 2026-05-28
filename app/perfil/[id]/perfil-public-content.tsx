import { notFound } from "next/navigation";
import { SiteHeader } from "@/app/components/site-header";
import {
  ProfileView,
  parseProfileTab,
  type ProfileTabKey,
} from "@/app/components/profile/profile-view";
import { getActiveListingsByUserId } from "@/src/services/products";
import { resolvePublicProfile } from "@/src/services/profiles";
import { fetchReviewSummaryForUser } from "@/src/services/reviews";
import { PerfilOwnRedirect } from "./perfil-own-redirect";

type PerfilPublicContentProps = {
  id: string;
  tab?: string;
};

export async function PerfilPublicContent({ id, tab }: PerfilPublicContentProps) {
  const activeTab: ProfileTabKey = parseProfileTab(tab);
  const profile = await resolvePublicProfile(id);

  if (!profile) {
    notFound();
  }

  const listings = await getActiveListingsByUserId(id);
  const reviewsSum = await fetchReviewSummaryForUser(id);
  const reviewSummary = reviewsSum.count > 0 ? reviewsSum : null;
  const basePath = `/perfil/${encodeURIComponent(id)}`;

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-zinc-900">
      <SiteHeader />
      <main>
        <PerfilOwnRedirect profileUserId={id}>
          <ProfileView
            profile={profile}
            listings={listings}
            favorites={[]}
            isOwnProfile={false}
            activeTab={activeTab}
            basePath={basePath}
            reviewSummary={reviewSummary}
          />
        </PerfilOwnRedirect>
      </main>
    </div>
  );
}
