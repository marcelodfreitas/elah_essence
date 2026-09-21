import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";

import { createClient } from "@/lib/supabase/server";

type Material = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
};

type ProductImage = {
  image_url: string;
  sort_order: number;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  promotional_price: number | null;
  is_featured: boolean;
  materials: Material | null;
  product_images: ProductImage[];
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default async function CatalogoPage() {
  const supabase = await createClient();

  const [
    { data: materials, error: materialsError },
    { data: products, error: productsError },
  ] = await Promise.all([
    supabase
      .from("materials")
      .select("id, name, slug, description, image_url")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),

    supabase
  .from("products")
  .select(
    `
    id,
    name,
    slug,
    price,
    promotional_price,
    is_featured,
    materials (
      id,
      name,
      slug,
      description,
      image_url
    ),
    product_images (
      image_url,
      sort_order
    )
  `,
  )
  .eq("is_active", true)
  .order("created_at", { ascending: false })
  .limit(8),
  ]);

  if (materialsError || productsError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f6f2] px-5">
        <p className="text-sm text-black/45">
          Não foi possível carregar o catálogo.
        </p>
      </main>
    );
  }

  // Normalizar os relacionamentos do Supabase.
  // O Supabase retorna materials como array,
  // mas cada produto possui apenas um material.
  const normalizedProducts: Product[] = (products ?? []).map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    promotional_price: product.promotional_price,
    is_featured: product.is_featured,
    materials: product.materials?.[0] ?? null,
    product_images: product.product_images ?? [],
  }));

  const featuredProducts = normalizedProducts.filter(
    (product) => product.is_featured,
  );

  const catalogProducts =
    featuredProducts.length > 0
      ? featuredProducts
      : normalizedProducts;

  return (
    <main className="min-h-screen overflow-hidden bg-[#f8f6f2] text-[#1c1b19]">
      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="relative px-5 pb-16 pt-7 sm:px-8 sm:pb-24 sm:pt-9 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          {/* HEADER */}
          <header className="flex items-center justify-between border-b border-black/[0.07] pb-6">
            <Link
              href="/catalogo"
              className="font-serif text-[27px] tracking-[0.22em] transition-opacity hover:opacity-60"
            >
              ELAH
            </Link>

            <span className="hidden text-[9px] uppercase tracking-[0.3em] text-black/35 sm:block">
              Joias &amp; Essência
            </span>

            <span className="text-[9px] uppercase tracking-[0.25em] text-black/40">
              Coleção 2026
            </span>
          </header>

          {/* HERO COPY */}
          <div className="mx-auto max-w-4xl px-2 py-28 text-center sm:py-36 lg:py-18">
            <p className="mb-7 text-[10px] uppercase tracking-[0.4em] text-[#a88950]">
              ELAH ESSENCE
            </p>

            <h1 className="font-serif text-[52px] leading-[0.9] tracking-[-0.03em] sm:text-7xl lg:text-[104px]">
              O detalhe
              <br />
              <span className="italic">que permanece.</span>
            </h1>

            <p className="mx-auto mt-8 max-w-lg text-sm leading-7 text-black/48 sm:text-[15px]">
              Joias escolhidas para acompanhar histórias, celebrar
              momentos e transformar pequenos detalhes em memórias.
            </p>

            <div className="mt-8 flex justify-center">
              <Link
                href="#colecoes"
                className="group inline-flex flex-col items-center gap-3 text-[9px] uppercase tracking-[0.3em] text-black/45 transition-colors hover:text-[#a88950]"
              >
                Explorar coleções

                <ArrowDown className="h-4 w-4 transition-transform duration-500 group-hover:translate-y-1" />
              </Link>
            </div>
          </div>

          {/* =====================================================
              COLEÇÕES
          ===================================================== */}
          <div id="colecoes">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <p className="text-[9px] uppercase tracking-[0.35em] text-[#a88950]">
                  Materiais
                </p>

                <h2 className="mt-2 font-serif text-3xl tracking-tight sm:text-4xl">
                  Escolha sua essência.
                </h2>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {(materials ?? []).map((material, index) => (
                <Link
                  key={material.id}
                  href={`/catalogo/${material.slug}`}
                  className={`group relative overflow-hidden bg-[#e9e4db] ${
                    index === 0
                      ? "min-h-[500px] sm:min-h-[680px]"
                      : "min-h-[500px] sm:min-h-[680px]"
                  }`}
                >
                  {material.image_url ? (
                    <img
                      src={material.image_url}
                      alt={material.name}
                      className="absolute inset-0 h-full w-full object-cover transition duration-[1200ms] ease-out group-hover:scale-[1.035]"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[#e9e4db]" />
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/0" />

                  {/* Número */}
                  <span className="absolute left-7 top-7 text-[9px] tracking-[0.3em] text-white/60 sm:left-9 sm:top-9">
                    0{index + 1}
                  </span>

                  {/* Conteúdo */}
                  <div className="absolute inset-x-0 bottom-0 p-7 sm:p-10">
                    <p className="mb-2 text-[9px] uppercase tracking-[0.32em] text-white/65">
                      Coleção
                    </p>

                    <h3 className="font-serif text-5xl tracking-tight text-white sm:text-6xl">
                      {material.name}
                    </h3>

                    {material.description && (
                      <p className="mt-4 max-w-sm text-sm leading-6 text-white/70">
                        {material.description}
                      </p>
                    )}

                    <div className="mt-7 flex items-center gap-3 text-[9px] uppercase tracking-[0.25em] text-white/90">
                      Explorar

                      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 transition-all duration-300 group-hover:border-white/70 group-hover:bg-white group-hover:text-black">
                        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FRASE / MANIFESTO
      ========================================================= */}
      <section className="border-y border-black/[0.07] bg-[#f3efe8] px-5 py-24 sm:px-8 sm:py-32 lg:px-12">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-[9px] uppercase tracking-[0.35em] text-[#a88950]">
            ELAH
          </p>

          <p className="mt-7 font-serif text-3xl leading-[1.15] tracking-tight text-[#292723] sm:text-5xl lg:text-6xl">
            “Algumas peças não acompanham apenas um momento.
            <span className="italic text-black/55">
              {" "}
              Elas passam a fazer parte dele.
            </span>
            ”
          </p>
        </div>
      </section>

      {/* =========================================================
          DESTAQUES
      ========================================================= */}
      {catalogProducts.length > 0 && (
        <section className="bg-[#f8f6f2] px-5 py-24 sm:px-8 sm:py-32 lg:px-12">
          <div className="mx-auto max-w-[1400px]">
            <div className="mb-12 flex items-end justify-between border-b border-black/[0.07] pb-6">
              <div>
                <p className="text-[9px] uppercase tracking-[0.35em] text-[#a88950]">
                  Seleção ELAH
                </p>

                <h2 className="mt-2 font-serif text-4xl tracking-tight sm:text-5xl">
                  Peças em destaque
                </h2>
              </div>

              <Link
                href="/catalogo"
                className="group hidden items-center gap-3 text-[9px] uppercase tracking-[0.25em] text-black/45 transition hover:text-black sm:flex"
              >
                Ver coleção completa

                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-12 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-7">
              {catalogProducts.map((product) => {
                const image = [...(product.product_images ?? [])].sort(
                  (a, b) => a.sort_order - b.sort_order,
                )[0];

                const hasPromotion =
                  product.promotional_price !== null;

                const finalPrice =
                  product.promotional_price ?? product.price;

                return (
                  <Link
                    key={product.id}
                    href={`/catalogo/${product.materials?.slug ?? "prata"}/${product.slug}`}
                    className="group"
                  >
                    {/* IMAGE */}
                    <div className="relative aspect-[4/5] overflow-hidden bg-[#eeebe5]">
                      {image?.image_url ? (
                        <img
                          src={image.image_url}
                          alt={product.name}
                          className="h-full w-full object-cover transition duration-[900ms] ease-out group-hover:scale-[1.035]"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <span className="font-serif text-2xl tracking-[0.18em] text-black/15">
                            ELAH
                          </span>
                        </div>
                      )}

                      {product.is_featured && (
                        <span className="absolute left-3 top-3 bg-white/90 px-3 py-1.5 text-[8px] uppercase tracking-[0.22em] backdrop-blur-sm">
                          Destaque
                        </span>
                      )}
                    </div>

                    {/* INFO */}
                    <div className="mt-5">
                      <p className="text-[8px] uppercase tracking-[0.25em] text-black/35">
                        {product.materials?.name}
                      </p>

                      <h3 className="mt-2 font-serif text-xl tracking-tight">
                        {product.name}
                      </h3>

                      <div className="mt-3 flex items-center gap-2">
                        {hasPromotion && (
                          <span className="text-xs text-black/30 line-through">
                            {formatCurrency(product.price)}
                          </span>
                        )}

                        <span className="text-sm text-black/65">
                          {formatCurrency(finalPrice)}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* MOBILE CTA */}
            <div className="mt-12 flex justify-center sm:hidden">
              <Link
                href="/catalogo"
                className="inline-flex items-center gap-3 border-b border-black/30 pb-2 text-[9px] uppercase tracking-[0.25em]"
              >
                Ver coleção completa
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================
          FOOTER
      ========================================================= */}
      <footer className="border-t border-black/[0.07] bg-[#1c1b19] px-5 py-16 text-white sm:px-8 sm:py-20 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-col justify-between gap-12 sm:flex-row sm:items-end">
            <div>
              <span className="font-serif text-4xl tracking-[0.18em]">
                ELAH
              </span>

              <p className="mt-5 max-w-xs text-xs leading-6 text-white/45">
                Joias escolhidas para acompanhar histórias que merecem
                permanecer.
              </p>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-[8px] uppercase tracking-[0.3em] text-white/30">
                ELAH ESSENCE
              </p>

              <p className="mt-2 text-xs text-white/45">
                Joias para momentos que permanecem.
              </p>
            </div>
          </div>

          <div className="mt-14 border-t border-white/10 pt-5">
            <p className="text-center text-[8px] uppercase tracking-[0.25em] text-white/25">
              © {new Date().getFullYear()} ELAH
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}