'use client'

import { clsx } from 'clsx'

interface ToggleProps {
  isOn: boolean
  onToggle: () => void
  label?: string
  disabled?: boolean
}

export function Toggle({ isOn, onToggle, label, disabled }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isOn}
      aria-label={label}
      disabled={disabled}
      onClick={onToggle}
      className={clsx(
        'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-medical-primary focus:ring-offset-2',
        isOn ? 'bg-medical-primary' : 'bg-[rgb(var(--muted))]',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <span
        className={clsx(
          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
          isOn ? 'translate-x-5' : 'translate-x-0'
        )}
      />
    </button>
  )
}
