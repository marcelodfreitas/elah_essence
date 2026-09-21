import { createClient } from '@/lib/supabase/server'
import { ProductForm } from '@/components/admin/products/ProductForm'

export default async function NovoProdutoPage() {
  const supabase = await createClient()

  const [
    { data: materials, error: materialsError },
    { data: categories, error: categoriesError },
  ] = await Promise.all([
    supabase
      .from('materials')
      .select('id, name, slug')
      .order('sort_order', { ascending: true }),

    supabase
      .from('categories')
      .select('id, name, slug')
      .order('sort_order', { ascending: true }),
  ])

  if (materialsError || categoriesError) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <p className="text-sm text-red-700">
            Não foi possível carregar os dados do formulário.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:py-10">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-[#a88950]">
          Catálogo
        </p>

        <h1 className="mt-2 font-serif text-3xl tracking-tight sm:text-4xl">
          Novo produto
        </h1>

        <p className="mt-2 text-sm text-black/45">
          Cadastre uma nova peça no catálogo ELAH.
        </p>
      </div>

      <ProductForm
        materials={materials ?? []}
        categories={categories ?? []}
      />
    </div>
  )
}