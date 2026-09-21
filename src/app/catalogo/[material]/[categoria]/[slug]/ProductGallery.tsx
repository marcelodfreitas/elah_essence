'use client'

import { useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from 'lucide-react'

type ProductImage = {
  id?: string
  image_url: string
  sort_order: number
}

type ProductGalleryProps = {
  images: ProductImage[]
  productName: string
}

export default function ProductGallery({
  images,
  productName,
}: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)

  const mainImage = images[selectedImage]

  function previousImage() {
    setSelectedImage((current) =>
      current === 0 ? images.length - 1 : current - 1
    )
  }

  function nextImage() {
    setSelectedImage((current) =>
      current === images.length - 1 ? 0 : current + 1
    )
  }

  if (!images.length) {
    return (
      <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-[#eeeae3]">
        <div className="flex h-full items-center justify-center">
          <span className="font-serif text-2xl tracking-[0.16em] text-black/20">
            ELAH
          </span>
        </div>
      </div>
    )
  }

  const hasMultipleImages = images.length > 1

  return (
    <>
      <div
        className={
          hasMultipleImages
            ? 'grid gap-4 lg:grid-cols-[88px_1fr]'
            : 'block'
        }
      >
        {/* MINIATURAS DESKTOP */}
        {hasMultipleImages && (
          <div className="order-2 hidden max-h-[720px] gap-3 overflow-y-auto lg:order-1 lg:flex lg:flex-col">
            {images.map((image, index) => {
              const active = index === selectedImage

              return (
                <button
                  key={image.id ?? `${image.image_url}-${index}`}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square w-full shrink-0 overflow-hidden rounded-xl bg-[#eeeae3] transition ${
                    active
                      ? 'ring-1 ring-[#1c1b19]'
                      : 'opacity-55 hover:opacity-100'
                  }`}
                >
                  <img
                    src={image.image_url}
                    alt={`${productName} - foto ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              )
            })}
          </div>
        )}

        {/* FOTO PRINCIPAL */}
        <div className={hasMultipleImages ? 'order-1 lg:order-2' : ''}>
          <div className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#eeeae3]">
            <img
              src={mainImage.image_url}
              alt={productName}
              className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.015]"
            />

            {/* CONTADOR */}
            {hasMultipleImages && (
              <div className="absolute bottom-4 left-4 rounded-full bg-white/85 px-3 py-1.5 text-[9px] tracking-[0.16em] text-black/55 backdrop-blur-md">
                {selectedImage + 1} / {images.length}
              </div>
            )}

            {/* ZOOM */}
            <button
              type="button"
              onClick={() => setIsZoomed(true)}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/85 text-black/55 opacity-0 backdrop-blur-md transition group-hover:opacity-100"
              aria-label="Ampliar imagem"
            >
              <Maximize2 className="h-4 w-4" />
            </button>

            {/* NAVEGAÇÃO */}
            {hasMultipleImages && (
              <>
                <button
                  type="button"
                  onClick={previousImage}
                  className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-black/55 opacity-0 backdrop-blur-md transition group-hover:opacity-100"
                  aria-label="Imagem anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-black/55 opacity-0 backdrop-blur-md transition group-hover:opacity-100"
                  aria-label="Próxima imagem"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}
          </div>

          {/* MINIATURAS MOBILE */}
          {hasMultipleImages && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {images.map((image, index) => {
                const active = index === selectedImage

                return (
                  <button
                    key={image.id ?? `${image.image_url}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-[#eeeae3] ${
                      active
                        ? 'ring-1 ring-[#1c1b19]'
                        : 'opacity-60'
                    }`}
                  >
                    <img
                      src={image.image_url}
                      alt={`${productName} - foto ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* MODAL ZOOM */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-5"
          onClick={() => setIsZoomed(false)}
        >
          <button
            type="button"
            onClick={() => setIsZoomed(false)}
            className="absolute right-5 top-5 z-10 text-sm uppercase tracking-[0.16em] text-white/70 transition hover:text-white"
          >
            Fechar
          </button>

          <img
            src={mainImage.image_url}
            alt={productName}
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
