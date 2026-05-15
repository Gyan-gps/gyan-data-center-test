import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { sendTrialHeartbeat } from "@/network/user/user.api";
import { toast } from "react-hot-toast";

const HEARTBEAT_INTERVAL = 20_000; // 20 seconds
const INACTIVITY_TIMEOUT = 60_000; // 60 seconds

export const useTrialHeartbeat = () => {
  const { trialState, setTrialState, logout, isAuthenticated } = useAuthStore();
  const heartbeatTimer = useRef<NodeJS.Timeout | null>(null);
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);
  const isActive = useRef(true);

  const isRequestPending = useRef(false);

  const stopHeartbeat = () => {
    if (heartbeatTimer.current) {
      clearInterval(heartbeatTimer.current);
      heartbeatTimer.current = null;
    }
    isActive.current = false;
  };

  const handleHeartbeat = async () => {
    if (isRequestPending.current) return;
    isRequestPending.current = true;
    try {
      const remainingToSync =
        useAuthStore.getState().trialState?.remainingSeconds || 0;
      const res = await sendTrialHeartbeat(remainingToSync);

      if (res.trial_status === "expired") {
        stopHeartbeat();
        setTrialState({
          status: "expired",
          remainingSeconds: 0,
        });
        toast.error("Your trial account has expired. Please contact support.");
        // We removed the auto-logout and redirect logic here.
        return;
      }

      const currentRemaining =
        useAuthStore.getState().trialState?.remainingSeconds;

      if (
        currentRemaining === null ||
        currentRemaining === undefined ||
        Math.abs(currentRemaining - res.remaining_seconds) > 3
      ) {
        setTrialState({
          remainingSeconds: res.remaining_seconds,
          status: res.trial_status,
        });
      } else {
        setTrialState({
          status: res.trial_status,
        });
      }
    } catch (err) {
      // Network error, time not deducted
    } finally {
      isRequestPending.current = false;
    }
  };

  const startHeartbeat = () => {
    if (heartbeatTimer.current) return;
    isActive.current = true;
    heartbeatTimer.current = setInterval(handleHeartbeat, HEARTBEAT_INTERVAL);
    handleHeartbeat();
  };

  const resetInactivityTimer = () => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    if (!isActive.current) startHeartbeat();

    inactivityTimer.current = setTimeout(() => {
      stopHeartbeat();
    }, INACTIVITY_TIMEOUT);
  };

  useEffect(() => {
    if (
      !isAuthenticated ||
      !trialState?.isTrial ||
      trialState.status === "expired"
    ) {
      stopHeartbeat();
      return;
    }

    startHeartbeat();

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopHeartbeat();
      } else {
        startHeartbeat();
        resetInactivityTimer();
      }
    };

    const handleBlur = () => stopHeartbeat();
    const handleFocus = () => {
      startHeartbeat();
      resetInactivityTimer();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    const activityEvents = [
      "mousemove",
      "keypress",
      "click",
      "scroll",
      "touchstart",
    ];
    activityEvents.forEach((evt) => {
      document.addEventListener(evt, resetInactivityTimer, { passive: true });
    });

    return () => {
      stopHeartbeat();
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      activityEvents.forEach((evt) => {
        document.removeEventListener(evt, resetInactivityTimer);
      });
    };
  }, [isAuthenticated, trialState?.isTrial, trialState?.status]);

  // Local decrementation for smooth UX countdown
  useEffect(() => {
    if (
      !isAuthenticated ||
      !trialState?.isTrial ||
      trialState.status !== "active"
    )
      return;

    const interval = setInterval(() => {
      if (isActive.current) {
        useAuthStore.getState().setTrialState({
          remainingSeconds: Math.max(
            0,
            (useAuthStore.getState().trialState?.remainingSeconds ?? 0) - 1,
          ),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, trialState?.isTrial, trialState?.status]);

  return { trialState };
};
