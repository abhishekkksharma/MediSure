import React from 'react'
import Navbar from '@/components/Header/Navbar'
import AdminGuard from '@/components/Admin/AdminGuard'
import AdminHeader from '@/components/Admin/AdminHeader'
import CreateDoctorForm from '@/components/Admin/CreateDoctorForm'

export default function AdminCreateDoctorPage() {
  return (
    <main className="flex min-h-screen w-full flex-col bg-[#fafafa] text-neutral-900">
      <Navbar />
      <AdminGuard>
        <div className="mx-auto w-full max-w-4xl flex-1 px-4 pb-16 pt-24 md:px-10 md:pt-28">
          <AdminHeader
            title="Create Doctor Account"
            subtitle="Provision a new doctor profile with department, license, and OPD schedule."
          />
          <CreateDoctorForm />
        </div>
      </AdminGuard>
    </main>
  )
}
