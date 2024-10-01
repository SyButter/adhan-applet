// src/api/prayerTimesAPI.js
const axios = require('axios');

/**
 * Fetch prayer times based on user location and calculation method.
 * @param {Object} options - Options for fetching prayer times.
 * @param {number} options.latitude - Latitude of the location.
 * @param {number} options.longitude - Longitude of the location.
 * @param {string} options.method - Calculation method (e.g., "ISNA").
 * @param {number} options.fajrAngle - Custom Fajr angle (optional).
 * @param {number} options.ishaAngle - Custom Isha angle (optional).
 * @returns {Promise<Object>} - A promise that resolves to the prayer times.
 */
const fetchPrayerTimes = async ({ latitude, longitude, method, fajrAngle, ishaAngle }) => {
  try {
    // Construct the Aladhan API URL with the provided parameters.
    const url = `https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=${method}&fajr=${fajrAngle}&isha=${ishaAngle}`;
    
    // Make the API request using axios.
    const response = await axios.get(url);

    // Return the timings from the API response.
    return response.data.data.timings;
  } catch (error) {
    console.error('Error fetching prayer times:', error);
    throw error;
  }
};

module.exports = { fetchPrayerTimes };
