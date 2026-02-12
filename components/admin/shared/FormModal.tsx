'use client'

import { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { X } from 'lucide-react'
import { useFocusTrap } from '@/lib/hooks/useFocusTrap'

interface FormModalProps {
  open: boolean
  title: string
  onClose: () => void
  onSubmit: () => void
  isLoading?: boolean
  submitLabel?: string
  children: ReactNode
}

export function FormModal({
  open,
  title,
  onClose,
  onSubmit,
  isLoading,
  submitLabel = 'Save',
  children,
}: FormModalProps) {
  const trapRef = useFocusTrap(open)

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="form-modal-title"
        className="relative bg-[rgb(var(--background))] rounded-xl shadow-xl border border-[rgb(var(--card-border))] w-full max-w-lg mx-4 max-h-[80vh] flex flex-col"
      >
        <div className="flex items-center justify-between p-4 border-b border-[rgb(var(--card-border))]">
          <h3 id="form-modal-title" className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[rgb(var(--muted))] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-auto flex-1 space-y-4">
          {children}
        </div>

        <div className="flex justify-end gap-3 p-4 border-t border-[rgb(var(--card-border))]">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={onSubmit} isLoading={isLoading}>
            {submitLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
