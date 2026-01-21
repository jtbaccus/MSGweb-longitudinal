import { create } from 'zustand'
import { ClerkshipTemplate } from '@/lib/types'
import { defaultTemplates } from '@/lib/data/templates'

interface TemplateState {
  templates: ClerkshipTemplate[]
  selectedTemplateId: string | null

  // Actions
  selectTemplate: (templateId: string) => void
  getSelectedTemplate: () => ClerkshipTemplate | null
  addCustomTemplate: (template: ClerkshipTemplate) => void
}

export const useTemplateStore = create<TemplateState>()((set, get) => ({
  templates: defaultTemplates,
  selectedTemplateId: null,

  selectTemplate: (templateId) => {
    set({ selectedTemplateId: templateId })
  },

  getSelectedTemplate: () => {
    const state = get()
    return state.templates.find(t => t.id === state.selectedTemplateId) || null
  },

  addCustomTemplate: (template) => {
    set((state) => ({
      templates: [...state.templates, template],
    }))
  },
}))
