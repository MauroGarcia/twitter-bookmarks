import React from 'react'
import ReactDOM from 'react-dom/client'
import { setApi } from '../shared/services/api'
import App from '../shared/App'
import './index.css'

// Injeta a implementação IPC exposta pelo preload (window.api)
setApi(window.api)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
