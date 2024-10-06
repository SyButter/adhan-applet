// src/api/prayerTimesService.js

const axios = require('axios');

/**
 * Fetch prayer times based on location and calculation method.
 * @param {Object} config - Configuration object for fetching prayer times.
 * @param {number} config.latitude - Latitude of the user's location.
 * @param {number} config.longitude - Longitude of the user's location.
 * @param {string} config.method - Calculation method (e.g., "ISNA", "Umm al-Qura").
 * @param {number} [config.fajrAngle] - Optional custom Fajr angle.
 * @param {number} [config.ishaAngle] - Optional custom Isha angle.
 * @returns {Promise<Object>} - Returns a promise resolving to the prayer times.
 */
const fetchPrayerTimes = async ({ latitude, longitude, method, fajrAngle, ishaAngle }) => {
  try {
    let url = `https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=${method}`;
    
    if (fajrAngle) url += `&fajr=${fajrAngle}`;
    if (ishaAngle) url += `&isha=${ishaAngle}`;

    const response = await axios.get(url);
    const prayerTimes = response.data.data.timings;
    return prayerTimes;
  } catch (error) {
    console.error("Error in fetchPrayerTimes:", error.message);
    throw new Error("Failed to fetch prayer times. " + error.message);
  }
};

// Export fetchPrayerTimes so it can be used in other files
module.exports = { fetchPrayerTimes };
