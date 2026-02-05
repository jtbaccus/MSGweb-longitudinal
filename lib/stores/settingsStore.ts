import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { WordCountPreset, WordCountPresetConfig, WordCountRange } from '@/lib/types'

export const WORD_COUNT_PRESETS: WordCountPresetConfig[] = [
  { preset: 1, label: 'Concise', description: 'Quick, focused narrative', range: { minWords: 75, maxWords: 125 } },
  { preset: 2, label: 'Standard', description: 'Balanced length and detail', range: { minWords: 120, maxWords: 190 } },
  { preset: 3, label: 'Detailed', description: 'Thorough coverage of strengths', range: { minWords: 180, maxWords: 275 } },
  { preset: 4, label: 'Comprehensive', description: 'In-depth narrative evaluation', range: { minWords: 250, maxWords: 350 } },
]

interface SettingsState {
  wordCountPreset: WordCountPreset
  setWordCountPreset: (preset: WordCountPreset) => void
  getWordCountRange: () => WordCountRange
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      wordCountPreset: 2 as WordCountPreset,

      setWordCountPreset: (preset) => set({ wordCountPreset: preset }),

      getWordCountRange: () => {
        const config = WORD_COUNT_PRESETS.find(p => p.preset === get().wordCountPreset)
        return config?.range ?? { minWords: 120, maxWords: 190 }
      },
    }),
    {
      name: 'msgweb-settings',
    }
  )
)
