import { setAuthToken, removeAuthToken, removeSessionFilters } from './api'
import { loginUser, logoutUser, refreshUserToken, getUserProfile } from '@/network/user/user.api'
import type { LoginCredentials, User } from '@/types'

export const login = async (credentials: LoginCredentials): Promise<{ user: User; token: string }> => {
  const response = await loginUser(credentials)

  // Store token in cookies after successful login
  if (response.token) {
    setAuthToken(response.token)
  }
  
  // Transform the response to match the expected User type
  const user: User = {
    id: response.user.id,
    email: response.user.email,
    name: response.user.name,
    role: response.user.role,
    status: response.user.status,
    allowedPages: response.user.allowedPages,
    allowExport: response.user.allowExport,
    notes: response.user.notes,
    startDate: response.user.startDate,
    expiresOn: response.user.expiresOn,
    myraTotalCredits: response.user.myraTotalCredits,
    myraRemainingCredits: response.user.myraRemainingCredits,
    onDemandTotalCredits: response.user.onDemandTotalCredits,
    onDemandRemainingCredits: response.user.onDemandRemainingCredits,
    isActive: response.user.status.toLowerCase() === 'active',
    favouriteDataCenters: response.user.favouriteDataCenters,
    favouriteCompanies: response.user.favouriteCompanies,
    trial: response.user.trial,
  }

  return { user, token: response.token }
}

export const logout = async (): Promise<void> => {
  try {
    // Try to logout on server
    await logoutUser()
  } catch (error) {
    // Even if server logout fails, remove local token
    console.warn('Server logout failed:', error)
  } finally {
    // Always remove local token
    removeAuthToken();
    removeSessionFilters();
  }
}

export const refreshToken = async (): Promise<{ token: string }> => {
  const response = await refreshUserToken()
  
  // Update token in cookies after successful refresh
  if (response.token) {
    setAuthToken(response.token)
  }
  
  return response
}

export const getProfile = async (): Promise<User> => {
  const userProfile = await getUserProfile()
  
  // Transform the response to match the expected User type
  const user: User = {
    id: userProfile.id,
    email: userProfile.email,
    name: userProfile.name,
    role: userProfile.role,
    status: userProfile.status,
    allowedPages: userProfile.allowedPages,
    allowExport: userProfile.allowExport,
    startDate: userProfile.startDate,
    expiresOn: userProfile.expiresOn,
    myraTotalCredits: userProfile.myraTotalCredits,
    myraRemainingCredits: userProfile.myraRemainingCredits,
    onDemandTotalCredits: userProfile.onDemandTotalCredits,
    onDemandRemainingCredits: userProfile.onDemandRemainingCredits,
    company: userProfile.company,
    phone: userProfile.phone,
    isActive: userProfile.isActive,
    notes: userProfile.notes,
    favouriteDataCenters: userProfile.favouriteDataCenters,
    favouriteCompanies: userProfile.favouriteCompanies,
    trial: userProfile.trial,
  }
  
  return user
}
