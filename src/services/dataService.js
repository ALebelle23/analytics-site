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
  
  // Graph 1: Sightings by Year - using the first column which appears to be datetime
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

  // Graph 2: Sightings by Country - using the country column
  const sightingsByCountry = data.reduce((acc, row) => {
    const country = row.country || Object.values(row)[3]; // country is 4th column (index 3)
    if (country && country.trim() && country.toLowerCase() !== 'country') {
      const countryName = country.trim().toUpperCase();
      acc[countryName] = (acc[countryName] || 0) + 1;
    }
    return acc;
  }, {});

  const countryData = Object.entries(sightingsByCountry)
    .map(([country, count]) => ({ location: country, sightings: count }))
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