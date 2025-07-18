import Papa from 'papaparse';

export const loadCSVData = async () => {
  try {
    const response = await fetch('/scrubbed.csv');
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          console.log('Parsed CSV data:', results.data);
          resolve(results.data);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Error loading CSV:', error);
    throw error;
  }
};

// Helper functions to process UFO data
export const processDataForCharts = (data) => {
  console.log('Processing data, total rows:', data.length);
  
  // Check what columns we have
  const sampleRow = data[0] || {};
  console.log('Available columns:', Object.keys(sampleRow));
  
  // Graph 1: Sightings by Year
  const sightingsByYear = data.reduce((acc, row) => {
    const dateValue = row.datetime || Object.values(row)[0];
    if (dateValue) {
      try {
        const year = new Date(dateValue).getFullYear();
        if (!isNaN(year) && year > 1900 && year < 2025) {
          acc[year] = (acc[year] || 0) + 1;
        }
      } catch (e) {
        // Skip invalid dates
      }
    }
    return acc;
  }, {});

  const yearData = Object.entries(sightingsByYear)
    .map(([year, count]) => ({ year: parseInt(year), sightings: count }))
    .sort((a, b) => a.year - b.year);

  // Graph 2: Sightings by Country and Cities
  const sightingsByCountry = {};
  const sightingsByCity = {};

  data.forEach(row => {
    const country = (row.country || Object.values(row)[3] || '').trim().toUpperCase();
    const city = (row.city || Object.values(row)[1] || '').trim();
    if (country && country !== 'COUNTRY') {
      sightingsByCountry[country] = (sightingsByCountry[country] || 0) + 1;
      if (!sightingsByCity[country]) sightingsByCity[country] = {};
      if (city) {
        sightingsByCity[country][city] = (sightingsByCity[country][city] || 0) + 1;
      }
    }
  });

  const countryData = Object.entries(sightingsByCountry)
    .map(([country, count]) => {
      // Get top 5 cities for this country
      const citiesObj = sightingsByCity[country] || {};
      const citiesArr = Object.entries(citiesObj)
        .map(([city, count]) => ({ city, sightings: count }))
        .sort((a, b) => b.sightings - a.sightings)
        .slice(0, 5);
      return { location: country, sightings: count, cities: citiesArr };
    })
    .sort((a, b) => b.sightings - a.sightings)
    .slice(0, 5); // Top 5 countries

  console.log('Raw country counts:', sightingsByCountry);
  console.log('Year data processed:', yearData.length, 'entries');
  console.log('Country data processed:', countryData.length, 'entries');
  console.log('Sample country data:', countryData.slice(0, 5));

  return { yearData, locationData: countryData };
};

export const getOldestSighting = (data) => {
  if (!Array.isArray(data) || data.length === 0) return null;
  let oldest = null;
  let oldestDate = Infinity;
  data.forEach(row => {
    const dateValue = row.datetime || Object.values(row)[0];
    const date = new Date(dateValue);
    if (date instanceof Date && !isNaN(date) && date.getFullYear() > 1900 && date.getTime() < oldestDate) {
      oldestDate = date.getTime();
      oldest = row;
    }
  });
  return oldest;
}

export const getNewestSighting = (data) => {
  if (!Array.isArray(data) || data.length === 0) return null;
  let newest = null;
  let newestDate = -Infinity;
  data.forEach(row => {
    const dateValue = row.datetime || Object.values(row)[0];
    const date = new Date(dateValue);
    if (date instanceof Date && !isNaN(date) && date.getFullYear() > 1900 && date.getTime() > newestDate) {
      newestDate = date.getTime();
      newest = row;
    }
  });
  return newest;
}