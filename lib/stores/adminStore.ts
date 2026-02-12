import { create } from 'zustand'

interface User {
  id: string
  email: string
  name: string | null
  role: 'ADMIN' | 'USER'
  mustChangePassword: boolean
  createdAt: string
  updatedAt: string
  [key: string]: unknown
}

interface AdminClerkship {
  id: string
  name: string
  templateId: string
  type: string
  durationWeeks: number
  midpointWeek: number | null
  evaluationFrequency: string | null
  createdAt: string
  [key: string]: unknown
}

interface AdminRotation {
  id: string
  clerkshipId: string
  clerkship?: { name: string }
  startDate: string
  endDate: string
  academicYear: string
  [key: string]: unknown
}

interface AdminEnrollment {
  id: string
  studentId: string
  rotationId: string
  student?: { name: string; email?: string | null }
  rotation?: { clerkship?: { name: string }; academicYear: string }
  startDate: string
  endDate?: string | null
  status: string
  [key: string]: unknown
}

interface AdminState {
  // Data
  users: User[]
  clerkships: AdminClerkship[]
  rotations: AdminRotation[]
  enrollments: AdminEnrollment[]

  // UI state
  isLoading: boolean
  error: string | null

  // Actions
  loadUsers: () => Promise<void>
  createUser: (data: Record<string, unknown>) => Promise<void>
  updateUser: (id: string, data: Record<string, unknown>) => Promise<void>
  deleteUser: (id: string) => Promise<void>
  loadClerkships: () => Promise<void>
  createClerkship: (data: Record<string, unknown>) => Promise<void>
  updateClerkship: (id: string, data: Record<string, unknown>) => Promise<void>
  deleteClerkship: (id: string) => Promise<void>
  loadRotations: (clerkshipId?: string) => Promise<void>
  createRotation: (data: Record<string, unknown>) => Promise<void>
  updateRotation: (id: string, data: Record<string, unknown>) => Promise<void>
  deleteRotation: (id: string) => Promise<void>
  loadEnrollments: (rotationId?: string) => Promise<void>
  createEnrollment: (data: Record<string, unknown>) => Promise<void>
  updateEnrollment: (id: string, data: Record<string, unknown>) => Promise<void>
  deleteEnrollment: (id: string) => Promise<void>
  clearError: () => void
}

async function apiCall(url: string, options?: RequestInit) {
  const response = await fetch(url, options)
  if (!response.ok) {
    const data = await response.json()
    throw new Error(data.error || `Request failed (${response.status})`)
  }
  return response.json()
}

export const useAdminStore = create<AdminState>()((set) => ({
  users: [],
  clerkships: [],
  rotations: [],
  enrollments: [],
  isLoading: false,
  error: null,

  // Users
  loadUsers: async () => {
    set({ isLoading: true, error: null })
    try {
      const users = await apiCall('/api/users')
      set({ users, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  createUser: async (data) => {
    set({ isLoading: true, error: null })
    try {
      await apiCall('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const users = await apiCall('/api/users')
      set({ users, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },

  updateUser: async (id, data) => {
    set({ isLoading: true, error: null })
    try {
      await apiCall(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const users = await apiCall('/api/users')
      set({ users, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },

  deleteUser: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await apiCall(`/api/users/${id}`, { method: 'DELETE' })
      const users = await apiCall('/api/users')
      set({ users, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },

  // Clerkships
  loadClerkships: async () => {
    set({ isLoading: true, error: null })
    try {
      const clerkships = await apiCall('/api/clerkships')
      set({ clerkships, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  createClerkship: async (data) => {
    set({ isLoading: true, error: null })
    try {
      await apiCall('/api/clerkships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const clerkships = await apiCall('/api/clerkships')
      set({ clerkships, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },

  updateClerkship: async (id, data) => {
    set({ isLoading: true, error: null })
    try {
      await apiCall(`/api/clerkships/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const clerkships = await apiCall('/api/clerkships')
      set({ clerkships, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },

  deleteClerkship: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await apiCall(`/api/clerkships/${id}`, { method: 'DELETE' })
      const clerkships = await apiCall('/api/clerkships')
      set({ clerkships, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },

  // Rotations
  loadRotations: async (clerkshipId) => {
    set({ isLoading: true, error: null })
    try {
      const url = clerkshipId ? `/api/rotations?clerkshipId=${clerkshipId}` : '/api/rotations'
      const rotations = await apiCall(url)
      set({ rotations, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  createRotation: async (data) => {
    set({ isLoading: true, error: null })
    try {
      await apiCall('/api/rotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const rotations = await apiCall('/api/rotations')
      set({ rotations, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },

  updateRotation: async (id, data) => {
    set({ isLoading: true, error: null })
    try {
      await apiCall(`/api/rotations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const rotations = await apiCall('/api/rotations')
      set({ rotations, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },

  deleteRotation: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await apiCall(`/api/rotations/${id}`, { method: 'DELETE' })
      const rotations = await apiCall('/api/rotations')
      set({ rotations, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },

  // Enrollments
  loadEnrollments: async (rotationId) => {
    set({ isLoading: true, error: null })
    try {
      const url = rotationId ? `/api/enrollments?rotationId=${rotationId}` : '/api/enrollments'
      const enrollments = await apiCall(url)
      set({ enrollments, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  createEnrollment: async (data) => {
    set({ isLoading: true, error: null })
    try {
      await apiCall('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const enrollments = await apiCall('/api/enrollments')
      set({ enrollments, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },

  updateEnrollment: async (id, data) => {
    set({ isLoading: true, error: null })
    try {
      await apiCall(`/api/enrollments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const enrollments = await apiCall('/api/enrollments')
      set({ enrollments, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },

  deleteEnrollment: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await apiCall(`/api/enrollments/${id}`, { method: 'DELETE' })
      const enrollments = await apiCall('/api/enrollments')
      set({ enrollments, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },

  clearError: () => set({ error: null }),
}))
