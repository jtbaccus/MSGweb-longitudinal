'use client'

import { clsx } from 'clsx'
import { Check } from 'lucide-react'

interface CheckboxProps {
  checked: boolean
  onChange: () => void
  label?: string
  disabled?: boolean
  className?: string
}

export function Checkbox({ checked, onChange, label, disabled, className }: CheckboxProps) {
  return (
    <label className={clsx(
      'inline-flex items-center cursor-pointer',
      disabled && 'opacity-50 cursor-not-allowed',
      className
    )}>
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        disabled={disabled}
        onClick={onChange}
        className={clsx(
          'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-medical-primary focus:ring-offset-2',
          checked
            ? 'bg-medical-primary border-medical-primary'
            : 'border-[rgb(var(--input-border))] bg-transparent'
        )}
      >
        {checked && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
      </button>
      {label && (
        <span className="ml-2 text-sm">{label}</span>
      )}
    </label>
  )
}
