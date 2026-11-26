'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { AppointmentItem, AppointmentStatus } from '@/types/appointment'
import { DEPARTMENT_LABELS } from '@/types/doctor'
import { UserRole } from '@/context/userContext'
import { toDateKey } from './AppointmentCalendar'

interface AppointmentScheduleGridProps {
  appointments: AppointmentItem[]
  selectedDate: string | null
  userRole?: UserRole
  onOpenManualModal: () => void
  onUpdateStatus: (appointmentId: string, status: AppointmentStatus) => Promise<void>
}

const STATUS_FILTERS: Array<{ value: 'all' | AppointmentStatus; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const CARD_TONES: Record<AppointmentStatus, string> = {
  confirmed: 'border-emerald-200 bg-emerald-50/70 text-emerald-950',
  pending: 'border-amber-200 bg-amber-50/70 text-amber-950',
  completed: 'border-sky-200 bg-sky-50/70 text-sky-950',
  cancelled: 'border-neutral-200 bg-neutral-100/70 text-neutral-500',
}

function getWeekStart(base: Date): Date {
  const d = new Date(base)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day // Monday start
  d.setDate(d.getDate() + diff)
  return d
}

export default function AppointmentScheduleGrid({
  appointments,
  selectedDate,
  userRole,
  onOpenManualModal,
  onUpdateStatus,
}: AppointmentScheduleGridProps) {
  const [statusFilter, setStatusFilter] = useState<'all' | AppointmentStatus>('all')
  const [viewMode, setViewMode] = useState<'week' | 'list'>('week')
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()))

  const todayKey = toDateKey(new Date())

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, idx) => {
      const d = new Date(weekStart)
      d.setDate(weekStart.getDate() + idx)
      return {
        date: d,
        key: toDateKey(d),
        dayNum: d.getDate(),
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      }
    })
  }, [weekStart])

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appt) => {
      if (statusFilter !== 'all' && appt.status !== statusFilter) return false
      if (selectedDate && toDateKey(new Date(appt.appointmentDate)) !== selectedDate) {
        return false
      }
      return true
    })
  }, [appointments, statusFilter, selectedDate])

  const appointmentsByDay = useMemo(() => {
    const map = new Map<string, AppointmentItem[]>()
    for (const appt of filteredAppointments) {
      const key = toDateKey(new Date(appt.appointmentDate))
      const list = map.get(key) || []
      list.push(appt)
      map.set(key, list)
    }
    return map
  }, [filteredAppointments])

  const weekRangeLabel = useMemo(() => {
    const end = new Date(weekStart)
    end.setDate(weekStart.getDate() + 6)
    const startStr = weekStart.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
    })
    const endStr = end.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
    return `${startStr} – ${endStr}`
  }, [weekStart])

  return (
    <div className="flex-1 rounded-2xl border border-neutral-200 bg-white p-4 md:p-6">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-4">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-lg font-bold tracking-tight text-neutral-900">
            {selectedDate ? `Schedule · ${selectedDate}` : weekRangeLabel}
          </h1>

          {/* Status Filter Pills */}
          <div className="flex flex-wrap items-center gap-1">
            {STATUS_FILTERS.map((f) => {
              const active = statusFilter === f.value
              return (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setStatusFilter(f.value)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    active
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200/70'
                  }`}
                >
                  {f.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Week Navigation */}
          {viewMode === 'week' && !selectedDate && (
            <div className="flex items-center gap-1 rounded-xl border border-neutral-200 p-0.5">
              <button
                type="button"
                onClick={() =>
                  setWeekStart((d) => {
                    const prev = new Date(d)
                    prev.setDate(d.getDate() - 7)
                    return prev
                  })
                }
                className="rounded-lg px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-100"
                aria-label="Previous week"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => setWeekStart(getWeekStart(new Date()))}
                className="rounded-lg px-2 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() =>
                  setWeekStart((d) => {
                    const next = new Date(d)
                    next.setDate(d.getDate() + 7)
                    return next
                  })
                }
                className="rounded-lg px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-100"
                aria-label="Next week"
              >
                ›
              </button>
            </div>
          )}

          {/* View Mode Switch */}
          <div className="flex rounded-xl border border-neutral-200 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('week')}
              className={`rounded-lg px-2.5 py-1 font-medium ${
                viewMode === 'week' ? 'bg-neutral-900 text-white' : 'text-neutral-600'
              }`}
            >
              Week
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`rounded-lg px-2.5 py-1 font-medium ${
                viewMode === 'list' ? 'bg-neutral-900 text-white' : 'text-neutral-600'
              }`}
            >
              List
            </button>
          </div>

          <Link
            href="/diagnosis"
            className="rounded-full border border-neutral-200 px-3.5 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50"
          >
            AI Checkup
          </Link>

          <button
            type="button"
            onClick={onOpenManualModal}
            className="rounded-full bg-neutral-900 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-neutral-800"
          >
            + Book Appointment
          </button>
        </div>
      </div>

      {/* Week Grid View */}
      {viewMode === 'week' && !selectedDate ? (
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-7">
          {weekDays.map((day) => {
            const isToday = day.key === todayKey
            const dayItems = appointmentsByDay.get(day.key) || []

            return (
              <div
                key={day.key}
                className="flex min-h-[260px] flex-col rounded-xl border border-neutral-100 bg-neutral-50/40 p-2"
              >
                <div
                  className={`mb-2 rounded-lg px-2 py-1.5 text-center text-xs font-semibold ${
                    isToday
                      ? 'bg-neutral-900 text-white'
                      : 'text-neutral-700'
                  }`}
                >
                  {day.dayNum} - {day.dayName}
                </div>

                <div className="flex flex-1 flex-col gap-2">
                  {dayItems.length === 0 ? (
                    <p className="mt-6 text-center text-[11px] text-neutral-400">—</p>
                  ) : (
                    dayItems.map((appt) => (
                      <div
                        key={appt._id}
                        className={`rounded-xl border p-2.5 text-xs ${CARD_TONES[appt.status]}`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="truncate font-semibold">
                            {userRole === 'doctor'
                              ? appt.patient?.name || 'Patient'
                              : appt.doctor?.name || 'Doctor'}
                          </span>
                          <span className="rounded bg-white/80 px-1.5 py-0.5 text-[9px] font-bold uppercase">
                            {appt.bookingType === 'ai_diagnosis' ? 'AI' : 'Manual'}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-[11px] opacity-80">
                          {DEPARTMENT_LABELS[appt.department] || appt.department}
                        </p>
                        <p className="mt-1 text-[10px] font-medium opacity-75">
                          {appt.timeSlot}
                        </p>

                        <div className="mt-2 flex items-center justify-between gap-1 border-t border-black/5 pt-1.5">
                          <span className="text-[10px] font-semibold capitalize">
                            {appt.status}
                          </span>
                          {appt.status !== 'cancelled' && appt.status !== 'completed' && (
                            <div className="flex gap-1">
                              {(userRole === 'doctor' || userRole === 'admin') &&
                                appt.status === 'pending' && (
                                  <button
                                    type="button"
                                    onClick={() => onUpdateStatus(appt._id, 'confirmed')}
                                    className="rounded bg-white px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 shadow-2xs hover:bg-emerald-50"
                                  >
                                    Confirm
                                  </button>
                                )}
                              <button
                                type="button"
                                onClick={() => onUpdateStatus(appt._id, 'cancelled')}
                                className="rounded bg-white px-1.5 py-0.5 text-[10px] font-semibold text-neutral-700 shadow-2xs hover:bg-red-50 hover:text-red-700"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* List View (or filtered by specific calendar date) */
        <div className="mt-4 space-y-2.5">
          {filteredAppointments.length === 0 ? (
            <div className="rounded-xl border border-dashed border-neutral-200 py-12 text-center">
              <p className="text-sm font-medium text-neutral-700">No appointments found</p>
              <p className="mt-1 text-xs text-neutral-500">
                Book a manual appointment or start an AI symptom checkup.
              </p>
            </div>
          ) : (
            filteredAppointments.map((appt) => (
              <div
                key={appt._id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-50/40 p-4"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-neutral-900">
                      {userRole === 'doctor'
                        ? appt.patient?.name || 'Patient'
                        : appt.doctor?.name || 'Doctor'}
                    </span>
                    <span className="rounded-full border border-neutral-200 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase text-neutral-600">
                      {appt.bookingType === 'ai_diagnosis' ? 'AI Diagnosis' : 'Manual'}
                    </span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${CARD_TONES[appt.status]}`}
                    >
                      {appt.status}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600">
                    {DEPARTMENT_LABELS[appt.department] || appt.department} ·{' '}
                    {new Date(appt.appointmentDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}{' '}
                    · {appt.timeSlot}
                  </p>
                  {appt.aiDiagnosisSummary && (
                    <p className="max-w-2xl text-xs text-neutral-500">
                      AI Note: {appt.aiDiagnosisSummary}
                    </p>
                  )}
                </div>

                {appt.status !== 'cancelled' && appt.status !== 'completed' && (
                  <div className="flex items-center gap-2">
                    {(userRole === 'doctor' || userRole === 'admin') &&
                      appt.status === 'pending' && (
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(appt._id, 'confirmed')}
                          className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                        >
                          Confirm
                        </button>
                      )}
                    {(userRole === 'doctor' || userRole === 'admin') &&
                      appt.status === 'confirmed' && (
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(appt._id, 'completed')}
                          className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-100"
                        >
                          Mark Complete
                        </button>
                      )}
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(appt._id, 'cancelled')}
                      className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-red-50 hover:text-red-700"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

