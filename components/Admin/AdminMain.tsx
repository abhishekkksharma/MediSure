'use client'

import React, { useEffect, useMemo, useState } from 'react'
import StarLoader from '@/components/Common/StarLoader'
import { UserRole, useUser } from '@/context/userContext'
import { usePopup } from '@/context/popupContext'
import {
  deleteUserAccount,
  fetchAdminUsers,
  updateUserActiveStatus,
  verifyDoctorAccount,
} from '@/lib/adminApi'
import { AdminStatsSummary, AdminUserRecord } from '@/types/admin'
import AdminGuard from './AdminGuard'
import AdminHeader from './AdminHeader'
import AdminStats from './AdminStats'
import UsersTable from './UsersTable'

function AdminDashboardContent() {
  const { user, token } = useUser()
  const { showError, showSuccess } = usePopup()
  const [users, setUsers] = useState<AdminUserRecord[]>([])
  const [patientTotal, setPatientTotal] = useState(0)
  const [adminTotal, setAdminTotal] = useState(0)
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [busyUserId, setBusyUserId] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    let active = true

    const load = async () => {
      try {
        const [doctorsRes, adminsRes, patientsRes] = await Promise.all([
          fetchAdminUsers(token, { role: 'doctor', limit: 100 }),
          fetchAdminUsers(token, { role: 'admin', limit: 100 }),
          fetchAdminUsers(token, { role: 'patient', limit: 100 }),
        ])
        if (!active) return

        setUsers([
          ...(doctorsRes.users || []),
          ...(adminsRes.users || []),
          ...(patientsRes.users || []),
        ])
        setPatientTotal(patientsRes.pagination?.total ?? (patientsRes.users || []).length)
        setAdminTotal(adminsRes.pagination?.total ?? (adminsRes.users || []).length)
      } catch (err) {
        if (active) {
          showError(err instanceof Error ? err.message : 'Failed to load users.')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [token, showError])

  const summary: AdminStatsSummary = useMemo(() => {
    const doctors = users.filter((u) => u.role === 'doctor')
    const verifiedDoctors = doctors.filter((u) => u.doctorProfile?.isVerified)
    return {
      totalUsers: doctors.length + patientTotal + adminTotal,
      doctors: doctors.length,
      verifiedDoctors: verifiedDoctors.length,
      patients: patientTotal,
    }
  }, [users, patientTotal, adminTotal])

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase()
    return users.filter((u) => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false
      if (q) {
        const matchesName = u.name.toLowerCase().includes(q)
        const matchesEmail = u.email.toLowerCase().includes(q)
        if (!matchesName && !matchesEmail) return false
      }
      return true
    })
  }, [users, roleFilter, search])

  const handleToggleVerifyDoctor = async (target: AdminUserRecord) => {
    if (!token) return
    setBusyUserId(target._id)
    try {
      const nextVerified = !target.doctorProfile?.isVerified
      const res = await verifyDoctorAccount(token, target._id, nextVerified)
      setUsers((prev) => prev.map((u) => (u._id === target._id ? res.user : u)))
      showSuccess(
        `${target.name} has been ${nextVerified ? 'verified' : 'unverified'}.`
      )
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to update verification.')
    } finally {
      setBusyUserId(null)
    }
  }

  const handleToggleActive = async (target: AdminUserRecord) => {
    if (!token) return
    setBusyUserId(target._id)
    try {
      const nextActive = !target.isActive
      const res = await updateUserActiveStatus(token, target._id, nextActive)
      setUsers((prev) => prev.map((u) => (u._id === target._id ? res.user : u)))
      showSuccess(
        `${target.name} is now ${nextActive ? 'active' : 'suspended'}.`
      )
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to update user status.')
    } finally {
      setBusyUserId(null)
    }
  }

  const handleDeleteUser = async (target: AdminUserRecord) => {
    if (!token) return
    setBusyUserId(target._id)
    try {
      await deleteUserAccount(token, target._id)
      setUsers((prev) => prev.filter((u) => u._id !== target._id))
      showSuccess(`${target.name} has been removed.`)
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to delete user.')
    } finally {
      setBusyUserId(null)
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16 pt-24 md:px-10 md:pt-28">
      <AdminHeader
        title="Users & Doctors"
        subtitle="Manage accounts, verify doctors, and onboard new specialists."
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <StarLoader label="Loading users..." size="md" />
        </div>
      ) : (
        <>
          <AdminStats summary={summary} />
          <UsersTable
            users={filteredUsers}
            currentUserId={user?._id || ''}
            roleFilter={roleFilter}
            search={search}
            busyUserId={busyUserId}
            onRoleFilterChange={setRoleFilter}
            onSearchChange={setSearch}
            onToggleVerifyDoctor={handleToggleVerifyDoctor}
            onToggleActive={handleToggleActive}
            onDeleteUser={handleDeleteUser}
          />
        </>
      )}
    </div>
  )
}

export default function AdminMain() {
  return (
    <AdminGuard>
      <AdminDashboardContent />
    </AdminGuard>
  )
}
