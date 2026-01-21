'use client'

import { Sidebar } from '@/components/layout/Sidebar'
import { MainContent } from '@/components/layout/MainContent'

export default function Home() {
  return (
    <div className="flex h-screen bg-[rgb(var(--background))]">
      <Sidebar />
      <MainContent />
    </div>
  )
}
