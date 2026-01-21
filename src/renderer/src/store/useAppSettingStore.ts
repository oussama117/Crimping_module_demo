import { AppSettings } from '@/types'
import { create } from 'zustand'

interface AppSettingsStore {
  settings: AppSettings
  setAppSettings: (settings: AppSettings) => void
  loadAppSettings: () => void
}

export const useAppSettingsStore = create<AppSettingsStore>((set) => ({
  settings: {
    id: null,
    language: null,
    trail_time: null,
    level_1: null,
    level_2: null,
    level_3: null,
    created_at: null,
    updated_at: null
  },
  loadAppSettings: async () => {
    const settings = await (window as any).api.getSettings()
    set({ settings })
  },
  setAppSettings: (settings) => set({ settings })
}))
