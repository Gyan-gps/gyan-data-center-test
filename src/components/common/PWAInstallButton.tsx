import React from 'react';
import { usePWAInstall } from '@/hooks/usePWAInstall';

interface PWAInstallButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ 
  className = "rounded-xl bg-[#007ea7] hover:bg-[#006a8c] px-4 py-2 text-sm font-semibold text-white transition-colors",
  children = "Install App"
}) => {
  const { isInstallable, installPWA } = usePWAInstall();

  if (!isInstallable) {
    return null;
  }

  return (
    <button
      onClick={installPWA}
      className={className}
      aria-label="Install Data Center Intelligence App"
    >
      {children}
    </button>
  );
};
