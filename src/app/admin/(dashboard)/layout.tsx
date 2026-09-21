'use client'

import { ReactNode, useState } from 'react'

import { AdminHeader } from '@/components/admin/AdminHeader'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default function AdminDashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#f7f5f1] text-[#1c1b19]">
      <div className="flex min-h-screen">
        <AdminSidebar
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <AdminHeader
            onMenuClick={() => setMobileOpen(true)}
          />

          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}