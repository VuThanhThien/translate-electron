import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../styles/globals.css'
import { QueryProvider } from '../shared/providers/QueryProvider'
import { SetupApp } from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryProvider>
      <SetupApp />
    </QueryProvider>
  </StrictMode>
)
