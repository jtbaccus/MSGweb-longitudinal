'use client'

import { clsx } from 'clsx'
import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={clsx(
            'w-full px-3 py-2 rounded-lg input-bg text-sm transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-medical-primary focus:border-transparent',
            error && 'border-category-fail',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-category-fail">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
