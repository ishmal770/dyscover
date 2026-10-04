// Entry point: mounts the React app into the #root div in index.html
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' // global fonts, CSS variables, resets
import App from './App.jsx'
import './game-ui.css' // the bigger, chunkier "game" look - keep this import last so it wins

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
