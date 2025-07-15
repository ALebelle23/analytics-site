import React from 'react'
import { Link } from 'react-router-dom'
import './Navigation.css'

const Navigation = () => {
  return (
    <nav className="navigation">
      <div className="nav-brand">
        <Link to="/">UFOlytics</Link>
      </div>
      <ul className="nav-links">
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/about">About</Link>
        </li>
        <li>
          <Link to="/analytics">Analytics</Link>
        </li>
      </ul>
    </nav>
  )
}

export default Navigation
