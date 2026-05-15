import axios, { AxiosError } from 'axios'

import { auth } from './firebase'
import { API_BASE_URL } from '@/utils'

// Create axios instance with base configuration
// This is used for all API calls to the backend
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
})

// Request interceptor - automatically adds Firebase auth token to all requests
apiClient.interceptors.request.use(
  async (config: any) => {
    try {
      // Get current Firebase user
      const user = auth.currentUser
      if (user) {
        // Get fresh ID token
        const token = await user.getIdToken()
        config.headers["Authorization"] = `Bearer ${token}`
      }
    } catch (error) {
      console.error('Error getting auth token:', error)
    }
    return config
  },
  (error: any) => {
    return Promise.reject(error)
  }
)

// Response interceptor - handles errors and extracts data
apiClient.interceptors.response.use(
  (response) => {
    // Return only the data portion, removing the axios wrapper
    // This means components receive response.data directly
    return response.data
  },
  (error: AxiosError<{ message: string; status_code: number }>) => {
    if (error.response) {
      // Backend returned an error response
      const message = error.response.data?.message || 'An error occurred'
      throw new Error(message)
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Network error. Please check your connection.')
    } else {
      // Error in setting up the request
      throw new Error('An unexpected error occurred')
    }
  }
)
