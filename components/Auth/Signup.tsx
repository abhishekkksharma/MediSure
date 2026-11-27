'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '../Header/Navbar'
import { useUser } from '@/context/userContext'
import { usePopup } from '@/context/popupContext'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const
const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
] as const

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

function Signup() {
  const router = useRouter()
  const { loginWithToken } = useUser()
  const { showError, showSuccess } = usePopup()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [phone, setPhone] = useState('')
  const [bloodGroup, setBloodGroup] = useState('')
  const [gender, setGender] = useState('')
  const [city, setCity] = useState('')
  const [stateName, setStateName] = useState('')
  const [isBloodDonorAvailable, setIsBloodDonorAvailable] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload: Record<string, unknown> = {
        name: name.trim(),
        email: email.trim(),
        password,
        role: 'patient',
        isBloodDonorAvailable,
      }

      if (phone.trim()) payload.phone = phone.trim()
      if (bloodGroup) payload.bloodGroup = bloodGroup
      if (gender) payload.gender = gender
      if (city.trim() || stateName.trim()) {
        payload.location = {
          city: city.trim() || undefined,
          state: stateName.trim() || undefined,
        }
      }

      const res = await fetch(`${API_BASE_URL}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        const detail = Array.isArray(data.errors) ? data.errors.join(', ') : ''
        showError(detail || data.message || 'Registration failed.')
        setLoading(false)
        return
      }

      if (data.token) {
        await loginWithToken(data.token, data.user || null)
      }

      showSuccess('Patient account created! Redirecting...')
      setTimeout(() => {
        router.push('/')
      }, 600)
    } catch {
      showError('Unable to reach the server. Please ensure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative flex min-h-screen w-full flex-col bg-[#F6E2E9] text-[#262029]">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.25),transparent_65%)]"
        aria-hidden="true"
      />

      <Navbar />

      <section className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 pb-12 pt-24 md:pt-28">
        <div className="rounded-3xl bg-white/95 p-7 shadow-[0_20px_50px_rgba(70,32,62,0.12)] backdrop-blur-sm md:p-9">
          <div className="mb-6 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fae78c] px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#2b242c]">
              Patient Registration
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#28222a]">
              Create your account
            </h1>
            <p className="mt-2 text-xs leading-relaxed text-[#5c4f5f] md:text-sm">
              Sign up as a patient to start AI symptom checkups, book doctors, and connect with blood donors.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="signup-name"
                  className="mb-1.5 block text-xs font-semibold text-[#38313a]"
                >
                  Full name *
                </label>
                <input
                  id="signup-name"
                  type="text"
                  required
                  minLength={2}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Aarav Sharma"
                  className="w-full rounded-xl border border-[#e5d8e3] bg-[#fdfbfd] px-4 py-2.5 text-sm text-[#262029] outline-none transition focus:border-[#c97cb9] focus:ring-2 focus:ring-[#edb4e1]/40"
                />
              </div>

              <div>
                <label
                  htmlFor="signup-phone"
                  className="mb-1.5 block text-xs font-semibold text-[#38313a]"
                >
                  Phone number
                </label>
                <input
                  id="signup-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-xl border border-[#e5d8e3] bg-[#fdfbfd] px-4 py-2.5 text-sm text-[#262029] outline-none transition focus:border-[#c97cb9] focus:ring-2 focus:ring-[#edb4e1]/40"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="signup-email"
                className="mb-1.5 block text-xs font-semibold text-[#38313a]"
              >
                Email address *
              </label>
              <input
                id="signup-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-[#e5d8e3] bg-[#fdfbfd] px-4 py-2.5 text-sm text-[#262029] outline-none transition focus:border-[#c97cb9] focus:ring-2 focus:ring-[#edb4e1]/40"
              />
            </div>

            <div>
              <label
                htmlFor="signup-password"
                className="mb-1.5 block text-xs font-semibold text-[#38313a]"
              >
                Password * (min. 6 characters)
              </label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="w-full rounded-xl border border-[#e5d8e3] bg-[#fdfbfd] px-4 py-2.5 pr-14 text-sm text-[#262029] outline-none transition focus:border-[#c97cb9] focus:ring-2 focus:ring-[#edb4e1]/40"
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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="signup-blood-group"
                  className="mb-1.5 block text-xs font-semibold text-[#38313a]"
                >
                  Blood group
                </label>
                <select
                  id="signup-blood-group"
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full rounded-xl border border-[#e5d8e3] bg-[#fdfbfd] px-4 py-2.5 text-sm text-[#262029] outline-none transition focus:border-[#c97cb9] focus:ring-2 focus:ring-[#edb4e1]/40"
                >
                  <option value="">Select blood group</option>
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="signup-gender"
                  className="mb-1.5 block text-xs font-semibold text-[#38313a]"
                >
                  Gender
                </label>
                <select
                  id="signup-gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full rounded-xl border border-[#e5d8e3] bg-[#fdfbfd] px-4 py-2.5 text-sm text-[#262029] outline-none transition focus:border-[#c97cb9] focus:ring-2 focus:ring-[#edb4e1]/40"
                >
                  <option value="">Select gender</option>
                  {GENDERS.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="signup-city"
                  className="mb-1.5 block text-xs font-semibold text-[#38313a]"
                >
                  City
                </label>
                <input
                  id="signup-city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Mumbai"
                  className="w-full rounded-xl border border-[#e5d8e3] bg-[#fdfbfd] px-4 py-2.5 text-sm text-[#262029] outline-none transition focus:border-[#c97cb9] focus:ring-2 focus:ring-[#edb4e1]/40"
                />
              </div>

              <div>
                <label
                  htmlFor="signup-state"
                  className="mb-1.5 block text-xs font-semibold text-[#38313a]"
                >
                  State
                </label>
                <input
                  id="signup-state"
                  type="text"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  placeholder="Maharashtra"
                  className="w-full rounded-xl border border-[#e5d8e3] bg-[#fdfbfd] px-4 py-2.5 text-sm text-[#262029] outline-none transition focus:border-[#c97cb9] focus:ring-2 focus:ring-[#edb4e1]/40"
                />
              </div>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#efe5ed] bg-[#fcf7fb] p-3.5">
              <input
                type="checkbox"
                checked={isBloodDonorAvailable}
                onChange={(e) => setIsBloodDonorAvailable(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-[#d6c2d3] accent-[#c95aa8]"
              />
              <span className="text-xs leading-relaxed text-[#4b3e4e]">
                <strong className="font-semibold text-[#262029]">
                  Opt in as an emergency blood donor
                </strong>
                <br />
                Allow patients with your blood group to reach out during emergencies.
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-full bg-[#fae78c] py-3.5 text-sm font-bold text-[#2b242c] shadow-[0_8px_20px_rgba(88,42,76,0.12)] transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Creating account...' : 'Create Patient Account'}
            </button>
          </form>

          <div className="mt-6 border-t border-[#f0e6ee] pt-5 text-center text-xs text-[#5c4f5f]">
            <p>
              Already have an account (Patient, Doctor, or Admin)?{' '}
              <Link
                href="/auth/login"
                className="font-bold text-[#262029] underline decoration-[#edb4e1] decoration-2 underline-offset-4 hover:opacity-80"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Signup
