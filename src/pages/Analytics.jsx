import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { loadCSVData, processDataForCharts } from '../services/dataService';
import './Analytics.css';

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

const Analytics = () => {
  const [data, setData] = useState({ yearData: [], locationData: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const csvData = await loadCSVData();
        console.log('Raw CSV data sample:', csvData.slice(0, 5)); // Debug: show first 5 rows
        console.log('CSV columns:', Object.keys(csvData[0] || {})); // Debug: show column names
        
        const processedData = processDataForCharts(csvData);
        console.log('Processed yearData:', processedData.yearData.slice(0, 10)); // Debug: show year data
        console.log('Processed locationData:', processedData.locationData); // Debug: show location data
        
        setData(processedData);
      } catch (err) {
        setError('Failed to load data: ' + err.message);
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="analytics">
        <h1>UFO Analytics Dashboard</h1>
        <div className="loading">Loading UFO data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics">
        <h1>UFO Analytics Dashboard</h1>
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="analytics">
      <h1>UFO Analytics Dashboard</h1>
      <p>Explore patterns in UFO sightings data from the last century</p>
      
      <div className="charts-container">
        {/* Graph 1: UFO Sightings Over Time */}
        <div className="chart-section">
          <h2>UFO Sightings by Year</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data.yearData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#7eb77f" opacity={0.3} />
              <XAxis 
                dataKey="year" 
                stroke="#034732"
                tick={{ fill: '#034732' }}
                name="Year"
              />
              <YAxis 
                stroke="#034732"
                tick={{ fill: '#034732' }}
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
                        <div><strong>Year:</strong> {label}</div>
                        <div><strong>Sightings:</strong> {payload[0].value}</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="sightings" 
                stroke="#a8201a" 
                strokeWidth={3}
                dot={{ fill: '#ec9a29', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#a8201a' }}
                name="Number of Sightings"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Graph 2: UFO Sightings by Location */}
        <div className="chart-section">
          <h2>Top 5 Countries - UFO Sightings</h2>
          <div style={{ marginBottom: '1rem', textAlign: 'center', color: '#034732' }}>
          </div>
          {data.locationData && data.locationData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data.locationData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#7eb77f" opacity={0.3} />
                <XAxis 
                  dataKey="location" 
                  stroke="#034732"
                  tick={{ fill: '#034732', fontSize: 14 }}
                />
                <YAxis 
                  stroke="#034732"
                  tick={{ fill: '#034732' }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      // Try to get full country name
                      const code = label.trim().toLowerCase();
                      const fullName = countryNames[code] || label;
                      return (
                        <div style={{
                          background: '#efe9f4',
                          border: '1px solid #034732',
                          borderRadius: '8px',
                          padding: '0.75rem',
                          color: '#034732'
                        }}>
                          <div><strong>Country:</strong> {fullName}</div>
                          <div><strong>Sightings:</strong> {payload[0].value}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="sightings" 
                  fill="#ec9a29"
                  name="Number of Sightings"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data" style={{ 
              textAlign: 'center', 
              padding: '2rem',
              backgroundColor: '#efe9f4',
              borderRadius: '8px',
              margin: '2rem 0'
            }}>
              <p>No location data found. Check console for debugging info.</p>
              <p>Available data count: {data.locationData?.length || 0}</p>
              <p>Raw data sample: {JSON.stringify(data.locationData)}</p>
            </div>
          )}
        </div>
      </div>
      <div className="data-source">
        <p>Please note that all sightings come from this dataset: <a href="https://www.kaggle.com/datasets/NUFORC/ufo-sightings" target="_blank" rel="noopener noreferrer">Kaggle: National UFO Reporting Center (NUFORC)</a></p>
    </div>
    </div>
  );
}

export default Analytics;
