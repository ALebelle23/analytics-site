import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import ufoIcon from '/UFO.png'
import './Navigation.css'
import { translations } from '../translation.js'

const Navigation = ({ language, setLanguage }) => {
     const t = translations[language];
  return (
    <nav className="navigation">
      <div className="nav-brand">
        <Link to="/">
          <img src={ufoIcon} alt="UFO" className="nav-logo" />
          UFOlytics
        </Link>
      </div>
      <ul className="nav-links">
        <li>
          <Link to="/analytics">{t.analytics}</Link>
        </li>
        <li>
          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
          >
            <option value="en">English</option>
            <option value="fr">Français</option>
          </select>
        </li>
      </ul>
    </nav>
  )
}

export default Navigation
