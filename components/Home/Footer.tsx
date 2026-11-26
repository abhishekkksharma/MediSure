import React from 'react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="w-full border-t border-[#ebe4ea] bg-[#fafafa] text-[#5c505e]">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-start justify-between gap-6 px-6 py-10 sm:flex-row sm:items-center md:px-14 lg:px-20">
        <div>
          <Link href="/" className="text-lg font-bold tracking-tight text-[#231d25]">
            Medi<span className="text-pink-600">Sure</span>
          </Link>
          <p className="mt-1 text-xs text-[#7d6c7f]">
            AI-assisted care, verified doctors, and emergency blood matching.
          </p>
        </div>

        <nav className="flex flex-wrap items-center gap-6 text-xs font-medium">
          <Link href="/diagnosis" className="transition-colors hover:text-[#231d25]">
            AI Diagnosis
          </Link>
          <Link href="/appointments" className="transition-colors hover:text-[#231d25]">
            Appointments
          </Link>
          <Link href="/blood-bank" className="transition-colors hover:text-[#231d25]">
            Blood Bank
          </Link>
          <Link href="/auth/login" className="transition-colors hover:text-[#231d25]">
            Sign in
          </Link>
        </nav>
      </div>
    </footer>
  )
}
