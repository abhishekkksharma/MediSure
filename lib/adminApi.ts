import { AdminUserRecord, AdminUsersResponse, CreateDoctorPayload } from '@/types/admin'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

async function parseJson<T>(res: Response): Promise<T & { message?: string }> {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error((data as { message?: string }).message || 'Request failed')
  }
  return data as T & { message?: string }
}

export async function fetchAdminUsers(
  token: string,
  params?: { role?: string; search?: string; limit?: number }
): Promise<AdminUsersResponse> {
  const query = new URLSearchParams()
  if (params?.role && params.role !== 'all') query.set('role', params.role)
  if (params?.search?.trim()) query.set('search', params.search.trim())
  query.set('limit', String(params?.limit ?? 100))

  const res = await fetch(`${API_BASE_URL}/api/users?${query.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return parseJson<AdminUsersResponse>(res)
}

export async function createDoctorAccount(
  token: string,
  payload: CreateDoctorPayload
): Promise<{ message?: string; user: AdminUserRecord }> {
  const res = await fetch(`${API_BASE_URL}/api/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      ...payload,
      role: 'doctor',
    }),
  })
  return parseJson<{ user: AdminUserRecord }>(res)
}

export async function verifyDoctorAccount(
  token: string,
  userId: string,
  isVerified: boolean
): Promise<{ message?: string; user: AdminUserRecord }> {
  const res = await fetch(`${API_BASE_URL}/api/users/${userId}/verify`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ isVerified }),
  })
  return parseJson<{ user: AdminUserRecord }>(res)
}

export async function updateUserActiveStatus(
  token: string,
  userId: string,
  isActive: boolean
): Promise<{ message?: string; user: AdminUserRecord }> {
  const res = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ isActive }),
  })
  return parseJson<{ user: AdminUserRecord }>(res)
}

export async function deleteUserAccount(
  token: string,
  userId: string
): Promise<{ message?: string }> {
  const res = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  return parseJson<{ message?: string }>(res)
}
