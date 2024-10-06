const path = require('path');
const axios = require('axios'); // Make sure axios is installed (`npm install axios`)

// Use the path to fetch the service
const { fetchPrayerTimes } = require(path.resolve(process.cwd(), 'src/api/prayerTimesService.js'));

// Function to convert 24-hour time format to 12-hour format with AM/PM
function convertTo12HourFormat(time) {
  const [hours, minutes] = time.split(':').map(Number);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const adjustedHours = hours % 12 || 12; // Convert '0' or '12' hours to 12 in 12-hour format
  return `${adjustedHours}:${minutes < 10 ? '0' + minutes : minutes} ${suffix}`;
}

// Function to get user input and fetch latitude and longitude based on zip code
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

// Function to get user input and fetch prayer times
async function getPrayerTimes() {
  try {
    console.log("getPrayerTimes function called!");

    // Retrieve user inputs from UI elements
    const zipcode = document.getElementById('zipcode').value.trim();
    const method = document.getElementById('method').value || "ISNA";
    const timeFormat = document.getElementById('time-format').value || "24-hour"; // Get selected time format

    // Log user inputs to verify correct values
    console.log(`Zip Code: ${zipcode}, Method: ${method}, Time Format: ${timeFormat}`);

    // Fetch latitude and longitude based on the zip code
    const { latitude, longitude } = await getLatLongFromZip(zipcode);
    console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);

    // Call the fetchPrayerTimes function with user inputs
    const timings = await fetchPrayerTimes({ latitude, longitude, method });
    console.log("Received Prayer Times:", timings); // Show the received timings

    // Check if the timings object is populated
    if (timings) {
      // Format prayer times based on the selected time format
      const formattedTimings = {};
      for (const [prayer, time] of Object.entries(timings)) {
        formattedTimings[prayer] = timeFormat === "12-hour" ? convertTo12HourFormat(time) : time;
      }

      // Update UI elements with the formatted prayer times
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

// Add event listener to the button to call getPrayerTimes() on click
document.getElementById('get-prayer-times-button').addEventListener('click', getPrayerTimes);
