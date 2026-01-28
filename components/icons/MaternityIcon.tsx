import React from 'react'

export function MaternityIcon({ className }: { className?: string }) {
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
      {/* Head */}
      <circle cx="12" cy="4" r="2.5" />
      {/* Body with pregnant belly profile */}
      <path d="M12 6.5 C12 6.5, 10 9, 10 12 C10 14, 11 15, 13 16.5 C15 18, 15.5 15, 15.5 13 C15.5 11, 14 9, 12 6.5Z" />
      {/* Hand cradling belly */}
      <path d="M10 14 C9 14.5, 9 15.5, 10 16" />
      {/* Left leg */}
      <line x1="11" y1="16.5" x2="10" y2="21.5" />
      {/* Right leg */}
      <line x1="13" y1="16.5" x2="14" y2="21.5" />
    </svg>
  )
}
