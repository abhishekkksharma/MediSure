'use client'

import React from 'react'
import { AdminUserRecord } from '@/types/admin'
import { UserRole } from '@/context/userContext'
import { DEPARTMENT_LABELS } from '@/types/doctor'

interface UsersTableProps {
  users: AdminUserRecord[]
  currentUserId: string
  roleFilter: 'all' | UserRole
  search: string
  busyUserId: string | null
  onRoleFilterChange: (role: 'all' | UserRole) => void
  onSearchChange: (value: string) => void
  onToggleVerifyDoctor: (user: AdminUserRecord) => Promise<void>
  onToggleActive: (user: AdminUserRecord) => Promise<void>
  onDeleteUser: (user: AdminUserRecord) => Promise<void>
}

const ROLE_FILTERS: Array<{ value: 'all' | UserRole; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'doctor', label: 'Doctors' },
  { value: 'patient', label: 'Patients' },
  { value: 'admin', label: 'Admins' },
]

export default function UsersTable({
  users,
  currentUserId,
  roleFilter,
  search,
  busyUserId,
  onRoleFilterChange,
  onSearchChange,
  onToggleVerifyDoctor,
  onToggleActive,
  onDeleteUser,
}: UsersTableProps) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white">
      {/* Toolbar */}
      <div className="flex flex-col justify-between gap-3 border-b border-neutral-100 p-4 sm:flex-row sm:items-center md:px-6">
        <div className="flex flex-wrap items-center gap-1.5">
          {ROLE_FILTERS.map((f) => {
            const active = roleFilter === f.value
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => onRoleFilterChange(f.value)}
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

        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search name or email..."
          className="w-full rounded-full border border-neutral-200 bg-neutral-50/70 px-4 py-1.5 text-xs text-neutral-900 outline-none transition focus:border-neutral-400 focus:bg-white sm:w-64"
        />
      </div>

      {/* Table / Responsive List */}
      {users.length === 0 ? (
        <div className="py-14 text-center">
          <p className="text-sm font-medium text-neutral-700">No matching users found</p>
          <p className="mt-1 text-xs text-neutral-500">
            Try adjusting your role filter or search query.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-neutral-100">
          {users.map((u) => {
            const isSelf = u._id === currentUserId
            const isBusy = busyUserId === u._id
            const isDoctor = u.role === 'doctor'
            const isVerified = Boolean(u.doctorProfile?.isVerified)

            return (
              <div
                key={u._id}
                className="flex flex-col justify-between gap-3 px-4 py-4 transition hover:bg-neutral-50/60 sm:flex-row sm:items-center md:px-6"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold text-neutral-900">
                      {u.name}
                    </p>
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold capitalize text-neutral-700">
                      {u.role}
                    </span>
                    {isDoctor && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          isVerified
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {isVerified ? 'Verified' : 'Unverified'}
                      </span>
                    )}
                    {!u.isActive && (
                      <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                        Inactive
                      </span>
                    )}
                  </div>

                  <p className="truncate text-xs text-neutral-500">
                    {u.email}
                    {u.phone ? ` · ${u.phone}` : ''}
                    {isDoctor && u.doctorProfile?.department
                      ? ` · ${
                          DEPARTMENT_LABELS[u.doctorProfile.department] ||
                          u.doctorProfile.department
                        }`
                      : ''}
                    {isDoctor && u.doctorProfile?.specialization
                      ? ` (${u.doctorProfile.specialization})`
                      : ''}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {isDoctor && (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => onToggleVerifyDoctor(u)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition disabled:opacity-50 ${
                        isVerified
                          ? 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {isVerified ? 'Unverify' : 'Verify'}
                    </button>
                  )}

                  {!isSelf && (
                    <>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => onToggleActive(u)}
                        className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50"
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => onDeleteUser(u)}
                        className="rounded-full border border-red-200 bg-white px-3 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
