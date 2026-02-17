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
import { defaultTemplates } from '@/lib/data/templates'

type ClerkshipRow = {
  id: string
  name: string
  templateId: string
  type: string
  durationWeeks: number
  midpointWeek: number | null
  evaluationIntervalDays: number | null
  [key: string]: unknown
}

const typeOptions = [
  { value: 'STANDARD', label: 'Standard' },
  { value: 'MULTI_WEEK', label: 'Multi-Week' },
  { value: 'LONGITUDINAL', label: 'Longitudinal' },
]

const initialForm = {
  name: '',
  templateId: '',
  type: 'STANDARD',
  durationWeeks: '',
  midpointWeek: '',
  evaluationIntervalDays: '',
}

export function ClerkshipManagementView() {
  const { clerkships, isLoading, error, loadClerkships, createClerkship, updateClerkship, deleteClerkship, clearError } = useAdminStore()
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState(initialForm)

  useEffect(() => { loadClerkships() }, [loadClerkships])

  const templateOptions = defaultTemplates.map(t => ({ value: t.id, label: t.name }))

  const filtered = useMemo(() => {
    if (!search) return clerkships as ClerkshipRow[]
    const lower = search.toLowerCase()
    return (clerkships as ClerkshipRow[]).filter(c =>
      c.name.toLowerCase().includes(lower) || c.type.toLowerCase().includes(lower)
    )
  }, [clerkships, search])

  const columns: Column<ClerkshipRow>[] = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'type', header: 'Type', sortable: true },
    { key: 'durationWeeks', header: 'Duration (weeks)', sortable: true },
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

  const handleEdit = (item: ClerkshipRow) => {
    setForm({
      name: item.name,
      templateId: item.templateId,
      type: item.type,
      durationWeeks: String(item.durationWeeks),
      midpointWeek: item.midpointWeek ? String(item.midpointWeek) : '',
      evaluationIntervalDays: item.evaluationIntervalDays ? String(item.evaluationIntervalDays) : '',
    })
    setEditId(item.id)
    setShowForm(true)
  }

  const handleSubmit = async () => {
    const data = {
      name: form.name,
      templateId: form.templateId,
      type: form.type,
      durationWeeks: Number(form.durationWeeks),
      midpointWeek: form.midpointWeek ? Number(form.midpointWeek) : null,
      evaluationIntervalDays: form.evaluationIntervalDays ? Number(form.evaluationIntervalDays) : null,
    }
    try {
      if (editId) {
        await updateClerkship(editId, data)
      } else {
        await createClerkship(data)
      }
      setShowForm(false)
      setEditId(null)
      setForm(initialForm)
    } catch { /* error is in store */ }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteClerkship(deleteId)
      setDeleteId(null)
    } catch { /* error is in store */ }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Manage Clerkships</CardTitle>
          <Button size="sm" onClick={() => { setForm(initialForm); setEditId(null); setShowForm(true) }}>
            <Plus className="w-4 h-4 mr-1" /> Add Clerkship
          </Button>
        </CardHeader>

        {error && (
          <div className="mx-4 mb-4 p-3 rounded-lg bg-category-fail/10 text-category-fail text-sm flex justify-between items-center">
            {error}
            <button onClick={clearError} className="text-xs underline">Dismiss</button>
          </div>
        )}

        <div className="px-4 pb-2">
          <SearchFilter value={search} onChange={setSearch} placeholder="Search clerkships..." />
        </div>

        <div className="px-4 pb-4">
          <DataTable data={filtered} columns={columns} emptyMessage="No clerkships found." />
        </div>
      </Card>

      <FormModal
        open={showForm}
        title={editId ? 'Edit Clerkship' : 'Create Clerkship'}
        onClose={() => { setShowForm(false); setEditId(null) }}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      >
        <Input label="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        <Select label="Template" options={templateOptions} value={form.templateId} onChange={e => setForm(f => ({ ...f, templateId: e.target.value }))} placeholder="Select template" />
        <Select label="Type" options={typeOptions} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} />
        <Input label="Duration (weeks)" type="number" value={form.durationWeeks} onChange={e => setForm(f => ({ ...f, durationWeeks: e.target.value }))} />
        <Input label="Midpoint Week (optional)" type="number" value={form.midpointWeek} onChange={e => setForm(f => ({ ...f, midpointWeek: e.target.value }))} />
        <Input label="Evaluation Interval (days)" type="number" value={form.evaluationIntervalDays} onChange={e => setForm(f => ({ ...f, evaluationIntervalDays: e.target.value }))} />
      </FormModal>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Clerkship"
        message="This will permanently delete this clerkship and all associated rotations. This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        isLoading={isLoading}
      />
    </div>
  )
}
