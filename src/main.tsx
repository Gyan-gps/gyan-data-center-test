import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/styles/globals.css'
import App from './App.tsx'
import { initializeGTM } from '@/utils/ga'

// Initialize Google Tag Manager
initializeGTM();

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then((registration) => {
        // console.log('SW registered now: ', registration);
        // console.log('SW scope: ', registration.scope);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          // console.log('SW update found');
        });
      })
      .catch((registrationError) => {
        console.error('SW registration failed: ', registrationError);
      });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
