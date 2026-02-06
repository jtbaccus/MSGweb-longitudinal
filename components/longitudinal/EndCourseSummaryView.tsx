'use client'

import { ContentHeader } from '@/components/layout/ContentHeader'
import { Card, CardContent } from '@/components/ui/Card'
import { GraduationCap } from 'lucide-react'

export function EndCourseSummaryView() {
  return (
    <div className="max-w-3xl">
      <ContentHeader
        title="End-Course Summary"
        description="Generate comprehensive end-of-course narrative summaries."
      />
      <Card>
        <CardContent>
          <div className="text-center py-8">
            <GraduationCap className="w-10 h-10 mx-auto mb-3 text-[rgb(var(--muted-foreground))]" />
            <p className="font-medium mb-1">Coming in Phase 7</p>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              AI-powered end-of-course summary generation will be available in the next update.
              This feature will create a comprehensive narrative covering the entire clerkship experience.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
