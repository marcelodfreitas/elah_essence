import Link from "next/link";
import { ArrowRight, Boxes, Package, Plus, ShoppingBag } from "lucide-react";

import { createClient } from "@/lib/supabase/server";

type RecentProduct = {
  id: string;
  name: string;
  price: number;
  promotional_price: number | null;
  is_active: boolean;
  created_at: string;
  materials:
    | {
        name: string;
      }[]
    | null;
  product_images: {
    image_url: string;
    sort_order: number;
  }[];
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user?.id)
    .single();

  const displayName =
    profile?.full_name?.trim().split(/\s+/).slice(0, 2).join(" ") ?? "Admin";

  const [
    { count: productsCount },
    { count: activeProductsCount },
    { count: reservationsCount },
    { data: recentProducts },
  ] = await Promise.all([
    supabase.from("products").select("*", {
      count: "exact",
      head: true,
    }),

    supabase
      .from("products")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("is_active", true),

    supabase
      .from("reservations")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("status", "pending"),

    supabase
      .from("products")
      .select(
        `
        id,
        name,
        price,
        promotional_price,
        is_active,
        created_at,
        materials (
          name
        ),
        product_images (
          image_url,
          sort_order
        )
      `,
      )
      .order("created_at", {
        ascending: false,
      })
      .limit(5),
  ]);

  const stats = [
    {
      label: "Produtos",
      value: productsCount ?? 0,
      description: "cadastrados",
      icon: Package,
    },
    {
      label: "Disponíveis",
      value: activeProductsCount ?? 0,
      description: "ativos no catálogo",
      icon: ShoppingBag,
    },
    {
      label: "Reservas",
      value: reservationsCount ?? 0,
      description: "aguardando atendimento",
      icon: Boxes,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[1400px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      {/* CABEÇALHO */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.25em] text-[#a88950]">
            Visão geral
          </p>

          <h1 className="font-serif text-3xl tracking-tight sm:text-4xl">
            Bom dia, {displayName}
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-black/45">
            Aqui está o resumo do seu catálogo ELAH.
          </p>
        </div>

        <Link
          href="/admin/produtos/novo"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1c1b19] px-5 text-sm font-medium text-white transition hover:bg-[#302e2a]"
        >
          <Plus className="h-4 w-4" />
          Novo produto
        </Link>
      </div>

      {/* INDICADORES */}
      <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-black/[0.06] bg-[#fdfcf9] p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-black/35">
                    {stat.label}
                  </p>

                  <p className="mt-4 text-3xl font-medium tracking-tight">
                    {stat.value}
                  </p>

                  <p className="mt-1 text-xs text-black/35">
                    {stat.description}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f3efe7]">
                  <Icon
                    className="h-[18px] w-[18px] text-[#a88950]"
                    strokeWidth={1.6}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CONTEÚDO */}
      <div className="mt-6">
        {/* PRODUTOS RECENTES */}
        <section className="overflow-hidden rounded-2xl border border-black/[0.06] bg-[#fdfcf9]">
          {/* HEADER */}
          <div className="flex flex-col gap-4 border-b border-black/[0.06] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[9px] font-medium uppercase tracking-[0.25em] text-[#a88950]">
                Catálogo
              </p>

              <h2 className="mt-1 text-sm font-medium">Produtos recentes</h2>

              <p className="mt-1 text-xs text-black/35">
                Últimas peças adicionadas ao catálogo.
              </p>
            </div>

            <Link
              href="/admin/produtos"
              className="group inline-flex items-center gap-2 text-xs font-medium text-black/45 transition hover:text-[#1c1b19]"
            >
              Ver todos
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* PRODUTOS */}
          {recentProducts && recentProducts.length > 0 ? (
            <div className="divide-y divide-black/[0.05]">
              {recentProducts.map((product: RecentProduct) => {
                const image = [...(product.product_images ?? [])].sort(
                  (a, b) => a.sort_order - b.sort_order,
                )[0];

                const finalPrice = product.promotional_price ?? product.price;

                return (
                  <Link
                    key={product.id}
                    href={`/admin/produtos/${product.id}`}
                    className="group flex items-center gap-4 px-6 py-4 transition hover:bg-[#faf8f4]"
                  >
                    {/* IMAGEM */}
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#f1eee8]">
                      {image?.image_url ? (
                        <img
                          src={image.image_url}
                          alt={product.name}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Package
                            className="h-5 w-5 text-black/15"
                            strokeWidth={1.4}
                          />
                        </div>
                      )}
                    </div>

                    {/* INFORMAÇÕES */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-sm font-medium text-[#1c1b19]">
                          {product.name}
                        </h3>

                        {!product.is_active && (
                          <span className="shrink-0 rounded-full bg-black/[0.05] px-2 py-0.5 text-[8px] uppercase tracking-[0.12em] text-black/40">
                            Inativo
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-xs text-black/35">
                        {product.materials?.[0]?.name ?? "Sem material"}
                      </p>
                    </div>

                    {/* PREÇO */}
                    <div className="hidden text-right sm:block">
                      {product.promotional_price !== null && (
                        <p className="text-[10px] text-black/25 line-through">
                          {formatCurrency(product.price)}
                        </p>
                      )}

                      <p className="text-sm text-black/65">
                        {formatCurrency(finalPrice)}
                      </p>
                    </div>

                    {/* SETA */}
                    <ArrowRight className="h-4 w-4 shrink-0 text-black/20 transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#a88950]" />
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="flex min-h-[280px] items-center justify-center px-6">
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f3efe7]">
                  <Package
                    className="h-6 w-6 text-[#a88950]"
                    strokeWidth={1.4}
                  />
                </div>

                <h3 className="mt-5 text-sm font-medium">
                  Nenhum produto ainda
                </h3>

                <p className="mx-auto mt-2 max-w-xs text-xs leading-5 text-black/35">
                  Cadastre a primeira peça para começar a montar seu catálogo.
                </p>

                <Link
                  href="/admin/produtos/novo"
                  className="mt-5 inline-flex items-center gap-2 text-xs font-medium text-[#a88950] transition hover:text-[#8e713e]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Cadastrar primeiro produto
                </Link>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
