import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../styles/globals.css'
import { QueryProvider } from '../shared/providers/QueryProvider'
import { ModalApp } from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryProvider>
      <ModalApp />
    </QueryProvider>
  </StrictMode>
)
