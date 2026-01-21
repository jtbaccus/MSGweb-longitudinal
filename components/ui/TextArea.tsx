'use client'

import { clsx } from 'clsx'
import { TextareaHTMLAttributes, forwardRef } from 'react'

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  showCharCount?: boolean
  maxChars?: number
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, showCharCount, maxChars, value, className, ...props }, ref) => {
    const charCount = typeof value === 'string' ? value.length : 0

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          value={value}
          className={clsx(
            'w-full px-3 py-2 rounded-lg input-bg text-sm transition-colors resize-none',
            'focus:outline-none focus:ring-2 focus:ring-medical-primary focus:border-transparent',
            error && 'border-category-fail',
            className
          )}
          {...props}
        />
        <div className="flex justify-between mt-1">
          {error && (
            <p className="text-sm text-category-fail">{error}</p>
          )}
          {showCharCount && (
            <p className={clsx(
              'text-xs ml-auto',
              maxChars && charCount > maxChars ? 'text-category-fail' : 'text-[rgb(var(--muted-foreground))]'
            )}>
              {charCount}{maxChars ? ` / ${maxChars}` : ''} characters
            </p>
          )}
        </div>
      </div>
    )
  }
)

TextArea.displayName = 'TextArea'
