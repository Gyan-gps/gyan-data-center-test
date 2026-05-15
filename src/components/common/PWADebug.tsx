import React, { useState, useEffect } from 'react';

interface PWAStatus {
  isHttps: boolean;
  hasServiceWorker: boolean;
  hasManifest: boolean;
  serviceWorkerState: string;
  manifestValid: boolean;
  installPromptAvailable: boolean;
}

export const PWADebug: React.FC = () => {
  const [status, setStatus] = useState<PWAStatus>({
    isHttps: false,
    hasServiceWorker: false,
    hasManifest: false,
    serviceWorkerState: 'unknown',
    manifestValid: false,
    installPromptAvailable: false
  });
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    const checkPWAStatus = async () => {
      const newStatus: PWAStatus = {
        isHttps: location.protocol === 'https:' || location.hostname === 'localhost',
        hasServiceWorker: 'serviceWorker' in navigator,
        hasManifest: false,
        serviceWorkerState: 'unknown',
        manifestValid: false,
        installPromptAvailable: false
      };

      // Check service worker state
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration) {
            newStatus.serviceWorkerState = registration.active ? 'active' : 
                                          registration.installing ? 'installing' : 
                                          registration.waiting ? 'waiting' : 'unknown';
          }
        } catch (error) {
          console.error('Error checking service worker:', error);
        }
      }

      // Check manifest
      try {
        const manifestLinks = document.querySelectorAll('link[rel="manifest"]');
        if (manifestLinks.length > 0) {
          newStatus.hasManifest = true;
          const manifestUrl = (manifestLinks[0] as HTMLLinkElement).href;
          const response = await fetch(manifestUrl);
          if (response.ok) {
            const manifest = await response.json();
            // Basic manifest validation
            newStatus.manifestValid = !!(
              manifest.name && 
              manifest.start_url && 
              manifest.display && 
              manifest.icons && 
              manifest.icons.length > 0
            );
          }
        }
      } catch (error) {
        console.error('Error checking manifest:', error);
      }

      // Listen for beforeinstallprompt
      const handleBeforeInstallPrompt = () => {
        newStatus.installPromptAvailable = true;
        setStatus({ ...newStatus });
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      setStatus(newStatus);

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    };

    checkPWAStatus();
  }, []);

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 no-print">
      <button
        onClick={() => setShowDebug(!showDebug)}
        className="bg-gray-800 text-white px-3 py-2 rounded-lg text-sm font-mono"
      >
        PWA Debug
      </button>
      
      {showDebug && (
        <div className="absolute bottom-12 right-0 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-80 text-sm font-mono">
          <h3 className="font-bold mb-2">PWA Status</h3>
          <div className="space-y-1">
            <div className={status.isHttps ? 'text-green-600' : 'text-red-600'}>
              HTTPS: {status.isHttps ? '✓' : '✗'}
            </div>
            <div className={status.hasServiceWorker ? 'text-green-600' : 'text-red-600'}>
              Service Worker Support: {status.hasServiceWorker ? '✓' : '✗'}
            </div>
            <div className="text-blue-600">
              SW State: {status.serviceWorkerState}
            </div>
            <div className={status.hasManifest ? 'text-green-600' : 'text-red-600'}>
              Manifest: {status.hasManifest ? '✓' : '✗'}
            </div>
            <div className={status.manifestValid ? 'text-green-600' : 'text-red-600'}>
              Manifest Valid: {status.manifestValid ? '✓' : '✗'}
            </div>
            <div className={status.installPromptAvailable ? 'text-green-600' : 'text-yellow-600'}>
              Install Prompt: {status.installPromptAvailable ? '✓' : 'Waiting...'}
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t">
            <h4 className="font-bold text-xs mb-1">Troubleshooting:</h4>
            <div className="text-xs text-gray-600">
              {!status.isHttps && <div>• Use HTTPS or localhost</div>}
              {!status.hasServiceWorker && <div>• Browser doesn't support SW</div>}
              {status.serviceWorkerState === 'unknown' && <div>• SW not registered</div>}
              {!status.manifestValid && <div>• Check manifest.json</div>}
              {!status.installPromptAvailable && <div>• Check console for errors</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
