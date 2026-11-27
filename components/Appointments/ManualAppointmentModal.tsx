'use client'

import React, { useMemo, useState } from 'react'
import { usePopup } from '@/context/popupContext'
import { AppointmentItem, AppointmentUserRef } from '@/types/appointment'
import { DEPARTMENT_LABELS, DEPARTMENT_NAMES, DepartmentName } from '@/types/doctor'

interface ManualAppointmentModalProps {
  isOpen: boolean
  token: string | null
  doctors: AppointmentUserRef[]
  onClose: () => void
  onCreated: (appointment: AppointmentItem) => void
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

const DEFAULT_TIME_SLOTS = [
  '09:00 AM - 09:30 AM',
  '10:00 AM - 10:30 AM',
  '11:00 AM - 11:30 AM',
  '02:00 PM - 02:30 PM',
  '04:00 PM - 04:30 PM',
]

export default function ManualAppointmentModal({
  isOpen,
  token,
  doctors,
  onClose,
  onCreated,
}: ManualAppointmentModalProps) {
  const { showError, showSuccess } = usePopup()
  const [department, setDepartment] = useState<DepartmentName | ''>('')
  const [doctorId, setDoctorId] = useState('')
  const [appointmentDate, setAppointmentDate] = useState(() => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
    return tomorrow.toISOString().split('T')[0]
  })
  const [timeSlot, setTimeSlot] = useState(DEFAULT_TIME_SLOTS[0])
  const [symptomsInput, setSymptomsInput] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const filteredDoctors = useMemo(() => {
    if (!department) return doctors
    return doctors.filter((doc) => doc.doctorProfile?.department === department)
  }, [doctors, department])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) {
      showError('Please sign in first to book an appointment.')
      return
    }

    if (!doctorId) {
      showError('Please select a doctor.')
      return
    }

    setLoading(true)
    try {
      const selectedDoc = doctors.find((d) => d._id === doctorId)
      const resolvedDepartment =
        department || selectedDoc?.doctorProfile?.department || 'GeneralMedicine'

      const symptoms = symptomsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)

      const res = await fetch(`${API_BASE_URL}/api/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          doctorId,
          department: resolvedDepartment,
          appointmentDate,
          timeSlot,
          symptoms,
          notes: notes.trim() || undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        showError(data.message || 'Failed to book appointment.')
        setLoading(false)
        return
      }

      showSuccess('Appointment booked successfully.')
      onCreated(data.appointment)
      onClose()
    } catch {
      showError('Unable to reach the server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="manual-booking-title"
    >
      <div className="w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between border-b border-neutral-100 pb-3">
          <div>
            <h2 id="manual-booking-title" className="text-base font-bold text-neutral-900">
              Book Manual Appointment
            </h2>
            <p className="text-xs text-neutral-500">
              Select a department, doctor, and preferred OPD slot.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-neutral-700">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => {
                  setDepartment(e.target.value as DepartmentName | '')
                  setDoctorId('')
                }}
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-xs text-neutral-900 outline-none focus:border-neutral-400 focus:bg-white"
              >
                <option value="">All Departments</option>
                {DEPARTMENT_NAMES.map((dept) => (
                  <option key={dept} value={dept}>
                    {DEPARTMENT_LABELS[dept]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-neutral-700">
                Doctor *
              </label>
              <select
                required
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-xs text-neutral-900 outline-none focus:border-neutral-400 focus:bg-white"
              >
                <option value="">
                  {filteredDoctors.length === 0
                    ? 'No verified doctors found'
                    : 'Select a doctor'}
                </option>
                {filteredDoctors.map((doc) => (
                  <option key={doc._id} value={doc._id}>
                    {doc.name} (
                    {doc.doctorProfile?.specialization ||
                      doc.doctorProfile?.department ||
                      'Doctor'}
                    )
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-neutral-700">
                Date *
              </label>
              <input
                type="date"
                required
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-xs text-neutral-900 outline-none focus:border-neutral-400 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-neutral-700">
                Time Slot *
              </label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-xs text-neutral-900 outline-none focus:border-neutral-400 focus:bg-white"
              >
                {DEFAULT_TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-neutral-700">
              Symptoms (optional, comma-separated)
            </label>
            <input
              type="text"
              value={symptomsInput}
              onChange={(e) => setSymptomsInput(e.target.value)}
              placeholder="e.g. Fever, cough, headache"
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-xs text-neutral-900 outline-none focus:border-neutral-400 focus:bg-white"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-neutral-700">
              Notes (optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional context for the doctor..."
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-900 outline-none focus:border-neutral-400 focus:bg-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-neutral-200 px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || filteredDoctors.length === 0}
              className="rounded-xl bg-neutral-900 px-5 py-2 text-xs font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

