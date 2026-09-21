'use client'

import { Menu, Gem } from 'lucide-react'

type AdminHeaderProps = {
  onMenuClick: () => void
}

export function AdminHeader({
  onMenuClick,
}: AdminHeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-black/[0.06] bg-[#fdfcf9] px-5 lg:hidden">
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-lg p-2 text-black/60 transition hover:bg-black/5"
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-2">
        <Gem
          className="h-4 w-4 text-[#a88950]"
          strokeWidth={1.5}
        />

        <span className="text-sm tracking-[0.25em]">
          ELAH
        </span>
      </div>

      <div className="h-9 w-9 rounded-full bg-[#1c1b19] text-center text-xs leading-9 text-white">
        J
      </div>
    </header>
  )
}