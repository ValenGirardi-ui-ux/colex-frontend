import { SiteHeader } from "./components/site-header";
import { HomeLanding } from "./components/home/home-landing";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F6F6F6] text-zinc-900">
      <SiteHeader />
      <main>
        <HomeLanding />
      </main>
    </div>
  );
}
