import { create } from 'zustand'
import { EvaluationItem, PersonalAttribute, ClerkshipTemplate, PerformanceLevel } from '@/lib/types'
import { defaultPersonalAttributes } from '@/lib/data/templates'
import { calculatePerformanceLevel } from '@/lib/utils/performanceLevel'
import { toDbPerformanceLevel } from '@/lib/utils/performanceLevelMapping'

// Clear any previously persisted evaluation data on load
if (typeof window !== 'undefined') {
  localStorage.removeItem('evaluation-storage')
}

interface EvaluationState {
  items: EvaluationItem[]
  attributes: PersonalAttribute[]
  narrativeText: string
  generatedNarrative: string
  editedGeneratedNarrative: string
  currentTemplate: ClerkshipTemplate | null
  isGenerating: boolean
  generationError: string | null

  // Longitudinal context (optional — set when editing within a longitudinal enrollment)
  enrollmentId?: string
  periodNumber?: number

  // Actions
  loadTemplate: (template: ClerkshipTemplate) => void
  toggleItem: (itemId: string) => void
  toggleAllInSection: (section: string, category: PerformanceLevel, selected: boolean) => void
  toggleAllInCategory: (category: PerformanceLevel, selected: boolean) => void
  toggleAttribute: (attributeId: string) => void
  setNarrativeText: (text: string) => void
  setGeneratedNarrative: (text: string) => void
  setEditedGeneratedNarrative: (text: string) => void
  resetEditedNarrative: () => void
  setIsGenerating: (isGenerating: boolean) => void
  setGenerationError: (error: string | null) => void
  resetForm: () => void
  resetAll: () => void

  // Longitudinal actions
  setLongitudinalContext: (enrollmentId: string, periodNumber: number) => void
  clearLongitudinalContext: () => void
  saveToDatabase: () => Promise<void>
  loadFromDatabase: (evaluationId: string) => Promise<void>

  // Selectors (computed)
  getStrengths: () => EvaluationItem[]
  getAreasForImprovement: () => EvaluationItem[]
  getSelectedAttributes: () => PersonalAttribute[]
  getPerformanceLevel: () => PerformanceLevel
  getSections: () => string[]
}

export const useEvaluationStore = create<EvaluationState>()(
  (set, get) => ({
      items: [],
      attributes: defaultPersonalAttributes.map(attr => ({ ...attr })),
      narrativeText: '',
      generatedNarrative: '',
      editedGeneratedNarrative: '',
      currentTemplate: null,
      isGenerating: false,
      generationError: null,
      enrollmentId: undefined,
      periodNumber: undefined,

      loadTemplate: (template) => {
        const itemsWithSelection = template.items.map(item => ({
          ...item,
          isSelected: false,
        }))
        set({
          items: itemsWithSelection,
          currentTemplate: template,
          generatedNarrative: '',
          editedGeneratedNarrative: '',
          generationError: null,
        })
      },

      toggleItem: (itemId) => {
        set((state) => ({
          items: state.items.map(item =>
            item.id === itemId ? { ...item, isSelected: !item.isSelected } : item
          ),
        }))
      },

      toggleAllInSection: (section, category, selected) => {
        set((state) => ({
          items: state.items.map(item =>
            item.section === section && item.category === category
              ? { ...item, isSelected: selected }
              : item
          ),
        }))
      },

      toggleAllInCategory: (category, selected) => {
        set((state) => ({
          items: state.items.map(item =>
            item.category === category ? { ...item, isSelected: selected } : item
          ),
        }))
      },

      toggleAttribute: (attributeId) => {
        set((state) => ({
          attributes: state.attributes.map(attr =>
            attr.id === attributeId ? { ...attr, isSelected: !attr.isSelected } : attr
          ),
        }))
      },

      setNarrativeText: (text) => set({ narrativeText: text }),
      setGeneratedNarrative: (text) => set({ generatedNarrative: text, editedGeneratedNarrative: text }),
      setEditedGeneratedNarrative: (text) => set({ editedGeneratedNarrative: text }),
      resetEditedNarrative: () => set((state) => ({
        editedGeneratedNarrative: state.generatedNarrative
      })),
      setIsGenerating: (isGenerating) => set({ isGenerating }),
      setGenerationError: (error) => set({ generationError: error }),

      resetForm: () => {
        set((state) => ({
          items: state.items.map(item => ({ ...item, isSelected: false })),
          attributes: state.attributes.map(attr => ({ ...attr, isSelected: false })),
          narrativeText: '',
          generatedNarrative: '',
          editedGeneratedNarrative: '',
          generationError: null,
          enrollmentId: undefined,
          periodNumber: undefined,
        }))
      },

      resetAll: () => {
        set({
          items: [],
          attributes: defaultPersonalAttributes.map(attr => ({ ...attr })),
          narrativeText: '',
          generatedNarrative: '',
          editedGeneratedNarrative: '',
          currentTemplate: null,
          isGenerating: false,
          generationError: null,
          enrollmentId: undefined,
          periodNumber: undefined,
        })
      },

      setLongitudinalContext: (enrollmentId, periodNumber) =>
        set({ enrollmentId, periodNumber }),

      clearLongitudinalContext: () =>
        set({ enrollmentId: undefined, periodNumber: undefined }),

      saveToDatabase: async () => {
        const state = get()
        if (!state.enrollmentId || !state.currentTemplate) {
          throw new Error('Missing enrollment context or template')
        }

        const performanceLevel = toDbPerformanceLevel(state.getPerformanceLevel())
        const selectedCriteriaIds = state.items
          .filter((item) => item.isSelected)
          .map((item) => item.id)
        const selectedAttributeIds = state.attributes
          .filter((attr) => attr.isSelected)
          .map((attr) => attr.id)

        const body = {
          evaluatorName: '',
          periodNumber: state.periodNumber,
          evaluationDate: new Date().toISOString(),
          performanceLevel,
          selectedCriteriaIds,
          selectedAttributeIds,
          narrativeContext: state.narrativeText || null,
          generatedNarrative: state.generatedNarrative || null,
          editedNarrative: state.editedGeneratedNarrative || null,
          templateId: state.currentTemplate.id,
          isDraft: true,
        }

        const response = await fetch(
          `/api/enrollments/${state.enrollmentId}/evaluations`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          }
        )
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to save evaluation')
        }
      },

      loadFromDatabase: async (evaluationId) => {
        const response = await fetch(`/api/evaluations/${evaluationId}`)
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to load evaluation')
        }
        const evaluation = await response.json()

        // Find and load the matching template
        const { currentTemplate } = get()
        if (currentTemplate && currentTemplate.id === evaluation.templateId) {
          // Template already loaded — update selection state
          set((state) => ({
            items: state.items.map((item) => ({
              ...item,
              isSelected: evaluation.selectedCriteriaIds.includes(item.id),
            })),
            attributes: state.attributes.map((attr) => ({
              ...attr,
              isSelected: evaluation.selectedAttributeIds.includes(attr.id),
            })),
            narrativeText: evaluation.narrativeContext || '',
            generatedNarrative: evaluation.generatedNarrative || '',
            editedGeneratedNarrative: evaluation.editedNarrative || evaluation.generatedNarrative || '',
            enrollmentId: evaluation.enrollmentId,
            periodNumber: evaluation.periodNumber,
          }))
        } else {
          // Template not loaded — set what we can
          set({
            narrativeText: evaluation.narrativeContext || '',
            generatedNarrative: evaluation.generatedNarrative || '',
            editedGeneratedNarrative: evaluation.editedNarrative || evaluation.generatedNarrative || '',
            enrollmentId: evaluation.enrollmentId,
            periodNumber: evaluation.periodNumber,
          })
        }
      },

      getStrengths: () => {
        const state = get()
        return state.items.filter(
          item => item.isSelected && (item.category === 'pass' || item.category === 'honors')
        )
      },

      getAreasForImprovement: () => {
        const state = get()
        return state.items.filter(item =>
          // Selected fail items
          (item.isSelected && item.category === 'fail') ||
          // Unselected pass/honors items (not meeting expectations)
          (!item.isSelected && (item.category === 'pass' || item.category === 'honors'))
        )
      },

      getSelectedAttributes: () => {
        const state = get()
        return state.attributes.filter(attr => attr.isSelected)
      },

      getPerformanceLevel: () => {
        const state = get()
        return calculatePerformanceLevel(state.items)
      },

      getSections: () => {
        const state = get()
        const sections = new Set(state.items.map(item => item.section))
        return Array.from(sections)
      },
    })
)
