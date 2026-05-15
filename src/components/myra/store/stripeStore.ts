import type { Stripe } from '@stripe/stripe-js'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface StripeState {
  stripeInstance: Stripe | null
  setStripeInstance: (instance: Stripe) => void

  authToken: string | null
  setAuthToken: (token: string | null) => void

  // persisted fields
  anonymousUserEmail: null | string
  setAnonymousUserEmail: (email: string | null) => void

  sessionId: string | null
  setSessionId: (id: string | null) => void

  previousPath: string | null
  setPreviousPath: (path: string | null) => void
}

export const useStripeStore = create<StripeState>()(
  persist(
    (set) => ({
      // non-persisted, re-initialize on each load
      stripeInstance: null,
      setStripeInstance: (instance) => set({ stripeInstance: instance }),

      // persisted fields
      anonymousUserEmail: null,
      setAnonymousUserEmail: (email) => set({ anonymousUserEmail: email }),

      // persisted fields
      authToken: null,
      setAuthToken: (token) => set({ authToken: token }),

      sessionId: null,
      setSessionId: (id) => set({ sessionId: id }),

      previousPath: null,
      setPreviousPath: (path) => set({ previousPath: path })
    }),
    {
      name: 'stripe-store', // key in localStorage
      // only persist these keys — leave stripeInstance out
      partialize: (state) => ({
        authToken: state.authToken,
        anonymousUserEmail: state.anonymousUserEmail,
        sessionId: state.sessionId,
        previousPath: state.previousPath
      })
      // optional: use sessionStorage instead of localStorage
      // getStorage: () => sessionStorage
    }
  )
)
