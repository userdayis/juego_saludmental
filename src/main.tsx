import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

function resolveTheme(): 'light' | 'dark' {
  try {
    const stored = localStorage.getItem('salud-mental:theme')
    if (stored === 'dark' || stored === 'light') return stored
  } catch {
    /* almacenamiento no disponible */
  }
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

document.documentElement.dataset.theme = resolveTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
