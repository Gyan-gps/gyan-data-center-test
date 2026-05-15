import { useAuthStore } from '@/store'
import { useNavigate } from 'react-router'

export const useAuth = () => {
  const navigate = useNavigate()
  const authStore = useAuthStore()

  const login = async (email: string, password?: string) => {
    return await authStore.login(email, password)
  }

  const logout = async () => {
    try {
      await authStore.logout()
      navigate('/')
    } catch (error) {
      console.error('Logout error:', error)
      navigate('/')
    }
  }

  return {
    ...authStore,
    login,
    logout
  }
}
