const axios = require("axios");
const { fetchPrayerTimes } = require("../api/prayerTimesService");

class PrayerTimesHelper {
  /**
   * Convert 24-hour time format to 12-hour format with AM/PM.
   */
  convertTo12HourFormat(time) {
    const [hours, minutes] = time.split(":").map(Number);
    const suffix = hours >= 12 ? "PM" : "AM";
    const adjustedHours = hours % 12 || 12;
    return `${adjustedHours}:${minutes < 10 ? "0" + minutes : minutes} ${suffix}`;
  }

  /**
   * Fetch latitude and longitude based on zip code.
   */
async getLatLongFromZip(zipCode) {
    try {
      // Log the zip code value and type to confirm its format
      console.log("Zip Code passed to getLatLongFromZip:", zipCode);
      console.log("Type of zipCode:", typeof zipCode); // Should be "string"

      // Ensure zipCode is a string and not an object or null
      if (typeof zipCode !== "string" || !zipCode.trim()) {
        throw new Error("Invalid zip code provided");
      }

      // Construct the URL using the correct zip code format
      const url = `https://api.zippopotam.us/us/${zipCode.trim()}`;
      console.log("Request URL for fetching latitude and longitude:", url);

      // Fetch the latitude and longitude using axios
      const response = await axios.get(url);

      // Validate the API response to ensure it has places data
      if (!response || !response.data || !response.data.places || response.data.places.length === 0) {
        throw new Error("No location data found for the given zip code.");
      }

      // If the request was successful, return the latitude and longitude
      const place = response.data.places[0];
      const lat = place.latitude;
      const lng = place.longitude;

      console.log(`Fetched data for ${zipCode}: Latitude: ${lat}, Longitude: ${lng}`);
      return { lat, lng };
    } catch (error) {
      console.error("Error occurred while fetching latitude and longitude:", error.message);
      throw new Error("Failed to fetch location data for the given zip code.");
    }
  }

  

  /**
   * Adjust a given time by a specific number of minutes.
   * @param {string} time - Time in "HH:mm" format.
   * @param {number} offset - Offset in minutes.
   * @returns {string} - Adjusted time in "HH:mm" format.
   */
  adjustTimeByOffset(time, offset) {
    const [hours, minutes] = time.split(":").map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes + offset); // Apply the offset in minutes

    const adjustedHours = date.getHours().toString().padStart(2, "0");
    const adjustedMinutes = date.getMinutes().toString().padStart(2, "0");
    return `${adjustedHours}:${adjustedMinutes}`;
  }

   /**
 * Get formatted prayer times based on user inputs, offsets, and angles.
 * @param {string} zipcode - The user's zipcode as a string.
 * @param {string} method - Calculation method for prayer times.
 * @param {string} timeFormat - Time format (24-hour or 12-hour).
 * @param {Object} offsets - Offsets for each prayer time.
 * @param {Object} config - Optional configuration with custom Fajr and Isha angles.
 * @returns {Promise<Object>} - Returns formatted prayer times with offsets applied.
 */
async getFormattedPrayerTimes(zipcode, method, timeFormat, offsets, config = {}) {
  try {
    // Log the function parameters for debugging
    console.log("Parameters passed to getFormattedPrayerTimes:");
    console.log("zipcode:", zipcode);
    console.log("method:", method);
    console.log("timeFormat:", timeFormat);
    console.log("offsets:", offsets);
    console.log("config:", config);

    // Ensure the zipcode parameter is a valid string before proceeding
    if (!zipcode || typeof zipcode !== "string" || zipcode.trim().length !== 5) {
      throw new Error(`Invalid zip code format: ${zipcode}. Please provide a 5-digit zip code.`);
    }

    // Fetch latitude and longitude based on the zip code
    const { lat, lng } = await this.getLatLongFromZip(zipcode.trim());

    // Log the fetched latitude and longitude for debugging
    console.log(`Fetched coordinates for zip code ${zipcode}: Latitude: ${lat}, Longitude: ${lng}`);

    // Use custom method (99) if Fajr or Isha angles are provided
    const apiMethod = (config.fajrAngle || config.ishaAngle) ? 99 : method;

    // Log the API method being used
    console.log("API Method being used:", apiMethod);

    // Include the custom Fajr and Isha angles in the API call if provided
    const timings = await fetchPrayerTimes({
      latitude: lat,
      longitude: lng,
      method: apiMethod,
      fajrAngle: config.fajrAngle,
      ishaAngle: config.ishaAngle,
    });

    // Log the raw prayer times received from the API
    console.log("Raw prayer times from API:", timings);

    // If timings are successfully fetched, format them
    if (timings) {
      const formattedTimings = {};
      for (const [prayer, time] of Object.entries(timings)) {
        const offset = offsets[prayer] || 0; // Default to 0 if no offset is provided
        const adjustedTime = this.adjustTimeByOffset(time, offset); // Adjust time by offset
        formattedTimings[prayer] = timeFormat === "12-hour" ? this.convertTo12HourFormat(adjustedTime) : adjustedTime;
      }
      // Log the formatted timings for debugging
      console.log("Formatted prayer times with offsets applied:", formattedTimings);
      return formattedTimings;
    }

    // If timings are not fetched, throw an error
    throw new Error("Failed to fetch prayer times from the API.");
  } catch (error) {
    console.error("Error in getFormattedPrayerTimes:", error.message);
    throw error;
  }
}



  /**
   * Start a timer to check for prayer times.
   * @param {Object} prayerTimings - The prayer times object.
   * @param {Function} playAudio - Function to play the correct Adhan audio.
   */
  startPrayerTimer(prayerTimings, playAudio) {
    setInterval(() => {
      const currentTime = new Date();

      for (const [prayer, time] of Object.entries(prayerTimings)) {
        const [prayerHour, prayerMinute] = time.split(":").map(Number);

        if (currentTime.getHours() === prayerHour && currentTime.getMinutes() === prayerMinute) {
          if (prayer === "Fajr") {
            playAudio("Fajr");
          } else {
            playAudio("Normal");
          }
          break;
        }
      }
    }, 60000); // Check every minute
  }
}

module.exports = PrayerTimesHelper;
