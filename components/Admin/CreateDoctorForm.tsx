'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import StarLoader from '@/components/Common/StarLoader'
import { useUser } from '@/context/userContext'
import { createDoctorAccount } from '@/lib/adminApi'
import {
  DEPARTMENT_LABELS,
  DEPARTMENT_NAMES,
  DepartmentName,
  WEEKDAYS,
  Weekday,
} from '@/types/doctor'

export default function CreateDoctorForm() {
  const { token } = useUser()
  const router = useRouter()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [department, setDepartment] = useState<DepartmentName>('GeneralMedicine')
  const [specialization, setSpecialization] = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [experienceYears, setExperienceYears] = useState('5')
  const [consultationFee, setConsultationFee] = useState('500')
  const [qualifications, setQualifications] = useState('MBBS, MD')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')
  const [days, setDays] = useState<Weekday[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'])
  const [city, setCity] = useState('')
  const [stateName, setStateName] = useState('')
  const [isVerified, setIsVerified] = useState(true)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const toggleDay = (day: Weekday) => {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    if (days.length === 0) {
      setError('Select at least one OPD working day.')
      return
    }

    setError('')
    setSuccess('')
    setSubmitting(true)

    try {
      const parsedQualifications = qualifications
        .split(',')
        .map((q) => q.trim())
        .filter(Boolean)

      await createDoctorAccount(token, {
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
        location:
          city.trim() || stateName.trim()
            ? {
                city: city.trim() || undefined,
                state: stateName.trim() || undefined,
              }
            : undefined,
        doctorProfile: {
          department,
          specialization: specialization.trim(),
          licenseNumber: licenseNumber.trim(),
          experienceYears: Number(experienceYears) || 0,
          consultationFee: Number(consultationFee) || 0,
          qualifications: parsedQualifications,
          opdTimings: {
            start: startTime,
            end: endTime,
          },
          days,
          isVerified,
        },
      })

      setSuccess(`Doctor account created for ${name.trim()}.`)
      setTimeout(() => {
        router.push('/admin')
      }, 900)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create doctor account.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-neutral-200 bg-white p-6 md:p-8"
    >
      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-700">
          {success}
        </div>
      )}

      {/* Account Details */}
      <div className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Account Details
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-700">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dr. Ananya Sharma"
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3.5 py-2.5 text-sm outline-none transition focus:border-neutral-400 focus:bg-white"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-700">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="doctor@medisure.com"
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3.5 py-2.5 text-sm outline-none transition focus:border-neutral-400 focus:bg-white"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-700">
              Temporary Password *
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3.5 py-2.5 text-sm outline-none transition focus:border-neutral-400 focus:bg-white"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-700">
              Phone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3.5 py-2.5 text-sm outline-none transition focus:border-neutral-400 focus:bg-white"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-700">
              City
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Chandigarh"
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3.5 py-2.5 text-sm outline-none transition focus:border-neutral-400 focus:bg-white"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-700">
              State
            </label>
            <input
              type="text"
              value={stateName}
              onChange={(e) => setStateName(e.target.value)}
              placeholder="Haryana"
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3.5 py-2.5 text-sm outline-none transition focus:border-neutral-400 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Clinical Profile */}
      <div className="mt-8 space-y-4 border-t border-neutral-100 pt-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Clinical Profile & Schedule
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-700">
              Department *
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value as DepartmentName)}
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3.5 py-2.5 text-sm outline-none transition focus:border-neutral-400 focus:bg-white"
            >
              {DEPARTMENT_NAMES.map((dept) => (
                <option key={dept} value={dept}>
                  {DEPARTMENT_LABELS[dept]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-700">
              Specialization *
            </label>
            <input
              type="text"
              required
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              placeholder="Internal Medicine"
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3.5 py-2.5 text-sm outline-none transition focus:border-neutral-400 focus:bg-white"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-700">
              Medical License Number *
            </label>
            <input
              type="text"
              required
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              placeholder="MCI-2026-88412"
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3.5 py-2.5 text-sm outline-none transition focus:border-neutral-400 focus:bg-white"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-700">
              Qualifications (comma-separated)
            </label>
            <input
              type="text"
              value={qualifications}
              onChange={(e) => setQualifications(e.target.value)}
              placeholder="MBBS, MD"
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3.5 py-2.5 text-sm outline-none transition focus:border-neutral-400 focus:bg-white"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-700">
              Experience (Years)
            </label>
            <input
              type="number"
              min={0}
              value={experienceYears}
              onChange={(e) => setExperienceYears(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3.5 py-2.5 text-sm outline-none transition focus:border-neutral-400 focus:bg-white"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-700">
              Consultation Fee
            </label>
            <input
              type="number"
              min={0}
              value={consultationFee}
              onChange={(e) => setConsultationFee(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3.5 py-2.5 text-sm outline-none transition focus:border-neutral-400 focus:bg-white"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-700">
              OPD Start Time
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3.5 py-2.5 text-sm outline-none transition focus:border-neutral-400 focus:bg-white"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-700">
              OPD End Time
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3.5 py-2.5 text-sm outline-none transition focus:border-neutral-400 focus:bg-white"
            />
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-neutral-700">OPD Working Days *</p>
          <div className="flex flex-wrap gap-2">
            {WEEKDAYS.map((day) => {
              const selected = days.includes(day)
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                    selected
                      ? 'bg-neutral-900 text-white'
                      : 'border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-2.5 pt-2">
          <input
            type="checkbox"
            checked={isVerified}
            onChange={(e) => setIsVerified(e.target.checked)}
            className="h-4 w-4 rounded accent-neutral-900"
          />
          <span className="text-xs font-medium text-neutral-700">
            Mark doctor as verified immediately
          </span>
        </label>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-end gap-3 border-t border-neutral-100 pt-5">
        <button
          type="button"
          onClick={() => router.push('/admin')}
          className="rounded-full border border-neutral-200 px-5 py-2.5 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-full bg-neutral-900 px-6 py-2.5 text-xs font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-60"
        >
          {submitting ? <StarLoader inline label="Creating doctor..." /> : 'Create Doctor Account'}
        </button>
      </div>
    </form>
  )
}
