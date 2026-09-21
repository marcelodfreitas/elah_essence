import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { notFound } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import ProductGallery from './ProductGallery'
import ProductPurchasePanel from './ProductPurchasePanel'

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

type ProductVariant = {
  id: string
  name: string | null
  size: string | null
  sku: string | null
  price: number | null
  stock_quantity: number
  is_active: boolean
}

type Product = {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  promotional_price: number | null
  stock_quantity: number | null
  has_variants: boolean
  material_id: string
  category_id: string
  is_active: boolean
  product_images: ProductImage[]
  product_variants: ProductVariant[]
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

  /*
   * =========================
   * MATERIAL
   * =========================
   */

  const { data: material, error: materialError } = await supabase
    .from('materials')
    .select('id, name, slug')
    .eq('slug', materialSlug)
    .single()

  if (materialError || !material) {
    notFound()
  }

  /*
   * =========================
   * CATEGORIA
   * =========================
   */

  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('slug', categorySlug)
    .single()

  if (categoryError || !category) {
    notFound()
  }

  /*
   * =========================
   * PRODUTO
   * =========================
   */

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
      has_variants,
      material_id,
      category_id,
      is_active,
      product_images (
        id,
        image_url,
        sort_order
      ),
      product_variants (
        id,
        name,
        size,
        sku,
        price,
        stock_quantity,
        is_active
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

  /*
   * =========================
   * IMAGENS
   * =========================
   */

  const images = [...(product.product_images ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order
  )

  /*
   * =========================
   * VARIANTES
   * =========================
   */

  const variants = [...(product.product_variants ?? [])]
    .filter((variant) => variant.is_active)
    .sort((a, b) => {
      const sizeA = Number(a.size)
      const sizeB = Number(b.size)

      if (!Number.isNaN(sizeA) && !Number.isNaN(sizeB)) {
        return sizeA - sizeB
      }

      return (a.size ?? '').localeCompare(
        b.size ?? '',
        'pt-BR',
        { numeric: true }
      )
    })

  /*
   * =========================
   * ESTOQUE
   * =========================
   */

  const variantStock = variants.reduce(
    (total, variant) => total + (variant.stock_quantity || 0),
    0
  )

  const isAvailable = product.has_variants
    ? variants.some((variant) => variant.stock_quantity > 0)
    : product.stock_quantity === null ||
      product.stock_quantity > 0

  /*
   * =========================
   * WHATSAPP
   * =========================
   *
   * Mantemos o número atual por enquanto.
   * Depois podemos puxar isso de store_settings.
   */

  const whatsappNumber = '5551994301670'

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

            {/* COMPRA / VARIAÇÕES */}
            <ProductPurchasePanel
              productName={product.name}
              materialName={material.name}
              categoryName={category.name}
              basePrice={product.price}
              promotionalPrice={product.promotional_price}
              stockQuantity={product.stock_quantity}
              hasVariants={product.has_variants}
              variants={variants}
              variantStock={variantStock}
              isAvailable={isAvailable}
              whatsappNumber={whatsappNumber}
            />

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