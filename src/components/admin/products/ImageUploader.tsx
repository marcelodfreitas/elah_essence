"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Star, Trash2 } from "lucide-react";

type ImageItem = {
  id: string;
  file: File;
  preview: string;
};

type ImageUploaderProps = {
  onChange?: (files: File[]) => void;
  onMainChange?: (file: File | null) => void;
};

export function ImageUploader({
  onChange,
  onMainChange,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [images, setImages] = useState<ImageItem[]>([]);
  const [mainImage, setMainImage] = useState<string | null>(null);

  function handleFiles(files: FileList | null) {
    if (!files) return;

    const selectedFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/"),
    );

    const newImages = selectedFiles.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((current) => {
      const updated = [...current, ...newImages];

      onChange?.(updated.map((image) => image.file));

      if (!mainImage && updated.length > 0) {
        setMainImage(updated[0].id);
        onMainChange?.(updated[0].file);
      }

      return updated;
    });
  }

  function handleRemove(id: string) {
    setImages((current) => {
      const imageToRemove = current.find((image) => image.id === id);

      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }

      const updated = current.filter((image) => image.id !== id);

      onChange?.(updated.map((image) => image.file));

      if (mainImage === id) {
        const nextMainImage = updated[0] ?? null;

        setMainImage(nextMainImage?.id ?? null);
        onMainChange?.(nextMainImage?.file ?? null);
      }

      return updated;
    });
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    handleFiles(event.target.files);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-medium text-[#1c1b19]">
          Fotos do produto
        </h2>

        <p className="mt-1 text-sm text-black/45">
          Adicione fotos com boa iluminação. A primeira será usada como capa.
        </p>
      </div>

      <div
        onClick={() => inputRef.current?.click()}
        className="
          group cursor-pointer rounded-2xl border border-dashed
          border-black/15 bg-white p-8 text-center
          transition hover:border-[#c8aa6e] hover:bg-[#fcfaf6]
        "
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleInputChange}
          className="hidden"
        />

        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f5f1e9]">
          <ImagePlus className="h-5 w-5 text-[#a88950]" strokeWidth={1.5} />
        </div>

        <p className="mt-4 text-sm font-medium text-[#1c1b19]">
          Adicionar fotos
        </p>

        <p className="mt-1 text-xs text-black/40">JPG, PNG ou WEBP</p>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((image, index) => {
            const isMain = mainImage === image.id;

            return (
              <div
                key={image.id}
                className="
                  group relative aspect-square overflow-hidden
                  rounded-2xl border border-black/10 bg-[#f5f3ef]
                "
              >
                <Image
                  src={image.preview}
                  alt={`Foto ${index + 1}`}
                  fill
                  unoptimized
                  className="object-cover"
                />

                {isMain && (
                  <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-[#1c1b19]/85 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-white backdrop-blur-sm">
                    <Star className="h-3 w-3 fill-current" />
                    Capa
                  </div>
                )}

                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent p-3 pt-8 opacity-0 transition group-hover:opacity-100">
                  {!isMain ? (
                    <button
                      type="button"
                      onClick={() => {
                        setMainImage(image.id);
                        onMainChange?.(image.file);
                      }}
                      className="text-xs font-medium text-white hover:text-[#e6cf9d]"
                    >
                      Usar como capa
                    </button>
                  ) : (
                    <span className="text-xs text-white/70">
                      Foto principal
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => handleRemove(image.id)}
                    className="
                      flex h-8 w-8 items-center justify-center
                      rounded-full bg-white/15 text-white
                      backdrop-blur-sm transition
                      hover:bg-white/25
                    "
                    aria-label="Remover foto"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
