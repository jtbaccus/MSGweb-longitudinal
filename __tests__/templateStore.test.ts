import { describe, it, expect, beforeEach } from 'vitest'
import { useTemplateStore } from '@/lib/stores/templateStore'
import { ClerkshipTemplate } from '@/lib/types'

// Custom template for testing
const customTemplate: ClerkshipTemplate = {
  id: 'custom-test',
  name: 'Custom Test Template',
  description: 'A custom template for testing',
  icon: 'CustomIcon',
  items: [
    { id: 'c1', name: 'Custom Item 1', description: 'Custom 1', category: 'pass', section: 'Custom Section' },
    { id: 'c2', name: 'Custom Item 2', description: 'Custom 2', category: 'honors', section: 'Custom Section' },
  ],
}

describe('templateStore', () => {
  beforeEach(() => {
    // Reset store state
    useTemplateStore.setState({
      selectedTemplateId: null,
      // Keep default templates but reset selection
    })
  })

  describe('initial state', () => {
    it('has default templates loaded', () => {
      const state = useTemplateStore.getState()
      expect(state.templates.length).toBeGreaterThan(0)
    })

    it('has no template selected initially', () => {
      const state = useTemplateStore.getState()
      expect(state.selectedTemplateId).toBeNull()
    })

    it('includes Internal Medicine template', () => {
      const state = useTemplateStore.getState()
      const imTemplate = state.templates.find(t => t.id === 'internal-medicine')
      expect(imTemplate).toBeDefined()
      expect(imTemplate?.name).toBe('Internal Medicine')
    })

    it('includes Neurology template', () => {
      const state = useTemplateStore.getState()
      const neuroTemplate = state.templates.find(t => t.id === 'neurology')
      expect(neuroTemplate).toBeDefined()
      expect(neuroTemplate?.name).toBe('Neurology')
    })

    it('includes Surgery template', () => {
      const state = useTemplateStore.getState()
      const surgTemplate = state.templates.find(t => t.id === 'surgery')
      expect(surgTemplate).toBeDefined()
      expect(surgTemplate?.name).toBe('Surgery')
    })

    it('includes Pediatrics template', () => {
      const state = useTemplateStore.getState()
      const pedsTemplate = state.templates.find(t => t.id === 'pediatrics')
      expect(pedsTemplate).toBeDefined()
    })

    it('includes Psychiatry template', () => {
      const state = useTemplateStore.getState()
      const psychTemplate = state.templates.find(t => t.id === 'psychiatry')
      expect(psychTemplate).toBeDefined()
    })

    it('includes OB/GYN template', () => {
      const state = useTemplateStore.getState()
      const obgynTemplate = state.templates.find(t => t.id === 'ob-gyn')
      expect(obgynTemplate).toBeDefined()
    })

    it('includes Family Medicine template', () => {
      const state = useTemplateStore.getState()
      const fmTemplate = state.templates.find(t => t.id === 'family-medicine')
      expect(fmTemplate).toBeDefined()
    })
  })

  describe('selectTemplate', () => {
    it('sets selectedTemplateId', () => {
      useTemplateStore.getState().selectTemplate('internal-medicine')
      const state = useTemplateStore.getState()

      expect(state.selectedTemplateId).toBe('internal-medicine')
    })

    it('can change selection to different template', () => {
      useTemplateStore.getState().selectTemplate('internal-medicine')
      useTemplateStore.getState().selectTemplate('neurology')
      const state = useTemplateStore.getState()

      expect(state.selectedTemplateId).toBe('neurology')
    })

    it('can select non-existent template id (does not validate)', () => {
      useTemplateStore.getState().selectTemplate('non-existent')
      const state = useTemplateStore.getState()

      expect(state.selectedTemplateId).toBe('non-existent')
    })
  })

  describe('getSelectedTemplate', () => {
    it('returns null when no template selected', () => {
      const template = useTemplateStore.getState().getSelectedTemplate()
      expect(template).toBeNull()
    })

    it('returns the selected template', () => {
      useTemplateStore.getState().selectTemplate('internal-medicine')
      const template = useTemplateStore.getState().getSelectedTemplate()

      expect(template).not.toBeNull()
      expect(template?.id).toBe('internal-medicine')
      expect(template?.name).toBe('Internal Medicine')
    })

    it('returns null when selected id does not match any template', () => {
      useTemplateStore.getState().selectTemplate('non-existent')
      const template = useTemplateStore.getState().getSelectedTemplate()

      expect(template).toBeNull()
    })

    it('returns full template with items', () => {
      useTemplateStore.getState().selectTemplate('internal-medicine')
      const template = useTemplateStore.getState().getSelectedTemplate()

      expect(template?.items).toBeDefined()
      expect(template?.items.length).toBeGreaterThan(0)
    })

    it('template has correct structure', () => {
      useTemplateStore.getState().selectTemplate('internal-medicine')
      const template = useTemplateStore.getState().getSelectedTemplate()

      expect(template).toHaveProperty('id')
      expect(template).toHaveProperty('name')
      expect(template).toHaveProperty('description')
      expect(template).toHaveProperty('icon')
      expect(template).toHaveProperty('items')
    })
  })

  describe('addCustomTemplate', () => {
    it('adds a custom template to the list', () => {
      const initialCount = useTemplateStore.getState().templates.length
      useTemplateStore.getState().addCustomTemplate(customTemplate)
      const state = useTemplateStore.getState()

      expect(state.templates).toHaveLength(initialCount + 1)
    })

    it('custom template can be found after adding', () => {
      useTemplateStore.getState().addCustomTemplate(customTemplate)
      const state = useTemplateStore.getState()

      const found = state.templates.find(t => t.id === 'custom-test')
      expect(found).toBeDefined()
      expect(found?.name).toBe('Custom Test Template')
    })

    it('custom template can be selected', () => {
      useTemplateStore.getState().addCustomTemplate(customTemplate)
      useTemplateStore.getState().selectTemplate('custom-test')
      const template = useTemplateStore.getState().getSelectedTemplate()

      expect(template).not.toBeNull()
      expect(template?.id).toBe('custom-test')
    })

    it('preserves existing templates when adding', () => {
      const existingIds = useTemplateStore.getState().templates.map(t => t.id)
      useTemplateStore.getState().addCustomTemplate(customTemplate)
      const state = useTemplateStore.getState()

      for (const id of existingIds) {
        expect(state.templates.some(t => t.id === id)).toBe(true)
      }
    })

    it('can add multiple custom templates', () => {
      const anotherTemplate: ClerkshipTemplate = {
        ...customTemplate,
        id: 'another-custom',
        name: 'Another Custom',
      }

      const initialCount = useTemplateStore.getState().templates.length
      useTemplateStore.getState().addCustomTemplate(customTemplate)
      useTemplateStore.getState().addCustomTemplate(anotherTemplate)
      const state = useTemplateStore.getState()

      expect(state.templates).toHaveLength(initialCount + 2)
    })
  })

  describe('template content validation', () => {
    it('Internal Medicine template has fail, pass, and honors items', () => {
      useTemplateStore.getState().selectTemplate('internal-medicine')
      const template = useTemplateStore.getState().getSelectedTemplate()

      const failItems = template?.items.filter(i => i.category === 'fail')
      const passItems = template?.items.filter(i => i.category === 'pass')
      const honorsItems = template?.items.filter(i => i.category === 'honors')

      expect(failItems?.length).toBeGreaterThan(0)
      expect(passItems?.length).toBeGreaterThan(0)
      expect(honorsItems?.length).toBeGreaterThan(0)
    })

    it('Internal Medicine template has multiple sections', () => {
      useTemplateStore.getState().selectTemplate('internal-medicine')
      const template = useTemplateStore.getState().getSelectedTemplate()

      const sections = new Set(template?.items.map(i => i.section))
      expect(sections.size).toBeGreaterThan(1)
    })

    it('template items have required properties', () => {
      useTemplateStore.getState().selectTemplate('internal-medicine')
      const template = useTemplateStore.getState().getSelectedTemplate()

      for (const item of template?.items || []) {
        expect(item).toHaveProperty('id')
        expect(item).toHaveProperty('name')
        expect(item).toHaveProperty('description')
        expect(item).toHaveProperty('category')
        expect(item).toHaveProperty('section')
        expect(['fail', 'pass', 'honors']).toContain(item.category)
      }
    })

    it('template items have unique ids within template', () => {
      useTemplateStore.getState().selectTemplate('internal-medicine')
      const template = useTemplateStore.getState().getSelectedTemplate()

      const ids = template?.items.map(i => i.id) || []
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })
  })

  describe('Neurology template content', () => {
    it('has fail, pass, and honors items', () => {
      useTemplateStore.getState().selectTemplate('neurology')
      const template = useTemplateStore.getState().getSelectedTemplate()

      const failItems = template?.items.filter(i => i.category === 'fail')
      const passItems = template?.items.filter(i => i.category === 'pass')
      const honorsItems = template?.items.filter(i => i.category === 'honors')

      expect(failItems?.length).toBeGreaterThan(0)
      expect(passItems?.length).toBeGreaterThan(0)
      expect(honorsItems?.length).toBeGreaterThan(0)
    })

    it('has multiple sections', () => {
      useTemplateStore.getState().selectTemplate('neurology')
      const template = useTemplateStore.getState().getSelectedTemplate()

      const sections = new Set(template?.items.map(i => i.section))
      expect(sections.size).toBeGreaterThan(1)
    })
  })

  describe('store isolation', () => {
    it('selecting a template does not modify the template object', () => {
      const templateBefore = useTemplateStore.getState().templates.find(t => t.id === 'internal-medicine')
      const itemCountBefore = templateBefore?.items.length

      useTemplateStore.getState().selectTemplate('internal-medicine')

      const templateAfter = useTemplateStore.getState().templates.find(t => t.id === 'internal-medicine')
      expect(templateAfter?.items.length).toBe(itemCountBefore)
    })
  })
})
