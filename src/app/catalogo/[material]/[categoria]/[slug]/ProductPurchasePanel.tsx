'use client'

import { useMemo, useState } from 'react'
import { ArrowRight, Check, MessageCircle } from 'lucide-react'

type ProductVariant = {
  id: string
  name: string | null
  size: string | null
  sku: string | null
  price: number | null
  stock_quantity: number
  is_active: boolean
}

type ProductPurchasePanelProps = {
  productName: string
  materialName: string
  categoryName: string
  basePrice: number
  promotionalPrice: number | null
  stockQuantity: number | null
  hasVariants: boolean
  variants: ProductVariant[]
  variantStock: number
  isAvailable: boolean
  whatsappNumber: string
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export default function ProductPurchasePanel({
  productName,
  materialName,
  categoryName,
  basePrice,
  promotionalPrice,
  stockQuantity,
  hasVariants,
  variants,
  variantStock,
  isAvailable,
  whatsappNumber,
}: ProductPurchasePanelProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null
  )

  const selectedVariant = useMemo(() => {
    if (!selectedVariantId) return null

    return (
      variants.find(
        (variant) => variant.id === selectedVariantId
      ) ?? null
    )
  }, [selectedVariantId, variants])

  /*
   * =========================
   * PREÇO
   * =========================
   *
   * A variante pode ter um preço próprio.
   * Se não tiver, usamos o preço principal.
   */

  const selectedBasePrice =
  selectedVariant?.price ?? basePrice

const finalPrice =
  selectedVariant?.price !== null &&
  selectedVariant?.price !== undefined
    ? selectedVariant.price
    : promotionalPrice ?? basePrice

const hasPromotion =
  selectedVariant?.price === null ||
  selectedVariant?.price === undefined
    ? promotionalPrice !== null
    : false

  /*
   * =========================
   * DISPONIBILIDADE
   * =========================
   */

  const selectedVariantAvailable =
    selectedVariant !== null &&
    selectedVariant.stock_quantity > 0

  const canBuy = hasVariants
    ? selectedVariantAvailable
    : isAvailable

  /*
   * =========================
   * WHATSAPP
   * =========================
   */

  function handleWhatsApp() {
    if (!canBuy) return

    const variantText = selectedVariant
      ? `Tamanho: ${selectedVariant.size}`
      : null

    const message = [
      `Olá! Gostaria de separar a peça *${productName}*.`,
      '',
      `Material: ${materialName}`,
      `Categoria: ${categoryName}`,
      ...(variantText ? [variantText] : []),
      `Valor: ${formatCurrency(finalPrice)}`,
      '',
      'Gostaria de confirmar a disponibilidade e o atendimento.',
    ].join('\n')

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      message
    )}`

    window.open(
      whatsappUrl,
      '_blank',
      'noopener,noreferrer'
    )
  }

  return (
    <>
      {/* PREÇO */}
      <div className="mt-7">
        <p className="text-[10px] uppercase tracking-[0.18em] text-black/35">
          Valor
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-3">
          <span className="text-2xl text-black/75">
            {formatCurrency(finalPrice)}
          </span>

          {hasPromotion && (
            <span className="text-sm text-black/30 line-through">
              {formatCurrency(selectedBasePrice)}
            </span>
          )}
        </div>

        {hasPromotion && (
          <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-[#a88950]">
            Condição especial
          </p>
        )}
      </div>

      {/* TAMANHOS */}
      {hasVariants && (
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-black/35">
                Escolha o tamanho
              </p>

              <p className="mt-1 text-xs text-black/35">
                Selecione uma opção disponível
              </p>
            </div>

            {selectedVariant && (
              <span className="text-xs text-black/50">
                {selectedVariant.stock_quantity}{' '}
                {selectedVariant.stock_quantity === 1
                  ? 'unidade'
                  : 'unidades'}
              </span>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {variants.map((variant) => {
              const available =
                variant.stock_quantity > 0

              const selected =
                selectedVariantId === variant.id

              return (
                <button
                  key={variant.id}
                  type="button"
                  disabled={!available}
                  onClick={() =>
                    setSelectedVariantId(variant.id)
                  }
                  className={`relative min-w-[58px] rounded-full border px-5 py-3 text-sm transition ${
                    selected
                      ? 'border-[#1c1b19] bg-[#1c1b19] text-white'
                      : available
                        ? 'border-black/10 bg-white text-black/70 hover:border-[#a88950] hover:text-black'
                        : 'cursor-not-allowed border-black/[0.06] bg-black/[0.02] text-black/20 line-through'
                  }`}
                >
                  {variant.size}
                </button>
              )
            })}
          </div>

          {variants.length === 0 && (
            <p className="mt-4 text-xs text-black/40">
              Nenhum tamanho disponível no momento.
            </p>
          )}

          {selectedVariant && (
            <div className="mt-4 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e8eee5]">
                <Check className="h-3.5 w-3.5 text-[#60705a]" />
              </span>

              <span className="text-xs text-black/55">
                Tamanho {selectedVariant.size} disponível
              </span>
            </div>
          )}

          {!selectedVariant && variants.length > 0 && (
            <p className="mt-4 text-xs text-[#a88950]">
              Selecione um tamanho para continuar.
            </p>
          )}
        </div>
      )}

      {/* DISPONIBILIDADE SEM VARIANTES */}
      {!hasVariants && (
        <div className="mt-8 flex items-center gap-2">
          {isAvailable ? (
            <>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e8eee5]">
                <Check className="h-3.5 w-3.5 text-[#60705a]" />
              </span>

              <span className="text-xs text-black/55">
                Peça disponível
                {stockQuantity !== null &&
                  ` · ${stockQuantity} ${
                    stockQuantity === 1
                      ? 'unidade'
                      : 'unidades'
                  }`}
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
      )}

      {/* ESTOQUE TOTAL QUANDO HÁ VARIANTES */}
      {hasVariants && variantStock > 0 && (
        <p className="mt-4 text-[10px] uppercase tracking-[0.14em] text-black/30">
          {variantStock}{' '}
          {variantStock === 1
            ? 'unidade disponível'
            : 'unidades disponíveis'}
        </p>
      )}

      {/* WHATSAPP */}
      {isAvailable && (
        <div className="mt-10">
          <button
            type="button"
            onClick={handleWhatsApp}
            disabled={!canBuy}
            className={`group flex w-full items-center justify-between rounded-full px-6 py-5 text-white transition ${
              canBuy
                ? 'bg-[#1c1b19] hover:bg-[#a88950]'
                : 'cursor-not-allowed bg-black/15'
            }`}
          >
            <span className="flex items-center gap-3">
              <MessageCircle className="h-5 w-5" />

              <span className="text-xs uppercase tracking-[0.16em]">
                {hasVariants && !selectedVariant
                  ? 'Escolha o tamanho'
                  : 'Separar peça pelo WhatsApp'}
              </span>
            </span>

            <ArrowRight
              className={`h-4 w-4 transition-transform duration-300 ${
                canBuy
                  ? 'group-hover:translate-x-1'
                  : ''
              }`}
            />
          </button>

          <p className="mt-3 text-center text-[10px] leading-5 text-black/35">
            Você será direcionada para o WhatsApp para
            confirmar disponibilidade e atendimento.
          </p>
        </div>
      )}

      {!isAvailable && (
        <div className="mt-10 rounded-2xl border border-black/[0.06] bg-black/[0.02] px-5 py-4 text-center">
          <p className="text-xs text-black/45">
            Esta peça não está disponível no momento.
          </p>
        </div>
      )}
    </>
  )
}