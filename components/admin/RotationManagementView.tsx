'use client'

import { useEffect, useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { DataTable, Column } from '@/components/admin/shared/DataTable'
import { ConfirmDialog } from '@/components/admin/shared/ConfirmDialog'
import { FormModal } from '@/components/admin/shared/FormModal'
import { SearchFilter } from '@/components/admin/shared/SearchFilter'
import { useAdminStore } from '@/lib/stores/adminStore'
import { Plus } from 'lucide-react'

type RotationRow = {
  id: string
  clerkshipId: string
  clerkship?: { name: string }
  startDate: string
  endDate: string
  academicYear: string
  [key: string]: unknown
}

const initialForm = {
  clerkshipId: '',
  startDate: '',
  endDate: '',
  academicYear: '',
}

export function RotationManagementView() {
  const {
    rotations, clerkships, isLoading, error,
    loadRotations, loadClerkships, createRotation, updateRotation, deleteRotation, clearError,
  } = useAdminStore()
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState(initialForm)

  useEffect(() => { loadRotations(); loadClerkships() }, [loadRotations, loadClerkships])

  const clerkshipOptions = (clerkships as Array<{ id: string; name: string }>).map(c => ({ value: c.id, label: c.name }))

  const filtered = useMemo(() => {
    if (!search) return rotations as RotationRow[]
    const lower = search.toLowerCase()
    return (rotations as RotationRow[]).filter(r =>
      r.clerkship?.name?.toLowerCase().includes(lower) ||
      r.academicYear.toLowerCase().includes(lower)
    )
  }, [rotations, search])

  const columns: Column<RotationRow>[] = [
    {
      key: 'clerkship',
      header: 'Clerkship',
      sortable: true,
      render: (item) => item.clerkship?.name || item.clerkshipId,
    },
    {
      key: 'startDate',
      header: 'Start',
      sortable: true,
      render: (item) => new Date(item.startDate).toLocaleDateString(),
    },
    {
      key: 'endDate',
      header: 'End',
      render: (item) => new Date(item.endDate).toLocaleDateString(),
    },
    { key: 'academicYear', header: 'Year', sortable: true },
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

  const handleEdit = (item: RotationRow) => {
    setForm({
      clerkshipId: item.clerkshipId,
      startDate: new Date(item.startDate).toISOString().split('T')[0],
      endDate: new Date(item.endDate).toISOString().split('T')[0],
      academicYear: item.academicYear,
    })
    setEditId(item.id)
    setShowForm(true)
  }

  const handleSubmit = async () => {
    try {
      if (editId) {
        await updateRotation(editId, form)
      } else {
        await createRotation(form)
      }
      setShowForm(false)
      setEditId(null)
      setForm(initialForm)
    } catch { /* error is in store */ }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteRotation(deleteId)
      setDeleteId(null)
    } catch { /* error is in store */ }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Manage Rotations</CardTitle>
          <Button size="sm" onClick={() => { setForm(initialForm); setEditId(null); setShowForm(true) }}>
            <Plus className="w-4 h-4 mr-1" /> Add Rotation
          </Button>
        </CardHeader>

        {error && (
          <div className="mx-4 mb-4 p-3 rounded-lg bg-category-fail/10 text-category-fail text-sm flex justify-between items-center">
            {error}
            <button onClick={clearError} className="text-xs underline">Dismiss</button>
          </div>
        )}

        <div className="px-4 pb-2">
          <SearchFilter value={search} onChange={setSearch} placeholder="Search rotations..." />
        </div>

        <div className="px-4 pb-4">
          <DataTable data={filtered} columns={columns} emptyMessage="No rotations found." />
        </div>
      </Card>

      <FormModal
        open={showForm}
        title={editId ? 'Edit Rotation' : 'Create Rotation'}
        onClose={() => { setShowForm(false); setEditId(null) }}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      >
        <Select label="Clerkship" options={clerkshipOptions} value={form.clerkshipId} onChange={e => setForm(f => ({ ...f, clerkshipId: e.target.value }))} placeholder="Select clerkship" />
        <Input label="Start Date" type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
        <Input label="End Date" type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
        <Input label="Academic Year" value={form.academicYear} onChange={e => setForm(f => ({ ...f, academicYear: e.target.value }))} placeholder="2025-2026" />
      </FormModal>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Rotation"
        message="This will permanently delete this rotation and all associated enrollments. This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        isLoading={isLoading}
      />
    </div>
  )
}
