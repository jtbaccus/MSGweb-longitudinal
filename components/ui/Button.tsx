'use client'

import { clsx } from 'clsx'
import { ReactNode, ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  isLoading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  isLoading,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

  const variantStyles = {
    primary: 'bg-medical-primary text-white hover:bg-medical-primary/90 focus:ring-medical-primary',
    secondary: 'bg-medical-secondary text-white hover:bg-medical-secondary/90 focus:ring-medical-secondary',
    outline: 'border border-[rgb(var(--input-border))] bg-transparent hover:bg-[rgb(var(--card-background))] focus:ring-medical-primary',
    ghost: 'bg-transparent hover:bg-[rgb(var(--card-background))] focus:ring-medical-primary',
    danger: 'bg-category-fail text-white hover:bg-category-fail/90 focus:ring-category-fail',
  }

  const sizeStyles = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-6 py-3',
  }

  return (
    <button
      className={clsx(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span className="spinner mr-2" />
      )}
      {children}
    </button>
  )
}
