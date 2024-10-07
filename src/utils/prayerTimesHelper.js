const axios = require('axios');
const {fetchPrayerTimes} = require('../api/prayerTimesService')
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

/**
 * Get formatted prayer times based on user inputs.
 * @param {string} zipcode - The user's zipcode.
 * @param {string} method - Calculation method for prayer times.
 * @param {string} timeFormat - Time format (24-hour or 12-hour).
 * @returns {Promise<Object>} - Returns formatted prayer times.
 */
async function getFormattedPrayerTimes(zipcode, method, timeFormat) {
  const { latitude, longitude } = await getLatLongFromZip(zipcode);
  const timings = await fetchPrayerTimes({ latitude, longitude, method });
  
  if (timings) {
    const formattedTimings = {};
    for (const [prayer, time] of Object.entries(timings)) {
      formattedTimings[prayer] = timeFormat === "12-hour" ? convertTo12HourFormat(time) : time;
    }
    return formattedTimings;
  }
  throw new Error("Failed to fetch prayer times");
}

/**
 * Start a timer to check for prayer times.
 * @param {Object} prayerTimings - The prayer times object.
 * @param {Function} playAudio - Function to play the correct Adhan audio.
 */
function startPrayerTimer(prayerTimings, playAudio) {
  setInterval(() => {
    const currentTime = new Date();
    const currentHourMinute = `${currentTime.getHours()}:${currentTime.getMinutes()}`;

    for (const [prayer, time] of Object.entries(prayerTimings)) {
      const [prayerHour, prayerMinute] = time.split(':').map(Number);

      if (currentTime.getHours() === prayerHour && currentTime.getMinutes() === prayerMinute) {
        if (prayer === 'Fajr') {
          playAudio('Fajr');
        } else {
          playAudio('Normal');
        }
        break;
      }
    }
  }, 60000); // Check every minute
}

module.exports = {
  convertTo12HourFormat,
  getLatLongFromZip,
  getFormattedPrayerTimes, 
  startPrayerTimer
};
