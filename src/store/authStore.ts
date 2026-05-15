import { create } from "zustand";
import { toast } from "react-hot-toast";
import * as authService from "@/services/auth";
import { getAuthToken, removeAuthToken } from "@/services/api";
import type { User, AuthState } from "@/types";
import { getTrialStatus } from "@/network/user/user.api";
import { trackUserLogin, trackUserLogout } from "@/utils/ga";
import { updateFavoriteDataCenter, updateFavoriteCompany } from "@/network";

interface AuthStore extends AuthState {
  login: (email: string, password?: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<string | null>;
  hasDownloadAccess: () => boolean;
  isActiveUser: () => boolean;
  canAccessPage: (pageName: string) => boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  initialize: () => Promise<void>;
  isMobileNavbarOpen: boolean;
  setMobileNavbarOpen: (isOpen: boolean) => void;
  setMessage: (conversation_id: string, message: string) => void;
  deleteMessage: () => void;
  validateToken: () => void;
  updateUserFavoriteDataCenters: (dataCenterId: string) => Promise<void>;
  updateUserFavoriteCompanies: (companyId: string) => Promise<void>;
  shouldBlur: () => boolean;
  shouldDeductCredit: () => boolean;
  setTrialState: (trialState: Partial<NonNullable<AuthState["trialState"]>>) => void;
}

export const useAuthStore = create<AuthStore>()((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  isMobileNavbarOpen: false,
  message: null,
  credits: 0,
  trial: false,
  trialState: {
    isTrial: false,
    status: null,
    remainingSeconds: null,
  },

  setTrialState: (newState) => {
    set((state) => ({
      trialState: {
        ...(state.trialState || {
          isTrial: false,
          status: null,
          remainingSeconds: null,
        }),
        ...newState,
      },
    }));
  },

  refreshToken: async () => {
    try {
      const { token } = await authService.refreshToken();
      set({ token });
      return token;
    } catch {
      removeAuthToken();
      set({ user: null, token: null, isAuthenticated: false });
      window.location.href = "/";
      return null;
    }
  },

  validateToken: async () => {
    const token = getAuthToken();
    if (token) {
      try {
        const user = await authService.getProfile();

        if (user.status.toLowerCase() !== "active") {
          throw new Error("User account is inactive");
        }

        set({
          user,
          token,
          isAuthenticated: true,
          credits: user.myraRemainingCredits,
        });
      } catch (error) {
        console.warn("Invalid token during validation:", error);
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          credits: 0,
        });
        authService.logout();
      }
    } else {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        credits: 0,
      });
    }
  },

  setMobileNavbarOpen: (isOpen) => {
    set({ isMobileNavbarOpen: isOpen });
  },

  login: async (email: string, password?: string): Promise<User> => {
    set({ isLoading: true });
    try {
      const response = await authService.login({ email, password });

      if (response.user.status.toLowerCase() !== "active") {
        throw new Error("Your account is inactive. Please contact support.");
      }

      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
      });

      if (response.user.trial && response.user.trialInfo) {
        set(() => ({
          trialState: {
            isTrial: true,
            status: response.user.trialInfo!.trial_status,
            remainingSeconds: response.user.trialInfo!.remaining_seconds,
          },
        }));
      } else if (response.user.trial) {
        try {
          const trialStatus = await getTrialStatus();
          set(() => ({
            trialState: {
              isTrial: true,
              status: trialStatus.trial_status,
              remainingSeconds: trialStatus.remaining_seconds,
            },
          }));
        } catch (e) {
          console.error("Failed to fetch trial status fallback");
        }
      } else {
        set(() => ({
          trialState: { isTrial: false, status: null, remainingSeconds: null },
        }));
      }

      trackUserLogin(response.user.id.toString(), response.user.email);

      toast.success(`Welcome back, ${response.user.name}!`);
      return response.user;
    } catch (error) {
      console.error("Login failed:", error);
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    const { user } = get();
    set({ isLoading: true });

    if (user) {
      trackUserLogout(user.id.toString(), user.email);
    }

    try {
      await authService.logout();
    } catch (error) {
      console.warn("Logout service error:", error);
    } finally {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        credits: 0,
        trial: false,
        trialState: {
          isTrial: false,
          status: null,
          remainingSeconds: null,
        },
        message: null,
      });
      
      // Use window.location.href for a full page reload to completely flush
      // all React Query caches, Zustand stores, and memory contexts.
      window.location.href = "/";
    }
  },

  hasDownloadAccess: () => {
    const { user } = get();
    return user?.allowExport === true;
  },

  isActiveUser: () => {
    const { user } = get();
    return user?.status.toLowerCase() === "active";
  },

  canAccessPage: (pageName: string) => {
    const { user } = get();
    if (user?.trial) return true;
    return user?.allowedPages.includes(pageName) || false;
  },

  setUser: (user) => {
    set({
      user,
      isAuthenticated: !!user,
    });
  },

  setToken: (token) => {
    set({ token });
  },

  initialize: async () => {
    const token = getAuthToken();
    if (token) {
      set({
        token,
        isLoading: true,
      });

      try {
        const user = await authService.getProfile();

        if (user.status.toLowerCase() !== "active") {
          throw new Error("User account is inactive");
        }

        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          credits: user.myraRemainingCredits,
        });
        if (user.trial && user.trialInfo) {
          set(() => ({
            trialState: {
              isTrial: true,
              status: user.trialInfo!.trial_status,
              remainingSeconds: user.trialInfo!.remaining_seconds,
            },
          }));
        } else if (user.trial) {
          try {
            const trialStatus = await getTrialStatus();
            set(() => ({
              trialState: {
                isTrial: true,
                status: trialStatus.trial_status,
                remainingSeconds: trialStatus.remaining_seconds,
              },
            }));
          } catch (e) {
            console.error("Failed to fetch trial status fallback");
          }
        } else {
          set(() => ({
            trialState: { isTrial: false, status: null, remainingSeconds: null },
          }));
        }
      } catch (error) {
        console.warn("Invalid token during initialization:", error);
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
        authService.logout();
      }
    } else {
      set({
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  setMessage: (conversation_id: string, message: string) => {
    set({
      message: {
        [conversation_id]: message,
      },
    });
  },

  deleteMessage: () => set({ message: null }),

  updateUserFavoriteDataCenters: async (dataCenterId: string) => {
    const { user, setUser } = get();
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      const isFavorite = user.favouriteDataCenters?.includes(dataCenterId);
      const action = isFavorite ? "remove" : "add";

      const updatedFavorites = isFavorite
        ? user.favouriteDataCenters.filter((id: string) => id !== dataCenterId)
        : [...(user.favouriteDataCenters || []), dataCenterId];

      const updatedUser = {
        ...user,
        favouriteDataCenters: updatedFavorites,
      };

      setUser(updatedUser);
      updateFavoriteDataCenter({ dataCenterId, action });
    } catch (error) {
      console.error("Failed to update favorite data centers:", error);
      throw error;
    }
  },

  updateUserFavoriteCompanies: async (companyId: string) => {
    const { user, setUser } = get();
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      const isFavorite = user.favouriteCompanies?.includes(companyId);
      const action = isFavorite ? "remove" : "add";

      const updatedFavorites = isFavorite
        ? user.favouriteCompanies.filter((id: string) => id !== companyId)
        : [...(user.favouriteCompanies || []), companyId];

      const updatedUser = {
        ...user,
        favouriteCompanies: updatedFavorites,
      };

      setUser(updatedUser);

      await updateFavoriteCompany({ companyId, action });
    } catch (error) {
      console.error("Failed to update favorite companies:", error);
      throw error;
    }
  },

  shouldBlur: () => {
    return false;
  },

  shouldDeductCredit: () => {
    return false;
  },
}));
