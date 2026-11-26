import React from 'react'
import Navbar from '@/components/Header/Navbar'
import AdminMain from '@/components/Admin/AdminMain'

export default function AdminPage() {
  return (
    <main className="flex min-h-screen w-full flex-col bg-[#fafafa] text-neutral-900">
      <Navbar />
      <AdminMain />
    </main>
  )
}
