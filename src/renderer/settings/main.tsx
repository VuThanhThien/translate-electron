import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../styles/globals.css'
import { QueryProvider } from '../shared/providers/QueryProvider'
import { SettingsApp } from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryProvider>
      <SettingsApp />
    </QueryProvider>
  </StrictMode>
)
