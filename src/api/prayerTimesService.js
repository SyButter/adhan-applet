// src/api/prayerTimesService.js

const axios = require('axios');

/**
 * Fetch prayer times based on location, calculation method, and custom angles.
 * @param {Object} config - Configuration object for fetching prayer times.
 * @param {number} config.latitude - Latitude of the user's location.
 * @param {number} config.longitude - Longitude of the user's location.
 * @param {string} config.method - Calculation method (e.g., "ISNA", "Umm al-Qura").
 * @param {number} [config.fajrAngle] - Optional custom Fajr angle.
 * @param {number} [config.ishaAngle] - Optional custom Isha angle.
 * @returns {Promise<Object>} - Returns a promise resolving to the prayer times.
 */
function fetchPrayerTimes(config) {
  // Use method 99 (Custom) if custom angles are provided
  let url = `https://api.aladhan.com/v1/timings?latitude=${config.latitude}&longitude=${config.longitude}&method=${config.method}`;

  // If custom Fajr and Isha angles are provided, set the method to 99 (Custom) and add methodSettings
  if (config.fajrAngle || config.ishaAngle) {
    url += `&method=99&methodSettings=${config.fajrAngle || 'null'},null,${config.ishaAngle || 'null'}`;
  }

  // Print out the constructed URL for debugging purposes
  console.log("Request URL:", url);

  return axios.get(url)
    .then(response => {
      // Log the response data to verify the returned prayer times
      console.log("Response Data:", response.data);
      return response.data.data.timings;
    })
    .catch(error => {
      // Log the error and throw it
      console.error("Error in fetchPrayerTimes:", error.message);
      throw new Error("Failed to fetch prayer times. " + error.message);
    });
}

module.exports = { fetchPrayerTimes };
