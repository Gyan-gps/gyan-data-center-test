import React, { useState } from "react";
import { useAuth } from "@/hooks";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router";
import { redirectUserToPageAfterLogin, scrollToTop } from "@/utils";
import {
  AtSign,
  Check,
  ChevronRight,
  Headset,
  Lock,
  ShieldCheckIcon,
} from "lucide-react";
import { Loading } from "../ui";
import { getUserProfile } from "@/network";

export const Login: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { login, isAuthenticated, user, setUser } = useAuth();

  // Navigate to dashboard for logged-in users
  const handleGoToDashboard = () => {
    scrollToTop();
    if (user?.allowedPages && user.allowedPages.length > 0) {
      const redirectPath = redirectUserToPageAfterLogin(
        user.allowedPages,
        "/home",
      );
      navigate(redirectPath);
    } else {
      console.log(user);
      if (user?.trial) {
        navigate("/reports", { replace: true });
      } else {
        navigate("/home", { replace: true });
      }
    }
  };

  // Vibration helper function
  const triggerVibration = () => {
    if (navigator.vibrate) {
      // Vibrate for 0.4 seconds (400ms)
      navigator.vibrate(300);
    }
  };

  // Reset error state when user starts typing
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (hasError) setHasError(false);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (hasError) setHasError(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email");
      setHasError(true);
      triggerVibration();
      setTimeout(() => setHasError(false), 600); // Reset after animation
      return;
    }

    if (!password.trim()) {
      toast.error("Please enter your password");
      setHasError(true);
      triggerVibration();
      setTimeout(() => setHasError(false), 600); // Reset after animation
      return;
    }

    setIsLoading(true);
    try {
      const loginUser = await login(email, password);
      // Login successful - will redirect via the useAuth hook
      await getUserProfile()
        .then((profile) => {
          setUser(profile);
        })
        .catch((err) => {
          console.error("Failed to fetch user profile after login:", err);
        });
      scrollToTop();
      if (loginUser.trial) {
        navigate("/reports", { replace: true });
      } else {
        navigate("/home", { replace: true });
      }
    } catch (error) {
      console.error("Login error:", error);
      // Trigger error animation and vibration
      setHasError(true);
      triggerVibration();
      setTimeout(() => setHasError(false), 600); // Reset after animation
      // Error toast is handled by the store/interceptor
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section
      id="login"
      className=" py-12 relative overflow-hidden flex justify-end"
    >
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* <div className="mx-auto w-12 h-12 bg-linear-to-br from-[#007ea7] to-[#0a2239] rounded-2xl flex items-center justify-center login-icon-glow login-floating-element">
          <Lock className="w-6 h-6 text-white" />
        </div> */}
        <div className="flex justify-end">
          {}
          <div className="order-1 lg:order-1 flex flex-col">
            {/* Header section with consistent height */}
            {/* <div className="text-center mb-8 min-h-[120px] flex flex-col justify-center">
              <h2 className="text-3xl font-bold text-[#0a2239] mb-2">
                {isAuthenticated
                  ? `Welcome Back, ${user?.name || "User"}!`
                  : "Welcome Back"}
              </h2>
              <p className="text-slate-600 text-base">
                {isAuthenticated
                  ? "You are already signed in. Access your dashboard and intelligence tools."
                  : "Sign in to access your dashboard and intelligence tools"}
              </p>
            </div> */}

            <div className="login-glass-effect rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 flex-1">
              {isAuthenticated ? (
                // Logged in state - Show dashboard button
                <div className="space-y-6 text-center">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-20 h-20 bg-linear-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center">
                      <Check className="w-10 h-10 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#0a2239] mb-2">
                        You're all set!
                      </h3>
                      <p className="text-slate-600 text-sm">
                        Continue to your personalized dashboard
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleGoToDashboard}
                    className="w-full font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg login-button-gradient text-white shadow-[#007ea7]/25 hover:shadow-[#007ea7]/40"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <ChevronRight className="w-5 h-5" />
                      <span>Go to Dashboard</span>
                    </div>
                  </button>

                  <div className="pt-4 border-t border-slate-200">
                    <p className="text-xs text-slate-500 mb-3">Quick Stats</p>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-500">Role</p>
                        <p className="text-sm font-medium text-slate-700">
                          {user?.role || "User"}
                        </p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-500">Status</p>
                        <p className="text-sm font-medium text-green-600">
                          Active
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Login form for non-authenticated users
                <div>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="group">
                      <label
                        htmlFor="email"
                        className="block text-sm font-semibold text-slate-700 mb-2 group-focus-within:text-[#007ea7] transition-colors"
                      >
                        Email Address
                      </label>
                      <div className="relative">
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={handleEmailChange}
                          className="w-full px-4 py-3 pl-12 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007ea7] focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white focus:login-input-focus"
                          placeholder="your@email.com"
                          required
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <AtSign className="h-5 w-5 text-slate-400 group-focus-within:text-[#007ea7] transition-colors" />
                        </div>
                      </div>
                    </div>

                    <div className="group">
                      <label
                        htmlFor="password"
                        className="block text-sm font-semibold text-slate-700 mb-2 group-focus-within:text-[#007ea7] transition-colors"
                      >
                        Password
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          type="password"
                          value={password}
                          onChange={handlePasswordChange}
                          className="w-full px-4 py-3 pl-12 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007ea7] focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white focus:login-input-focus"
                          placeholder="••••••••"
                          required
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-[#007ea7] transition-colors" />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg cursor-pointer ${
                        hasError
                          ? "btn-error shake-error text-white bg-red-500 hover:bg-red-600"
                          : isLoading
                            ? "bg-slate-400 cursor-not-allowed text-white"
                            : "login-button-gradient text-white shadow-[#007ea7]/25 hover:shadow-[#007ea7]/40"
                      }`}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <Loading size="sm" />
                          <span>Signing in...</span>
                        </div>
                      ) : (
                        "Sign In"
                      )}
                    </button>
                  </form>

                  {/* Additional visual elements */}
                  <div className="mt-8 text-center">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-slate-500">
                          Secure & Trusted Login
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-3 gap-4 text-xs text-slate-500">
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Lock className="w-4 h-4 text-green-600" />
                        </div>
                        <span>SSL Secured</span>
                      </div>
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <ShieldCheckIcon className="w-4 h-4 text-blue-600" />
                        </div>
                        <span>Data Protected</span>
                      </div>
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <Headset className="w-4 h-4 text-purple-600" />
                        </div>
                        <span>24/7 Support</span>
                      </div>
                    </div>

                    <div className="mt-6 text-xs text-slate-400">
                      <p>
                        By signing in, you agree to our{" "}
                        <a
                          href="https://www.mordorintelligence.com/privacy-policy"
                          target="_blank"
                          rel="nofollow noopener noreferrer"
                          className="underline"
                        >
                          privacy policy
                        </a>{" "}
                        and{" "}
                        <a
                          href="https://www.mordorintelligence.com/terms-and-conditions"
                          target="_blank"
                          rel="nofollow noopener noreferrer"
                          className="underline"
                        >
                          terms and conditions
                        </a>
                        ..
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
