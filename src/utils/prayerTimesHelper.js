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
  async getLatLongFromZip(zipcode) {
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
   * @param {string} zipcode - The user's zipcode.
   * @param {string} method - Calculation method for prayer times.
   * @param {string} timeFormat - Time format (24-hour or 12-hour).
   * @param {Object} offsets - Offsets for each prayer time.
   * @param {Object} config - Optional configuration with custom Fajr and Isha angles.
   * @returns {Promise<Object>} - Returns formatted prayer times with offsets applied.
   */
   async getFormattedPrayerTimes(zipcode, method, timeFormat, offsets, config = {}) {
    const { latitude, longitude } = await this.getLatLongFromZip(zipcode);
    
    // Use custom method (99) if Fajr or Isha angles are provided
    const apiMethod = (config.fajrAngle || config.ishaAngle) ? 99 : method;

    // Include the custom Fajr and Isha angles in the API call if provided
    const timings = await fetchPrayerTimes({
      latitude,
      longitude,
      method: apiMethod,
      fajrAngle: config.fajrAngle,
      ishaAngle: config.ishaAngle,
    });

    if (timings) {
      const formattedTimings = {};
      for (const [prayer, time] of Object.entries(timings)) {
        const offset = offsets[prayer] || 0; // Default to 0 if no offset provided
        const adjustedTime = this.adjustTimeByOffset(time, offset); // Adjust time by offset
        formattedTimings[prayer] = timeFormat === "12-hour" ? this.convertTo12HourFormat(adjustedTime) : adjustedTime;
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

// Export the entire class as a module
module.exports = PrayerTimesHelper;
