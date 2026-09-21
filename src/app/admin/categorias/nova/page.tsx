'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { ArrowLeft, ImagePlus, Save, Tag } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'

function generateSlug(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function NovaCategoriaPage() {
  const supabase = createClient()

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [sortOrder, setSortOrder] = useState('0')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function handleNameChange(value: string) {
    setName(value)
    setSlug(generateSlug(value))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setError('')

    if (!name.trim()) {
      setError('Informe o nome da categoria.')
      return
    }

    if (!slug.trim()) {
      setError('Informe um slug válido.')
      return
    }

    setSaving(true)

    try {
      const { data: existingCategory, error: existingError } =
        await supabase
          .from('categories')
          .select('id')
          .eq('slug', slug.trim())
          .maybeSingle()

      if (existingError) {
        throw existingError
      }

      if (existingCategory) {
        setError('Já existe uma categoria utilizando este slug.')
        setSaving(false)
        return
      }

      const { error: insertError } = await supabase
        .from('categories')
        .insert({
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim() || null,
          image_url: imageUrl.trim() || null,
          is_active: isActive,
          sort_order: Number(sortOrder) || 0,
        })

      if (insertError) {
        throw insertError
      }

      window.location.href = '/admin/categorias'
    } catch (err) {
      console.error(err)

      setError(
        'Não foi possível criar a categoria. Verifique os dados e tente novamente.',
      )

      setSaving(false)
    }
  }

  return (
    <div className="min-h-full bg-[#f7f5f1] text-[#1c1b19]">
      <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
        {/* Cabeçalho */}
        <div className="mb-8">
          <Link
            href="/admin/categorias"
            className="mb-5 inline-flex items-center gap-2 text-sm text-black/45 transition hover:text-black"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.7} />
            Voltar para categorias
          </Link>

          <div>
            <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.22em] text-[#a88950]">
              Catálogo
            </p>

            <h1 className="text-2xl font-medium tracking-[-0.02em] sm:text-3xl">
              Nova categoria
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-black/45">
              Crie uma nova categoria para organizar os produtos do catálogo
              ELAH.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            {/* Formulário principal */}
            <div className="rounded-2xl border border-black/[0.06] bg-[#fdfcf9]">
              <div className="border-b border-black/[0.06] px-6 py-5 sm:px-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f3efe7]">
                    <Tag
                      className="h-[18px] w-[18px] text-[#a88950]"
                      strokeWidth={1.6}
                    />
                  </div>

                  <div>
                    <h2 className="text-sm font-medium">
                      Informações da categoria
                    </h2>

                    <p className="mt-0.5 text-xs text-black/40">
                      Defina como a categoria aparecerá no catálogo.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6 p-6 sm:p-7">
                {/* Nome */}
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-xs font-medium text-black/65"
                  >
                    Nome da categoria
                  </label>

                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(event) =>
                      handleNameChange(event.target.value)
                    }
                    placeholder="Ex.: Anéis"
                    className="h-12 w-full rounded-xl border border-black/[0.08] bg-white px-4 text-sm text-[#1c1b19] outline-none transition placeholder:text-black/25 focus:border-[#a88950]/60 focus:ring-4 focus:ring-[#a88950]/10"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label
                    htmlFor="slug"
                    className="mb-2 block text-xs font-medium text-black/65"
                  >
                    Slug
                  </label>

                  <input
                    id="slug"
                    type="text"
                    value={slug}
                    onChange={(event) =>
                      setSlug(generateSlug(event.target.value))
                    }
                    placeholder="aneis"
                    className="h-12 w-full rounded-xl border border-black/[0.08] bg-white px-4 text-sm text-[#1c1b19] outline-none transition placeholder:text-black/25 focus:border-[#a88950]/60 focus:ring-4 focus:ring-[#a88950]/10"
                  />

                  <p className="mt-2 text-[11px] leading-5 text-black/35">
                    Usado na URL pública da categoria.
                  </p>
                </div>

                {/* Descrição */}
                <div>
                  <label
                    htmlFor="description"
                    className="mb-2 block text-xs font-medium text-black/65"
                  >
                    Descrição
                  </label>

                  <textarea
                    id="description"
                    value={description}
                    onChange={(event) =>
                      setDescription(event.target.value)
                    }
                    placeholder="Uma breve descrição para apresentar a categoria..."
                    rows={5}
                    className="w-full resize-none rounded-xl border border-black/[0.08] bg-white px-4 py-3 text-sm leading-6 text-[#1c1b19] outline-none transition placeholder:text-black/25 focus:border-[#a88950]/60 focus:ring-4 focus:ring-[#a88950]/10"
                  />
                </div>

                {/* Imagem */}
                <div>
                  <label
                    htmlFor="imageUrl"
                    className="mb-2 block text-xs font-medium text-black/65"
                  >
                    URL da imagem
                  </label>

                  <div className="relative">
                    <ImagePlus
                      className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/25"
                      strokeWidth={1.6}
                    />

                    <input
                      id="imageUrl"
                      type="url"
                      value={imageUrl}
                      onChange={(event) =>
                        setImageUrl(event.target.value)
                      }
                      placeholder="https://..."
                      className="h-12 w-full rounded-xl border border-black/[0.08] bg-white pl-11 pr-4 text-sm text-[#1c1b19] outline-none transition placeholder:text-black/25 focus:border-[#a88950]/60 focus:ring-4 focus:ring-[#a88950]/10"
                    />
                  </div>

                  <p className="mt-2 text-[11px] leading-5 text-black/35">
                    Por enquanto utilizamos uma URL. O upload para o
                    armazenamento poderá ser adicionado depois.
                  </p>
                </div>
              </div>
            </div>

            {/* Configurações */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-black/[0.06] bg-[#fdfcf9]">
                <div className="border-b border-black/[0.06] px-6 py-5">
                  <h2 className="text-sm font-medium">Configurações</h2>

                  <p className="mt-1 text-xs leading-5 text-black/40">
                    Controle a exibição e a organização.
                  </p>
                </div>

                <div className="space-y-6 p-6">
                  {/* Ativo */}
                  <div>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium">
                          Categoria ativa
                        </p>

                        <p className="mt-1 text-xs leading-5 text-black/40">
                          Define se ela poderá aparecer no catálogo.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsActive((current) => !current)}
                        className={`
                          relative h-6 w-11 shrink-0 rounded-full transition
                          ${
                            isActive
                              ? 'bg-[#1c1b19]'
                              : 'bg-black/15'
                          }
                        `}
                        aria-label={
                          isActive
                            ? 'Desativar categoria'
                            : 'Ativar categoria'
                        }
                      >
                        <span
                          className={`
                            absolute top-1 h-4 w-4 rounded-full bg-white transition
                            ${
                              isActive
                                ? 'left-6'
                                : 'left-1'
                            }
                          `}
                        />
                      </button>
                    </div>

                    <div
                      className={`
                        mt-4 rounded-xl px-4 py-3 text-xs
                        ${
                          isActive
                            ? 'bg-[#edf7f0] text-[#39734b]'
                            : 'bg-black/[0.035] text-black/40'
                        }
                      `}
                    >
                      {isActive
                        ? 'Esta categoria estará disponível no catálogo.'
                        : 'Esta categoria ficará oculta do catálogo.'}
                    </div>
                  </div>

                  {/* Ordem */}
                  <div>
                    <label
                      htmlFor="sortOrder"
                      className="mb-2 block text-xs font-medium text-black/65"
                    >
                      Ordem de exibição
                    </label>

                    <input
                      id="sortOrder"
                      type="number"
                      min="0"
                      value={sortOrder}
                      onChange={(event) =>
                        setSortOrder(event.target.value)
                      }
                      className="h-11 w-full rounded-xl border border-black/[0.08] bg-white px-4 text-sm text-[#1c1b19] outline-none transition focus:border-[#a88950]/60 focus:ring-4 focus:ring-[#a88950]/10"
                    />

                    <p className="mt-2 text-[11px] leading-5 text-black/35">
                      Categorias com menor número aparecem primeiro.
                    </p>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="rounded-2xl border border-[#a88950]/20 bg-[#fbf8f1] p-6">
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#a88950]">
                  Prévia
                </p>

                <div className="mt-5 flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-black/[0.06] bg-[#f3efe7]">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Tag
                        className="h-5 w-5 text-[#a88950]"
                        strokeWidth={1.5}
                      />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {name || 'Nome da categoria'}
                    </p>

                    <p className="mt-1 truncate text-xs text-black/40">
                      /{slug || 'categoria'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Erro */}
          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Ações */}
          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-black/[0.06] pt-6 sm:flex-row sm:items-center sm:justify-end">
            <Link
              href="/admin/categorias"
              className="inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm text-black/50 transition hover:bg-black/[0.04] hover:text-black"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1c1b19] px-6 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save className="h-4 w-4" strokeWidth={1.7} />

              {saving ? 'Salvando...' : 'Criar categoria'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}