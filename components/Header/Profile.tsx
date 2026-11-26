'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useUser } from '@/context/userContext'

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] || ''}${parts[parts.length - 1][0] || ''}`.toUpperCase()
}

function Profile() {
  const { user, loading, logout } = useUser()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (loading) {
    return (
      <div
        className="h-8 w-20 animate-pulse rounded-full bg-white/50"
        aria-label="Loading profile"
      />
    )
  }

  if (!user) {
    return (
      <Link
        href="/auth/login"
        className="rounded-full bg-white/80 px-4 py-1.5 text-sm font-semibold text-[#231d25] shadow-xs transition hover:bg-white"
      >
        Login
      </Link>
    )
  }

  const firstName = user.name.trim().split(/\s+/)[0] || user.name

  const handleLogout = () => {
    setOpen(false)
    logout()
    router.push('/')
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-full bg-white/90 py-1 pl-1.5 pr-3 text-left shadow-xs transition hover:bg-white"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#fae78c] text-[11px] font-bold text-[#262029]">
          {getInitials(user.name)}
        </span>
        <span className="flex flex-col leading-none">
          <span className="text-xs font-semibold text-[#231d25]">{firstName}</span>
          <span className="text-[10px] capitalize text-[#6c5c70]">{user.role}</span>
        </span>
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`h-3.5 w-3.5 text-[#5c4f5f] transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2.5 w-60 rounded-2xl border border-[#efe4ed] bg-white p-3.5 shadow-[0_18px_40px_rgba(70,32,62,0.16)]"
        >
          <div className="border-b border-[#f3eaf1] pb-3">
            <p className="truncate text-sm font-bold text-[#231d25]">{user.name}</p>
            <p className="truncate text-xs text-[#6c5c70]">{user.email}</p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="rounded-full bg-[#f7eef5] px-2.5 py-0.5 text-[10px] font-semibold capitalize text-[#4a394e]">
                {user.role}
              </span>
              {user.bloodGroup && (
                <span className="rounded-full bg-[#fde8e8] px-2.5 py-0.5 text-[10px] font-bold text-[#b83232]">
                  Blood: {user.bloodGroup}
                </span>
              )}
            </div>
          </div>

          <div className="mt-2 flex flex-col gap-1 text-xs font-medium text-[#362c38]">
            <Link
              href="/diagnosis"
              onClick={() => setOpen(false)}
              className="rounded-xl px-2.5 py-2 transition hover:bg-[#faf3f8]"
            >
              AI Diagnosis
            </Link>
            <Link
              href="/appointments"
              onClick={() => setOpen(false)}
              className="rounded-xl px-2.5 py-2 transition hover:bg-[#faf3f8]"
            >
              My Appointments
            </Link>
            <Link
              href="/blood-bank"
              onClick={() => setOpen(false)}
              className="rounded-xl px-2.5 py-2 transition hover:bg-[#faf3f8]"
            >
              Blood Donor Portal
            </Link>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-2 w-full rounded-xl border border-[#f2dce9] bg-[#fdf7fb] px-3 py-2 text-left text-xs font-semibold text-[#9c326e] transition hover:bg-[#faeef6]"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}

export default Profile
