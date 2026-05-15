/**
 * Admin API Types
 * Contains interfaces for admin authentication requests and responses
 */

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  token: string;
  admin: {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'super-admin';
    status: string;
    createdAt?: string;
    updatedAt?: string;
  };
}

export interface AdminProfile {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'super-admin';
  status: string;
  createdAt?: string;
  updatedAt?: string;
}
