import Link from 'next/link'
import React from 'react'

function Navbar() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 w-full bg-[#edb4e1]/85 px-6 py-4 backdrop-blur-md md:px-14 md:py-5 lg:px-20">
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-[#231d25] md:text-2xl"
        >
          MediSure
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-[#362c38] md:flex lg:gap-10">
          <Link href="/diagnosis" className="transition-opacity hover:opacity-70">
            AI Diagnosis
          </Link>
          <Link href="/appointments" className="transition-opacity hover:opacity-70">
            Appointments
          </Link>
          <Link href="/blood-bank" className="transition-opacity hover:opacity-70">
            Blood Bank
          </Link>
          <Link href="/doctors" className="transition-opacity hover:opacity-70">
            Doctors
          </Link>
          <Link href="/auth/login" className="transition-opacity hover:opacity-70">
            Login
          </Link>
        </nav>

        <Link
          href="/appointments"
          className="group relative inline-flex items-center gap-2 text-sm font-semibold text-[#231d25] transition-opacity hover:opacity-80"
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
      </div>
    </header>
  )
}

export default Navbar
