import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// HashRouter is used deliberately: GitHub Pages is a static file host with no
// server-side rewrite rules, so a BrowserRouter path like /wedding-map/detail/1
// would 404 on refresh or direct link. Hash-based routes
// (/wedding-map/#/detail/1) always resolve to index.html first. See README.

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
)
