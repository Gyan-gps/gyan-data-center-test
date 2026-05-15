# Data Center Intelligence - Frontend

This is a React + TypeScript + Vite application for the Data Center Intelligence platform, providing global data center projects & assets intelligence.

## PWA Features

This application is configured as a Progressive Web App (PWA) with the following features:

### 📱 Mobile App Experience
- **Installable**: Users can install the app on their devices for native app-like experience
- **Offline Support**: Basic caching for core assets and offline functionality
- **Responsive Design**: Optimized for mobile, tablet, and desktop devices

### 🚀 PWA Components
- **Service Worker**: Handles caching and offline functionality (`/public/sw.js`)
- **Web App Manifest**: Defines app metadata and install behavior (`/public/manifest.json`)
- **Install Button**: Prompts users to install the app when available
- **Cross-platform Icons**: Optimized icons for various platforms and sizes

### 📦 Installation
Users can install the app by:
1. Clicking the "Install App" button in the header
2. Using browser's install prompt
3. Adding to home screen on mobile devices

### 🔧 PWA Development
The PWA setup includes:
- Service worker registration in `src/main.tsx`
- Install prompt hook (`usePWAInstall`)
- PWA install button component
- Proper meta tags and manifest configuration

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
