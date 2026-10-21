import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/components/Auth'
import App from './App'
import './index.css'

if (typeof window !== 'undefined' && window.location.pathname.startsWith('/campus')) {
  void import('@/data/campus-jobs/loadJobs').then(({ ensureLocalCampusCatalog }) =>
    ensureLocalCampusCatalog()
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
