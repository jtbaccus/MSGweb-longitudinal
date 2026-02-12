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

type UserRow = {
  id: string
  email: string
  name: string | null
  role: string
  mustChangePassword: boolean
  createdAt: string
  [key: string]: unknown
}

const roleOptions = [
  { value: 'USER', label: 'User' },
  { value: 'ADMIN', label: 'Admin' },
]

const initialForm = {
  email: '',
  name: '',
  password: '',
  role: 'USER',
  mustChangePassword: false,
}

export function UserManagementView() {
  const { users, isLoading, error, loadUsers, createUser, updateUser, deleteUser, clearError } = useAdminStore()
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState(initialForm)

  useEffect(() => { loadUsers() }, [loadUsers])

  const filtered = useMemo(() => {
    if (!search) return users as UserRow[]
    const lower = search.toLowerCase()
    return (users as UserRow[]).filter(u =>
      u.email.toLowerCase().includes(lower) ||
      u.name?.toLowerCase().includes(lower) ||
      u.role.toLowerCase().includes(lower)
    )
  }, [users, search])

  const columns: Column<UserRow>[] = [
    { key: 'email', header: 'Email', sortable: true },
    { key: 'name', header: 'Name', sortable: true, render: (item) => item.name || '-' },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      render: (item) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
          item.role === 'ADMIN' ? 'bg-medical-primary/10 text-medical-primary' : 'bg-[rgb(var(--muted))]/50 text-[rgb(var(--muted-foreground))]'
        }`}>
          {item.role}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      sortable: true,
      render: (item) => new Date(item.createdAt).toLocaleDateString(),
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

  const handleEdit = (item: UserRow) => {
    setForm({
      email: item.email,
      name: item.name || '',
      password: '',
      role: item.role,
      mustChangePassword: item.mustChangePassword,
    })
    setEditId(item.id)
    setShowForm(true)
  }

  const handleSubmit = async () => {
    try {
      if (editId) {
        const data: Record<string, unknown> = {
          email: form.email,
          name: form.name || null,
          role: form.role,
          mustChangePassword: form.mustChangePassword,
        }
        if (form.password) data.password = form.password
        await updateUser(editId, data)
      } else {
        await createUser(form)
      }
      setShowForm(false)
      setEditId(null)
      setForm(initialForm)
    } catch { /* error is in store */ }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteUser(deleteId)
      setDeleteId(null)
    } catch { /* error is in store */ }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Manage Users</CardTitle>
          <Button size="sm" onClick={() => { setForm(initialForm); setEditId(null); setShowForm(true) }}>
            <Plus className="w-4 h-4 mr-1" /> Add User
          </Button>
        </CardHeader>

        {error && (
          <div className="mx-4 mb-4 p-3 rounded-lg bg-category-fail/10 text-category-fail text-sm flex justify-between items-center">
            {error}
            <button onClick={clearError} className="text-xs underline">Dismiss</button>
          </div>
        )}

        <div className="px-4 pb-2">
          <SearchFilter value={search} onChange={setSearch} placeholder="Search users..." />
        </div>

        <div className="px-4 pb-4">
          <DataTable data={filtered} columns={columns} emptyMessage="No users found." />
        </div>
      </Card>

      <FormModal
        open={showForm}
        title={editId ? 'Edit User' : 'Create User'}
        onClose={() => { setShowForm(false); setEditId(null) }}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      >
        <Input label="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
        <Input label="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        <Input label={editId ? 'New Password (leave blank to keep)' : 'Password'} type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
        <Select label="Role" options={roleOptions} value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.mustChangePassword}
            onChange={e => setForm(f => ({ ...f, mustChangePassword: e.target.checked }))}
            className="rounded"
          />
          Must change password on next login
        </label>
      </FormModal>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete User"
        message="This will permanently delete this user account. This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        isLoading={isLoading}
      />
    </div>
  )
}
