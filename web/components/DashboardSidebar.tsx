'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const links = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Sessions', href: '/dashboard/sessions' },
  { label: 'Insights', href: '/dashboard/insights' },
  { label: 'Recordings', href: '/dashboard/recordings' },
  { label: 'Settings', href: '/dashboard/settings' },
]

type DashboardSidebarProps = {
  active: string
}

type SidebarUser = {
  name: string
  plan: string
  avatarUrl?: string | null
}

export default function DashboardSidebar({ active }: DashboardSidebarProps) {
  const [user, setUser] = useState<SidebarUser>({
    name: 'User',
    plan: 'Free',
    avatarUrl: null,
  })

  useEffect(() => {
    async function loadUser() {
      const response = await fetch('/api/me', { cache: 'no-store' })
      if (response.status === 401) {
        window.location.href = '/login'
        return
      }

      if (!response.ok) {
        return
      }

      const payload = await response.json()
      const nextUser = payload.user ?? {}
      setUser({
        name: nextUser.name ?? 'User',
        plan: String(nextUser.plan ?? 'FREE')
          .toLowerCase()
          .replace(/^\w/, (value: string) => value.toUpperCase()),
        avatarUrl: nextUser.avatarUrl ?? null,
      })
    }

    loadUser().catch(() => undefined)
  }, [])

  const initial = user.name.trim().charAt(0).toUpperCase() || 'U'

  return (
    <aside className="w-52 border-r border-white/10 flex-shrink-0 fixed h-full">
      <div className="p-4">
        <Link href="/" className="flex items-center gap-2 mb-6">
          <div className="w-6 h-6 rounded-md bg-white flex items-center justify-center">
            <span className="text-black font-bold text-xs">M</span>
          </div>
          <span className="text-white font-semibold text-sm">MoodFlow</span>
        </Link>

        <nav className="space-y-0.5">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                active === link.label ? 'bg-white text-black' : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="absolute bottom-0 w-52 p-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-semibold">
              {initial}
            </div>
          )}
          <div>
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-white/50">{user.plan} Plan</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
