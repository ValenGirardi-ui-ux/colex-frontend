import { notFound, redirect } from "next/navigation";
import { SiteHeader } from "@/app/components/site-header";
import {
  ProfileView,
  parseProfileTab,
  type ProfileTabKey,
} from "@/app/components/profile/profile-view";
import { getMockProfileById, MOCK_CURRENT_USER_ID } from "@/src/data/mockProfiles";
import { getProductsBySellerId } from "@/src/data/mockProducts";

type PerfilUsuarioPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export default async function PerfilUsuarioPage({ params, searchParams }: PerfilUsuarioPageProps) {
  const { id } = await params;
  const q = await searchParams;
  const activeTab: ProfileTabKey = parseProfileTab(q.tab);

  if (id === MOCK_CURRENT_USER_ID) {
    redirect("/perfil");
  }

  const profile = getMockProfileById(id);
  if (!profile) {
    notFound();
  }

  const listings = getProductsBySellerId(id);
  const basePath = `/perfil/${encodeURIComponent(id)}`;

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-zinc-900">
      <SiteHeader />

      <main>
        <ProfileView
          profile={profile}
          listings={listings}
          favorites={[]}
          isOwnProfile={false}
          activeTab={activeTab}
          basePath={basePath}
        />
      </main>
    </div>
  );
}
