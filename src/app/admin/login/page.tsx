'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Eye, EyeOff, Gem, Loader2 } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'

export default function AdminLoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    // if (error) {
    //   setError('E-mail ou senha inválidos.')
    //   setLoading(false)
    //   return
    // }

    if (error) {
  setError(error.message);
  setLoading(false);
  return;
}

const {
  data: { user },
} = await supabase.auth.getUser();

console.log("USUÁRIO LOGADO:", user);

router.push("/admin");
router.refresh();

    router.push('/admin')
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-[#f8f6f2] text-[#1c1b19]">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* Lado visual */}
        <section className="relative hidden overflow-hidden bg-[#171614] lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(196,166,103,0.18),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(196,166,103,0.10),transparent_30%)]" />

          <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">
            <div>
              <div className="flex items-center gap-3 text-white">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#c8aa6e]/40">
                  <Gem className="h-4 w-4 text-[#c8aa6e]" strokeWidth={1.5} />
                </div>

                <span className="text-lg tracking-[0.3em]">
                  ELAH
                </span>
              </div>
            </div>

            <div className="max-w-lg">
              <p className="mb-5 text-xs font-medium uppercase tracking-[0.35em] text-[#c8aa6e]">
                Painel administrativo
              </p>

              <h1 className="font-serif text-5xl leading-tight text-white xl:text-6xl">
                Seu catálogo.
                <br />
                Sua marca.
                <br />
                Seu momento.
              </h1>

              <p className="mt-7 max-w-md text-sm leading-7 text-white/55">
                Gerencie produtos, estoque e informações do catálogo
                ELAH em um único lugar.
              </p>
            </div>

            <p className="text-xs tracking-wide text-white/30">
              ELAH · Catálogo & Gestão
            </p>
          </div>
        </section>

        {/* Formulário */}
        <section className="flex min-h-screen items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">

            <div className="mb-10 lg:hidden">
              <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-full border border-[#c8aa6e]/50">
                <Gem
                  className="h-5 w-5 text-[#a88950]"
                  strokeWidth={1.5}
                />
              </div>

              <p className="text-lg tracking-[0.3em]">
                ELAH
              </p>
            </div>

            <div className="mb-10">
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-[#a88950]">
                Área administrativa
              </p>

              <h2 className="font-serif text-4xl tracking-tight">
                Bem-vinda.
              </h2>

              <p className="mt-3 text-sm leading-6 text-black/50">
                Entre para gerenciar seu catálogo.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-xs font-medium uppercase tracking-wider text-black/60"
                >
                  E-mail
                </label>

                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="h-13 w-full rounded-xl border border-black/10 bg-white px-4 text-sm outline-none transition placeholder:text-black/25 focus:border-[#b99a60] focus:ring-2 focus:ring-[#b99a60]/10"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-xs font-medium uppercase tracking-wider text-black/60"
                >
                  Senha
                </label>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Digite sua senha"
                    required
                    className="h-13 w-full rounded-xl border border-black/10 bg-white px-4 pr-12 text-sm outline-none transition placeholder:text-black/25 focus:border-[#b99a60] focus:ring-2 focus:ring-[#b99a60]/10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-black/35 transition hover:text-black/70"
                    aria-label={
                      showPassword
                        ? 'Ocultar senha'
                        : 'Mostrar senha'
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group flex h-13 w-full items-center justify-center gap-3 rounded-xl bg-[#1c1b19] px-5 text-sm font-medium text-white transition hover:bg-[#302e2a] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    Entrar no painel
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-10 text-center text-xs leading-5 text-black/35">
              Acesso restrito aos administradores da Elah Essence.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}