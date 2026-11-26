'use client'

import React, { useMemo, useState } from 'react'
import { AppointmentItem } from '@/types/appointment'
import { DEPARTMENT_LABELS } from '@/types/doctor'

interface AppointmentCalendarProps {
  appointments: AppointmentItem[]
  selectedDate: string | null
  onSelectDate: (dateKey: string | null) => void
}

const DAY_HEADERS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export default function AppointmentCalendar({
  appointments,
  selectedDate,
  onSelectDate,
}: AppointmentCalendarProps) {
  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  const todayKey = toDateKey(new Date())

  const appointmentsByDate = useMemo(() => {
    const map = new Map<string, AppointmentItem[]>()
    for (const appt of appointments) {
      if (appt.status === 'cancelled') continue
      const key = toDateKey(new Date(appt.appointmentDate))
      const existing = map.get(key) || []
      existing.push(appt)
      map.set(key, existing)
    }
    return map
  }, [appointments])

  const calendarDays = useMemo(() => {
    const year = viewMonth.getFullYear()
    const month = viewMonth.getMonth()
    const firstDayIndex = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const cells: Array<{ date: Date | null; key: string }> = []
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push({ date: null, key: `empty-${i}` })
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d)
      cells.push({ date, key: toDateKey(date) })
    }
    return cells
  }, [viewMonth])

  const upcomingAppointments = useMemo(() => {
    const nowStart = new Date()
    nowStart.setHours(0, 0, 0, 0)

    return [...appointments]
      .filter(
        (a) =>
          a.status !== 'cancelled' &&
          a.status !== 'completed' &&
          new Date(a.appointmentDate) >= nowStart
      )
      .sort(
        (a, b) =>
          new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime()
      )
      .slice(0, 5)
  }, [appointments])

  const monthLabel = viewMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <aside className="flex w-full flex-col gap-5 lg:w-76 lg:shrink-0">
      {/* Mini Month Calendar */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-900">{monthLabel}</h2>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() =>
                setViewMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
              }
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-200 text-xs text-neutral-600 hover:bg-neutral-50"
              aria-label="Previous month"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() =>
                setViewMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
              }
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-200 text-xs text-neutral-600 hover:bg-neutral-50"
              aria-label="Next month"
            >
              ›
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-neutral-400">
          {DAY_HEADERS.map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="mt-1 grid grid-cols-7 gap-1 text-center text-xs">
          {calendarDays.map((cell) => {
            if (!cell.date) {
              return <div key={cell.key} className="h-8" />
            }

            const isToday = cell.key === todayKey
            const isSelected = cell.key === selectedDate
            const count = appointmentsByDate.get(cell.key)?.length || 0

            return (
              <button
                key={cell.key}
                type="button"
                onClick={() => onSelectDate(isSelected ? null : cell.key)}
                className={`relative flex h-8 flex-col items-center justify-center rounded-lg text-xs transition ${
                  isSelected
                    ? 'bg-neutral-900 font-semibold text-white'
                    : isToday
                    ? 'border border-neutral-900 font-semibold text-neutral-900'
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <span>{cell.date.getDate()}</span>
                {count > 0 && (
                  <span
                    className={`absolute bottom-1 h-1 w-1 rounded-full ${
                      isSelected ? 'bg-white' : 'bg-emerald-500'
                    }`}
                  />
                )}
              </button>
            )
          })}
        </div>

        {selectedDate && (
          <button
            type="button"
            onClick={() => onSelectDate(null)}
            className="mt-3 w-full rounded-lg border border-neutral-200 py-1.5 text-[11px] font-medium text-neutral-600 hover:bg-neutral-50"
          >
            Clear date filter ({selectedDate})
          </button>
        )}
      </div>

      {/* Upcoming Appointments Sidebar List */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Upcoming
          </h3>
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-700">
            {upcomingAppointments.length}
          </span>
        </div>

        {upcomingAppointments.length === 0 ? (
          <p className="text-xs text-neutral-500">No upcoming appointments scheduled.</p>
        ) : (
          <div className="space-y-2.5">
            {upcomingAppointments.map((appt) => {
              const dateObj = new Date(appt.appointmentDate)
              const dateKey = toDateKey(dateObj)
              return (
                <button
                  key={appt._id}
                  type="button"
                  onClick={() => onSelectDate(dateKey)}
                  className="w-full rounded-xl border border-neutral-100 bg-neutral-50/70 p-2.5 text-left transition hover:border-neutral-300 hover:bg-neutral-50"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs font-semibold text-neutral-900">
                      {appt.doctor?.name || 'Doctor'}
                    </span>
                    <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[10px] font-medium capitalize text-neutral-600 border border-neutral-200">
                      {appt.status}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-[11px] text-neutral-500">
                    {DEPARTMENT_LABELS[appt.department] || appt.department}
                  </p>
                  <p className="mt-1 text-[11px] font-medium text-neutral-700">
                    {dateObj.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}{' '}
                    · {appt.timeSlot}
                  </p>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </aside>
  )
}

