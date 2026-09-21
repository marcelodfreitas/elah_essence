'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { ArrowLeft, Check, Gem, Loader2, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { createClient } from '@/lib/supabase/client'

function generateSlug(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export default function NovoMaterialPage() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [sortOrder, setSortOrder] = useState('0')

  const [slugEdited, setSlugEdited] = useState(false)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function handleNameChange(value: string) {
    setName(value)

    if (!slugEdited) {
      setSlug(generateSlug(value))
    }
  }

  function handleSlugChange(value: string) {
    setSlugEdited(true)
    setSlug(generateSlug(value))
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
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

    const supabase = createClient()

    // Verifica se já existe um material com o mesmo slug
    const { data: existingMaterial, error: slugError } =
      await supabase
        .from('materials')
        .select('id')
        .eq('slug', cleanSlug)
        .maybeSingle()

    if (slugError) {
      console.error(slugError)

      setError(
        'Não foi possível validar o slug. Tente novamente.'
      )

      setSaving(false)
      return
    }

    if (existingMaterial) {
      setError(
        'Já existe um material utilizando este slug.'
      )

      setSaving(false)
      return
    }

    // Cria o material
    const { error: insertError } = await supabase
      .from('materials')
      .insert({
        name: cleanName,
        slug: cleanSlug,
        description: description.trim() || null,
        image_url: imageUrl.trim() || null,
        is_active: isActive,
        sort_order: Number(sortOrder) || 0,
      })

    if (insertError) {
      console.error(
        'Erro ao criar material:',
        insertError
      )

      setError(
        insertError.message ||
          'Não foi possível criar o material.'
      )

      setSaving(false)
      return
    }

    setSuccess('Material criado com sucesso.')

    setSaving(false)

    // Volta para a página de categorias após salvar
    setTimeout(() => {
      router.push('/admin/categorias')
      router.refresh()
    }, 700)
  }

  return (
    <div className="min-h-full bg-[#f7f5f1] text-[#1c1b19]">
      <div className="mx-auto w-full max-w-[1100px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">

        {/* Cabeçalho */}
        <div>
          <Link
            href="/admin/categorias"
            className="inline-flex items-center gap-2 text-xs font-medium text-black/45 transition hover:text-black"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para categorias
          </Link>

          <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.25em] text-[#a88950]">
                Organização
              </p>

              <h1 className="font-serif text-3xl tracking-tight text-[#1c1b19] sm:text-4xl">
                Novo material
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-black/45">
                Cadastre um novo material para organizar as
                coleções do catálogo ELAH.
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f3efe7]">
              <Gem
                className="h-6 w-6 text-[#a88950]"
                strokeWidth={1.5}
              />
            </div>
          </div>
        </div>

        {/* Mensagem de erro */}
        {error && (
          <div className="mt-8 rounded-xl border border-red-200 bg-[#fffafa] px-4 py-3">
            <p className="text-xs leading-5 text-red-700">
              {error}
            </p>
          </div>
        )}

        {/* Mensagem de sucesso */}
        {success && (
          <div className="mt-8 rounded-xl border border-[#b8d8c1] bg-[#f4fbf6] px-4 py-3">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-[#39734b]" />

              <p className="text-xs font-medium text-[#39734b]">
                {success}
              </p>
            </div>
          </div>
        )}

        {/* Formulário */}
        <form
          onSubmit={handleSubmit}
          className="mt-8"
        >
          <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-[#fdfcf9]">

            {/* Informações */}
            <div className="border-b border-black/[0.06] px-6 py-6 sm:px-8">
              <div>
                <h2 className="text-sm font-medium text-[#1c1b19]">
                  Informações do material
                </h2>

                <p className="mt-1 text-xs text-black/35">
                  Essas informações serão usadas na organização
                  do catálogo.
                </p>
              </div>

              <div className="mt-7 grid gap-6">

                {/* Nome */}
                <div>
                  <label
                    htmlFor="name"
                    className="text-xs font-medium text-black/65"
                  >
                    Nome
                  </label>

                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(event) =>
                      handleNameChange(event.target.value)
                    }
                    placeholder="Ex.: Prata"
                    className="mt-2 h-11 w-full rounded-xl border border-black/[0.08] bg-white px-4 text-sm text-[#1c1b19] outline-none transition placeholder:text-black/25 focus:border-[#a88950]/60 focus:ring-2 focus:ring-[#a88950]/10"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label
                    htmlFor="slug"
                    className="text-xs font-medium text-black/65"
                  >
                    Slug
                  </label>

                  <div className="mt-2 flex h-11 overflow-hidden rounded-xl border border-black/[0.08] bg-white focus-within:border-[#a88950]/60 focus-within:ring-2 focus-within:ring-[#a88950]/10">
                    <span className="flex items-center pl-4 text-sm text-black/25">
                      /
                    </span>

                    <input
                      id="slug"
                      type="text"
                      value={slug}
                      onChange={(event) =>
                        handleSlugChange(event.target.value)
                      }
                      placeholder="prata"
                      className="min-w-0 flex-1 bg-transparent px-2 pr-4 text-sm text-[#1c1b19] outline-none"
                    />
                  </div>

                  <p className="mt-2 text-[11px] leading-5 text-black/30">
                    O slug é usado nas URLs públicas do
                    catálogo.
                  </p>
                </div>

                {/* Descrição */}
                <div>
                  <label
                    htmlFor="description"
                    className="text-xs font-medium text-black/65"
                  >
                    Descrição
                  </label>

                  <textarea
                    id="description"
                    value={description}
                    onChange={(event) =>
                      setDescription(event.target.value)
                    }
                    rows={4}
                    placeholder="Descreva brevemente este material..."
                    className="mt-2 w-full resize-none rounded-xl border border-black/[0.08] bg-white px-4 py-3 text-sm leading-6 text-[#1c1b19] outline-none transition placeholder:text-black/25 focus:border-[#a88950]/60 focus:ring-2 focus:ring-[#a88950]/10"
                  />
                </div>

                {/* Imagem */}
                <div>
                  <label
                    htmlFor="imageUrl"
                    className="text-xs font-medium text-black/65"
                  >
                    URL da imagem
                  </label>

                  <input
                    id="imageUrl"
                    type="url"
                    value={imageUrl}
                    onChange={(event) =>
                      setImageUrl(event.target.value)
                    }
                    placeholder="https://..."
                    className="mt-2 h-11 w-full rounded-xl border border-black/[0.08] bg-white px-4 text-sm text-[#1c1b19] outline-none transition placeholder:text-black/25 focus:border-[#a88950]/60 focus:ring-2 focus:ring-[#a88950]/10"
                  />

                  <p className="mt-2 text-[11px] leading-5 text-black/30">
                    Opcional. Pode ser utilizada futuramente
                    para representar o material no catálogo.
                  </p>
                </div>
              </div>
            </div>

            {/* Configurações */}
            <div className="px-6 py-6 sm:px-8">
              <div>
                <h2 className="text-sm font-medium text-[#1c1b19]">
                  Configurações
                </h2>

                <p className="mt-1 text-xs text-black/35">
                  Defina como o material será exibido.
                </p>
              </div>

              <div className="mt-7 grid gap-6 sm:grid-cols-2">

                {/* Ativo */}
                <div className="rounded-xl border border-black/[0.06] bg-[#faf9f6] p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium text-[#1c1b19]">
                        Material ativo
                      </p>

                      <p className="mt-1 text-[11px] leading-5 text-black/35">
                        Define se o material poderá ser utilizado
                        no catálogo.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setIsActive((current) => !current)
                      }
                      className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                        isActive
                          ? 'bg-[#1c1b19]'
                          : 'bg-black/[0.12]'
                      }`}
                    >
                      <span
                        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                          isActive
                            ? 'left-6'
                            : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Ordem */}
                <div className="rounded-xl border border-black/[0.06] bg-[#faf9f6] p-4">
                  <label
                    htmlFor="sortOrder"
                    className="text-xs font-medium text-[#1c1b19]"
                  >
                    Ordem de exibição
                  </label>

                  <p className="mt-1 text-[11px] leading-5 text-black/35">
                    Quanto menor o número, primeiro aparece.
                  </p>

                  <input
                    id="sortOrder"
                    type="number"
                    min="0"
                    value={sortOrder}
                    onChange={(event) =>
                      setSortOrder(event.target.value)
                    }
                    className="mt-3 h-10 w-full rounded-lg border border-black/[0.08] bg-white px-3 text-sm text-[#1c1b19] outline-none transition focus:border-[#a88950]/60 focus:ring-2 focus:ring-[#a88950]/10"
                  />
                </div>
              </div>
            </div>

            {/* Ações */}
            <div className="flex flex-col-reverse gap-3 border-t border-black/[0.06] bg-[#faf9f6] px-6 py-5 sm:flex-row sm:items-center sm:justify-end sm:px-8">
              <Link
                href="/admin/categorias"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-black/[0.08] bg-white px-5 text-xs font-medium text-black/60 transition hover:border-black/[0.14] hover:text-black"
              >
                Cancelar
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1c1b19] px-6 text-xs font-medium text-white transition hover:bg-[#302e2a] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}

                {saving
                  ? 'Salvando...'
                  : 'Criar material'}
              </button>
            </div>
          </div>
        </form>

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
                Materiais definem coleções como Prata ou Ouro.
                Depois de criado, você poderá editar todas essas
                informações diretamente pela tela de categorias.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}