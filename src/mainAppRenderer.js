const path = require('path');
const { fetchPrayerTimes } = require('../src/api/prayerTimesService');
const { convertTo12HourFormat, getLatLongFromZip } = require('../src/utils/helperMethods');

// Function to get user input and fetch prayer times
async function getPrayerTimes() {
  try {
    console.log("getPrayerTimes function called!");

    // Retrieve user inputs from UI elements
    const zipcode = document.getElementById('zipcode').value.trim();
    const method = document.getElementById('method').value || "ISNA";
    const timeFormat = document.getElementById('time-format').value || "24-hour";

    console.log(`Zip Code: ${zipcode}, Method: ${method}, Time Format: ${timeFormat}`);

    // Fetch latitude and longitude based on the zip code
    const { latitude, longitude } = await getLatLongFromZip(zipcode);
    console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);

    // Call the fetchPrayerTimes function with user inputs
    const timings = await fetchPrayerTimes({ latitude, longitude, method });
    console.log("Received Prayer Times:", timings);

    if (timings) {
      const formattedTimings = {};
      for (const [prayer, time] of Object.entries(timings)) {
        formattedTimings[prayer] = timeFormat === "12-hour" ? convertTo12HourFormat(time) : time;
      }

      document.getElementById('fajr-time').textContent = formattedTimings.Fajr;
      document.getElementById('dhuhr-time').textContent = formattedTimings.Dhuhr;
      document.getElementById('asr-time').textContent = formattedTimings.Asr;
      document.getElementById('maghrib-time').textContent = formattedTimings.Maghrib;
      document.getElementById('isha-time').textContent = formattedTimings.Isha;
    } else {
      console.log("No prayer timings received.");
    }
  } catch (error) {
    console.error("Error occurred while fetching prayer times:", error.message);
  }
}

document.getElementById('get-prayer-times-button').addEventListener('click', getPrayerTimes);
