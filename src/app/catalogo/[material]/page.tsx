import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { notFound } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

type PageProps = {
  params: Promise<{
    material: string
  }>
}

type Material = {
  id: string
  name: string
  slug: string
  description: string | null
}

type Category = {
  id: string
  name: string
  slug: string
}

type ProductImage = {
  image_url: string
  sort_order: number
}

type Product = {
  id: string
  name: string
  slug: string
  price: number
  promotional_price: number | null
  is_featured: boolean
  category: Category | null
  product_images: ProductImage[]
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export default async function MaterialPage({ params }: PageProps) {
  const { material: materialSlug } = await params

  const supabase = await createClient()

  const { data: material, error: materialError } = await supabase
    .from('materials')
    .select('id, name, slug, description')
    .eq('slug', materialSlug)
    .single()

  if (materialError || !material) {
    notFound()
  }

  const { data: products, error: productsError } = await supabase
    .from('products')
    .select(`
      id,
      name,
      slug,
      price,
      promotional_price,
      is_featured,
      categories (
        id,
        name,
        slug
      ),
      product_images (
        image_url,
        sort_order
      )
    `)
    .eq('material_id', material.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (productsError) {
    return (
      <main className="min-h-screen bg-[#f8f6f2] px-5 py-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm text-black/50">
            Não foi possível carregar esta coleção.
          </p>
        </div>
      </main>
    )
  }

  /*
   * O Supabase retorna os relacionamentos como arrays.
   * Como cada produto pertence a uma única categoria,
   * normalizamos aqui para trabalhar com um objeto único
   * no restante da página.
   */
  const normalizedProducts: Product[] = (products ?? []).map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    promotional_price: product.promotional_price,
    is_featured: product.is_featured,
    category: product.categories?.[0] ?? null,
    product_images: product.product_images ?? [],
  }))

  const categories = Array.from(
    new Map(
      normalizedProducts
        .filter((product) => product.category)
        .map((product) => [
          product.category!.id,
          product.category!,
        ])
    ).values()
  )

  return (
    <main className="min-h-screen bg-[#f8f6f2] text-[#1c1b19]">
      {/* HEADER */}
      <header className="border-b border-black/[0.06] bg-[#f8f6f2]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6 sm:px-8 lg:px-12">
          <Link
            href="/catalogo"
            className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-black/45 transition hover:text-black"
          >
            <ArrowLeft className="h-4 w-4" />
            Catálogo
          </Link>

          <Link
            href="/catalogo"
            className="font-serif text-2xl tracking-[0.18em]"
          >
            ELAH
          </Link>

          <div className="w-20" />
        </div>
      </header>

      {/* INTRO */}
      <section className="px-5 pb-12 pt-16 sm:px-8 sm:pb-16 sm:pt-20 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#a88950]">
            Coleção
          </p>

          <h1 className="mt-3 font-serif text-5xl tracking-tight sm:text-6xl lg:text-7xl">
            {material.name}
          </h1>

          {material.description && (
            <p className="mt-5 max-w-xl text-sm leading-7 text-black/50 sm:text-base">
              {material.description}
            </p>
          )}
        </div>
      </section>

      {/* CATEGORIAS */}
      {categories.length > 0 && (
        <section className="border-y border-black/[0.06] bg-white px-5 sm:px-8 lg:px-12">
          <div className="mx-auto flex max-w-7xl gap-6 overflow-x-auto py-5 scrollbar-hide">
            <Link
              href={`/catalogo/${material.slug}`}
              className="shrink-0 text-[10px] uppercase tracking-[0.18em] text-black"
            >
              Todas
            </Link>

            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/catalogo/${material.slug}/${category.slug}`}
                className="shrink-0 text-[10px] uppercase tracking-[0.18em] text-black/40 transition hover:text-black"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* PRODUTOS */}
      <section className="px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
        <div className="mx-auto max-w-7xl">
          {normalizedProducts.length > 0 ? (
            <>
              <div className="mb-8 flex items-center justify-between">
                <p className="text-xs text-black/40">
                  {normalizedProducts.length}{' '}
                  {normalizedProducts.length === 1 ? 'peça' : 'peças'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
                {normalizedProducts.map((product) => {
                  const image = [...product.product_images].sort(
                    (a, b) => a.sort_order - b.sort_order
                  )[0]

                  const hasPromotion =
                    product.promotional_price !== null

                  const finalPrice =
                    product.promotional_price ?? product.price

                  return (
                    <Link
                      key={product.id}
                      href={`/catalogo/${material.slug}/${product.category?.slug ?? 'outros'}/${product.slug}`}
                      className="group"
                    >
                      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#eeeae3]">
                        {image?.image_url ? (
                          <img
                            src={image.image_url}
                            alt={product.name}
                            className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.035]"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-[0.2em] text-black/25">
                            ELAH
                          </div>
                        )}

                        {product.is_featured && (
                          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1.5 text-[9px] uppercase tracking-[0.16em] backdrop-blur-sm">
                            Destaque
                          </span>
                        )}
                      </div>

                      <div className="mt-4">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-black/35">
                          {product.category?.name ?? 'ELAH'}
                        </p>

                        <h2 className="mt-1 font-serif text-lg">
                          {product.name}
                        </h2>

                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-sm text-black/65">
                            {formatCurrency(finalPrice)}
                          </span>

                          {hasPromotion && (
                            <span className="text-xs text-black/30 line-through">
                              {formatCurrency(product.price)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="py-24 text-center">
              <p className="font-serif text-3xl">
                Nenhuma peça disponível
              </p>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-black/45">
                Estamos preparando novas peças para esta coleção.
              </p>

              <Link
                href="/catalogo"
                className="mt-7 inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em]"
              >
                Voltar ao catálogo
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}