'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Navbar from '../Header/Navbar'
import StarLoader from '../Common/StarLoader'
import { useUser } from '@/context/userContext'
import { usePopup } from '@/context/popupContext'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const
const URGENCIES = [
  { value: 'normal', label: 'Normal' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'critical', label: 'Critical' },
] as const

interface DonorItem {
  _id: string
  name: string
  email: string
  phone?: string
  bloodGroup: string
  isBloodDonorAvailable: boolean
  location?: {
    city?: string
    state?: string
    address?: string
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function BloodBankMain() {
  const { token } = useUser()
  const { showError, showSuccess, showWarning } = usePopup()

  const [bloodGroup, setBloodGroup] = useState<string>('O+')
  const [city, setCity] = useState('')
  const [stateName, setStateName] = useState('')
  const [unitsRequired, setUnitsRequired] = useState(1)
  const [urgency, setUrgency] = useState<'normal' | 'urgent' | 'critical'>('urgent')
  const [hospitalName, setHospitalName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [requirements, setRequirements] = useState('')

  const [donors, setDonors] = useState<DonorItem[]>([])
  const [states, setStates] = useState<string[]>([])
  const [citiesByState, setCitiesByState] = useState<Record<string, string[]>>({})
  const [hasSearched, setHasSearched] = useState(false)
  const [searching, setSearching] = useState(false)
  const [sendingRequest, setSendingRequest] = useState(false)

  useEffect(() => {
    let active = true

    const fetchLocations = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/blood-requests/locations`)
        if (!res.ok) return
        const data = await res.json()
        if (!active) return
        setStates(Array.isArray(data.states) ? data.states : [])
        setCitiesByState(data.citiesByState || {})
      } catch {
        // Keep empty state list if server is unreachable
      }
    }

    void fetchLocations()
    return () => {
      active = false
    }
  }, [])

  const availableCities = useMemo(() => {
    if (!stateName) return []
    return citiesByState[stateName] || []
  }, [stateName, citiesByState])

  useEffect(() => {
    if (!stateName) return

    let active = true

    const fetchMatchingDonors = async () => {
      try {
        const params = new URLSearchParams({ bloodGroup, state: stateName })
        if (city) params.set('city', city)
        const headers: Record<string, string> = {}
        if (token) headers.Authorization = `Bearer ${token}`
        const res = await fetch(`${API_BASE_URL}/api/blood-requests/donors?${params.toString()}`, {
          headers,
        })
        const data = await res.json()
        if (!active) return

        if (res.ok) {
          setDonors(data.donors || [])
          setHasSearched(true)
        }
      } catch {
        // Keep manual search available on transient network errors
      } finally {
        if (active) setSearching(false)
      }
    }

    void fetchMatchingDonors()

    return () => {
      active = false
    }
  }, [bloodGroup, stateName, city, token])

  const handleSearchDonors = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stateName) {
      showError('Please select a state/UT to view matching donors.')
      return
    }

    setSearching(true)

    try {
      const params = new URLSearchParams({ bloodGroup, state: stateName })
      if (city) params.set('city', city)
      const headers: Record<string, string> = {}
      if (token) headers.Authorization = `Bearer ${token}`
      const res = await fetch(`${API_BASE_URL}/api/blood-requests/donors?${params.toString()}`, {
        headers,
      })
      const data = await res.json()

      if (!res.ok) {
        showError(data.message || 'Failed to search donors.')
        setSearching(false)
        return
      }

      setDonors(data.donors || [])
      setHasSearched(true)
    } catch {
      showError('Unable to reach the MediSure server.')
    } finally {
      setSearching(false)
    }
  }

  const handleSendDonorRequest = async () => {
    if (!stateName) {
      showError('Please select a state/UT before sending a donor request.')
      return
    }

    if (!token) {
      showError('Please sign in to send an emergency blood donor request.', {
        action: { label: 'Sign in here', href: '/auth/login' },
      })
      return
    }

    setSendingRequest(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/blood-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bloodGroup,
          unitsRequired,
          urgency,
          city: city.trim() || undefined,
          state: stateName.trim() || undefined,
          hospitalName: hospitalName.trim() || undefined,
          contactPhone: contactPhone.trim() || undefined,
          requirements: requirements.trim() || undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        showError(data.message || 'Failed to send donor request.')
        setSendingRequest(false)
        return
      }

      if (Array.isArray(data.donors)) {
        setDonors(data.donors)
        setHasSearched(true)
      }

      const matchedCount = data.matchedDonorsCount ?? 0
      const recipients: string[] = data.emailDelivery?.recipients || []
      const details =
        recipients.length > 0
          ? `Matched donors in area: ${matchedCount} · Recipients: ${recipients.join(', ')}`
          : `Matched donors in area: ${matchedCount}`

      if (data.emailDelivery?.sentCount === 0 && (data.emailDelivery?.failedCount ?? 0) > 0) {
        showWarning(data.message || 'Could not deliver blood alert emails.', {
          title: 'Email Delivery Issue',
          details,
          duration: 7000,
        })
      } else {
        showSuccess(data.message || 'Blood donor request sent.', {
          title: 'Blood Alert Sent',
          details,
          duration: 7000,
        })
      }
    } catch {
      showError('Unable to reach the MediSure server.')
    } finally {
      setSendingRequest(false)
    }
  }

  return (
    <main className="flex min-h-screen w-full flex-col bg-[#fafafa] text-neutral-900">
      <Navbar />

      <section className="mx-auto w-full max-w-6xl flex-1 px-4 pb-14 pt-24 md:px-10 md:pt-28">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              Emergency Blood Donor Network
            </h1>
            <p className="mt-1 text-xs text-neutral-500">
              Search donors by blood group, city, and state, then notify everyone in that area via email.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left: Search & Request Requirements Form */}
          <form
            onSubmit={handleSearchDonors}
            className="min-w-0 space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xs lg:col-span-5"
          >
            <h2 className="text-sm font-bold text-neutral-900">
              Requirements &amp; Location
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-neutral-700">
                  Blood Group *
                </label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-xs font-semibold text-neutral-900 outline-none focus:border-neutral-400 focus:bg-white"
                >
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-neutral-700">
                  Units Needed
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={unitsRequired}
                  onChange={(e) => setUnitsRequired(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-xs text-neutral-900 outline-none focus:border-neutral-400 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-neutral-700">
                  State
                </label>
                <select
                  value={stateName}
                  onChange={(e) => {
                    setStateName(e.target.value)
                    setCity('')
                  }}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-xs text-neutral-900 outline-none focus:border-neutral-400 focus:bg-white"
                >
                  <option value="">All States</option>
                  {states.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-neutral-700">
                  City
                </label>
                <select
                  value={city}
                  disabled={!stateName}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-xs text-neutral-900 outline-none focus:border-neutral-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">
                    {stateName ? 'All Cities' : 'Select state first'}
                  </option>
                  {availableCities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-neutral-700">
                  Urgency
                </label>
                <select
                  value={urgency}
                  onChange={(e) =>
                    setUrgency(e.target.value as 'normal' | 'urgent' | 'critical')
                  }
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-xs text-neutral-900 outline-none focus:border-neutral-400 focus:bg-white"
                >
                  {URGENCIES.map((u) => (
                    <option key={u.value} value={u.value}>
                      {u.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-neutral-700">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-xs text-neutral-900 outline-none focus:border-neutral-400 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-neutral-700">
                Hospital / Clinic Name
              </label>
              <input
                type="text"
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                placeholder="e.g. Lilavati Hospital"
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-xs text-neutral-900 outline-none focus:border-neutral-400 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-neutral-700">
                Requirements &amp; Notes
              </label>
              <textarea
                rows={3}
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="Describe patient requirements, ward details, or timing..."
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-900 outline-none focus:border-neutral-400 focus:bg-white"
              />
            </div>

            <div className="flex flex-col gap-2.5 pt-1">
              <button
                type="submit"
                disabled={searching}
                className="flex w-full items-center justify-center rounded-xl border border-neutral-200 bg-white py-2.5 text-xs font-semibold text-neutral-900 transition hover:bg-neutral-50 disabled:opacity-60"
              >
                {searching ? (
                  <StarLoader inline label="Searching donors..." />
                ) : (
                  'Find Matching Donors'
                )}
              </button>

              <button
                type="button"
                disabled={sendingRequest}
                onClick={handleSendDonorRequest}
                className="flex w-full items-center justify-center rounded-xl bg-neutral-900 py-3 text-xs font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-60"
              >
                {sendingRequest ? (
                  <StarLoader inline label="Emailing donors in area..." />
                ) : (
                  'Make Request & Email All Donors in Area'
                )}
              </button>
            </div>
          </form>

          {/* Right: Matching Donors in City/State */}
          <div className="min-w-0 rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xs lg:col-span-7">
            <div className="mb-4 flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-neutral-900">
                  Available Donors ({bloodGroup})
                </h2>
                <p className="text-xs text-neutral-500">
                  {city || stateName
                    ? `Filtered by ${[city, stateName].filter(Boolean).join(', ')}`
                    : 'Showing all locations'}
                </p>
              </div>
              <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700">
                {donors.length} found
              </span>
            </div>

            {searching ? (
              <StarLoader label="Finding matching donors..." size="md" />
            ) : !stateName || !hasSearched ? (
              <div className="rounded-xl border border-dashed border-neutral-200 py-14 text-center">
                <p className="text-sm font-medium text-neutral-700">
                  Select a blood group and state/UT
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  Matching donors across all cities in that state/UT (or a specific city) will appear automatically.
                </p>
              </div>
            ) : donors.length === 0 ? (
              <div className="rounded-xl border border-dashed border-neutral-200 py-14 text-center">
                <p className="text-sm font-medium text-neutral-700">
                  No available {bloodGroup} donors found in this area
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  Try clearing the city filter to search across the entire state.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {donors.map((donor) => (
                  <div
                    key={donor._id}
                    className="min-w-0 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50/50 p-4"
                  >
                    <div className="flex min-w-0 items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p
                          className="truncate text-sm font-semibold text-neutral-900"
                          title={donor.name}
                        >
                          {donor.name}
                        </p>
                        <p
                          className="break-all text-xs text-neutral-500"
                          title={donor.email}
                        >
                          {donor.email}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-bold text-red-700">
                        {donor.bloodGroup}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1 text-xs text-neutral-600">
                      <p className="break-words">
                        <strong>Location:</strong>{' '}
                        {[donor.location?.city, donor.location?.state]
                          .filter(Boolean)
                          .join(', ') || 'Not specified'}
                      </p>
                      {donor.phone && (
                        <p className="break-words">
                          <strong>Phone:</strong> {donor.phone}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
