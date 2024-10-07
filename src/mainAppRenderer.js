const { ipcRenderer } = require('electron');
const { getFormattedPrayerTimes, startPrayerTimer } = require('../src/utils/prayerTimesHelper');
const { setAudioFolderPath, playAudio } = require('../src/utils/audioHelper');

let selectedReciter = ''; // Variable to store the selected reciter
let prayerTimings = {}; // Store fetched prayer timings

// Function to populate reciter dropdown
async function populateReciterDropdown() {
  const reciters = await ipcRenderer.invoke('get-reciter-list');
  const reciterDropdown = document.getElementById('reciter-dropdown');

  reciterDropdown.innerHTML = '';
  reciters.forEach(reciter => {
    const option = document.createElement('option');
    option.value = reciter;
    option.textContent = reciter;
    reciterDropdown.appendChild(option);
  });

  selectedReciter = reciterDropdown.value;
}

// Function to get user input and fetch prayer times
async function getPrayerTimes() {
  try {
    const zipcode = document.getElementById('zipcode').value.trim();
    const method = document.getElementById('method').value || "ISNA";
    const timeFormat = document.getElementById('time-format').value || "24-hour";

    const timings = await getFormattedPrayerTimes(zipcode, method, timeFormat);
    console.log("Received Prayer Times:", timings);

    prayerTimings = timings;
    document.getElementById('fajr-time').textContent = timings.Fajr;
    document.getElementById('dhuhr-time').textContent = timings.Dhuhr;
    document.getElementById('asr-time').textContent = timings.Asr;
    document.getElementById('maghrib-time').textContent = timings.Maghrib;
    document.getElementById('isha-time').textContent = timings.Isha;

    // Start the timer to check for prayer times
    startPrayerTimer(prayerTimings, (prayer) => playAudio(prayer, selectedReciter));
  } catch (error) {
    console.error("Error occurred while fetching prayer times:", error.message);
  }
}

// Update the selected reciter when the dropdown value changes
document.getElementById('reciter-dropdown').addEventListener('change', (event) => {
  selectedReciter = event.target.value;
});

// Populate reciter dropdown on page load
populateReciterDropdown();

// Event listener for get prayer times button
document.getElementById('get-prayer-times-button').addEventListener('click', getPrayerTimes);
