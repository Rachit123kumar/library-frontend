import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'
import App from './App.tsx'
import { ToastContainer } from "react-toastify";


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />

 <ToastContainer
    position="top-right"
    autoClose={3000}
    newestOnTop
    closeOnClick
    pauseOnHover
    draggable
    pauseOnFocusLoss
    theme="dark"
    stacked
    limit={3}
/>
  </StrictMode>,
)
