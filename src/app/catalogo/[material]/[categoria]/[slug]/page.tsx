import Link from 'next/link'
import { ArrowLeft, ArrowRight, Check, MessageCircle } from 'lucide-react'
import { notFound } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import ProductGallery from './ProductGallery'

type PageProps = {
  params: Promise<{
    material: string
    categoria: string
    slug: string
  }>
}

type Material = {
  id: string
  name: string
  slug: string
}

type Category = {
  id: string
  name: string
  slug: string
}

type ProductImage = {
  id?: string
  image_url: string
  sort_order: number
}

type Product = {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  promotional_price: number | null
  stock_quantity: number | null
  material_id: string
  category_id: string
  is_active: boolean
  product_images: ProductImage[]
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export default async function ProdutoPage({
  params,
}: PageProps) {
  const {
    material: materialSlug,
    categoria: categorySlug,
    slug: productSlug,
  } = await params

  const supabase = await createClient()

  // Buscar material
  const { data: material, error: materialError } = await supabase
    .from('materials')
    .select('id, name, slug')
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

  // Buscar produto
  const { data: product, error: productError } = await supabase
    .from('products')
    .select(`
      id,
      name,
      slug,
      description,
      price,
      promotional_price,
      stock_quantity,
      material_id,
      category_id,
      is_active,
      product_images (
        id,
        image_url,
        sort_order
      )
    `)
    .eq('slug', productSlug)
    .eq('material_id', material.id)
    .eq('category_id', category.id)
    .eq('is_active', true)
    .single()

  if (productError || !product) {
    notFound()
  }

  const images = [...(product.product_images ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order
  )

  const hasPromotion = product.promotional_price !== null

  const finalPrice =
    product.promotional_price ?? product.price

  const isAvailable =
    product.stock_quantity === null ||
    product.stock_quantity > 0

  /*
   * IMPORTANTE:
   * Troque pelo número do WhatsApp da ELAH.
   *
   * Formato:
   * 5551999999999
   *
   * Não coloque +, espaços, parênteses ou hífens.
   */
  const whatsappNumber = '5551994301670'

  const whatsappMessage = [
    `Olá! Gostaria de separar a peça *${product.name}*.`,
    '',
    `Material: ${material.name}`,
    `Categoria: ${category.name}`,
    `Valor: ${formatCurrency(finalPrice)}`,
    '',
    'Gostaria de saber mais informações sobre disponibilidade.',
  ].join('\n')

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    whatsappMessage
  )}`

  return (
    <main className="min-h-screen bg-[#f8f6f2] text-[#1c1b19]">
      {/* HEADER */}
      <header className="border-b border-black/[0.06] bg-[#f8f6f2]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6 sm:px-8 lg:px-12">
          <Link
            href={`/catalogo/${material.slug}/${category.slug}`}
            className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-black/45 transition hover:text-black"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
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

      {/* BREADCRUMB */}
      <section className="px-5 pb-8 pt-8 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-black/35">
            <Link
              href={`/catalogo/${material.slug}`}
              className="transition hover:text-black"
            >
              {material.name}
            </Link>

            <span>/</span>

            <Link
              href={`/catalogo/${material.slug}/${category.slug}`}
              className="transition hover:text-black"
            >
              {category.name}
            </Link>

            <span>/</span>

            <span className="text-black/60">
              {product.name}
            </span>
          </div>
        </div>
      </section>

      {/* PRODUTO */}
      <section className="px-5 pb-20 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          {/* GALERIA */}
          <ProductGallery
            images={images}
            productName={product.name}
          />

          {/* INFORMAÇÕES */}
          <div className="flex flex-col justify-center">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#a88950]">
              {category.name}
            </p>

            <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl lg:text-6xl">
              {product.name}
            </h1>

            <div className="mt-6 h-px w-16 bg-[#a88950]" />

            {/* MATERIAL */}
            <div className="mt-7">
              <p className="text-[10px] uppercase tracking-[0.18em] text-black/35">
                Material
              </p>

              <p className="mt-2 text-sm text-black/70">
                {material.name}
              </p>
            </div>

            {/* PREÇO */}
            <div className="mt-7">
              <p className="text-[10px] uppercase tracking-[0.18em] text-black/35">
                Valor
              </p>

              <div className="mt-2 flex items-center gap-3">
                <span className="text-2xl text-black/75">
                  {formatCurrency(finalPrice)}
                </span>

                {hasPromotion && (
                  <span className="text-sm text-black/30 line-through">
                    {formatCurrency(product.price)}
                  </span>
                )}
              </div>

              {hasPromotion && (
                <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-[#a88950]">
                  Condição especial
                </p>
              )}
            </div>

            {/* DESCRIÇÃO */}
            {product.description && (
              <div className="mt-8">
                <p className="text-[10px] uppercase tracking-[0.18em] text-black/35">
                  Sobre a peça
                </p>

                <p className="mt-3 max-w-xl whitespace-pre-line text-sm leading-7 text-black/55">
                  {product.description}
                </p>
              </div>
            )}

            {/* DISPONIBILIDADE */}
            <div className="mt-8 flex items-center gap-2">
              {isAvailable ? (
                <>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e8eee5]">
                    <Check className="h-3.5 w-3.5 text-[#60705a]" />
                  </span>

                  <span className="text-xs text-black/55">
                    Peça disponível
                  </span>
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-black/30" />

                  <span className="text-xs text-black/45">
                    Peça indisponível
                  </span>
                </>
              )}
            </div>

            {/* WHATSAPP */}
            {isAvailable && (
              <div className="mt-10">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex w-full items-center justify-between rounded-full bg-[#1c1b19] px-6 py-5 text-white transition hover:bg-[#a88950]"
                >
                  <span className="flex items-center gap-3">
                    <MessageCircle className="h-5 w-5" />

                    <span className="text-xs uppercase tracking-[0.16em]">
                      Separar peça pelo WhatsApp
                    </span>
                  </span>

                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </a>

                <p className="mt-3 text-center text-[10px] leading-5 text-black/35">
                  Você será direcionada para o WhatsApp para confirmar
                  disponibilidade e atendimento.
                </p>
              </div>
            )}

            {/* VOLTAR */}
            <Link
              href={`/catalogo/${material.slug}/${category.slug}`}
              className="mt-8 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-black/40 transition hover:text-black"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Ver outras peças
            </Link>
          </div>
        </div>
      </section>

      {/* RODAPÉ */}
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