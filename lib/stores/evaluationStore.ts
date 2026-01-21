import { create } from 'zustand'
import { EvaluationItem, PersonalAttribute, ClerkshipTemplate, PerformanceLevel } from '@/lib/types'
import { defaultPersonalAttributes } from '@/lib/data/templates'
import { calculatePerformanceLevel } from '@/lib/utils/performanceLevel'

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

  // Actions
  loadTemplate: (template: ClerkshipTemplate) => void
  toggleItem: (itemId: string) => void
  toggleAllInSection: (section: string, category: PerformanceLevel, selected: boolean) => void
  toggleAllInCategory: (category: PerformanceLevel, selected: boolean) => void
  toggleAttribute: (attributeId: string) => void
  setNarrativeText: (text: string) => void
  setGeneratedNarrative: (text: string) => void
  setEditedGeneratedNarrative: (text: string) => void
  setIsGenerating: (isGenerating: boolean) => void
  setGenerationError: (error: string | null) => void
  resetForm: () => void
  resetAll: () => void

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
        })
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
