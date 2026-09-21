'use client'

import Link from 'next/link'
import {
  Package,
  Plus,
  Search,
  ChevronRight,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'

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
  materials: {
    name: string
    slug: string
  } | null
  categories: {
    name: string
    slug: string
  } | null
}

export default function ProdutosLista({
  products,
}: {
  products: Product[]
}) {
  const [search, setSearch] = useState('')

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase()

    if (!term) {
      return products
    }

    return products.filter((product) => {
      return (
        product.name.toLowerCase().includes(term) ||
        product.slug.toLowerCase().includes(term) ||
        product.materials?.name
          ?.toLowerCase()
          .includes(term) ||
        product.categories?.name
          ?.toLowerCase()
          .includes(term)
      )
    })
  }, [products, search])

  const hasSearch = search.trim().length > 0

  return (
    <>
      {/* Busca */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/30" />

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Buscar produto..."
            className="h-11 w-full rounded-xl border border-black/[0.07] bg-[#fdfcf9] pl-11 pr-10 text-sm outline-none transition placeholder:text-black/30 focus:border-[#b99a60] focus:ring-2 focus:ring-[#b99a60]/10"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-black/30 transition hover:bg-black/[0.04] hover:text-black/60"
              aria-label="Limpar busca"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Resultado */}
      {hasSearch && (
        <div className="mt-5 flex items-center justify-between">
          <p className="text-xs text-black/40">
            {filteredProducts.length === 0
              ? 'Nenhum resultado encontrado'
              : filteredProducts.length === 1
                ? '1 produto encontrado'
                : `${filteredProducts.length} produtos encontrados`}
          </p>

          {filteredProducts.length > 0 && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="text-xs font-medium text-[#a88950] transition hover:text-[#8d713f]"
            >
              Limpar busca
            </button>
          )}
        </div>
      )}

      {/* Desktop */}
      <div
        className={`${
          hasSearch ? 'mt-4' : 'mt-6'
        } hidden overflow-hidden rounded-2xl border border-black/[0.06] bg-[#fdfcf9] md:block`}
      >
        <div className="grid grid-cols-[2fr_1fr_1fr_100px_110px_40px] items-center border-b border-black/[0.06] px-6 py-4 text-[10px] font-medium uppercase tracking-[0.16em] text-black/35">
          <span>Produto</span>
          <span>Material</span>
          <span>Categoria</span>
          <span>Preço</span>
          <span>Estoque</span>
          <span />
        </div>

        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <Link
              key={product.id}
              href={`/admin/produtos/${product.id}`}
              className="grid grid-cols-[2fr_1fr_1fr_100px_110px_40px] items-center border-b border-black/[0.05] px-6 py-5 transition last:border-0 hover:bg-black/[0.015]"
            >
              <div>
                <p className="text-sm font-medium">
                  {product.name}
                </p>

                <div className="mt-1 flex items-center gap-2">
                  {product.is_featured && (
                    <span className="text-[9px] uppercase tracking-wider text-[#a88950]">
                      Destaque
                    </span>
                  )}

                  {!product.is_active && (
                    <span className="text-[9px] uppercase tracking-wider text-red-500">
                      Inativo
                    </span>
                  )}
                </div>
              </div>

              <span className="text-sm text-black/55">
                {product.materials?.name ?? '—'}
              </span>

              <span className="text-sm text-black/55">
                {product.categories?.name ?? '—'}
              </span>

              <span className="text-sm font-medium">
                {formatCurrency(
                  product.promotional_price ??
                    product.price
                )}
              </span>

              <span className="text-sm text-black/55">
                {product.stock_quantity}
              </span>

              <ChevronRight className="h-4 w-4 text-black/25" />
            </Link>
          ))
        ) : (
          <EmptyProducts
            searching={hasSearch}
            search={search}
            onClear={() => setSearch('')}
          />
        )}
      </div>

      {/* Mobile */}
      <div
        className={`${
          hasSearch ? 'mt-4' : 'mt-6'
        } space-y-3 md:hidden`}
      >
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
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
                    {product.materials?.name ??
                      'Sem material'}
                    {' · '}
                    {product.categories?.name ??
                      'Sem categoria'}
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
                      product.promotional_price ??
                        product.price
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
          <EmptyProducts
            searching={hasSearch}
            search={search}
            onClear={() => setSearch('')}
          />
        )}
      </div>
    </>
  )
}

function EmptyProducts({
  searching,
  search,
  onClear,
}: {
  searching: boolean
  search: string
  onClear: () => void
}) {
  if (searching) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f3efe7]">
          <Search
            className="h-6 w-6 text-[#a88950]"
            strokeWidth={1.5}
          />
        </div>

        <h2 className="mt-5 text-sm font-medium">
          Nenhum produto encontrado
        </h2>

        <p className="mt-2 max-w-sm text-xs leading-5 text-black/35">
          Não encontramos nenhum produto para{' '}
          <span className="font-medium text-black/50">
            "{search}"
          </span>
          .
        </p>

        <button
          type="button"
          onClick={onClear}
          className="mt-5 inline-flex items-center gap-2 text-xs font-medium text-[#a88950] transition hover:text-[#8d713f] hover:underline"
        >
          <X className="h-3.5 w-3.5" />
          Limpar busca
        </button>
      </div>
    )
  }

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