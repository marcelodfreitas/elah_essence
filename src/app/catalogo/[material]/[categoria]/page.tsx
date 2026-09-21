import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { notFound } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

type PageProps = {
  params: Promise<{
    material: string
    categoria: string
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
  categories: Category | null
  product_images: ProductImage[]
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export default async function CategoriaPage({
  params,
}: PageProps) {
  const {
    material: materialSlug,
    categoria: categorySlug,
  } = await params

  const supabase = await createClient()

  // Buscar material
  const { data: material, error: materialError } = await supabase
    .from('materials')
    .select('id, name, slug, description')
    .eq('slug', materialSlug)
    .single()

  if (materialError || !material) {
    notFound()
  }

  // Buscar categoria
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('slug', categorySlug)
    .single()

  if (categoryError || !category) {
    notFound()
  }

  // Buscar produtos da combinação material + categoria
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
    .eq('category_id', category.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (productsError) {
    return (
      <main className="min-h-screen bg-[#f8f6f2] px-5 py-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm text-black/50">
            Não foi possível carregar esta categoria.
          </p>
        </div>
      </main>
    )
  }

  // Normalizar relacionamento categories
  const normalizedProducts: Product[] = (products ?? []).map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    promotional_price: product.promotional_price,
    is_featured: product.is_featured,
    categories: product.categories?.[0] ?? null,
    product_images: product.product_images ?? [],
  }))

  // Buscar todas as categorias que possuem produtos ativos
  const { data: categoryProducts } = await supabase
    .from('products')
    .select(`
      categories (
        id,
        name,
        slug
      )
    `)
    .eq('material_id', material.id)
    .eq('is_active', true)

  // Normalizar categorias relacionadas aos produtos
  const normalizedCategories: Category[] = (categoryProducts ?? [])
    .map((product) => product.categories?.[0] ?? null)
    .filter((category): category is Category => category !== null)

  // Remover categorias duplicadas
  const categories = Array.from(
    new Map(
      normalizedCategories.map((item) => [item.id, item])
    ).values()
  )

  return (
    <main className="min-h-screen bg-[#f8f6f2] text-[#1c1b19]">
      {/* HEADER */}
      <header className="border-b border-black/[0.06] bg-[#f8f6f2]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6 sm:px-8 lg:px-12">
          <Link
            href={`/catalogo/${material.slug}`}
            className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-black/45 transition hover:text-black"
          >
            <ArrowLeft className="h-4 w-4" />
            {material.name}
          </Link>

          <Link
            href="/"
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
          <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-black/35">
            <Link
              href={`/catalogo/${material.slug}`}
              className="transition hover:text-black"
            >
              {material.name}
            </Link>

            <span>/</span>

            <span className="text-[#a88950]">
              {category.name}
            </span>
          </div>

          <h1 className="mt-4 font-serif text-5xl tracking-tight sm:text-6xl lg:text-7xl">
            {category.name}
          </h1>

          <p className="mt-5 max-w-xl text-sm leading-7 text-black/50 sm:text-base">
            Explore nossa seleção de {category.name.toLowerCase()} em{' '}
            {material.name.toLowerCase()}.
          </p>
        </div>
      </section>

      {/* CATEGORIAS */}
      {categories.length > 0 && (
        <section className="border-y border-black/[0.06] bg-white px-5 sm:px-8 lg:px-12">
          <div className="mx-auto flex max-w-7xl gap-6 overflow-x-auto py-5">
            <Link
              href={`/catalogo/${material.slug}`}
              className="shrink-0 text-[10px] uppercase tracking-[0.18em] text-black/40 transition hover:text-black"
            >
              Todas
            </Link>

            {categories.map((item) => {
              const isCurrent = item.slug === category.slug

              return (
                <Link
                  key={item.id}
                  href={`/catalogo/${material.slug}/${item.slug}`}
                  className={`shrink-0 text-[10px] uppercase tracking-[0.18em] transition ${
                    isCurrent
                      ? 'text-black'
                      : 'text-black/40 hover:text-black'
                  }`}
                >
                  {item.name}
                </Link>
              )
            })}
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
                  const image = [...(product.product_images ?? [])].sort(
                    (a, b) => a.sort_order - b.sort_order
                  )[0]

                  const hasPromotion =
                    product.promotional_price !== null

                  const finalPrice =
                    product.promotional_price ?? product.price

                  return (
                    <Link
                      key={product.id}
                      href={`/catalogo/${material.slug}/${category.slug}/${product.slug}`}
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
                          {product.categories?.name}
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
                Ainda não temos peças disponíveis nesta categoria.
              </p>

              <Link
                href={`/catalogo/${material.slug}`}
                className="mt-7 inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em]"
              >
                Voltar para {material.name}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-black/[0.06] bg-[#f8f6f2] px-5 py-12 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-serif text-xl tracking-[0.16em]">
            ELAH
          </span>

          <p className="text-xs text-black/40">
            Joias para momentos que permanecem.
          </p>
        </div>
      </footer>
    </main>
  )
}