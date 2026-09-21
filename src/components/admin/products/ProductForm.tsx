"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import Link from "next/link";

import { createClient } from "@/lib/supabase/client";
import { uploadProductImage } from "@/lib/products/uploadProductImage";

import { ImageUploader } from "./ImageUploader";

type Option = {
  id: string;
  name: string;
  slug: string;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  promotional_price: number | null;
  stock_quantity: number;
  has_variants: boolean;
  is_featured: boolean;
  is_active: boolean;
  material_id: string;
  category_id: string;
};

type ExistingImage = {
  id: string;
  image_url: string;
  storage_path: string | null;
  alt_text: string | null;
  sort_order: number;
};

type ProductVariant = {
  id: string;
  name: string | null;
  size: string | null;
  sku: string | null;
  price: number | null;
  stock_quantity: number;
  is_active: boolean;
};

type VariantForm = {
  id?: string;
  size: string;
  sku: string;
  price: string;
  stock_quantity: string;
  is_active: boolean;
};

type ProductFormProps = {
  materials: Option[];
  categories: Option[];
  product?: Product;
  existingImages?: ExistingImage[];
};

export function ProductForm({
  materials,
  categories,
  product,
  existingImages = [],
}: ProductFormProps) {
  const isEditing = Boolean(product);

  const [name, setName] = useState(product?.name ?? "");
  const [materialId, setMaterialId] = useState(product?.material_id ?? "");
  const [categoryId, setCategoryId] = useState(product?.category_id ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product?.price?.toString() ?? "");
  const [promotionalPrice, setPromotionalPrice] = useState(
    product?.promotional_price?.toString() ?? "",
  );
  const [stockQuantity, setStockQuantity] = useState(
    product?.stock_quantity?.toString() ?? "0",
  );
  const [hasVariants, setHasVariants] = useState(
    product?.has_variants ?? false,
  );
  const [isFeatured, setIsFeatured] = useState(product?.is_featured ?? false);
  const [isActive, setIsActive] = useState(product?.is_active ?? true);

  const [variants, setVariants] = useState<VariantForm[]>([]);
  const [loadingVariants, setLoadingVariants] = useState(false);

  const [images, setImages] = useState<File[]>([]);
  const [mainImage, setMainImage] = useState<File | null>(null);

  const [saving, setSaving] = useState(false);

  /*
   * =========================
   * CARREGAR PRODUTO
   * =========================
   */

  useEffect(() => {
    if (!product) return;

    setName(product.name);
    setMaterialId(product.material_id);
    setCategoryId(product.category_id);
    setDescription(product.description ?? "");
    setPrice(product.price?.toString() ?? "");
    setPromotionalPrice(product.promotional_price?.toString() ?? "");
    setStockQuantity(product.stock_quantity?.toString() ?? "0");
    setHasVariants(product.has_variants);
    setIsFeatured(product.is_featured);
    setIsActive(product.is_active);
  }, [product]);

  /*
   * =========================
   * CARREGAR VARIANTES
   * =========================
   */

  useEffect(() => {
  if (!product?.id) {
    setVariants([])
    return
  }

  const productId = product.id

  async function loadVariants() {
    setLoadingVariants(true)

    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from("product_variants")
        .select(
          "id, name, size, sku, price, stock_quantity, is_active",
        )
        .eq("product_id", productId)
        .order("created_at", { ascending: true })

      if (error) {
        throw new Error(error.message)
      }

      const formattedVariants: VariantForm[] = (data ?? []).map(
        (variant: ProductVariant) => ({
          id: variant.id,
          size: variant.size ?? "",
          sku: variant.sku ?? "",
          price: variant.price?.toString() ?? "",
          stock_quantity: variant.stock_quantity?.toString() ?? "0",
          is_active: variant.is_active,
        }),
      )

      setVariants(formattedVariants)
    } catch (error) {
      console.error("Erro ao carregar variantes:", error)

      alert(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar as variantes.",
      )
    } finally {
      setLoadingVariants(false)
    }
  }

  loadVariants()
}, [product?.id])

  /*
   * =========================
   * ESTOQUE TOTAL DAS VARIANTES
   * =========================
   */

  const variantTotalStock = useMemo(() => {
    return variants.reduce((total, variant) => {
      return total + (Number(variant.stock_quantity) || 0);
    }, 0);
  }, [variants]);

  /*
   * =========================
   * VARIANTES
   * =========================
   */

  function addVariant() {
    setVariants((current) => [
      ...current,
      {
        size: "",
        sku: "",
        price: "",
        stock_quantity: "0",
        is_active: true,
      },
    ]);
  }

  function updateVariant(
    index: number,
    field: keyof VariantForm,
    value: string | boolean,
  ) {
    setVariants((current) =>
      current.map((variant, variantIndex) =>
        variantIndex === index
          ? {
              ...variant,
              [field]: value,
            }
          : variant,
      ),
    );
  }

  function removeVariant(index: number) {
    setVariants((current) =>
      current.filter((_, variantIndex) => variantIndex !== index),
    );
  }

  /*
   * =========================
   * EXCLUIR PRODUTO
   * =========================
   */

  async function handleDeleteProduct() {
    if (!product) return;

    const confirmed = window.confirm(
      `Tem certeza que deseja excluir o produto "${product.name}"?\n\nEssa ação não poderá ser desfeita.`,
    );

    if (!confirmed) {
      return;
    }

    setSaving(true);

    try {
      const supabase = createClient();

      // 1. Buscar imagens do produto
      const { data: productImages, error: imagesFetchError } =
        await supabase
          .from("product_images")
          .select("id, storage_path")
          .eq("product_id", product.id);

      if (imagesFetchError) {
        throw new Error(imagesFetchError.message);
      }

      // 2. Remover arquivos do Storage
      const storagePaths =
        productImages
          ?.map((image) => image.storage_path)
          .filter((path): path is string => Boolean(path)) ?? [];

      if (storagePaths.length > 0) {
        const { error: storageError } = await supabase.storage
          .from("product-images")
          .remove(storagePaths);

        if (storageError) {
          throw new Error(
            `Não foi possível remover as imagens: ${storageError.message}`,
          );
        }
      }

      // 3. Remover registros das imagens
      const { error: deleteImagesError } = await supabase
        .from("product_images")
        .delete()
        .eq("product_id", product.id);

      if (deleteImagesError) {
        throw new Error(deleteImagesError.message);
      }

      // 4. Remover variantes
      const { error: deleteVariantsError } = await supabase
        .from("product_variants")
        .delete()
        .eq("product_id", product.id);

      if (deleteVariantsError) {
        throw new Error(deleteVariantsError.message);
      }

      // 5. Remover o produto
      const { error: deleteProductError } = await supabase
        .from("products")
        .delete()
        .eq("id", product.id);

      if (deleteProductError) {
        throw new Error(deleteProductError.message);
      }

      alert(`Produto "${product.name}" excluído com sucesso.`);

      window.location.href = "/admin/produtos";
    } catch (error) {
      console.error("Erro ao excluir produto:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Não foi possível excluir o produto.",
      );

      setSaving(false);
    }
  }

  /*
   * =========================
   * ATIVAR / DESATIVAR
   * =========================
   */

  async function handleToggleActive() {
    if (!product) return;

    const newStatus = !isActive;

    const confirmed = window.confirm(
      newStatus
        ? `Deseja ativar o produto "${product.name}"?\n\nEle voltará a aparecer na vitrine do ELAH.`
        : `Deseja desativar o produto "${product.name}"?\n\nEle será removido da vitrine, mas continuará salvo no painel administrativo.`,
    );

    if (!confirmed) return;

    setSaving(true);

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("products")
        .update({
          is_active: newStatus,
        })
        .eq("id", product.id);

      if (error) {
        throw new Error(error.message);
      }

      setIsActive(newStatus);

      alert(
        newStatus
          ? "Produto ativado e disponível na vitrine."
          : "Produto desativado e removido da vitrine.",
      );
    } catch (error) {
      console.error("Erro ao alterar status:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Não foi possível alterar o status do produto.",
      );
    } finally {
      setSaving(false);
    }
  }

  /*
   * =========================
   * VALIDAR VARIANTES
   * =========================
   */

  function validateVariants() {
    if (!hasVariants) return;

    if (variants.length === 0) {
      throw new Error(
        "Adicione pelo menos uma variação ou desative a opção de variações.",
      );
    }

    const normalizedSizes = variants.map((variant) =>
      variant.size.trim().toLowerCase(),
    );

    const duplicatedSizes = normalizedSizes.filter(
      (size, index) => size && normalizedSizes.indexOf(size) !== index,
    );

    if (duplicatedSizes.length > 0) {
      throw new Error(
        "Existem tamanhos duplicados. Cada tamanho deve aparecer apenas uma vez.",
      );
    }

    variants.forEach((variant, index) => {
      if (!variant.size.trim()) {
        throw new Error(`Informe o tamanho da variação ${index + 1}.`);
      }

      if (Number(variant.stock_quantity) < 0) {
        throw new Error(
          `O estoque da variação ${index + 1} não pode ser negativo.`,
        );
      }

      if (variant.price && Number(variant.price) < 0) {
        throw new Error(
          `O preço da variação ${index + 1} não pode ser negativo.`,
        );
      }
    });
  }

  /*
   * =========================
   * SALVAR VARIANTES
   * =========================
   */

  async function saveVariants(productId: string) {
    const supabase = createClient();

    /*
     * Busca as variantes atualmente existentes no banco.
     * Isso permite atualizar as existentes, inserir novas
     * e excluir apenas as que foram removidas do formulário.
     */
    const { data: existingVariants, error: existingError } =
      await supabase
        .from("product_variants")
        .select("id")
        .eq("product_id", productId);

    if (existingError) {
      throw new Error(existingError.message);
    }

    const existingIds = new Set(
      (existingVariants ?? []).map((variant) => variant.id),
    );

    const formIds = new Set(
      variants
        .map((variant) => variant.id)
        .filter((id): id is string => Boolean(id)),
    );

    /*
     * Remove apenas variantes que existiam no banco
     * e foram retiradas do formulário.
     */
    const idsToDelete = [...existingIds].filter(
      (id) => !formIds.has(id),
    );

    if (idsToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from("product_variants")
        .delete()
        .in("id", idsToDelete);

      if (deleteError) {
        throw new Error(deleteError.message);
      }
    }

    /*
     * Atualiza ou cria cada variante.
     */
    for (const variant of variants) {
      const payload = {
        product_id: productId,
        name: "Tamanho",
        size: variant.size.trim(),
        sku: variant.sku.trim() || null,
        price: variant.price ? Number(variant.price) : null,
        stock_quantity: Number(variant.stock_quantity) || 0,
        is_active: variant.is_active,
        updated_at: new Date().toISOString(),
      };

      if (variant.id) {
        const { error: updateError } = await supabase
          .from("product_variants")
          .update(payload)
          .eq("id", variant.id)
          .eq("product_id", productId);

        if (updateError) {
          throw new Error(updateError.message);
        }
      } else {
        const { error: insertError } = await supabase
          .from("product_variants")
          .insert(payload);

        if (insertError) {
          throw new Error(insertError.message);
        }
      }
    }
  }

  /*
   * =========================
   * SALVAR PRODUTO
   * =========================
   */

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);

    try {
      if (!name.trim()) {
        throw new Error("Informe o nome do produto.");
      }

      if (!materialId) {
        throw new Error("Selecione o material.");
      }

      if (!categoryId) {
        throw new Error("Selecione a categoria.");
      }

      if (!price) {
        throw new Error("Informe o preço.");
      }

      validateVariants();

      const supabase = createClient();

      const slug = name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      /*
       * Quando existem variantes, o estoque principal
       * passa a representar a soma dos estoques.
       */
      const finalStockQuantity = hasVariants
        ? variantTotalStock
        : Number(stockQuantity) || 0;

      /*
       * =========================
       * MODO EDIÇÃO
       * =========================
       */

      if (isEditing && product) {
        const { error: updateError } = await supabase
          .from("products")
          .update({
            name: name.trim(),
            slug,
            category_id: categoryId,
            material_id: materialId,
            description: description.trim() || null,
            price: Number(price),
            promotional_price: promotionalPrice
              ? Number(promotionalPrice)
              : null,
            stock_quantity: finalStockQuantity,
            has_variants: hasVariants,
            is_featured: isFeatured,
            is_active: isActive,
            published_at: isActive ? new Date().toISOString() : null,
          })
          .eq("id", product.id);

        if (updateError) {
          throw new Error(updateError.message);
        }

        /*
         * Salva as variantes somente quando o produto
         * está configurado para utilizá-las.
         *
         * Se o usuário desativar temporariamente as variantes,
         * elas continuam salvas no banco.
         */
        if (hasVariants) {
          await saveVariants(product.id);
        }

        /*
         * Adiciona novas imagens, caso tenham sido selecionadas.
         */

        if (images.length > 0) {
          const { data: currentImages, error: currentImagesError } =
            await supabase
              .from("product_images")
              .select("sort_order")
              .eq("product_id", product.id)
              .order("sort_order", { ascending: false })
              .limit(1);

          if (currentImagesError) {
            throw new Error(currentImagesError.message);
          }

          const lastSortOrder = currentImages?.[0]?.sort_order ?? -1;

          const orderedImages = [
            ...(mainImage ? [mainImage] : []),
            ...images.filter((file) => file !== mainImage),
          ];

          const uploadedImages = [];

          for (const [index, file] of orderedImages.entries()) {
            const uploaded = await uploadProductImage(file, product.id);

            uploadedImages.push({
              product_id: product.id,
              image_url: uploaded.publicUrl,
              storage_path: uploaded.path,
              alt_text: `${name.trim()} - foto`,
              sort_order: lastSortOrder + index + 1,
            });
          }

          const { error: imagesError } = await supabase
            .from("product_images")
            .insert(uploadedImages);

          if (imagesError) {
            throw new Error(
              `Produto atualizado, mas houve um erro ao salvar as novas imagens: ${imagesError.message}`,
            );
          }
        }

        alert(`Produto "${name}" atualizado com sucesso!`);

        window.location.href = "/admin/produtos";
        return;
      }

      /*
       * =========================
       * MODO NOVO PRODUTO
       * =========================
       */

      const { data: newProduct, error: productError } = await supabase
        .from("products")
        .insert({
          name: name.trim(),
          slug,
          category_id: categoryId,
          material_id: materialId,
          description: description.trim() || null,
          price: Number(price),
          promotional_price: promotionalPrice
            ? Number(promotionalPrice)
            : null,
          stock_quantity: finalStockQuantity,
          has_variants: hasVariants,
          is_featured: isFeatured,
          is_active: isActive,
          published_at: isActive ? new Date().toISOString() : null,
        })
        .select("id")
        .single();

      if (productError) {
        throw new Error(productError.message);
      }

      if (!newProduct) {
        throw new Error("Produto não foi criado.");
      }

      /*
       * Salvar variantes do novo produto.
       */

      if (hasVariants) {
        await saveVariants(newProduct.id);
      }

      /*
       * Upload das imagens do novo produto.
       */

      if (images.length > 0) {
        const orderedImages = [
          ...(mainImage
            ? [mainImage]
            : images.length > 0
              ? [images[0]]
              : []),
          ...images.filter((file) => file !== mainImage),
        ];

        const uploadedImages = [];

        for (const [index, file] of orderedImages.entries()) {
          const uploaded = await uploadProductImage(file, newProduct.id);

          uploadedImages.push({
            product_id: newProduct.id,
            image_url: uploaded.publicUrl,
            storage_path: uploaded.path,
            alt_text: `${name.trim()} - foto ${index + 1}`,
            sort_order: index,
          });
        }

        const { error: imagesError } = await supabase
          .from("product_images")
          .insert(uploadedImages);

        if (imagesError) {
          throw new Error(
            `Produto criado, mas houve um erro ao salvar as imagens: ${imagesError.message}`,
          );
        }
      }

      alert(`Produto "${name}" criado com sucesso!`);

      window.location.href = "/admin/produtos";
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o produto.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Imagens */}
      <section className="rounded-3xl border border-black/[0.06] bg-[#fdfcf9] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.03)] sm:p-8">
        <ImageUploader onChange={setImages} onMainChange={setMainImage} />

        {isEditing && existingImages.length > 0 && (
          <div className="mt-8">
            <div className="mb-4">
              <h3 className="text-sm font-medium">Fotos cadastradas</h3>

              <p className="mt-1 text-xs text-black/40">
                Essas fotos já estão salvas no produto.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {existingImages.map((image) => (
                <div
                  key={image.id}
                  className="relative aspect-square overflow-hidden rounded-2xl border border-black/10 bg-[#f5f3ef]"
                >
                  <img
                    src={image.image_url}
                    alt={image.alt_text ?? name}
                    className="h-full w-full object-cover"
                  />

                  {image.sort_order === 0 && (
                    <div className="absolute left-2 top-2 rounded-full bg-[#1c1b19]/85 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-white">
                      Capa
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Informações principais */}
      <section className="rounded-3xl border border-black/[0.06] bg-[#fdfcf9] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.03)] sm:p-8">
        <div className="mb-7">
          <h2 className="font-serif text-2xl">Informações da peça</h2>

          <p className="mt-1 text-sm text-black/45">
            Informações básicas que aparecerão no catálogo.
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Nome do produto
            </label>

            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex.: Anel Aurora"
              required
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#b99b61] focus:ring-2 focus:ring-[#b99b61]/10"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Material
              </label>

              <select
                value={materialId}
                onChange={(event) => setMaterialId(event.target.value)}
                required
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#b99b61] focus:ring-2 focus:ring-[#b99b61]/10"
              >
                <option value="">Selecione o material</option>

                {materials.map((material) => (
                  <option key={material.id} value={material.id}>
                    {material.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Categoria
              </label>

              <select
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                required
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#b99b61] focus:ring-2 focus:ring-[#b99b61]/10"
              >
                <option value="">Selecione a categoria</option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Descrição
            </label>

            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Descreva a peça, acabamento, detalhes..."
              rows={5}
              className="w-full resize-none rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#b99b61] focus:ring-2 focus:ring-[#b99b61]/10"
            />
          </div>
        </div>
      </section>

      {/* Preço e estoque */}
      <section className="rounded-3xl border border-black/[0.06] bg-[#fdfcf9] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.03)] sm:p-8">
        <div className="mb-7">
          <h2 className="font-serif text-2xl">Preço e estoque</h2>

          <p className="mt-1 text-sm text-black/45">
            Defina os valores e a disponibilidade da peça.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Preço
            </label>

            <input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              placeholder="0,00"
              required
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#b99b61] focus:ring-2 focus:ring-[#b99b61]/10"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Preço promocional
            </label>

            <input
              type="number"
              step="0.01"
              min="0"
              value={promotionalPrice}
              onChange={(event) =>
                setPromotionalPrice(event.target.value)
              }
              placeholder="Opcional"
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#b99b61] focus:ring-2 focus:ring-[#b99b61]/10"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Estoque
            </label>

            <input
              type="number"
              min="0"
              value={hasVariants ? variantTotalStock : stockQuantity}
              onChange={(event) => setStockQuantity(event.target.value)}
              disabled={hasVariants}
              required
              className={`w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none transition focus:border-[#b99b61] focus:ring-2 focus:ring-[#b99b61]/10 ${
                hasVariants
                  ? "cursor-not-allowed bg-[#f3f1ed] text-black/55"
                  : "bg-white"
              }`}
            />

            {hasVariants && (
              <p className="mt-2 text-xs text-black/40">
                O estoque total é calculado automaticamente pela soma das
                variações.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Variações */}
      {hasVariants && (
        <section className="rounded-3xl border border-black/[0.06] bg-[#fdfcf9] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.03)] sm:p-8">
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#a88950]">
                Disponibilidade
              </p>

              <h2 className="mt-2 font-serif text-2xl">
                Variações do produto
              </h2>

              <p className="mt-1 max-w-xl text-sm text-black/45">
                Cadastre os tamanhos disponíveis e controle o estoque de cada
                um separadamente.
              </p>
            </div>

            <div className="rounded-2xl bg-[#f3efe7] px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.16em] text-black/40">
                Estoque total
              </p>

              <p className="mt-1 text-lg font-semibold text-[#1c1b19]">
                {variantTotalStock}{" "}
                <span className="text-sm font-normal text-black/45">
                  unidades
                </span>
              </p>
            </div>
          </div>

          {loadingVariants ? (
            <div className="rounded-2xl border border-dashed border-black/10 bg-[#faf9f6] px-5 py-10 text-center">
              <p className="text-sm text-black/45">
                Carregando variações...
              </p>
            </div>
          ) : variants.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-black/10 bg-[#faf9f6] px-5 py-10 text-center">
              <p className="text-sm font-medium">
                Nenhuma variação cadastrada
              </p>

              <p className="mt-1 text-xs text-black/40">
                Adicione os tamanhos disponíveis para esta peça.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {variants.map((variant, index) => (
                <div
                  key={variant.id ?? `new-${index}`}
                  className="rounded-2xl border border-black/[0.07] bg-white p-4 sm:p-5"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-[#a88950]">
                        Variação {index + 1}
                      </p>

                      <p className="mt-1 text-sm font-medium">
                        {variant.size.trim() || "Novo tamanho"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      disabled={saving}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-red-100 bg-red-50 text-red-500 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                      title="Remover variação"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <label className="mb-2 block text-xs font-medium text-black/65">
                        Tamanho
                      </label>

                      <input
                        type="text"
                        value={variant.size}
                        onChange={(event) =>
                          updateVariant(
                            index,
                            "size",
                            event.target.value,
                          )
                        }
                        placeholder="Ex.: 16"
                        className="w-full rounded-xl border border-black/10 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-[#b99b61] focus:ring-2 focus:ring-[#b99b61]/10"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-medium text-black/65">
                        Estoque
                      </label>

                      <input
                        type="number"
                        min="0"
                        value={variant.stock_quantity}
                        onChange={(event) =>
                          updateVariant(
                            index,
                            "stock_quantity",
                            event.target.value,
                          )
                        }
                        className="w-full rounded-xl border border-black/10 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-[#b99b61] focus:ring-2 focus:ring-[#b99b61]/10"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-medium text-black/65">
                        SKU
                      </label>

                      <input
                        type="text"
                        value={variant.sku}
                        onChange={(event) =>
                          updateVariant(
                            index,
                            "sku",
                            event.target.value,
                          )
                        }
                        placeholder="Opcional"
                        className="w-full rounded-xl border border-black/10 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-[#b99b61] focus:ring-2 focus:ring-[#b99b61]/10"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-medium text-black/65">
                        Preço específico
                      </label>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={variant.price}
                        onChange={(event) =>
                          updateVariant(
                            index,
                            "price",
                            event.target.value,
                          )
                        }
                        placeholder="Preço principal"
                        className="w-full rounded-xl border border-black/10 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-[#b99b61] focus:ring-2 focus:ring-[#b99b61]/10"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-black/[0.06] pt-4">
                    <div>
                      <p className="text-xs font-medium">
                        Variação disponível
                      </p>

                      <p className="mt-0.5 text-[11px] text-black/40">
                        Desative sem precisar excluir o tamanho.
                      </p>
                    </div>

                    <input
                      type="checkbox"
                      checked={variant.is_active}
                      onChange={(event) =>
                        updateVariant(
                          index,
                          "is_active",
                          event.target.checked,
                        )
                      }
                      className="h-5 w-5 accent-[#a88950]"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={addVariant}
            disabled={saving}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#a88950]/30 bg-[#fbf8f1] px-5 py-3 text-sm font-medium text-[#7d6335] transition hover:border-[#a88950]/50 hover:bg-[#f7f1e5] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Adicionar tamanho
          </button>
        </section>
      )}

      {/* Configurações */}
      <section className="rounded-3xl border border-black/[0.06] bg-[#fdfcf9] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.03)] sm:p-8">
        <div className="mb-7">
          <h2 className="font-serif text-2xl">Configurações</h2>

          <p className="mt-1 text-sm text-black/45">
            Controle como essa peça será exibida.
          </p>
        </div>

        <div className="space-y-4">
          <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-black/10 bg-white p-4">
            <div>
              <p className="text-sm font-medium">Produto ativo</p>

              <p className="mt-1 text-xs text-black/40">
                O produto poderá aparecer no catálogo.
              </p>
            </div>

            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
              className="h-5 w-5 accent-[#a88950]"
            />
          </label>

          <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-black/10 bg-white p-4">
            <div>
              <p className="text-sm font-medium">Produto em destaque</p>

              <p className="mt-1 text-xs text-black/40">
                Pode aparecer em áreas de destaque do catálogo.
              </p>
            </div>

            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(event) => setIsFeatured(event.target.checked)}
              className="h-5 w-5 accent-[#a88950]"
            />
          </label>

          <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-black/10 bg-white p-4">
            <div>
              <p className="text-sm font-medium">Possui variações</p>

              <p className="mt-1 text-xs text-black/40">
                Use para tamanhos ou outras variações da peça.
              </p>
            </div>

            <input
              type="checkbox"
              checked={hasVariants}
              onChange={(event) => setHasVariants(event.target.checked)}
              className="h-5 w-5 accent-[#a88950]"
            />
          </label>
        </div>
      </section>

      {/* Ações */}
      <div className="flex flex-col gap-3 border-t border-black/[0.06] pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/admin/produtos"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-5 py-3 text-sm font-medium transition hover:bg-black/[0.03]"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>

          {isEditing && (
            <button
              type="button"
              onClick={handleToggleActive}
              disabled={saving}
              className={`inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                isActive
                  ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              }`}
            >
              {isActive ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  Desativar produto
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Ativar produto
                </>
              )}
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={saving || loadingVariants}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1c1b19] px-6 py-3 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save className="h-4 w-4" />

          {saving
            ? "Salvando..."
            : isEditing
              ? "Salvar alterações"
              : "Salvar produto"}
        </button>
      </div>
    </form>
  );
}