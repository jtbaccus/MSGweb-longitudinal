import { create } from 'zustand'
import { NavigationTab } from '@/lib/types'

interface NavigationState {
  currentTab: NavigationTab
  setCurrentTab: (tab: NavigationTab) => void
}

export const useNavigationStore = create<NavigationState>()((set) => ({
  currentTab: 'templates',
  setCurrentTab: (tab) => set({ currentTab: tab }),
}))
