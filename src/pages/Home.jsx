import React, { useEffect, useState } from 'react'
import './Home.css'
import { getOldestSighting, getNewestSighting, loadCSVData } from '../services/dataService'
import { translations } from '../translation.js'

function decodeHTMLEntities(text) {
  const txt = document.createElement('textarea');
  txt.innerHTML = text;
  return txt.value;
}
function capitalizeWordWithPunctuation(str) {
  return typeof str === 'string'
    ? str.replace(/([a-zA-Z]+)(.*)/, (match, p1, p2) => {
        const capitalized = p1.charAt(0).toUpperCase() + p1.slice(1).toLowerCase();
        return capitalized + p2;
      })
    : str;
}
function cleanAndCapitalize(str) {
  if (typeof str !== 'string') return str;
  // Remove parentheses and trim whitespace
  const cleaned = str.replace(/[()]/g, '').trim();
  // Capitalize first letter, lowercase the rest
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
}
function formatLocation(cityStr) {
  if (typeof cityStr !== 'string') return cityStr;
  const parts = cityStr.split(' ');
  if (parts.length === 2) {
    const city = cleanAndCapitalize(parts[0]);
    const country = cleanAndCapitalize(parts[1]);
    return `${city}, ${country}`;
  }
  return cleanAndCapitalize(cityStr);
}

const Home = ({language}) => {
  const [oldest, setOldest] = useState(null)
  const [newest, setNewest] = useState(null)
  const t = translations[language];

  useEffect(() => {
    async function fetchSightings() {
      const data = await loadCSVData();
      setOldest(getOldestSighting(data));
      setNewest(getNewestSighting(data));
    }
    fetchSightings();
  }, [])

  return (
    <div className='home-container'>
      <h1 className='welcome-banner'>{t.welcome}</h1>
      <p className='text-container'>{t.description}</p>
      <h2 className='source-container'>Source: <a href="https://www.kaggle.com/datasets/NUFORC/ufo-sightings" target="_blank" rel="noopener noreferrer">Kaggle: National UFO Reporting Center (NUFORC)</a></h2>
      <div className='sighting-container'>
        {oldest && (
          <div className='oldest-sighting'>
            <h2>{t.oldest}</h2>
            <p><strong>Date:</strong> {oldest.datetime || oldest.date}</p>
            <p><strong>{t.location}:</strong> {formatLocation(oldest.city)}</p>
            <p><strong>{t.shape}:</strong> {capitalizeWordWithPunctuation(oldest.shape)}</p>
            <p><strong>Description:</strong> {decodeHTMLEntities(oldest.comments)}</p>
          </div>
        )}
        {newest && (
          <div className='newest-sighting'>
            <h2>{t.newest}</h2>
            <p><strong>Date:</strong> {newest.datetime || newest.date}</p>
            <p><strong>{t.location}:</strong> {formatLocation(newest.city)}</p>
            <p><strong>{t.shape}:</strong> {capitalizeWordWithPunctuation(newest.shape)}</p>
            <p><strong>Description:</strong> {decodeHTMLEntities(newest.comments)}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Home
