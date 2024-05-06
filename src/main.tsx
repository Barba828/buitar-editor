import React from 'react'
import ReactDOM from 'react-dom/client'
import * as slate from 'slate'
import App from './App.tsx'
import './index.css'

window.slate = slate

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
