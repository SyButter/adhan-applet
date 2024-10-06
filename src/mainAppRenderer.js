const path = require('path');
const prayerTimesServicePath = path.resolve(process.cwd(), 'src/api/prayerTimesService.js');

let fetchPrayerTimes;
try {
  const serviceModule = require(prayerTimesServicePath);
  fetchPrayerTimes = serviceModule.fetchPrayerTimes;
} catch (error) {
  console.error("Error requiring prayerTimesService.js module:", error.message);
}

// Function to get user input and fetch prayer times
async function getPrayerTimes() {
  try {
    console.log("getPrayerTimes function called!");

    // Retrieve user inputs from UI elements
    const latitude = parseFloat(document.getElementById('latitude').value) || 0;
    const longitude = parseFloat(document.getElementById('longitude').value) || 0;
    const method = document.getElementById('method').value || "ISNA";

    // Log user inputs to verify correct values
    console.log(`Latitude: ${latitude}, Longitude: ${longitude}, Method: ${method}`);

    if (typeof fetchPrayerTimes === 'function') {
      const timings = await fetchPrayerTimes({ latitude, longitude, method });
      console.log("Received Prayer Times:", timings);

      // Check if the timings object is populated
      if (timings) {
        // Update UI elements with the fetched prayer times
        document.getElementById('fajr-time').textContent = timings.Fajr;
        document.getElementById('dhuhr-time').textContent = timings.Dhuhr;
        document.getElementById('asr-time').textContent = timings.Asr;
        document.getElementById('maghrib-time').textContent = timings.Maghrib;
        document.getElementById('isha-time').textContent = timings.Isha;
      } else {
        console.log("No prayer timings received.");
      }
    } else {
      console.error("fetchPrayerTimes is not defined or not a function");
    }
  } catch (error) {
    console.error("Error occurred while fetching prayer times:", error.message);
  }
}

document.getElementById('get-prayer-times-button').addEventListener('click', getPrayerTimes);
