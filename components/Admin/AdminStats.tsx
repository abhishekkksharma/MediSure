'use client'

import React from 'react'
import { AdminStatsSummary } from '@/types/admin'

export default function AdminStats({ summary }: { summary: AdminStatsSummary }) {
  const stats = [
    { label: 'Total Users', value: summary.totalUsers },
    { label: 'Doctors', value: summary.doctors },
    { label: 'Verified Doctors', value: summary.verifiedDoctors },
    { label: 'Patients', value: summary.patients },
  ]

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-neutral-200 bg-white px-5 py-4"
        >
          <p className="text-[11px] font-medium text-neutral-500">{item.label}</p>
          <p className="mt-1 font-serif text-3xl text-neutral-900">{item.value}</p>
        </div>
      ))}
    </div>
  )
}
