// frontend/src/main.jsx — VERSI LENGKAP, timpa file lama.
// Perubahan: tambah SearchProvider membungkus App.

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { SearchProvider } from './context/SearchContext' // ← BARU
import './index.css'

console.log("ROOT:", document.getElementById('root'));

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <SearchProvider>
      <App />
    </SearchProvider>
  </AuthProvider>
)
