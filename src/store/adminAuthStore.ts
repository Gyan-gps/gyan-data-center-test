import { create } from 'zustand';
import { toast } from 'react-hot-toast';
import { setAdminAuthToken, removeAdminAuthToken, getAdminAuthToken } from '@/services/api';
import { loginAdmin } from '@/network/admin/admin.api';
import type { AdminLoginRequest } from '@/network/admin/admin.types';

export interface AdminProfile {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'super-admin';
  status: string;
}

interface AdminAuthStore {
  admin: AdminProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: AdminLoginRequest) => Promise<void>;
  logout: () => void;
  setAdmin: (admin: AdminProfile | null) => void;
  setToken: (token: string | null) => void;
  initialize: () => Promise<void>; 
}

export const useAdminAuthStore = create<AdminAuthStore>()((set, get) => ({
  admin: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (credentials: AdminLoginRequest) => {
    try {
      const response = await loginAdmin(credentials);

      // Store admin token in separate admin cookie after successful login
      if (response.token) {
        setAdminAuthToken(response.token);
      }

      // Transform admin response to profile type
      const adminProfile: AdminProfile = {
        id: response.admin.id || 'admin-001',
        email: response.admin.email || 'admin@datacenter.com',
        name: response.admin.name || 'Admin',
        role: response.admin.role || 'admin',
        status: response.admin.status || 'active',
      };

      set({
        admin: adminProfile,
        token: response.token,
        isAuthenticated: true,
      });

      toast.success('Admin login successful');
    } catch (error: any) {
      set({
        admin: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });

      // Error is handled by the global api interceptor
      throw error;
    }
  },

  logout: () => {
    removeAdminAuthToken();
    set({
      admin: null,
      token: null,
      isAuthenticated: false,
    });
    toast.success('Logged out successfully');
  },

  setAdmin: (admin) => {
    set({ admin });
  },

  setToken: (token) => {
    set({ token });
  },
  initialize: async () => {
  const token = getAdminAuthToken();
  if (token) {
    set({
      token,
      isLoading: true,
    });

    try {
      // No api call for now as admin isn't stored anywhere
      set({
        admin: {
          id: 'admin-001',
          email: 'admin@datacenter.com',
          name: 'Admin',
          role: 'admin',
          status: 'active'
        },
        token,
        isAuthenticated: true,
        isLoading: false,
      });

    } catch (error) {
      // Token is invalid or user is inactive, clear auth state
      console.warn("Invalid admin token during initialization:", error);
      set({
        admin: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });

      // Remove invalid token from storage
      removeAdminAuthToken();
    }
  } else {
    set({
      isAuthenticated: false,
      isLoading: false,
    });
  }
}

}));
