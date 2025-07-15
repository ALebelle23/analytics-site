import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navigation from './components/Navigation'
import Home from './pages/Home'
import Analytics from './pages/Analytics'
import NotFound from './pages/NotFound'
import './App.css'
import { translations } from './translation'

function App() {
  const [language, setLanguage] = useState('en')
  return (
    <div className="App">
      <Navigation language={language} setLanguage={setLanguage} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home language={language} />} />
          <Route path="/analytics" element={<Analytics language={language} />} />
          <Route path="*" element={<NotFound language={language} />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
