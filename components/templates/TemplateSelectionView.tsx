'use client'

import { ContentHeader } from '@/components/layout/ContentHeader'
import { TemplateCard } from './TemplateCard'
import { useTemplateStore } from '@/lib/stores/templateStore'
import { useEvaluationStore } from '@/lib/stores/evaluationStore'
import { useNavigationStore } from '@/lib/stores/navigationStore'

export function TemplateSelectionView() {
  const { templates, selectedTemplateId, selectTemplate } = useTemplateStore()
  const loadTemplate = useEvaluationStore(state => state.loadTemplate)
  const setCurrentTab = useNavigationStore(state => state.setCurrentTab)

  const handleSelectTemplate = (templateId: string) => {
    selectTemplate(templateId)
    const template = templates.find(t => t.id === templateId)
    if (template) {
      loadTemplate(template)
      setCurrentTab('evaluation')
    }
  }

  return (
    <div className="max-w-5xl">
      <ContentHeader
        title="Select Clerkship Template"
        description="Choose a template to begin your student evaluation. Each template contains criteria specific to the rotation type."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            isSelected={selectedTemplateId === template.id}
            onSelect={() => handleSelectTemplate(template.id)}
          />
        ))}
      </div>
    </div>
  )
}
