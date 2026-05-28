import { SiteHeader } from "../components/site-header";
import { FavoritosContent } from "./favoritos-content";

export default function FavoritosPage() {
  return (
    <div className="min-h-screen bg-[#F6F6F6] text-zinc-900">
      <SiteHeader />
      <main className="colex-page min-w-0">
        <FavoritosContent />
      </main>
    </div>
  );
}
