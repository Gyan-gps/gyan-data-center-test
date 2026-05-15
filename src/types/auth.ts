export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  company?: string;
  phone?: string;
  startDate?: string;
  expiresOn?: string;
  myraTotalCredits: number;
  myraRemainingCredits: number;
  onDemandTotalCredits: number;
  onDemandRemainingCredits: number;
  allowedPages: string[];
  allowExport: boolean;
  notes: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  favouriteDataCenters: string[];
  favouriteCompanies: string[];
  trial: boolean;
  trialInfo?: {
    trial_status: "active" | "expired";
    remaining_seconds: number;
  };
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  message: Record<string, string> | null;
  credits: number;
  trial: boolean;
  trialState?: {
    isTrial: boolean;
    status: "active" | "expired" | null;
    remainingSeconds: number | null;
  };
}
