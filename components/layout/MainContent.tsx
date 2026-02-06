'use client'

import { useNavigationStore } from '@/lib/stores/navigationStore'
import { TemplateSelectionView } from '@/components/templates/TemplateSelectionView'
import { EvaluationFormView } from '@/components/evaluation/EvaluationFormView'
import { PersonalAttributeView } from '@/components/attributes/PersonalAttributeView'
import { NarrativeInputView } from '@/components/narrative/NarrativeInputView'
import { EvaluationSummaryView } from '@/components/summary/EvaluationSummaryView'
import { AIGenerationView } from '@/components/generate/AIGenerationView'
import { ExportReportView } from '@/components/export/ExportReportView'
import { SettingsView } from '@/components/settings/SettingsView'
import { NavigationButtons } from '@/components/layout/NavigationButtons'
import { DashboardView } from '@/components/longitudinal/DashboardView'
import { StudentListView } from '@/components/longitudinal/StudentListView'
import { StudentProgressView } from '@/components/longitudinal/StudentProgressView'
import { MidCourseSummaryView } from '@/components/longitudinal/MidCourseSummaryView'
import { EndCourseSummaryView } from '@/components/longitudinal/EndCourseSummaryView'

export function MainContent() {
  const currentTab = useNavigationStore(state => state.currentTab)

  return (
    <main className="flex-1 overflow-auto p-6">
      {currentTab === 'templates' && <TemplateSelectionView />}
      {currentTab === 'evaluation' && <EvaluationFormView />}
      {currentTab === 'attributes' && <PersonalAttributeView />}
      {currentTab === 'narrative' && <NarrativeInputView />}
      {currentTab === 'summary' && <EvaluationSummaryView />}
      {currentTab === 'generate' && <AIGenerationView />}
      {currentTab === 'export' && <ExportReportView />}
      {currentTab === 'settings' && <SettingsView />}

      {currentTab === 'dashboard' && <DashboardView />}
      {currentTab === 'students' && <StudentListView />}
      {currentTab === 'progress' && <StudentProgressView />}
      {currentTab === 'mid-course' && <MidCourseSummaryView />}
      {currentTab === 'end-course' && <EndCourseSummaryView />}

      <NavigationButtons />
    </main>
  )
}
