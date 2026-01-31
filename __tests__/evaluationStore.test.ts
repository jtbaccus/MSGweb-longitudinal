import { describe, it, expect, beforeEach } from 'vitest'
import { useEvaluationStore } from '@/lib/stores/evaluationStore'
import { ClerkshipTemplate } from '@/lib/types'

// Mock template for testing
const mockTemplate: ClerkshipTemplate = {
  id: 'test-template',
  name: 'Test Template',
  description: 'A test template',
  icon: 'TestIcon',
  items: [
    // Fail items - Section A
    { id: 'f1', name: 'Fail Item 1', description: 'Fail 1', category: 'fail', section: 'Section A' },
    { id: 'f2', name: 'Fail Item 2', description: 'Fail 2', category: 'fail', section: 'Section A' },
    { id: 'f3', name: 'Fail Item 3', description: 'Fail 3', category: 'fail', section: 'Section B' },
    // Pass items
    { id: 'p1', name: 'Pass Item 1', description: 'Pass 1', category: 'pass', section: 'Section A' },
    { id: 'p2', name: 'Pass Item 2', description: 'Pass 2', category: 'pass', section: 'Section B' },
    // Honors items
    { id: 'h1', name: 'Honors Item 1', description: 'Honors 1', category: 'honors', section: 'Section A' },
    { id: 'h2', name: 'Honors Item 2', description: 'Honors 2', category: 'honors', section: 'Section A' },
    { id: 'h3', name: 'Honors Item 3', description: 'Honors 3', category: 'honors', section: 'Section B' },
    { id: 'h4', name: 'Honors Item 4', description: 'Honors 4', category: 'honors', section: 'Section B' },
    { id: 'h5', name: 'Honors Item 5', description: 'Honors 5', category: 'honors', section: 'Section B' },
  ],
}

describe('evaluationStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useEvaluationStore.getState().resetAll()
  })

  describe('initial state', () => {
    it('starts with empty items', () => {
      const state = useEvaluationStore.getState()
      expect(state.items).toHaveLength(0)
    })

    it('starts with default attributes', () => {
      const state = useEvaluationStore.getState()
      expect(state.attributes.length).toBeGreaterThan(0)
      expect(state.attributes.every(attr => !attr.isSelected)).toBe(true)
    })

    it('starts with empty narrative text', () => {
      const state = useEvaluationStore.getState()
      expect(state.narrativeText).toBe('')
    })

    it('starts with empty generated narrative', () => {
      const state = useEvaluationStore.getState()
      expect(state.generatedNarrative).toBe('')
      expect(state.editedGeneratedNarrative).toBe('')
    })

    it('starts with no current template', () => {
      const state = useEvaluationStore.getState()
      expect(state.currentTemplate).toBeNull()
    })

    it('starts with isGenerating false', () => {
      const state = useEvaluationStore.getState()
      expect(state.isGenerating).toBe(false)
    })

    it('starts with no generation error', () => {
      const state = useEvaluationStore.getState()
      expect(state.generationError).toBeNull()
    })
  })

  describe('loadTemplate', () => {
    it('loads template items with isSelected set to false', () => {
      useEvaluationStore.getState().loadTemplate(mockTemplate)
      const state = useEvaluationStore.getState()

      expect(state.items).toHaveLength(mockTemplate.items.length)
      expect(state.items.every(item => item.isSelected === false)).toBe(true)
    })

    it('sets currentTemplate', () => {
      useEvaluationStore.getState().loadTemplate(mockTemplate)
      const state = useEvaluationStore.getState()

      expect(state.currentTemplate).toEqual(mockTemplate)
    })

    it('clears generated narrative on load', () => {
      useEvaluationStore.getState().setGeneratedNarrative('Some narrative')
      useEvaluationStore.getState().loadTemplate(mockTemplate)
      const state = useEvaluationStore.getState()

      expect(state.generatedNarrative).toBe('')
      expect(state.editedGeneratedNarrative).toBe('')
    })

    it('clears generation error on load', () => {
      useEvaluationStore.getState().setGenerationError('Some error')
      useEvaluationStore.getState().loadTemplate(mockTemplate)
      const state = useEvaluationStore.getState()

      expect(state.generationError).toBeNull()
    })

    it('preserves item properties from template', () => {
      useEvaluationStore.getState().loadTemplate(mockTemplate)
      const state = useEvaluationStore.getState()

      const failItem = state.items.find(item => item.id === 'f1')
      expect(failItem).toBeDefined()
      expect(failItem?.name).toBe('Fail Item 1')
      expect(failItem?.category).toBe('fail')
      expect(failItem?.section).toBe('Section A')
    })
  })

  describe('toggleItem', () => {
    beforeEach(() => {
      useEvaluationStore.getState().loadTemplate(mockTemplate)
    })

    it('toggles item from false to true', () => {
      useEvaluationStore.getState().toggleItem('f1')
      const state = useEvaluationStore.getState()

      const item = state.items.find(i => i.id === 'f1')
      expect(item?.isSelected).toBe(true)
    })

    it('toggles item from true to false', () => {
      useEvaluationStore.getState().toggleItem('f1')
      useEvaluationStore.getState().toggleItem('f1')
      const state = useEvaluationStore.getState()

      const item = state.items.find(i => i.id === 'f1')
      expect(item?.isSelected).toBe(false)
    })

    it('only toggles the specified item', () => {
      useEvaluationStore.getState().toggleItem('f1')
      const state = useEvaluationStore.getState()

      const f2 = state.items.find(i => i.id === 'f2')
      const h1 = state.items.find(i => i.id === 'h1')
      expect(f2?.isSelected).toBe(false)
      expect(h1?.isSelected).toBe(false)
    })

    it('does nothing for non-existent item id', () => {
      const beforeState = useEvaluationStore.getState().items.map(i => ({ ...i }))
      useEvaluationStore.getState().toggleItem('non-existent')
      const afterState = useEvaluationStore.getState().items

      expect(afterState).toEqual(beforeState)
    })
  })

  describe('toggleAllInSection', () => {
    beforeEach(() => {
      useEvaluationStore.getState().loadTemplate(mockTemplate)
    })

    it('selects all items in section and category when selected=true', () => {
      useEvaluationStore.getState().toggleAllInSection('Section A', 'fail', true)
      const state = useEvaluationStore.getState()

      const sectionAFailItems = state.items.filter(
        i => i.section === 'Section A' && i.category === 'fail'
      )
      expect(sectionAFailItems.every(i => i.isSelected)).toBe(true)
    })

    it('deselects all items in section and category when selected=false', () => {
      // First select them
      useEvaluationStore.getState().toggleAllInSection('Section A', 'fail', true)
      // Then deselect
      useEvaluationStore.getState().toggleAllInSection('Section A', 'fail', false)
      const state = useEvaluationStore.getState()

      const sectionAFailItems = state.items.filter(
        i => i.section === 'Section A' && i.category === 'fail'
      )
      expect(sectionAFailItems.every(i => !i.isSelected)).toBe(true)
    })

    it('does not affect items in other sections', () => {
      useEvaluationStore.getState().toggleAllInSection('Section A', 'fail', true)
      const state = useEvaluationStore.getState()

      const sectionBFailItems = state.items.filter(
        i => i.section === 'Section B' && i.category === 'fail'
      )
      expect(sectionBFailItems.every(i => !i.isSelected)).toBe(true)
    })

    it('does not affect items in other categories', () => {
      useEvaluationStore.getState().toggleAllInSection('Section A', 'fail', true)
      const state = useEvaluationStore.getState()

      const sectionAPassItems = state.items.filter(
        i => i.section === 'Section A' && i.category === 'pass'
      )
      expect(sectionAPassItems.every(i => !i.isSelected)).toBe(true)
    })
  })

  describe('toggleAllInCategory', () => {
    beforeEach(() => {
      useEvaluationStore.getState().loadTemplate(mockTemplate)
    })

    it('selects all items in category when selected=true', () => {
      useEvaluationStore.getState().toggleAllInCategory('honors', true)
      const state = useEvaluationStore.getState()

      const honorsItems = state.items.filter(i => i.category === 'honors')
      expect(honorsItems.every(i => i.isSelected)).toBe(true)
    })

    it('deselects all items in category when selected=false', () => {
      useEvaluationStore.getState().toggleAllInCategory('honors', true)
      useEvaluationStore.getState().toggleAllInCategory('honors', false)
      const state = useEvaluationStore.getState()

      const honorsItems = state.items.filter(i => i.category === 'honors')
      expect(honorsItems.every(i => !i.isSelected)).toBe(true)
    })

    it('does not affect other categories', () => {
      useEvaluationStore.getState().toggleAllInCategory('honors', true)
      const state = useEvaluationStore.getState()

      const failItems = state.items.filter(i => i.category === 'fail')
      const passItems = state.items.filter(i => i.category === 'pass')
      expect(failItems.every(i => !i.isSelected)).toBe(true)
      expect(passItems.every(i => !i.isSelected)).toBe(true)
    })
  })

  describe('toggleAttribute', () => {
    it('toggles attribute from false to true', () => {
      const state = useEvaluationStore.getState()
      const firstAttr = state.attributes[0]

      useEvaluationStore.getState().toggleAttribute(firstAttr.id)
      const newState = useEvaluationStore.getState()

      const updated = newState.attributes.find(a => a.id === firstAttr.id)
      expect(updated?.isSelected).toBe(true)
    })

    it('toggles attribute from true to false', () => {
      const state = useEvaluationStore.getState()
      const firstAttr = state.attributes[0]

      useEvaluationStore.getState().toggleAttribute(firstAttr.id)
      useEvaluationStore.getState().toggleAttribute(firstAttr.id)
      const newState = useEvaluationStore.getState()

      const updated = newState.attributes.find(a => a.id === firstAttr.id)
      expect(updated?.isSelected).toBe(false)
    })
  })

  describe('setNarrativeText', () => {
    it('sets narrative text', () => {
      useEvaluationStore.getState().setNarrativeText('Test narrative')
      expect(useEvaluationStore.getState().narrativeText).toBe('Test narrative')
    })

    it('can set empty string', () => {
      useEvaluationStore.getState().setNarrativeText('Something')
      useEvaluationStore.getState().setNarrativeText('')
      expect(useEvaluationStore.getState().narrativeText).toBe('')
    })
  })

  describe('setGeneratedNarrative', () => {
    it('sets both generatedNarrative and editedGeneratedNarrative', () => {
      useEvaluationStore.getState().setGeneratedNarrative('Generated text')
      const state = useEvaluationStore.getState()

      expect(state.generatedNarrative).toBe('Generated text')
      expect(state.editedGeneratedNarrative).toBe('Generated text')
    })
  })

  describe('setEditedGeneratedNarrative', () => {
    it('only sets editedGeneratedNarrative', () => {
      useEvaluationStore.getState().setGeneratedNarrative('Original')
      useEvaluationStore.getState().setEditedGeneratedNarrative('Edited')
      const state = useEvaluationStore.getState()

      expect(state.generatedNarrative).toBe('Original')
      expect(state.editedGeneratedNarrative).toBe('Edited')
    })
  })

  describe('setIsGenerating', () => {
    it('sets isGenerating to true', () => {
      useEvaluationStore.getState().setIsGenerating(true)
      expect(useEvaluationStore.getState().isGenerating).toBe(true)
    })

    it('sets isGenerating to false', () => {
      useEvaluationStore.getState().setIsGenerating(true)
      useEvaluationStore.getState().setIsGenerating(false)
      expect(useEvaluationStore.getState().isGenerating).toBe(false)
    })
  })

  describe('setGenerationError', () => {
    it('sets error message', () => {
      useEvaluationStore.getState().setGenerationError('An error occurred')
      expect(useEvaluationStore.getState().generationError).toBe('An error occurred')
    })

    it('clears error with null', () => {
      useEvaluationStore.getState().setGenerationError('An error')
      useEvaluationStore.getState().setGenerationError(null)
      expect(useEvaluationStore.getState().generationError).toBeNull()
    })
  })

  describe('resetForm', () => {
    beforeEach(() => {
      useEvaluationStore.getState().loadTemplate(mockTemplate)
    })

    it('deselects all items', () => {
      useEvaluationStore.getState().toggleItem('f1')
      useEvaluationStore.getState().toggleItem('h1')
      useEvaluationStore.getState().resetForm()
      const state = useEvaluationStore.getState()

      expect(state.items.every(i => !i.isSelected)).toBe(true)
    })

    it('deselects all attributes', () => {
      const attrId = useEvaluationStore.getState().attributes[0].id
      useEvaluationStore.getState().toggleAttribute(attrId)
      useEvaluationStore.getState().resetForm()
      const state = useEvaluationStore.getState()

      expect(state.attributes.every(a => !a.isSelected)).toBe(true)
    })

    it('clears narrative text', () => {
      useEvaluationStore.getState().setNarrativeText('Some text')
      useEvaluationStore.getState().resetForm()
      expect(useEvaluationStore.getState().narrativeText).toBe('')
    })

    it('clears generated narrative', () => {
      useEvaluationStore.getState().setGeneratedNarrative('Generated')
      useEvaluationStore.getState().resetForm()
      const state = useEvaluationStore.getState()

      expect(state.generatedNarrative).toBe('')
      expect(state.editedGeneratedNarrative).toBe('')
    })

    it('clears generation error', () => {
      useEvaluationStore.getState().setGenerationError('Error')
      useEvaluationStore.getState().resetForm()
      expect(useEvaluationStore.getState().generationError).toBeNull()
    })

    it('preserves loaded template', () => {
      useEvaluationStore.getState().resetForm()
      expect(useEvaluationStore.getState().currentTemplate).toEqual(mockTemplate)
    })

    it('preserves items (just deselects them)', () => {
      useEvaluationStore.getState().resetForm()
      expect(useEvaluationStore.getState().items).toHaveLength(mockTemplate.items.length)
    })
  })

  describe('resetAll', () => {
    beforeEach(() => {
      useEvaluationStore.getState().loadTemplate(mockTemplate)
      useEvaluationStore.getState().toggleItem('f1')
      useEvaluationStore.getState().setNarrativeText('Text')
      useEvaluationStore.getState().setGeneratedNarrative('Generated')
    })

    it('clears all items', () => {
      useEvaluationStore.getState().resetAll()
      expect(useEvaluationStore.getState().items).toHaveLength(0)
    })

    it('resets attributes to defaults', () => {
      const attrId = useEvaluationStore.getState().attributes[0].id
      useEvaluationStore.getState().toggleAttribute(attrId)
      useEvaluationStore.getState().resetAll()
      const state = useEvaluationStore.getState()

      expect(state.attributes.length).toBeGreaterThan(0)
      expect(state.attributes.every(a => !a.isSelected)).toBe(true)
    })

    it('clears narrative text', () => {
      useEvaluationStore.getState().resetAll()
      expect(useEvaluationStore.getState().narrativeText).toBe('')
    })

    it('clears generated narrative', () => {
      useEvaluationStore.getState().resetAll()
      const state = useEvaluationStore.getState()

      expect(state.generatedNarrative).toBe('')
      expect(state.editedGeneratedNarrative).toBe('')
    })

    it('clears current template', () => {
      useEvaluationStore.getState().resetAll()
      expect(useEvaluationStore.getState().currentTemplate).toBeNull()
    })

    it('resets isGenerating', () => {
      useEvaluationStore.getState().setIsGenerating(true)
      useEvaluationStore.getState().resetAll()
      expect(useEvaluationStore.getState().isGenerating).toBe(false)
    })

    it('clears generation error', () => {
      useEvaluationStore.getState().setGenerationError('Error')
      useEvaluationStore.getState().resetAll()
      expect(useEvaluationStore.getState().generationError).toBeNull()
    })
  })

  describe('selectors', () => {
    beforeEach(() => {
      useEvaluationStore.getState().loadTemplate(mockTemplate)
    })

    describe('getStrengths', () => {
      it('returns selected pass items', () => {
        useEvaluationStore.getState().toggleItem('p1')
        const strengths = useEvaluationStore.getState().getStrengths()

        expect(strengths.some(s => s.id === 'p1')).toBe(true)
      })

      it('returns selected honors items', () => {
        useEvaluationStore.getState().toggleItem('h1')
        const strengths = useEvaluationStore.getState().getStrengths()

        expect(strengths.some(s => s.id === 'h1')).toBe(true)
      })

      it('does not return fail items', () => {
        useEvaluationStore.getState().toggleItem('f1')
        const strengths = useEvaluationStore.getState().getStrengths()

        expect(strengths.some(s => s.id === 'f1')).toBe(false)
      })

      it('does not return unselected items', () => {
        const strengths = useEvaluationStore.getState().getStrengths()
        expect(strengths).toHaveLength(0)
      })

      it('returns all selected pass and honors items', () => {
        useEvaluationStore.getState().toggleItem('p1')
        useEvaluationStore.getState().toggleItem('p2')
        useEvaluationStore.getState().toggleItem('h1')
        const strengths = useEvaluationStore.getState().getStrengths()

        expect(strengths).toHaveLength(3)
      })
    })

    describe('getAreasForImprovement', () => {
      it('returns selected fail items', () => {
        useEvaluationStore.getState().toggleItem('f1')
        const areas = useEvaluationStore.getState().getAreasForImprovement()

        expect(areas.some(a => a.id === 'f1')).toBe(true)
      })

      it('returns unselected pass items', () => {
        // p1 is not selected
        const areas = useEvaluationStore.getState().getAreasForImprovement()

        expect(areas.some(a => a.id === 'p1')).toBe(true)
      })

      it('returns unselected honors items', () => {
        // h1 is not selected
        const areas = useEvaluationStore.getState().getAreasForImprovement()

        expect(areas.some(a => a.id === 'h1')).toBe(true)
      })

      it('does not return selected pass items', () => {
        useEvaluationStore.getState().toggleItem('p1')
        const areas = useEvaluationStore.getState().getAreasForImprovement()

        expect(areas.some(a => a.id === 'p1')).toBe(false)
      })

      it('does not return unselected fail items', () => {
        // f1 is not selected
        const areas = useEvaluationStore.getState().getAreasForImprovement()

        expect(areas.some(a => a.id === 'f1')).toBe(false)
      })
    })

    describe('getSelectedAttributes', () => {
      it('returns empty array when no attributes selected', () => {
        const selected = useEvaluationStore.getState().getSelectedAttributes()
        expect(selected).toHaveLength(0)
      })

      it('returns selected attributes', () => {
        const attrId = useEvaluationStore.getState().attributes[0].id
        useEvaluationStore.getState().toggleAttribute(attrId)
        const selected = useEvaluationStore.getState().getSelectedAttributes()

        expect(selected).toHaveLength(1)
        expect(selected[0].id).toBe(attrId)
      })

      it('returns multiple selected attributes', () => {
        const attrs = useEvaluationStore.getState().attributes
        useEvaluationStore.getState().toggleAttribute(attrs[0].id)
        useEvaluationStore.getState().toggleAttribute(attrs[1].id)
        const selected = useEvaluationStore.getState().getSelectedAttributes()

        expect(selected).toHaveLength(2)
      })
    })

    describe('getPerformanceLevel', () => {
      it('returns pass by default', () => {
        const level = useEvaluationStore.getState().getPerformanceLevel()
        expect(level).toBe('pass')
      })

      it('returns fail when enough fail items selected', () => {
        // Select 1 of 3 fail items = 33% >= 30%
        useEvaluationStore.getState().toggleItem('f1')
        const level = useEvaluationStore.getState().getPerformanceLevel()

        expect(level).toBe('fail')
      })

      it('returns honors when 80%+ honors selected and all sections covered', () => {
        // Select 4 of 5 honors items = 80%, both sections covered
        useEvaluationStore.getState().toggleItem('h1')
        useEvaluationStore.getState().toggleItem('h2')
        useEvaluationStore.getState().toggleItem('h3')
        useEvaluationStore.getState().toggleItem('h4')
        const level = useEvaluationStore.getState().getPerformanceLevel()

        expect(level).toBe('honors')
      })
    })

    describe('getSections', () => {
      it('returns unique sections from items', () => {
        const sections = useEvaluationStore.getState().getSections()

        expect(sections).toContain('Section A')
        expect(sections).toContain('Section B')
        expect(sections).toHaveLength(2)
      })

      it('returns empty array when no items', () => {
        useEvaluationStore.getState().resetAll()
        const sections = useEvaluationStore.getState().getSections()

        expect(sections).toHaveLength(0)
      })
    })
  })
})
