const axios = require('axios');

/**
 * Function to get latitude and longitude based on zip code.
 * @param {string} zipcode - Zip code to lookup.
 * @returns {Promise<{latitude: number, longitude: number}>} - Returns latitude and longitude.
 */
async function getLatLongFromZip(zipcode) {
  try {
    const response = await axios.get(`https://api.zippopotam.us/us/${zipcode}`);
    if (response.data && response.data.places && response.data.places.length > 0) {
      const place = response.data.places[0];
      const latitude = parseFloat(place.latitude);
      const longitude = parseFloat(place.longitude);
      return { latitude, longitude };
    } else {
      throw new Error("Invalid zip code or no data found.");
    }
  } catch (error) {
    console.error("Error occurred while fetching latitude and longitude:", error.message);
    throw new Error("Failed to fetch location data for the given zip code.");
  }
}

/**
 * Function to convert 24-hour time format to 12-hour format with AM/PM.
 * @param {string} time - Time in 24-hour format ("HH:MM").
 * @returns {string} - Time in 12-hour format ("HH:MM AM/PM").
 */
function convertTo12HourFormat(time) {
  const [hours, minutes] = time.split(':').map(Number);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const adjustedHours = hours % 12 || 12; // Convert '0' or '12' hours to 12 in 12-hour format
  return `${adjustedHours}:${minutes < 10 ? '0' + minutes : minutes} ${suffix}`;
}

module.exports = { getLatLongFromZip, convertTo12HourFormat };