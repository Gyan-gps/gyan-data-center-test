import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Mail, Lock } from 'lucide-react';
import { Button, Input, Card, CardContent } from '@/components/ui';
import { useAdminAuthStore } from '@/store/adminAuthStore';
import { APP_NAME } from '@/utils';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAdminAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await login({ email, password });
      // On success, redirect to admin dashboard
      navigate('/admin/dashboard', { replace: true });
    } catch (error) {
      // Error is handled by the store and toast notification
      console.error('Admin login failed:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-40 h-40 flex items-center justify-center mb-6">
            <Link to="/">
              <img src="/Logo.png" alt={APP_NAME} className="h-15 w-auto" />
            </Link>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Admin Login</h2>
          <p className="text-sm text-gray-600">
            Sign in to access the {APP_NAME} admin panel
          </p>
        </div>

        {/* Login Form */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="relative">
                <Mail className="absolute left-3 top-9 w-5 h-5 text-gray-400 z-10" />
                <Input
                  type="email"
                  label="Email address"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  error={errors.email}
                  className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                  disabled={isLoading || isSubmitting}
                />
              </div>

              {/* Password Field */}
              <div className="relative">
                <Lock className="absolute left-3 top-9 w-5 h-5 text-gray-400 z-10" />
                <Input
                  type="password"
                  label="Password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                  error={errors.password}
                  className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                  disabled={isLoading || isSubmitting}
                />
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-[#007ea7] text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                disabled={isLoading || isSubmitting}
              >
                {isLoading || isSubmitting ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            {/* Help Text */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-600 text-center">
                For admin access issues, contact{' '}
                <a
                  href="mailto:admin@mordorintelligence.com"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  admin@mordorintelligence.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Back to home */}
        <div className="text-center">
          <Link
            to="/"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};
