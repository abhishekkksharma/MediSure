'use client'

import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useUser } from '@/context/userContext'
import Profile from './Profile'

const NAV_LINKS = [
  { href: '/diagnosis', label: 'AI Diagnosis' },
  { href: '/appointments', label: 'Appointments' },
  { href: '/blood-bank', label: 'Blood Bank' },
]

function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useUser()
  const [openPathname, setOpenPathname] = useState<string | null>(null)
  const mobileOpen = openPathname === pathname

  useEffect(() => {
    if (!mobileOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenPathname(null)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mobileOpen])

  const handleMobileLogout = () => {
    setOpenPathname(null)
    logout()
    router.push('/')
  }

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-40 w-full bg-transparent px-5 py-4 backdrop-blur-xl md:px-14 md:py-5 lg:px-20">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-[#231d25] md:text-2xl"
          >
            Medi<span className="text-pink-600">Sure</span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-8 text-sm font-medium text-[#362c38] md:flex lg:gap-10">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-opacity hover:opacity-70"
              >
                {item.label}
              </Link>
            ))}
            <Profile />
          </nav>

          <div className="flex items-center gap-3">
            {/* Desktop-only Start free checkup CTA */}
            <Link
              href="/appointments"
              className="group relative hidden items-center gap-2 text-sm font-semibold text-[#231d25] transition-opacity hover:opacity-80 md:inline-flex"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                className="text-white drop-shadow-xs transition-transform duration-300 group-hover:rotate-45"
                aria-hidden="true"
              >
                <path
                  d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
                  fill="currentColor"
                />
              </svg>
              <span className="relative pb-1">
                Start free checkup
                <svg
                  viewBox="0 0 130 12"
                  fill="none"
                  className="absolute -bottom-1 left-0 h-2.5 w-full text-[#362c38]"
                  aria-hidden="true"
                >
                  <path
                    d="M2 7.5C34 3.5 96 2.5 128 5.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M18 10C48 7.5 84 6.5 112 8.5"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </Link>

            {/* Transparent larger mobile hamburger button */}
            <button
              type="button"
              onClick={() => setOpenPathname((prev) => (prev === pathname ? null : pathname))}
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav-drawer"
              className="inline-flex h-11 w-11 items-center justify-center bg-transparent text-[#231d25] transition-opacity hover:opacity-70 md:hidden"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile backdrop */}
      <div
        onClick={() => setOpenPathname(null)}
        aria-hidden="true"
        className={`fixed inset-0 z-50 bg-[#231d25]/25 backdrop-blur-[2px] transition-opacity duration-300 md:hidden ${
          mobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      {/* Mobile slide-in side drawer */}
      <aside
        id="mobile-nav-drawer"
        aria-hidden={!mobileOpen}
        className={`fixed inset-y-0 right-0 z-50 flex w-72 max-w-[82vw] flex-col justify-between border-l border-[#ebe0e8] bg-[#fafafa] p-6 shadow-[-16px_0_40px_rgba(35,29,37,0.12)] transition-transform duration-300 ease-out md:hidden ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div>
          <div className="flex items-center justify-between border-b border-[#ece3ea] pb-4">
            <Link
              href="/"
              onClick={() => setOpenPathname(null)}
              className="text-lg font-bold tracking-tight text-[#231d25]"
            >
              Medi<span className="text-pink-600">Sure</span>
            </Link>
            <button
              type="button"
              onClick={() => setOpenPathname(null)}
              aria-label="Close navigation menu"
              className="inline-flex h-10 w-10 items-center justify-center bg-transparent text-[#231d25] transition-opacity hover:opacity-70"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <nav className="mt-6 flex flex-col gap-1.5 text-sm font-medium text-[#262029]">
            {NAV_LINKS.map((item) => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpenPathname(null)}
                  className={`flex items-center justify-between rounded-xl px-3.5 py-3 transition ${
                    active
                      ? 'bg-[#f6e2e9]/75 font-semibold text-[#231d25]'
                      : 'hover:bg-[#f2eaef]'
                  }`}
                >
                  <span>{item.label}</span>
                  <span className="text-xs text-[#8a798c]">→</span>
                </Link>
              )
            })}
            {user?.role === 'admin' && (
              <>
                <Link
                  href="/admin"
                  onClick={() => setOpenPathname(null)}
                  className={`flex items-center justify-between rounded-xl px-3.5 py-3 transition ${
                    pathname === '/admin'
                      ? 'bg-[#f6e2e9]/75 font-semibold text-[#231d25]'
                      : 'hover:bg-[#f2eaef]'
                  }`}
                >
                  <span>Admin Panel</span>
                  <span className="text-xs text-[#8a798c]">→</span>
                </Link>
                <Link
                  href="/admin/doctors/new"
                  onClick={() => setOpenPathname(null)}
                  className={`flex items-center justify-between rounded-xl px-3.5 py-3 transition ${
                    pathname === '/admin/doctors/new'
                      ? 'bg-[#f6e2e9]/75 font-semibold text-[#231d25]'
                      : 'hover:bg-[#f2eaef]'
                  }`}
                >
                  <span>Create Doctor</span>
                  <span className="text-xs text-[#8a798c]">→</span>
                </Link>
              </>
            )}
            <Link
              href="/appointments"
              onClick={() => setOpenPathname(null)}
              className="mt-2 rounded-full border border-[#d9c7d3] bg-white px-4 py-2.5 text-center text-xs font-semibold text-[#231d25] transition hover:border-[#231d25]"
            >
              Start free checkup
            </Link>
          </nav>
        </div>

        <div className="border-t border-[#ece3ea] pt-4">
          {user ? (
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-[#231d25]">{user.name}</p>
                <p className="truncate text-[11px] capitalize text-[#7d6c7f]">{user.role}</p>
              </div>
              <button
                type="button"
                onClick={handleMobileLogout}
                className="shrink-0 rounded-full border border-[#edd8e5] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#9c326e] transition hover:bg-[#faeef6]"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              href="/auth/login"
              onClick={() => setOpenPathname(null)}
              className="block w-full rounded-full bg-[#262029] px-4 py-2.5 text-center text-xs font-semibold text-white transition hover:bg-[#3b3240]"
            >
              Sign in
            </Link>
          )}
        </div>
      </aside>
    </>
  )
}

export default Navbar
