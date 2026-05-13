import { SiteHeader } from "@/app/components/site-header";
import { HomeProductCard } from "@/app/components/home/home-product-card";
import { getProductsByCategory } from "@/src/services/products";

type PageProps = {
  params: Promise<{ categoria: string }>;
};

function categoryLabel(slug: string): string {
  if (!slug) return "Categoría";
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}

export default async function CategoriaPage({ params }: PageProps) {
  const { categoria } = await params;
  const products = await getProductsByCategory(categoria);

  return (
    <div className="min-h-screen bg-[#F6F6F6] text-zinc-900">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1240px] px-4 py-6 lg:px-6 lg:py-8">
        <section className="mb-6 rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm sm:p-6">
          <h1 className="text-3xl font-semibold tracking-tight text-[#822020] sm:text-4xl">
            Categoría: {categoryLabel(categoria)}
          </h1>
          <p className="mt-2 text-sm text-zinc-600 sm:text-base">
            Explorá artículos relacionados con esta categoría en Colex.
          </p>
        </section>

        <section>
          <div className="mb-4 text-sm text-zinc-600 sm:text-base">
            {products.length} {products.length === 1 ? "artículo" : "artículos"}
          </div>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <li key={product.id}>
                <HomeProductCard product={product} />
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
