'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const ADMIN_TABS = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/doctors/new', label: 'Create Doctor' },
]

export default function AdminHeader({
  title,
  subtitle,
}: {
  title: string
  subtitle: string
}) {
  const pathname = usePathname()

  return (
    <div className="mb-6 flex flex-col justify-between gap-4 border-b border-neutral-200 pb-5 sm:flex-row sm:items-end">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-neutral-500">
          Admin Console
        </p>
        <h1 className="mt-1 font-serif text-3xl font-normal tracking-tight text-neutral-900">
          {title}
        </h1>
        <p className="mt-1 text-xs text-neutral-500">{subtitle}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {ADMIN_TABS.map((tab) => {
          const active = pathname === tab.href
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                active
                  ? 'bg-neutral-900 text-white'
                  : 'border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
