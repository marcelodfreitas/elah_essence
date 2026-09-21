import Link from 'next/link'
import {
  Package,
  Plus,
  ChevronRight,
} from 'lucide-react'

import { createClient } from '@/lib/supabase/server'
import ProdutosLista from './ProdutosLista'

type Material = {
  name: string
  slug: string
}

type Category = {
  name: string
  slug: string
}

type Product = {
  id: string
  name: string
  slug: string
  price: number
  promotional_price: number | null
  stock_quantity: number
  is_active: boolean
  is_featured: boolean
  created_at: string
  materials: Material | null
  categories: Category | null
}

export default async function ProdutosPage() {
  const supabase = await createClient()

  // =========================================================
  // 1. BUSCA OS PRODUTOS
  // =========================================================
  //
  // Aqui buscamos os IDs diretamente.
  // Não dependemos dos relacionamentos aninhados do Supabase.
  //
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      slug,
      price,
      promotional_price,
      stock_quantity,
      is_active,
      is_featured,
      created_at,
      material_id,
      category_id
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar produtos:', error)
  }

  const rawProducts = products ?? []

  // =========================================================
  // 2. PEGA OS IDs ÚNICOS DE MATERIAL E CATEGORIA
  // =========================================================

  const materialIds = [
    ...new Set(
      rawProducts
        .map((product) => product.material_id)
        .filter(Boolean)
    ),
  ]

  const categoryIds = [
    ...new Set(
      rawProducts
        .map((product) => product.category_id)
        .filter(Boolean)
    ),
  ]

  // =========================================================
  // 3. BUSCA OS MATERIAIS E CATEGORIAS SEPARADAMENTE
  // =========================================================

  const [materialsResult, categoriesResult] = await Promise.all([
    materialIds.length > 0
      ? supabase
          .from('materials')
          .select(`
            id,
            name,
            slug
          `)
          .in('id', materialIds)
      : Promise.resolve({ data: [], error: null }),

    categoryIds.length > 0
      ? supabase
          .from('categories')
          .select(`
            id,
            name,
            slug
          `)
          .in('id', categoryIds)
      : Promise.resolve({ data: [], error: null }),
  ])

  if (materialsResult.error) {
    console.error(
      'Erro ao buscar materiais:',
      materialsResult.error
    )
  }

  if (categoriesResult.error) {
    console.error(
      'Erro ao buscar categorias:',
      categoriesResult.error
    )
  }

  // =========================================================
  // 4. TRANSFORMA EM MAPS
  // =========================================================

  const materialsMap = new Map(
    (materialsResult.data ?? []).map((material) => [
      material.id,
      {
        name: material.name,
        slug: material.slug,
      },
    ])
  )

  const categoriesMap = new Map(
    (categoriesResult.data ?? []).map((category) => [
      category.id,
      {
        name: category.name,
        slug: category.slug,
      },
    ])
  )

  // =========================================================
  // 5. MONTA OS PRODUTOS FINAIS
  // =========================================================

  const normalizedProducts: Product[] = rawProducts.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    promotional_price: product.promotional_price,
    stock_quantity: product.stock_quantity,
    is_active: product.is_active,
    is_featured: product.is_featured,
    created_at: product.created_at,

    materials: product.material_id
      ? materialsMap.get(product.material_id) ?? null
      : null,

    categories: product.category_id
      ? categoriesMap.get(product.category_id) ?? null
      : null,
  }))

  return (
    <div className="mx-auto w-full max-w-[1400px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">

      {/* CABEÇALHO */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.25em] text-[#a88950]">
            Catálogo
          </p>

          <h1 className="font-serif text-3xl tracking-tight sm:text-4xl">
            Produtos
          </h1>

          <p className="mt-2 text-sm text-black/45">
            Gerencie as peças disponíveis no catálogo ELAH.
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

      {/* LISTA DESKTOP */}
      <ProdutosLista products={normalizedProducts} />

      {/* MOBILE */}
      <div className="mt-6 space-y-3 md:hidden">
        {normalizedProducts.length > 0 ? (
          normalizedProducts.map((product) => (
            <Link
              key={product.id}
              href={`/admin/produtos/${product.id}`}
              className="block rounded-2xl border border-black/[0.06] bg-[#fdfcf9] p-5 transition active:scale-[0.99]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-medium">
                    {product.name}
                  </h2>

                  <p className="mt-1 text-xs text-black/40">
                    {product.materials?.name ?? 'Sem material'}
                    {' · '}
                    {product.categories?.name ?? 'Sem categoria'}
                  </p>
                </div>

                <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-black/25" />
              </div>

              <div className="mt-5 flex items-end justify-between">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.15em] text-black/30">
                    Preço
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    {formatCurrency(
                      product.promotional_price ?? product.price
                    )}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[9px] uppercase tracking-[0.15em] text-black/30">
                    Estoque
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    {product.stock_quantity}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] ${
                    product.is_active
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-red-50 text-red-600'
                  }`}
                >
                  {product.is_active ? 'Ativo' : 'Inativo'}
                </span>

                {product.is_featured && (
                  <span className="rounded-full bg-[#f3efe7] px-2.5 py-1 text-[10px] text-[#a88950]">
                    Destaque
                  </span>
                )}
              </div>
            </Link>
          ))
        ) : (
          <EmptyProducts />
        )}
      </div>
    </div>
  )
}

function EmptyProducts() {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f3efe7]">
        <Package
          className="h-6 w-6 text-[#a88950]"
          strokeWidth={1.5}
        />
      </div>

      <h2 className="mt-5 text-sm font-medium">
        Nenhum produto cadastrado
      </h2>

      <p className="mt-2 max-w-sm text-xs leading-5 text-black/35">
        Comece adicionando a primeira peça ao catálogo ELAH.
      </p>

      <Link
        href="/admin/produtos/novo"
        className="mt-5 inline-flex items-center gap-2 text-xs font-medium text-[#a88950] hover:underline"
      >
        <Plus className="h-3.5 w-3.5" />
        Cadastrar produto
      </Link>
    </div>
  )
}

function formatCurrency(value: number | null) {
  if (value === null || value === undefined) {
    return '—'
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}