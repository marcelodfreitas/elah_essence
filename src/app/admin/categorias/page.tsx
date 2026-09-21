import Link from 'next/link'
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Edit3,
  Gem,
  Plus,
  Tag,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react'

import { createClient } from '@/lib/supabase/server'

type Material = {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  is_active: boolean
  sort_order: number
}

type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  is_active: boolean
  sort_order: number
}

type Product = {
  id: string
  category_id: string
  material_id: string
}

export default async function CategoriasPage() {
  const supabase = await createClient()

  const [
    { data: materials, error: materialsError },
    { data: categories, error: categoriesError },
    { data: products, error: productsError },
  ] = await Promise.all([
    supabase
      .from('materials')
      .select(
        `
          id,
          name,
          slug,
          description,
          image_url,
          is_active,
          sort_order
        `
      )
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true }),

    supabase
      .from('categories')
      .select(
        `
          id,
          name,
          slug,
          description,
          image_url,
          is_active,
          sort_order
        `
      )
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true }),

    supabase
      .from('products')
      .select('id, category_id, material_id'),
  ])

  if (materialsError || categoriesError || productsError) {
    return (
      <div className="min-h-full bg-[#f7f5f1] text-[#1c1b19]">
        <div className="mx-auto w-full max-w-[1400px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          <div className="rounded-2xl border border-red-200 bg-[#fffafa] px-6 py-8">
            <p className="text-sm font-medium text-red-700">
              Não foi possível carregar as categorias.
            </p>

            <p className="mt-2 text-xs leading-5 text-red-600/80">
              Verifique a conexão com o banco de dados e tente
              novamente.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const materialList = (materials ?? []) as Material[]
  const categoryList = (categories ?? []) as Category[]
  const productList = (products ?? []) as Product[]

  const getMaterialProductCount = (materialId: string) =>
    productList.filter(
      (product) => product.material_id === materialId
    ).length

  const getCategoryProductCount = (categoryId: string) =>
    productList.filter(
      (product) => product.category_id === categoryId
    ).length

  const activeMaterials = materialList.filter(
    (material) => material.is_active
  ).length

  const activeCategories = categoryList.filter(
    (category) => category.is_active
  ).length

  return (
    <div className="min-h-full bg-[#f7f5f1] text-[#1c1b19]">
      <div className="mx-auto w-full max-w-[1400px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
        
        <Link
  href="/admin"
  className="group mb-6 cursor-pointer inline-flex items-center gap-2 text-sm font-medium text-black/50 transition-all duration-300 hover:text-[#1c1b19]"
>
  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-black/[0.07] bg-[#fdfcf9] transition-all duration-300 group-hover:-translate-x-0.5 group-hover:border-[#a88950]/40 group-hover:bg-[#fbf8f1]">
    <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5 group-hover:text-[#a88950]" />
  </span>

  <span className="relative">
    Voltar

    <span className="absolute -bottom-1 left-0 h-px w-0 bg-[#a88950] transition-all duration-300 group-hover:w-full" />
  </span>
</Link>

        {/* Cabeçalho */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.25em] text-[#a88950]">
              Organização
            </p>

            <h1 className="font-serif text-3xl tracking-tight text-[#1c1b19] sm:text-4xl">
              Categorias
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-black/45">
              Organize os materiais e categorias utilizados no
              catálogo ELAH.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="/admin/categorias/nova"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1c1b19] px-5 text-sm font-medium text-white transition hover:bg-[#302e2a]"
            >
              <Plus className="h-4 w-4" />
              Nova categoria
            </Link>

            <Link
              href="/admin/materiais/novo"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-black/[0.08] bg-[#fdfcf9] px-5 text-sm font-medium text-black/65 transition hover:border-black/[0.15] hover:bg-white hover:text-black"
            >
              <Gem
                className="h-4 w-4 text-[#a88950]"
                strokeWidth={1.5}
              />
              Novo material
            </Link>
          </div>
        </div>

        {/* Indicadores */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-black/[0.06] bg-[#fdfcf9] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-black/35">
                  Materiais
                </p>

                <p className="mt-3 text-2xl font-medium tracking-tight text-[#1c1b19]">
                  {materialList.length}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f3efe7]">
                <Gem
                  className="h-[18px] w-[18px] text-[#a88950]"
                  strokeWidth={1.6}
                />
              </div>
            </div>

            <p className="mt-2 text-xs text-black/35">
              {activeMaterials} ativos
            </p>
          </div>

          <div className="rounded-2xl border border-black/[0.06] bg-[#fdfcf9] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-black/35">
                  Categorias
                </p>

                <p className="mt-3 text-2xl font-medium tracking-tight text-[#1c1b19]">
                  {categoryList.length}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f3efe7]">
                <Tag
                  className="h-[18px] w-[18px] text-[#a88950]"
                  strokeWidth={1.6}
                />
              </div>
            </div>

            <p className="mt-2 text-xs text-black/35">
              {activeCategories} ativas
            </p>
          </div>

          <div className="rounded-2xl border border-black/[0.06] bg-[#fdfcf9] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-black/35">
                  Produtos
                </p>

                <p className="mt-3 text-2xl font-medium tracking-tight text-[#1c1b19]">
                  {productList.length}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f3efe7]">
                <Check
                  className="h-[18px] w-[18px] text-[#a88950]"
                  strokeWidth={1.6}
                />
              </div>
            </div>

            <p className="mt-2 text-xs text-black/35">
              vinculados às categorias
            </p>
          </div>

          <div className="rounded-2xl border border-black/[0.06] bg-[#fdfcf9] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-black/35">
                  Organização
                </p>

                <p className="mt-3 text-2xl font-medium tracking-tight text-[#1c1b19]">
                  {
                    categoryList.filter(
                      (category) => category.sort_order > 0
                    ).length
                  }
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f3efe7]">
                <Check
                  className="h-[18px] w-[18px] text-[#a88950]"
                  strokeWidth={1.6}
                />
              </div>
            </div>

            <p className="mt-2 text-xs text-black/35">
              categorias com ordem definida
            </p>
          </div>
        </div>

        {/* Materiais */}
        <section className="mt-8 overflow-hidden rounded-2xl border border-black/[0.06] bg-[#fdfcf9]">
          <div className="flex flex-col gap-4 border-b border-black/[0.06] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-medium text-[#1c1b19]">
                Materiais
              </h2>

              <p className="mt-1 text-xs text-black/35">
                Os materiais disponíveis para seus produtos.
              </p>
            </div>

            <span className="text-[10px] uppercase tracking-[0.18em] text-black/30">
              {materialList.length}{' '}
              {materialList.length === 1
                ? 'material'
                : 'materiais'}
            </span>
          </div>

          {materialList.length > 0 ? (
            <div className="divide-y divide-black/[0.06]">
              {materialList.map((material) => {
                const productCount =
                  getMaterialProductCount(material.id)

                return (
                  <div
                    key={material.id}
                    className="flex flex-col gap-4 bg-[#fdfcf9] px-6 py-5 transition hover:bg-[#faf9f6] sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f3efe7]">
                        <Gem
                          className="h-5 w-5 text-[#a88950]"
                          strokeWidth={1.5}
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-medium text-[#1c1b19]">
                            {material.name}
                          </h3>

                          {material.is_active ? (
                            <span className="rounded-full bg-[#edf7f0] px-2 py-1 text-[9px] font-medium uppercase tracking-[0.12em] text-[#39734b]">
                              Ativo
                            </span>
                          ) : (
                            <span className="rounded-full bg-black/[0.04] px-2 py-1 text-[9px] font-medium uppercase tracking-[0.12em] text-black/35">
                              Inativo
                            </span>
                          )}
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-black/35">
                          <span>/{material.slug}</span>

                          <span className="h-1 w-1 rounded-full bg-black/20" />

                          <span>
                            {productCount}{' '}
                            {productCount === 1
                              ? 'produto'
                              : 'produtos'}
                          </span>

                          <span className="h-1 w-1 rounded-full bg-black/20" />

                          <span>
                            ordem {material.sort_order}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* <button
                        type="button"
                        disabled
                        title="Em breve"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-black/20"
                      >
                        {material.is_active ? (
                          <ToggleRight className="h-5 w-5" />
                        ) : (
                          <ToggleLeft className="h-5 w-5" />
                        )}
                      </button> */}

                     <Link
                        href={`/admin/materiais/${material.id}`}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-black/30 transition hover:bg-black/[0.04] hover:text-black"
                        title="Editar material"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Link>

                      <Link
                        href={`/catalogo/${material.slug}`}
                        target="_blank"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-black/30 transition hover:bg-black/[0.04] hover:text-black"
                        title="Ver no catálogo"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-[#fdfcf9] px-6 py-16 text-center">
              <Gem className="mx-auto h-7 w-7 text-black/20" />

              <p className="mt-4 text-sm font-medium text-[#1c1b19]">
                Nenhum material cadastrado
              </p>

              <p className="mt-2 text-xs text-black/35">
                Cadastre materiais como Prata ou Ouro para
                organizar seu catálogo.
              </p>
            </div>
          )}
        </section>

        {/* Categorias */}
        <section className="mt-6 overflow-hidden rounded-2xl border border-black/[0.06] bg-[#fdfcf9]">
          <div className="flex flex-col gap-4 border-b border-black/[0.06] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-medium text-[#1c1b19]">
                Categorias de produtos
              </h2>

              <p className="mt-1 text-xs text-black/35">
                Organize suas peças por tipo.
              </p>
            </div>

            <span className="text-[10px] uppercase tracking-[0.18em] text-black/30">
              {categoryList.length}{' '}
              {categoryList.length === 1
                ? 'categoria'
                : 'categorias'}
            </span>
          </div>

          {categoryList.length > 0 ? (
            <div className="grid gap-px bg-black/[0.06] sm:grid-cols-2 xl:grid-cols-3">
              {categoryList.map((category) => {
                const productCount =
                  getCategoryProductCount(category.id)

                return (
                  <div
                    key={category.id}
                    className="group bg-[#fdfcf9] p-6 transition hover:bg-white"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f3efe7]">
                        <Tag
                          className="h-5 w-5 text-[#a88950]"
                          strokeWidth={1.5}
                        />
                      </div>

                      {category.is_active ? (
                        <span className="rounded-full bg-[#edf7f0] px-2 py-1 text-[9px] font-medium uppercase tracking-[0.12em] text-[#39734b]">
                          Ativa
                        </span>
                      ) : (
                        <span className="rounded-full bg-black/[0.04] px-2 py-1 text-[9px] font-medium uppercase tracking-[0.12em] text-black/35">
                          Inativa
                        </span>
                      )}
                    </div>

                    <div className="mt-5">
                      <h3 className="font-serif text-2xl text-[#1c1b19]">
                        {category.name}
                      </h3>

                      <p className="mt-1 text-xs text-black/35">
                        /{category.slug}
                      </p>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-black/[0.06] pt-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.16em] text-black/30">
                          Produtos
                        </p>

                        <p className="mt-1 text-sm font-medium text-[#1c1b19]">
                          {productCount}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] uppercase tracking-[0.16em] text-black/30">
                          Ordem
                        </p>

                        <p className="mt-1 text-right text-sm font-medium text-[#1c1b19]">
                          {category.sort_order}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center gap-2">
                      <button
                        type="button"
                        disabled
                        className="flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-black/[0.07] text-xs text-black/25"
                      >
                        {category.is_active ? (
                          <ToggleRight className="h-4 w-4" />
                        ) : (
                          <ToggleLeft className="h-4 w-4" />
                        )}

                        {category.is_active
                          ? 'Ativa'
                          : 'Inativa'}
                      </button>

                      <Link
                        href={`/admin/categorias/${category.id}`}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-black/[0.07] text-black/25"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Link>

                      <Link
                        href={`/catalogo/${category.slug}`}
                        target="_blank"
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-black/[0.07] text-black/30 transition hover:bg-black/[0.04] hover:text-black"
                        title="Ver no catálogo"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-[#fdfcf9] px-6 py-16 text-center">
              <Tag className="mx-auto h-7 w-7 text-black/20" />

              <p className="mt-4 text-sm font-medium text-[#1c1b19]">
                Nenhuma categoria cadastrada
              </p>

              <p className="mt-2 text-xs text-black/35">
                Crie categorias como Anéis, Brincos ou
                Pulseiras.
              </p>

              <Link
                href="/admin/categorias/nova"
                className="mt-5 inline-flex items-center gap-2 text-xs font-medium text-[#a88950] hover:underline"
              >
                <Plus className="h-3.5 w-3.5" />
                Criar primeira categoria
              </Link>
            </div>
          )}
        </section>

        {/* Informação */}
        <div className="mt-6 rounded-2xl border border-[#c8aa6e]/20 bg-[#fbf8f1] px-6 py-5">
          <div className="flex gap-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f3ead9]">
              <Gem
                className="h-4 w-4 text-[#a88950]"
                strokeWidth={1.5}
              />
            </div>

            <div>
              <p className="text-sm font-medium text-[#1c1b19]">
                Organização do catálogo
              </p>

              <p className="mt-1 max-w-3xl text-xs leading-5 text-black/45">
                Materiais definem a coleção principal, como
                Prata ou Ouro. As categorias definem o tipo da
                peça, como Anéis, Brincos e Correntes. Essa
                estrutura também determina como suas clientes
                navegam pelo catálogo público.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}