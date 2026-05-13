import { SiteHeader } from "../components/site-header";

import {

  ProfileView,

  parseProfileTab,

  type ProfileTabKey,

} from "../components/profile/profile-view";

import { getMockProfileById, MOCK_CURRENT_USER_ID } from "@/src/data/mockProfiles";

import { getProductsBySellerId, mockFavoriteProducts } from "@/src/data/mockProducts";



type PerfilPageProps = {

  searchParams: Promise<{ tab?: string }>;

};



export default async function PerfilPage({ searchParams }: PerfilPageProps) {

  const params = await searchParams;

  const activeTab: ProfileTabKey = parseProfileTab(params.tab);



  const profileId = MOCK_CURRENT_USER_ID;

  const profile = getMockProfileById(profileId)!;

  const listings = getProductsBySellerId(profileId);



  return (

    <div className="min-h-screen bg-[#FFFFFF] text-zinc-900">

      <SiteHeader />



      <main>

        <ProfileView

          profile={profile}

          listings={listings}

          favorites={mockFavoriteProducts}

          isOwnProfile

          activeTab={activeTab}

          basePath="/perfil"

        />

      </main>

    </div>

  );

}

