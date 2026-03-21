import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        success: {
          className: "!bg-emerald-50 !text-emerald-800 !border !border-emerald-200",
        },
        error: {
          className: "!bg-rose-50 !text-rose-800 !border !border-rose-200",
        },
      }}
    />
  </StrictMode>,
)
