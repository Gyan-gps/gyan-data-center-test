import React from "react";
import { useNavigate, useLocation, Link, Navigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { Button, Input, Card, CardContent } from "@/components/ui";
import { toast } from "react-hot-toast";
import { loginSchema } from "@/utils/validators";
import { useAuthStore } from "@/store/authStore";
import type { LoginCredentials } from "@/types";
import { APP_NAME } from "@/utils";

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("expired") === "true") {
      toast.error("Your trial account has expired. Please contact support.");
    }
  }, [location]);

  const { login, isLoading } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginCredentials) => {
    try {
      await login(data.email);

      const user = useAuthStore.getState().user;

      if (user?.trial) {
        navigate("/reports", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (error) {
      // Error handling is done by auth store and interceptors
      console.error("Login failed:", error);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-40 h-40 flex items-center justify-center mb-6">
            <span className="text-white font-bold text-3xl animate-pulse">
              <Link to="/">
                <img src="/Logo.png" alt={APP_NAME} className="h-15 w-auto" />
              </Link>
            </span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back
          </h2>
          <p className="text-sm text-gray-600">
            Enter your email to access the {APP_NAME} platform
          </p>
        </div>

        {/* Login Form */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="relative">
                <Mail className="absolute left-3 top-9 w-5 h-5 text-gray-400 z-10" />
                <Input
                  {...register("email")}
                  type="email"
                  label="Email address"
                  placeholder="Enter your email"
                  error={errors.email?.message}
                  className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-[#007ea7] text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                loading={isLoading}
              >
                Sign in
              </Button>
            </form>

            {/* <div className="mt-8 text-center">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Need access?</span>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                Don't have an account?{' '}
                <Link 
                  to="/signup" 
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors hover:underline"
                >
                  Contact sales
                </Link>
              </p>
            </div> */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
