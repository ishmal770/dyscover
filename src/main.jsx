// Entry point: mounts the React app into the #root div in index.html
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' // global fonts, CSS variables, resets
import App from './App.jsx'
import './jungle.css' // jungle theme - after App so its rules win ties with page CSS

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
