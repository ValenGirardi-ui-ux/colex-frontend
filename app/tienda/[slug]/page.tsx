import { notFound } from "next/navigation";
import { SiteHeader } from "@/app/components/site-header";
import { PremiumShopPage } from "@/app/components/shop/premium-shop-page";
import { isFeaturedListing } from "@/src/lib/featured-listings";
import { fetchPremiumShopBySlug } from "@/src/services/premium-shops";
import { getActiveListingsByUserId } from "@/src/services/products";
import { fetchReviewSummaryForUser } from "@/src/services/reviews";

type TiendaPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function TiendaPage({ params }: TiendaPageProps) {
  const { slug } = await params;
  const shop = await fetchPremiumShopBySlug(slug);

  if (!shop) {
    notFound();
  }

  const [products, reviewsSum] = await Promise.all([
    getActiveListingsByUserId(shop.userId),
    fetchReviewSummaryForUser(shop.userId),
  ]);

  const featuredProducts = products.filter(isFeaturedListing).slice(0, 8);
  const reviewSummary = reviewsSum.count > 0 ? reviewsSum : null;

  return (
    <div className="min-h-screen bg-[#F6F6F6] text-zinc-900">
      <SiteHeader />
      <main>
        <PremiumShopPage
          shop={shop}
          products={products}
          featuredProducts={featuredProducts}
          reviewSummary={reviewSummary}
        />
      </main>
    </div>
  );
}
