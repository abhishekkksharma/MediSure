'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import StarLoader from '@/components/Common/StarLoader'
import { useUser } from '@/context/userContext'
import { usePopup } from '@/context/popupContext'
import {
  AppointmentItem,
  AppointmentStatus,
  AppointmentUserRef,
} from '@/types/appointment'
import AppointmentCalendar from './AppointmentCalendar'
import AppointmentScheduleGrid from './AppointmentScheduleGrid'
import ManualAppointmentModal from './ManualAppointmentModal'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function AppointmentsMain() {
  const { user, token, loading: authLoading } = useUser()
  const { showError, showSuccess } = usePopup()
  const [appointments, setAppointments] = useState<AppointmentItem[]>([])
  const [doctors, setDoctors] = useState<AppointmentUserRef[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) return
    let active = true

    const loadData = async () => {
      try {
        const [apptsRes, docsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/appointments`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/api/doctors`),
        ])

        if (!active) return

        if (apptsRes.ok) {
          const apptsData = await apptsRes.json()
          setAppointments(apptsData.appointments || [])
        } else {
          const errData = await apptsRes.json()
          showError(errData.message || 'Failed to load appointments.')
        }

        if (docsRes.ok) {
          const docsData = await docsRes.json()
          setDoctors(docsData.doctors || [])
        }
      } catch {
        if (active) showError('Unable to reach the MediSure server.')
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadData()

    return () => {
      active = false
    }
  }, [token, showError])

  const handleUpdateStatus = async (
    appointmentId: string,
    status: AppointmentStatus
  ) => {
    if (!token) return

    try {
      const res = await fetch(`${API_BASE_URL}/api/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      })

      const data = await res.json()
      if (!res.ok) {
        showError(data.message || 'Failed to update appointment status.')
        return
      }

      setAppointments((prev) =>
        prev.map((item) => (item._id === appointmentId ? data.appointment : item))
      )
      showSuccess(`Appointment marked as ${status}.`)
    } catch {
      showError('Unable to update appointment status.')
    }
  }

  if (authLoading) {
    return (
      <div className="mx-auto flex w-full max-w-[1440px] flex-1 items-center justify-center px-6 pt-28">
        <StarLoader label="Loading your schedule..." size="md" />
      </div>
    )
  }

  if (!user || !token) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 pt-28 text-center">
        <div className="w-full rounded-2xl border border-neutral-200 bg-white p-8 shadow-xs">
          <h1 className="text-lg font-bold text-neutral-900">Sign in to view appointments</h1>
          <p className="mt-2 text-xs leading-relaxed text-neutral-500">
            Access your upcoming doctor visits, book manual appointments, or view AI-scheduled consultations.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Link
              href="/auth/login"
              className="rounded-xl bg-neutral-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-neutral-800"
            >
              Sign in
            </Link>
            <Link
              href="/diagnosis"
              className="rounded-xl border border-neutral-200 px-5 py-2.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
            >
              AI Checkup
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <section className="mx-auto w-full max-w-[1440px] flex-1 px-4 pb-12 pt-24 md:px-10 md:pt-28 lg:px-14">
      {loading && appointments.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-10">
          <StarLoader label="Loading appointments..." size="md" />
        </div>
      ) : (
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
          <AppointmentCalendar
            appointments={appointments}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />

          <AppointmentScheduleGrid
            appointments={appointments}
            selectedDate={selectedDate}
            userRole={user.role}
            onOpenManualModal={() => setModalOpen(true)}
            onUpdateStatus={handleUpdateStatus}
          />
        </div>
      )}

      <ManualAppointmentModal
        isOpen={modalOpen}
        token={token}
        doctors={doctors}
        onClose={() => setModalOpen(false)}
        onCreated={(newAppt) => {
          setAppointments((prev) => [newAppt, ...prev])
        }}
      />
    </section>
  )
}

