'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '../Header/Navbar'
import { useUser } from '@/context/userContext'

type PortalRole = 'patient' | 'doctor' | 'admin'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

const ROLE_META: Record<
  PortalRole,
  { label: string; subtitle: string; badge: string }
> = {
  patient: {
    label: 'Patient',
    subtitle: 'Access your AI symptom checks, doctor appointments, and blood donor alerts.',
    badge: 'Patient Portal',
  },
  doctor: {
    label: 'Doctor',
    subtitle: 'Sign in with your MediSure-issued credentials to manage patient appointments.',
    badge: 'Doctor Portal · Login Only',
  },
  admin: {
    label: 'Admin',
    subtitle: 'Sign in with your administrator credentials to manage users and doctor verification.',
    badge: 'Admin Portal · Login Only',
  },
}

function Login() {
  const router = useRouter()
  const { loginWithToken } = useUser()
  const [selectedRole, setSelectedRole] = useState<PortalRole>('patient')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Invalid email or password.')
        setLoading(false)
        return
      }

      if (data.token) {
        await loginWithToken(data.token, data.user || null)
      }

      setSuccess(`Welcome back, ${data.user?.name || 'User'}! Redirecting...`)
      setTimeout(() => {
        router.push('/')
      }, 600)
    } catch {
      setError('Unable to reach the server. Please ensure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative flex min-h-screen w-full flex-col bg-[#edb4e1] text-[#262029]">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.25),transparent_65%)]"
        aria-hidden="true"
      />

      <Navbar />

      <section className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 pb-12 pt-24 md:pt-28">
        <div className="rounded-3xl bg-white/95 p-7 shadow-[0_20px_50px_rgba(70,32,62,0.12)] backdrop-blur-sm md:p-9">
          <div className="mb-6 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fae78c] px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#2b242c]">
              {ROLE_META[selectedRole].badge}
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#28222a]">
              Welcome back
            </h1>
            <p className="mt-2 text-xs leading-relaxed text-[#5c4f5f] md:text-sm">
              {ROLE_META[selectedRole].subtitle}
            </p>
          </div>

          {/* Role Tabs */}
          <div className="mb-6 grid grid-cols-3 gap-1.5 rounded-2xl bg-[#f7eef5] p-1.5">
            {(['patient', 'doctor', 'admin'] as PortalRole[]).map((role) => {
              const active = selectedRole === role
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => {
                    setSelectedRole(role)
                    setError('')
                  }}
                  className={`rounded-xl py-2 text-xs font-semibold transition-all ${
                    active
                      ? 'bg-white text-[#262029] shadow-xs'
                      : 'text-[#6c5c70] hover:text-[#262029]'
                  }`}
                >
                  {ROLE_META[role].label}
                </button>
              )
            })}
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-700">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="mb-1.5 block text-xs font-semibold text-[#38313a]"
              >
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-[#e5d8e3] bg-[#fdfbfd] px-4 py-3 text-sm text-[#262029] outline-none transition focus:border-[#c97cb9] focus:ring-2 focus:ring-[#edb4e1]/40"
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="mb-1.5 block text-xs font-semibold text-[#38313a]"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-[#e5d8e3] bg-[#fdfbfd] px-4 py-3 pr-14 text-sm text-[#262029] outline-none transition focus:border-[#c97cb9] focus:ring-2 focus:ring-[#edb4e1]/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#6c5c70] hover:text-[#262029]"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-full bg-[#fae78c] py-3.5 text-sm font-bold text-[#2b242c] shadow-[0_8px_20px_rgba(88,42,76,0.12)] transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Signing in...' : `Sign in as ${ROLE_META[selectedRole].label}`}
            </button>
          </form>

          <div className="mt-6 border-t border-[#f0e6ee] pt-5 text-center text-xs text-[#5c4f5f]">
            {selectedRole === 'patient' ? (
              <p>
                New patient to MediSure?{' '}
                <Link
                  href="/auth/signup"
                  className="font-bold text-[#262029] underline decoration-[#edb4e1] decoration-2 underline-offset-4 hover:opacity-80"
                >
                  Create a patient account
                </Link>
              </p>
            ) : (
              <p>
                Doctor &amp; Admin accounts are provisioned by MediSure administrators and cannot be self-registered.
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

export default Login
