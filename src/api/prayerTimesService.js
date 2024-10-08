const axios = require("axios");

/**
 * Fetch prayer times based on location, calculation method, custom angles, and user-defined offsets.
 * @param {Object} config - Configuration object for fetching prayer times.
 * @param {number} config.latitude - Latitude of the user's location.
 * @param {number} config.longitude - Longitude of the user's location.
 * @param {string} config.method - Calculation method (e.g., "ISNA", "Umm al-Qura").
 * @param {number} [config.fajrAngle] - Optional custom Fajr angle.
 * @param {number} [config.ishaAngle] - Optional custom Isha angle.
 * @param {Object} [config.offsets] - Prayer time offsets in minutes.
 * @returns {Promise<Object>} - Returns a promise resolving to the prayer times.
 */
function fetchPrayerTimes(config) {
  // Construct the base URL
  let url = `https://api.aladhan.com/v1/timings?latitude=${config.latitude}&longitude=${config.longitude}&method=${config.method}`;

  // If custom Fajr and Isha angles are provided, set the method to 99 (Custom) and add methodSettings
  if (config.fajrAngle || config.ishaAngle) {
    url += `&method=99&methodSettings=${config.fajrAngle || "null"},null,${config.ishaAngle || "null"}`;
  }

  // If offsets are provided, construct the tune parameter
  if (config.offsets) {
    const {
      Imsak = 0, Fajr = 0, Sunrise = 0, Dhuhr = 0,
      Asr = 0, Maghrib = 0, Sunset = 0, Isha = 0, Midnight = 0
    } = config.offsets;

    // Create the tune parameter string
    const tune = `${Imsak},${Fajr},${Sunrise},${Dhuhr},${Asr},${Maghrib},${Sunset},${Isha},${Midnight}`;
    url += `&tune=${tune}`;
  }

  // Print out the constructed URL for debugging purposes
  console.log("Request URL:", url);

  // Make the API call
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
