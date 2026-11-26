'use client'

import React from 'react'
import Link from 'next/link'
import StarLoader from '@/components/Common/StarLoader'
import { useUser } from '@/context/userContext'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, token, loading } = useUser()

  if (loading) {
    return (
      <div className="mx-auto flex w-full max-w-[1440px] flex-1 items-center justify-center px-6 pt-28">
        <StarLoader label="Checking admin access..." size="md" />
      </div>
    )
  }

  if (!user || !token) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 pt-28 text-center">
        <div className="w-full rounded-2xl border border-neutral-200 bg-white p-8 shadow-xs">
          <h1 className="font-serif text-2xl text-neutral-900">Admin Sign In</h1>
          <p className="mt-2 text-xs leading-relaxed text-neutral-500">
            Sign in with an administrator account to manage users and create doctor profiles.
          </p>
          <Link
            href="/auth/login"
            className="mt-5 inline-block rounded-full bg-neutral-900 px-6 py-2.5 text-xs font-semibold text-white transition hover:bg-neutral-800"
          >
            Sign in
          </Link>
        </div>
      </div>
    )
  }

  if (user.role !== 'admin') {
    return (
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 pt-28 text-center">
        <div className="w-full rounded-2xl border border-neutral-200 bg-white p-8 shadow-xs">
          <h1 className="font-serif text-2xl text-neutral-900">Restricted Area</h1>
          <p className="mt-2 text-xs leading-relaxed text-neutral-500">
            This panel is available to administrators only.
          </p>
          <Link
            href="/"
            className="mt-5 inline-block rounded-full border border-neutral-200 px-6 py-2.5 text-xs font-semibold text-neutral-800 transition hover:bg-neutral-50"
          >
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
