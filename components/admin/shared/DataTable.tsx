'use client'

import { useState, useMemo } from 'react'
import { clsx } from 'clsx'
import { ArrowUpDown } from 'lucide-react'
import { Pagination } from '@/components/ui/Pagination'

export interface Column<T> {
  key: string
  header: string
  render?: (item: T) => React.ReactNode
  sortable?: boolean
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  keyField?: string
  pageSize?: number
  emptyMessage?: string
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  keyField = 'id',
  pageSize: initialPageSize = 10,
  emptyMessage = 'No data found.',
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortAsc, setSortAsc] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)

  const sorted = useMemo(() => {
    if (!sortKey) return data
    return [...data].sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]
      if (aVal == null) return 1
      if (bVal == null) return -1
      const cmp = String(aVal).localeCompare(String(bVal))
      return sortAsc ? cmp : -cmp
    })
  }, [data, sortKey, sortAsc])

  const totalPages = Math.ceil(sorted.length / pageSize)
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize)

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc)
    } else {
      setSortKey(key)
      setSortAsc(true)
    }
    setPage(1)
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setPage(1)
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-[rgb(var(--muted-foreground))]">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[rgb(var(--card-border))]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={clsx(
                    'text-left px-3 py-2.5 font-medium text-[rgb(var(--muted-foreground))]',
                    col.sortable && 'cursor-pointer select-none hover:text-[rgb(var(--foreground))]'
                  )}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {col.sortable && (
                      <ArrowUpDown className={clsx('w-3.5 h-3.5', sortKey === col.key && 'text-medical-primary')} />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((item) => (
              <tr
                key={String(item[keyField])}
                className="border-b border-[rgb(var(--card-border))] last:border-0 hover:bg-[rgb(var(--card-background))] transition-colors"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-3 py-2.5">
                    {col.render ? col.render(item) : String(item[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  )
}
