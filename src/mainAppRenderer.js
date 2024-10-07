const { ipcRenderer } = require('electron');
const path = require('path');
const { fetchPrayerTimes } = require('../src/api/prayerTimesService');
const { convertTo12HourFormat, getLatLongFromZip } = require('../src/utils/helperMethods');

let audioFolderPath = ''; // Variable to store the selected folder path

// Function to select a folder for the MP3 files
async function selectAudioFolder() {
  audioFolderPath = await ipcRenderer.invoke('select-folder');
  console.log("Selected folder:", audioFolderPath);
}

// Function to play the appropriate audio file based on prayer time
function playAudio(prayer) {
  const audio = new Audio();
  const audioFile = prayer === 'Fajr' ? 'fajr.mp3' : 'normal.mp3';

  // Construct the full path to the audio file
  const filePath = path.join(audioFolderPath, audioFile);

  // Play the audio file
  audio.src = filePath;
  audio.play();
}

// Function to get user input and fetch prayer times
async function getPrayerTimes() {
  try {
    const zipcode = document.getElementById('zipcode').value.trim();
    const method = document.getElementById('method').value || "ISNA";
    const timeFormat = document.getElementById('time-format').value || "24-hour";

    const { latitude, longitude } = await getLatLongFromZip(zipcode);

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

      // Play Fajr or Normal Adhan based on prayer time
      if (new Date().getHours() === new Date(formattedTimings.Fajr).getHours()) {
        playAudio('Fajr');
      } else {
        playAudio('Normal');
      }
    }
  } catch (error) {
    console.error("Error occurred while fetching prayer times:", error.message);
  }
}

document.getElementById('get-prayer-times-button').addEventListener('click', getPrayerTimes);
document.getElementById('select-audio-folder-button').addEventListener('click', selectAudioFolder);
