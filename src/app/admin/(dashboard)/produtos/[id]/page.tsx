import { notFound } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { ProductForm } from '@/components/admin/products/ProductForm'

type EditarProdutoPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function EditarProdutoPage({
  params,
}: EditarProdutoPageProps) {
  const { id } = await params

  const supabase = await createClient()

  const [
    { data: product, error: productError },
    { data: materials, error: materialsError },
    { data: categories, error: categoriesError },
    { data: images, error: imagesError },
  ] = await Promise.all([
    supabase
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
        is_featured,
        is_active,
        material_id,
        category_id
      `)
      .eq('id', id)
      .single(),

    supabase
      .from('materials')
      .select('id, name, slug')
      .order('sort_order', { ascending: true }),

    supabase
      .from('categories')
      .select('id, name, slug')
      .order('sort_order', { ascending: true }),

    supabase
      .from('product_images')
      .select(`
        id,
        image_url,
        storage_path,
        alt_text,
        sort_order
      `)
      .eq('product_id', id)
      .order('sort_order', { ascending: true }),
  ])

  if (
    productError ||
    materialsError ||
    categoriesError ||
    imagesError
  ) {
    notFound()
  }

  if (!product) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:py-10">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-[#a88950]">
          Catálogo
        </p>

        <h1 className="mt-2 font-serif text-3xl tracking-tight sm:text-4xl">
          Editar produto
        </h1>

        <p className="mt-2 text-sm text-black/45">
          Atualize as informações da peça e gerencie suas fotos.
        </p>
      </div>

      <ProductForm
        materials={materials ?? []}
        categories={categories ?? []}
        product={product}
        existingImages={images ?? []}
      />
    </div>
  )
}