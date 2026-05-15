import { v4 as uuidv4 } from 'uuid'

import { auth } from './firebase'

// Generate a unique fingerprint for the user
// For now, this returns a UUID. Later we can implement more sophisticated fingerprinting
export const generateFingerprint = (): string => {
  return uuidv4()
}

// Check if we're on the client side
const isClient = typeof window !== 'undefined'

// Get or create fingerprint from localStorage
export const getOrCreateFingerprint = (): string => {
  if (!isClient) {
    return '' // Return empty string on server side
  }

  const FINGERPRINT_KEY = 'user_fingerprint'

  let fingerprint = localStorage.getItem(FINGERPRINT_KEY)

  if (!fingerprint) {
    fingerprint = generateFingerprint()
    localStorage.setItem(FINGERPRINT_KEY, fingerprint)
  }

  return fingerprint
}

// Anonymous credits management
const ANONYMOUS_CREDITS_KEY = 'anonymous_credits'
const INITIAL_ANONYMOUS_CREDITS = 2

export const getAnonymousCredits = (): number => {
  if (!isClient) {
    return INITIAL_ANONYMOUS_CREDITS // Return default on server side
  }

  const credits = localStorage.getItem(ANONYMOUS_CREDITS_KEY)
  if (credits === null) {
    // First time user, set initial credits
    localStorage.setItem(
      ANONYMOUS_CREDITS_KEY,
      INITIAL_ANONYMOUS_CREDITS.toString()
    )
    return INITIAL_ANONYMOUS_CREDITS
  }
  return parseInt(credits, 10)
}

export const deductCredit = (myraRemainingCredits = 0): number => {
  if (!isClient) {
    return 0
  }

  let newCredits = myraRemainingCredits

  if (auth.currentUser) {
    newCredits = Math.max(0, myraRemainingCredits - 1)
  } else {
    const currentCredits = getAnonymousCredits()
    newCredits = Math.max(0, currentCredits - 1)
    localStorage.setItem(ANONYMOUS_CREDITS_KEY, newCredits.toString())
  }
  return newCredits
}

export const hasAnonymousCredits = (): boolean => {
  if (!isClient) {
    return true // Assume credits available on server side
  }

  return getAnonymousCredits() > 0
}

export const resetAnonymousCredits = (): void => {
  if (!isClient) {
    return
  }

  localStorage.setItem(
    ANONYMOUS_CREDITS_KEY,
    INITIAL_ANONYMOUS_CREDITS.toString()
  )
}
