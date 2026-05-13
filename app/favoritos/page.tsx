import { SiteHeader } from "../components/site-header";
import { FavoritosContent } from "./favoritos-content";

export default function FavoritosPage() {
  return (
    <div className="min-h-screen bg-[#F6F6F6] text-zinc-900">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1240px] px-4 py-6 lg:px-6 lg:py-8">
        <FavoritosContent />
      </main>
    </div>
  );
}
