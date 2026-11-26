import React from 'react'
import Navbar from '@/components/Header/Navbar'
import AppointmentsMain from '@/components/Appointments/AppointmentsMain'

export default function AppointmentsPage() {
  return (
    <main className="flex min-h-screen w-full flex-col bg-[#fafafa] text-neutral-900">
      <Navbar />
      <AppointmentsMain />
    </main>
  )
}
