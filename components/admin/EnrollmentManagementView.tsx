'use client'

import { useEffect, useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { DataTable, Column } from '@/components/admin/shared/DataTable'
import { ConfirmDialog } from '@/components/admin/shared/ConfirmDialog'
import { FormModal } from '@/components/admin/shared/FormModal'
import { SearchFilter } from '@/components/admin/shared/SearchFilter'
import { useAdminStore } from '@/lib/stores/adminStore'
import { useLongitudinalStore } from '@/lib/stores/longitudinalStore'
import { Plus } from 'lucide-react'

type EnrollmentRow = {
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

const statusOptions = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'WITHDRAWN', label: 'Withdrawn' },
]

const initialForm = {
  studentId: '',
  rotationId: '',
  startDate: '',
  endDate: '',
  status: 'ACTIVE',
}

export function EnrollmentManagementView() {
  const {
    enrollments, rotations, isLoading, error,
    loadEnrollments, loadRotations, createEnrollment, updateEnrollment, deleteEnrollment, clearError,
  } = useAdminStore()
  const { students, loadStudents } = useLongitudinalStore()
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState(initialForm)

  useEffect(() => { loadEnrollments(); loadRotations(); loadStudents() }, [loadEnrollments, loadRotations, loadStudents])

  const studentOptions = students.map(s => ({ value: s.id, label: s.name }))
  const rotationOptions = (rotations as Array<{ id: string; clerkship?: { name: string }; academicYear: string }>).map(r => ({
    value: r.id,
    label: `${r.clerkship?.name || 'Unknown'} (${r.academicYear})`,
  }))

  const filtered = useMemo(() => {
    if (!search) return enrollments as EnrollmentRow[]
    const lower = search.toLowerCase()
    return (enrollments as EnrollmentRow[]).filter(e =>
      e.student?.name?.toLowerCase().includes(lower) ||
      e.rotation?.clerkship?.name?.toLowerCase().includes(lower) ||
      e.status.toLowerCase().includes(lower)
    )
  }, [enrollments, search])

  const columns: Column<EnrollmentRow>[] = [
    {
      key: 'student',
      header: 'Student',
      sortable: true,
      render: (item) => item.student?.name || item.studentId,
    },
    {
      key: 'rotation',
      header: 'Rotation',
      render: (item) => `${item.rotation?.clerkship?.name || ''} (${item.rotation?.academicYear || ''})`,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (item) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
          item.status === 'ACTIVE' ? 'bg-status-success/10 text-status-success' :
          item.status === 'COMPLETED' ? 'bg-medical-primary/10 text-medical-primary' :
          'bg-status-warning/10 text-status-warning'
        }`}>
          {item.status}
        </span>
      ),
    },
    {
      key: 'startDate',
      header: 'Start',
      render: (item) => new Date(item.startDate).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: '',
      render: (item) => (
        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="ghost" onClick={() => handleEdit(item)}>Edit</Button>
          <Button size="sm" variant="ghost" onClick={() => setDeleteId(item.id)}>Delete</Button>
        </div>
      ),
    },
  ]

  const handleEdit = (item: EnrollmentRow) => {
    setForm({
      studentId: item.studentId,
      rotationId: item.rotationId,
      startDate: new Date(item.startDate).toISOString().split('T')[0],
      endDate: item.endDate ? new Date(item.endDate).toISOString().split('T')[0] : '',
      status: item.status,
    })
    setEditId(item.id)
    setShowForm(true)
  }

  const handleSubmit = async () => {
    const data = {
      ...form,
      endDate: form.endDate || null,
    }
    try {
      if (editId) {
        await updateEnrollment(editId, { startDate: form.startDate, endDate: data.endDate, status: form.status })
      } else {
        await createEnrollment(data)
      }
      setShowForm(false)
      setEditId(null)
      setForm(initialForm)
    } catch { /* error is in store */ }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteEnrollment(deleteId)
      setDeleteId(null)
    } catch { /* error is in store */ }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Manage Enrollments</CardTitle>
          <Button size="sm" onClick={() => { setForm(initialForm); setEditId(null); setShowForm(true) }}>
            <Plus className="w-4 h-4 mr-1" /> Add Enrollment
          </Button>
        </CardHeader>

        {error && (
          <div className="mx-4 mb-4 p-3 rounded-lg bg-category-fail/10 text-category-fail text-sm flex justify-between items-center">
            {error}
            <button onClick={clearError} className="text-xs underline">Dismiss</button>
          </div>
        )}

        <div className="px-4 pb-2">
          <SearchFilter value={search} onChange={setSearch} placeholder="Search enrollments..." />
        </div>

        <div className="px-4 pb-4">
          <DataTable data={filtered} columns={columns} emptyMessage="No enrollments found." />
        </div>
      </Card>

      <FormModal
        open={showForm}
        title={editId ? 'Edit Enrollment' : 'Create Enrollment'}
        onClose={() => { setShowForm(false); setEditId(null) }}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      >
        {!editId && (
          <>
            <Select label="Student" options={studentOptions} value={form.studentId} onChange={e => setForm(f => ({ ...f, studentId: e.target.value }))} placeholder="Select student" />
            <Select label="Rotation" options={rotationOptions} value={form.rotationId} onChange={e => setForm(f => ({ ...f, rotationId: e.target.value }))} placeholder="Select rotation" />
          </>
        )}
        <Input label="Start Date" type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
        <Input label="End Date (optional)" type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
        <Select label="Status" options={statusOptions} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} />
      </FormModal>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Enrollment"
        message="This will permanently delete this enrollment and all associated evaluations. This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        isLoading={isLoading}
      />
    </div>
  )
}
