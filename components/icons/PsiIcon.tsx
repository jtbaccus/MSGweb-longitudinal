import React from 'react'

export function PsiIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Vertical stem */}
      <line x1="12" y1="4" x2="12" y2="21" />
      {/* Left prong */}
      <path d="M6 4 C6 10, 12 10, 12 10" />
      {/* Right prong */}
      <path d="M18 4 C18 10, 12 10, 12 10" />
    </svg>
  )
}
