import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { loadCSVData, processDataForCharts } from '../services/dataService';
import './Analytics.css';
import { translations } from '../translation.js';

const countryNames = {
  us: 'United States',
  gb: 'United Kingdom',
  au: 'Australia',
  ca: 'Canada',
  de: 'Germany',
  fr: 'France',
  it: 'Italy',
  es: 'Spain',
  br: 'Brazil',
  ru: 'Russia',
  jp: 'Japan',
  cn: 'China',
  in: 'India',
  at: 'Austria',
};

const Analytics = ({language}) => {
  const [data, setData] = useState({ yearData: [], locationData: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [yearRange, setYearRange] = useState([1990, 2020]); 
  const [selectedCountry, setSelectedCountry] = useState(null); 
  const t = translations[language];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const csvData = await loadCSVData();
        const processedData = processDataForCharts(csvData);
        setData(processedData);
      } catch (err) {
        setError('Failed to load data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Get min/max year from data
  const minYear = data.yearData.length > 0 ? Math.min(...data.yearData.map(d => d.year)) : 1990;
  const maxYear = data.yearData.length > 0 ? Math.max(...data.yearData.map(d => d.year)) : 2020;

  // Only years with sightings
  const yearsWithSightings = data.yearData.map(d => d.year);

  // Filter yearData for Graph 1
  const filteredYearData = data.yearData.filter(d => d.year >= yearRange[0] && d.year <= yearRange[1]);
  const yearRangeLength = yearRange[1] - yearRange[0] + 1;

  // Graph 2: Top 5 countries and top 5 cities in selected country
  const topCountries = data.locationData.slice(0, 5);
  const topCities = selectedCountry
    ? (data.locationData.find(c => c.location === selectedCountry)?.cities || [])
    : [];

  if (loading) {
    return (
      <div className="analytics">
        <h1>{t.dashboard}</h1>
        <div className="loading">Loading UFO data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics">
        <h1>{t.dashboard}</h1>
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="analytics">
      <h1>{t.dashboard}</h1>
      <p>{t.dashboard_desc}</p>
      <div className="charts-container">
        {/* Graph 1: UFO Sightings Over Time */}
        <div className="chart-section" style={{ paddingTop: '0.5rem' }}>
          <h2>{t.graph1_title}</h2>
          <div style={{ margin: '1rem 0', textAlign: 'center', color: '#034732' }}>
            <label htmlFor="startYear">{t.year} {t.start}:</label>
            <select
              id="startYear"
              value={yearRange[0]}
              onChange={e => {
                const newStart = Number(e.target.value);
                setYearRange([newStart, Math.max(newStart, yearRange[1])]);
              }}
              style={{ margin: '0 1rem' }}
              aria-label={`${t.year} ${t.start}`}
            >
              {data.yearData.map(d => (
                <option key={d.year} value={d.year}>{d.year}</option>
              ))}
            </select>
            <label htmlFor="endYear">{t.year} {t.end}:</label>
            <select
              id="endYear"
              value={yearRange[1]}
              onChange={e => {
                const newEnd = Number(e.target.value);
                setYearRange([Math.min(yearRange[0], newEnd), newEnd]);
              }}
              style={{ margin: '0 1rem' }}
              aria-label={`${t.year} ${t.end}`}
            >
              {data.yearData.map(d => (
                <option key={d.year} value={d.year}>{d.year}</option>
              ))}
            </select>
          </div>
          {yearRange[1] - yearRange[0] < 2 ? (
            <div className="chart-warning" style={{
              background: '#ffe4e1',
              color: '#a8201a',
              border: '1px solid #a8201a',
              borderRadius: '8px',
              padding: '1rem',
              margin: '1rem 0',
              textAlign: 'center',
              fontWeight: 'bold'
            }}>
              {t.year_range_warning}
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={filteredYearData} margin={{ top: 20, right: 30, left: 20, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#7eb77f" opacity={0.3} />
                  <XAxis 
                    dataKey="year" 
                    stroke="#034732"
                    tick={{ fill: '#034732' }}
                    name={t.year}
                    label={{ value: t.year, position: 'insideBottom', offset: -5, fill: '#034732', fontWeight: 'bold' }}
                  />
                  <YAxis 
                    stroke="#034732"
                    tick={{ fill: '#034732' }}
                    label={{ value: t.sightings, angle: 270, position: 'left', fill: '#034732', fontWeight: 'bold' }}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div style={{
                            background: '#efe9f4',
                            border: '1px solid #034732',
                            borderRadius: '8px',
                            padding: '0.75rem',
                            color: '#034732'
                          }}>
                            <div><strong>{t.year}:</strong> {label}</div>
                            <div><strong>{t.sightings}:</strong> {payload[0].value}</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sightings" 
                    stroke="#a8201a" 
                    strokeWidth={3}
                    dot={{ fill: '#ec9a29', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#a8201a' }}
                    name={t.legend}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="custom-legend" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 16 }}>
                <span style={{ display: 'inline-block', width: 20, height: 20, background: '#ec9a29', marginRight: 8, borderRadius: "50%" }}></span>
                <span style={{ color: '#034732', fontWeight: 'bold' }}>{t.legend}</span>
              </div>
            </>
          )}
        </div>

        {/* Graph 2: UFO Sightings by Country */}
        <div className="chart-section">
          <h2>{!selectedCountry ? t.graph2_title : `${t.graph2_title} - ${countryNames[selectedCountry] || selectedCountry}`}</h2>
          {!selectedCountry && (
            <div style={{ marginBottom: '1rem', textAlign: 'center', color: '#034732' }}>
              <label htmlFor="countrySelect">{t.country}:</label>
              <select
                id="countrySelect"
                value={selectedCountry || ''}
                onChange={e => setSelectedCountry(e.target.value)}
                style={{ margin: '0 1rem' }}
                aria-label={t.country}
              >
                <option value="" disabled>{t.select_country}</option>
                {topCountries.map(country => (
                  <option key={country.location} value={country.location}>
                    {countryNames[country.location] ? (language === 'fr' && t[`country_${country.location}`]) || countryNames[country.location] : country.location}
                  </option>
                ))}
              </select>
            </div>
          )}
          {selectedCountry && (
            <button className='back-button'
              onClick={() => setSelectedCountry(null)}
              style={{ marginBottom: '1rem', border: 'none', borderRadius: '6px', padding: '0.5rem 1rem', cursor: 'pointer' }}
              aria-label={t.back}
            >
              {t.back || 'Back'}
            </button>
          )}
          {!selectedCountry ? (
            <>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={topCountries} margin={{ top: 20, right: 30, left: 20, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#7eb77f" opacity={0.3} />
                  <XAxis
                    dataKey="location" 
                    stroke="#034732"
                    tick={{ fill: '#034732', fontSize: 14 }}
                    label={{ value: t.countries, position: 'insideBottom', offset: -5, fill: '#034732', fontWeight: 'bold'}}
                  />
                  <YAxis 
                    stroke="#034732"
                    tick={{ fill: '#034732' }}
                    label={{ value: t.sightings, angle: -90, position: 'left', fill: '#034732', fontWeight: 'bold' }}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const code = label.trim().toUpperCase();
                        const fullName = countryNames[code] ? (language === 'fr' && t[`country_${code}`]) || countryNames[code] : label;
                        return (
                          <div style={{
                            background: '#efe9f4',
                            border: '1px solid #034732',
                            borderRadius: '8px',
                            padding: '0.75rem',
                            color: '#034732'
                          }}>
                            <div><strong>{t.country}:</strong> {fullName}</div>
                            <div><strong>{t.sightings}:</strong> {payload[0].value}</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar 
                    dataKey="sightings" 
                    fill="#ec9a29"
                    name={t.legend}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
              <div className="custom-legend" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 16 }}>
                <span style={{ display: 'inline-block', width: 24, height: 16, background: '#ec9a29', marginRight: 8, borderRadius: 2 }}></span>
                <span style={{ color: '#034732', fontWeight: 'bold' }}>{t.legend}</span>
              </div>
            </>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={topCities} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#7eb77f" opacity={0.3} />
                  <XAxis 
                    dataKey="city" 
                    stroke="#034732"
                    tick={{ fill: '#034732', fontSize: 14 }}
                    label={{ value: t.location, position: 'insideBottom', offset: -5, fill: '#034732', fontWeight: 'bold' }}
                  />
                  <YAxis 
                    stroke="#034732"
                    tick={{ fill: '#034732' }}
                    label={{ value: t.sightings, angle: -90, position: 'insideLeft', fill: '#034732', fontWeight: 'bold' }}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div style={{
                            background: '#efe9f4',
                            border: '1px solid #034732',
                            borderRadius: '8px',
                            padding: '0.75rem',
                            color: '#034732'
                          }}>
                            <div><strong>{t.location}:</strong> {label}</div>
                            <div><strong>{t.sightings}:</strong> {payload[0].value}</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar 
                    dataKey="sightings" 
                    fill="#ec9a29"
                    name={t.legend}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
              <div className="custom-legend" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 16 }}>
                <span style={{ display: 'inline-block', width: 24, height: 16, background: '#ec9a29', marginRight: 8, borderRadius: 2 }}></span>
                <span style={{ color: '#034732', fontWeight: 'bold' }}>{t.legend}</span>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="data-source">
        <p>{t.notice}: <a href="https://www.kaggle.com/datasets/NUFORC/ufo-sightings" target="_blank" rel="noopener noreferrer">Kaggle: National UFO Reporting Center (NUFORC)</a></p>
      </div>
    </div>
  );
}

export default Analytics;
