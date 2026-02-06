import { create } from 'zustand'
import { LongitudinalNavigationTab } from '@/lib/types'

interface NavigationState {
  currentTab: LongitudinalNavigationTab
  setCurrentTab: (tab: LongitudinalNavigationTab) => void
}

export const useNavigationStore = create<NavigationState>()((set) => ({
  currentTab: 'templates',
  setCurrentTab: (tab) => set({ currentTab: tab }),
}))
