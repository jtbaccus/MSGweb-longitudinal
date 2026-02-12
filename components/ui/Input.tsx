'use client'

import { clsx } from 'clsx'
import { InputHTMLAttributes, forwardRef, useId } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id: providedId, ...props }, ref) => {
    const generatedId = useId()
    const inputId = providedId || generatedId
    const errorId = error ? `${inputId}-error` : undefined

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className={clsx(
            'w-full px-3 py-2 rounded-lg input-bg text-sm transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-medical-primary focus:border-transparent',
            error && 'border-category-fail',
            className
          )}
          {...props}
        />
        {error && (
          <p id={errorId} className="mt-1 text-sm text-category-fail">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
