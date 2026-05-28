import { SiteHeader } from "./components/site-header";
import { HomeLanding } from "./components/home/home-landing";
import { getFeaturedBusinesses } from "@/src/services/featured-businesses";
import { getProducts } from "@/src/services/products";

type PageProps = {
  searchParams: Promise<{ q?: string; cat?: string; sub?: string }>;
};

export default async function Home({ searchParams }: PageProps) {
  const { q, cat, sub } = await searchParams;
  const [allProducts, featuredBusinesses] = await Promise.all([getProducts(), getFeaturedBusinesses()]);
  const hasUrlFilters = Boolean(
    (q ?? "").trim() || (cat && cat !== "todo") || (sub && sub !== "todo"),
  );

  return (
    <div className="min-h-screen bg-[#F6F6F6] text-zinc-900">
      <SiteHeader />
      <main>
        <HomeLanding
          allProducts={allProducts}
          featuredBusinesses={featuredBusinesses}
          filterQuery={q ?? ""}
          showPremiumBusinesses={!hasUrlFilters}
        />
      </main>
    </div>
  );
}
