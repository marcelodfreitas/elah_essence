'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Boxes,
  Gem,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  Tags,
  BookImage,
  X,
} from 'lucide-react'

import { createClient } from '@/lib/supabase/client'

type AdminSidebarProps = {
  mobileOpen: boolean
  onClose: () => void
}

const navigation = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    label: 'Produtos',
    href: '/admin/produtos',
    icon: Package,
  },
  {
    label: 'Categorias',
    href: '/admin/categorias',
    icon: Tags,
  },
  // {
  //   label: 'Estoque',
  //   href: '/admin/estoque',
  //   icon: Boxes,
  // },
  {
    label: 'Catálogo',
    href: '/catalogo',
    icon: BookImage,
  }
]

export function AdminSidebar({
  mobileOpen,
  onClose,
}: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()

    await supabase.auth.signOut()

    router.push('/admin/login')
    router.refresh()
  }

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-72 flex-col
          border-r border-black/[0.06] bg-[#fdfcf9]
          transition-transform duration-300
          lg:static lg:z-auto lg:translate-x-0
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex h-20 items-center justify-between border-b border-black/[0.06] px-7">
          <Link
            href="/admin"
            onClick={onClose}
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#c8aa6e]/50">
              <Gem
                className="h-4 w-4 text-[#a88950]"
                strokeWidth={1.5}
              />
            </div>

            <div>
              <p className="text-[15px] tracking-[0.28em] text-[#1c1b19]">
                ELAH
              </p>

              <p className="mt-0.5 text-[9px] uppercase tracking-[0.18em] text-black/30">
                Administração
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-black/35 hover:bg-black/5 hover:text-black lg:hidden"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-7">
          <p className="mb-4 px-3 text-[10px] font-medium uppercase tracking-[0.2em] text-black/30">
            Menu
          </p>

          {navigation.map((item) => {
            const Icon = item.icon

            const active =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`
                  flex items-center gap-3 rounded-xl px-3 py-3
                  text-sm transition
                  ${
                    active
                      ? 'bg-[#1c1b19] text-white'
                      : 'text-black/55 hover:bg-black/[0.04] hover:text-black'
                  }
                `}
              >
                <Icon className="h-[17px] w-[17px]" strokeWidth={1.7} />

                <span>{item.label}</span>
              </Link>
            )
          })}

          <div className="my-6 h-px bg-black/[0.06]" />

          <p className="mb-4 px-3 text-[10px] font-medium uppercase tracking-[0.2em] text-black/30">
            Sistema
          </p>

          <Link
            href="/admin/configuracoes"
            onClick={onClose}
            className={`
              flex items-center gap-3 rounded-xl px-3 py-3
              text-sm transition
              ${
                pathname.startsWith('/admin/configuracoes')
                  ? 'bg-[#1c1b19] text-white'
                  : 'text-black/55 hover:bg-black/[0.04] hover:text-black'
              }
            `}
          >
            <Settings
              className="h-[17px] w-[17px]"
              strokeWidth={1.7}
            />

            <span>Configurações</span>
          </Link>
        </nav>

        <div className="border-t border-black/[0.06] p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-black/45 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut
              className="h-[17px] w-[17px]"
              strokeWidth={1.7}
            />

            <span>Sair</span>
          </button>
        </div>
      </aside>
    </>
  )
}