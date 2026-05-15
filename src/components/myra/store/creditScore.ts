import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

/**
 * Zustand store for managing pending credits across the app
 */
export type PendingCreditsState = {
  pendingCredits: number
  setPendingCredits: (count: number) => void
  clearPendingCredits: () => void
}

export const useCreditsStore = create<PendingCreditsState>()(
  persist(
    (set) => ({
      pendingCredits: 0,
      setPendingCredits: (count: number) => set({ pendingCredits: count }),
      clearPendingCredits: () => set({ pendingCredits: 0 })
    }),
    {
      name: 'pending-credits-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
)
