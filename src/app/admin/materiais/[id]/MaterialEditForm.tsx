'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'
import {
  ArrowLeft,
  Check,
  ImageIcon,
  Loader2,
  Save,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

import { createClient } from '@/lib/supabase/client'

type Material = {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  is_active: boolean
  sort_order: number
}

type MaterialEditFormProps = {
  material: Material
}

export default function MaterialEditForm({
  material,
}: MaterialEditFormProps) {
  const router = useRouter()
  const supabase = createClient()

  const [name, setName] = useState(material.name)
  const [slug, setSlug] = useState(material.slug)
  const [description, setDescription] = useState(
    material.description ?? ''
  )
  const [imageUrl, setImageUrl] = useState(material.image_url ?? '')
  const [isActive, setIsActive] = useState(material.is_active)
  const [sortOrder, setSortOrder] = useState(
    material.sort_order.toString()
  )

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState(
    material.image_url ?? ''
  )

  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  function generateSlug(value: string) {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  function handleNameChange(value: string) {
    setName(value)

    if (!selectedFile) {
      setSlug(generateSlug(value))
    }
  }

  function handleFileChange(file: File | null) {
    setError('')

    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      setError('Selecione um arquivo de imagem válido.')
      return
    }

    const maxSize = 5 * 1024 * 1024

    if (file.size > maxSize) {
      setError('A imagem deve ter no máximo 5 MB.')
      return
    }

    if (imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview)
    }

    const previewUrl = URL.createObjectURL(file)

    setSelectedFile(file)
    setImagePreview(previewUrl)
  }

  function handleRemoveImage() {
    setSelectedFile(null)
    setImagePreview('')
    setImageUrl('')
  }

  async function uploadImage(file: File) {
    const extension =
      file.name.split('.').pop()?.toLowerCase() || 'jpg'

    const filePath = `${material.id}/${crypto.randomUUID()}.${extension}`

    const { error: uploadError } = await supabase.storage
      .from('materials')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      })

    if (uploadError) {
      throw new Error(
        `Não foi possível enviar a imagem: ${uploadError.message}`
      )
    }

    const { data } = supabase.storage
      .from('materials')
      .getPublicUrl(filePath)

    if (!data.publicUrl) {
      throw new Error('Não foi possível obter a URL pública da imagem.')
    }

    return data.publicUrl
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setError('')
    setSuccess('')

    const cleanName = name.trim()
    const cleanSlug = slug.trim()

    if (!cleanName) {
      setError('Informe o nome do material.')
      return
    }

    if (!cleanSlug) {
      setError('Informe o slug do material.')
      return
    }

    setSaving(true)

    try {
      const { data: existingMaterial, error: slugError } =
        await supabase
          .from('materials')
          .select('id')
          .eq('slug', cleanSlug)
          .neq('id', material.id)
          .maybeSingle()

      if (slugError) {
        throw new Error(
          `Erro ao verificar o slug: ${slugError.message}`
        )
      }

      if (existingMaterial) {
        setError('Já existe outro material utilizando este slug.')
        setSaving(false)
        return
      }

      let finalImageUrl = imageUrl.trim() || null

      if (selectedFile) {
        finalImageUrl = await uploadImage(selectedFile)
      }

      const { error: updateError } = await supabase
        .from('materials')
        .update({
          name: cleanName,
          slug: cleanSlug,
          description: description.trim() || null,
          image_url: finalImageUrl,
          is_active: isActive,
          sort_order: Number(sortOrder) || 0,
          updated_at: new Date().toISOString(),
        })
        .eq('id', material.id)

      if (updateError) {
        throw new Error(
          `Não foi possível salvar o material: ${updateError.message}`
        )
      }

      setSuccess('Material atualizado com sucesso.')

      setTimeout(() => {
        router.push('/admin/categorias')
        router.refresh()
      }, 700)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Ocorreu um erro ao salvar o material.'
      )

      setSaving(false)
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      'Tem certeza que deseja excluir este material?'
    )

    if (!confirmed) {
      return
    }

    setError('')
    setSuccess('')
    setSaving(true)

    try {
      const { count, error: productsError } = await supabase
        .from('products')
        .select('id', {
          count: 'exact',
          head: true,
        })
        .eq('material_id', material.id)

      if (productsError) {
        throw new Error(
          `Não foi possível verificar os produtos: ${productsError.message}`
        )
      }

      if ((count ?? 0) > 0) {
        setError(
          'Este material não pode ser excluído porque existem produtos vinculados a ele.'
        )
        setSaving(false)
        return
      }

      const { error: deleteError } = await supabase
        .from('materials')
        .delete()
        .eq('id', material.id)

      if (deleteError) {
        throw new Error(
          `Não foi possível excluir o material: ${deleteError.message}`
        )
      }

      router.push('/admin/categorias')
      router.refresh()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Ocorreu um erro ao excluir o material.'
      )

      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      
      {/* HEADER */}
      <div className="mb-8 mt-10">
        <p className="text-[10px] uppercase tracking-[0.28em] text-[#a88950]">
          Materiais
        </p>

        <h1 className="mt-2 font-serif text-4xl tracking-tight text-[#1c1b19]">
          Editar material
        </h1>

        <p className="mt-2 text-sm text-black/50">
          Atualize as informações e a imagem da coleção.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* INFORMAÇÕES */}
        <section className="rounded-3xl border border-black/[0.06] bg-[#fdfcf9] p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="font-serif text-2xl text-[#1c1b19]">
              Informações
            </h2>

            <p className="mt-1 text-sm text-black/45">
              Dados principais do material.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {/* NOME */}
            <div className="sm:col-span-2">
              <label className="mb-2 block text-xs font-medium uppercase tracking-[0.16em] text-black/50">
                Nome
              </label>

              <input
                type="text"
                value={name}
                onChange={(event) =>
                  handleNameChange(event.target.value)
                }
                placeholder="Ex.: Prata"
                className="w-full rounded-2xl border border-black/[0.08] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#a88950]/50 focus:ring-4 focus:ring-[#a88950]/10"
              />
            </div>

            {/* SLUG */}
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-[0.16em] text-black/50">
                Slug
              </label>

              <input
                type="text"
                value={slug}
                onChange={(event) =>
                  setSlug(generateSlug(event.target.value))
                }
                placeholder="prata"
                className="w-full rounded-2xl border border-black/[0.08] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#a88950]/50 focus:ring-4 focus:ring-[#a88950]/10"
              />

              <p className="mt-2 text-xs text-black/35">
                Usado na URL pública do catálogo.
              </p>
            </div>

            {/* ORDEM */}
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-[0.16em] text-black/50">
                Ordem
              </label>

              <input
                type="number"
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value)}
                min="0"
                className="w-full rounded-2xl border border-black/[0.08] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#a88950]/50 focus:ring-4 focus:ring-[#a88950]/10"
              />
            </div>

            {/* DESCRIÇÃO */}
            <div className="sm:col-span-2">
              <label className="mb-2 block text-xs font-medium uppercase tracking-[0.16em] text-black/50">
                Descrição
              </label>

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Descreva este material..."
                rows={5}
                className="w-full resize-none rounded-2xl border border-black/[0.08] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#a88950]/50 focus:ring-4 focus:ring-[#a88950]/10"
              />
            </div>
          </div>
        </section>

        {/* IMAGEM */}
        <section className="rounded-3xl border border-black/[0.06] bg-[#fdfcf9] p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="font-serif text-2xl text-[#1c1b19]">
              Imagem da coleção
            </h2>

            <p className="mt-1 text-sm text-black/45">
              Escolha uma imagem para representar este material no
              catálogo.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
            {/* PREVIEW */}
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#f1eee8]">
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt={name || 'Preview do material'}
                    className="h-full w-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/65 text-white backdrop-blur transition hover:bg-black/80"
                    aria-label="Remover imagem"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-black/25 shadow-sm">
                    <ImageIcon className="h-6 w-6" />
                  </div>

                  <p className="font-serif text-xl text-black/35">
                    Sem imagem
                  </p>

                  <p className="mt-1 text-xs text-black/30">
                    O material aparecerá sem foto no catálogo.
                  </p>
                </div>
              )}
            </div>

            {/* UPLOAD */}
            <div className="flex flex-col justify-center">
              <label
                htmlFor="material-image"
                className="group flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-black/[0.12] bg-[#faf8f4] px-6 text-center transition hover:border-[#a88950]/50 hover:bg-[#fbf8f1]"
              >
                <input
                  id="material-image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null
                    handleFileChange(file)
                  }}
                />

                <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm transition duration-300 group-hover:-translate-y-1 group-hover:text-[#a88950]">
                  <Upload className="h-6 w-6" />
                </span>

                <span className="text-sm font-medium text-[#1c1b19]">
                  Escolher imagem
                </span>

                <span className="mt-2 max-w-xs text-xs leading-5 text-black/40">
                  JPG, PNG ou WEBP
                  <br />
                  Tamanho máximo de 5 MB
                </span>

                {selectedFile && (
                  <span className="mt-4 max-w-full truncate rounded-full bg-[#f3efe7] px-4 py-2 text-xs text-black/55">
                    {selectedFile.name}
                  </span>
                )}
              </label>

              <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-black/40">
                <ImageIcon className="mt-0.5 h-4 w-4 shrink-0" />

                <p>
                  A imagem será armazenada com segurança no Supabase
                  Storage e utilizada automaticamente no catálogo
                  público.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* STATUS */}
        <section className="rounded-3xl border border-black/[0.06] bg-[#fdfcf9] p-6 sm:p-8">
          <div className="flex items-center justify-between gap-6">
            <div>
              <h2 className="font-serif text-2xl text-[#1c1b19]">
                Visibilidade
              </h2>

              <p className="mt-1 text-sm text-black/45">
                Controle se este material aparece no catálogo.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsActive((current) => !current)}
              className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                isActive ? 'bg-[#1c1b19]' : 'bg-black/15'
              }`}
              aria-label={
                isActive
                  ? 'Desativar material'
                  : 'Ativar material'
              }
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
                  isActive ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          <div className="mt-5 flex items-center gap-3 rounded-2xl bg-[#f3efe7] px-4 py-3">
            <span
              className={`h-2 w-2 rounded-full ${
                isActive ? 'bg-emerald-500' : 'bg-black/25'
              }`}
            />

            <span className="text-sm text-black/55">
              {isActive
                ? 'Material ativo e visível no catálogo.'
                : 'Material inativo e oculto do catálogo.'}
            </span>
          </div>
        </section>

        {/* MENSAGENS */}
        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
            <X className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-700">
            <Check className="h-4 w-4" />
            <span>{success}</span>
          </div>
        )}

        {/* AÇÕES */}
        <div className="flex mb-10 flex-col-reverse gap-3 border-t border-black/[0.06] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={handleDelete}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            Excluir material
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1c1b19] px-6 py-3 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Salvar alterações
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}