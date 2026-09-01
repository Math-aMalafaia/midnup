import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Routes } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <Routes>
    <StrictMode>
      <App />
    </StrictMode>
  </Routes>
)
