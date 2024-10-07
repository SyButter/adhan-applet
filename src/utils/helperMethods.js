const axios = require('axios');

/**
 * Convert 24-hour time format to 12-hour format with AM/PM.
 */
function convertTo12HourFormat(time) {
  const [hours, minutes] = time.split(':').map(Number);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const adjustedHours = hours % 12 || 12;
  return `${adjustedHours}:${minutes < 10 ? '0' + minutes : minutes} ${suffix}`;
}

/**
 * Fetch latitude and longitude based on zip code.
 */
async function getLatLongFromZip(zipcode) {
  try {
    const response = await axios.get(`https://api.zippopotam.us/us/${zipcode}`);
    if (response.data && response.data.places && response.data.places.length > 0) {
      const place = response.data.places[0];
      return { latitude: parseFloat(place.latitude), longitude: parseFloat(place.longitude) };
    } else {
      throw new Error("Invalid zip code or no data found.");
    }
  } catch (error) {
    console.error("Error occurred while fetching latitude and longitude:", error.message);
    throw new Error("Failed to fetch location data for the given zip code.");
  }
}

module.exports = {
  convertTo12HourFormat,
  getLatLongFromZip,
};
