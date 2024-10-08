const { ipcRenderer } = require("electron");
const PrayerTimesHelper = require("../src/utils/prayerTimesHelper");
const AudioHelper = require("../src/utils/audioHelper");
const ErrorHandler = require("../src/utils/errorHandler");
const ConfigHelper = require("../src/utils/configHelper.js");

// Create instances of the helper classes
const prayerTimesHelper = new PrayerTimesHelper();
const audioHelper = new AudioHelper();
const generalHelpers = new ErrorHandler();
const configHelper = new ConfigHelper();

let selectedReciter = ""; // Variable to store the selected reciter
let prayerTimings = {}; // Store fetched prayer timings


// Example usage of configuration helper methods
(async () => {
  // Get a configuration value
  const zipcode = await configHelper.getConfigValue("ZIPCODE");
  console.log("Current Zipcode:", zipcode);

  // Set a configuration value
  await configHelper.setConfigValue("ZIPCODE", "67890");
  console.log("Updated Zipcode to 67890");

  // List all configuration values
  const configList = await configHelper.listAllConfigValues();
  console.log("Configuration values:", configList);

  // Delete a configuration key
  await configHelper.deleteConfigValue("METHOD");
  console.log("Deleted configuration key: METHOD");
})();
// Function to populate reciter dropdown
async function populateReciterDropdown() {
  const reciters = await ipcRenderer.invoke("get-reciter-list");
  const reciterDropdown = document.getElementById("reciter-dropdown");

  reciterDropdown.innerHTML = "";
  reciters.forEach(reciter => {
    const option = document.createElement("option");
    option.value = reciter;
    option.textContent = reciter;
    reciterDropdown.appendChild(option);
  });

  selectedReciter = reciterDropdown.value;
}

async function getPrayerTimes() {
  try {
    // Retrieve the consolidated configuration object from ConfigHelper
    const config = await configHelper.getConfigObject();

    // Check if a ZIPCODE is present in the config or the input field
    const zipcode = document.getElementById("zipcode").value.trim() || config.ZIPCODE;
    if (!zipcode) {
      generalHelpers.showError("PLEASE ENTER A ZIPCODE");
      return;
    }

    // Use either the config object values or the input field values
    const method = document.getElementById("method").value || config.METHOD;
    const timeFormat = document.getElementById("time-format").value || config.TIME_FORMAT;

    // Prepare offsets from config values or default values
    const offsets = {
      Fajr: parseInt(document.getElementById("fajr-offset").value, 10) || config.FAJR_OFFSET,
      Dhuhr: parseInt(document.getElementById("dhuhr-offset").value, 10) || config.DHUHR_OFFSET,
      Asr: parseInt(document.getElementById("asr-offset").value, 10) || config.ASR_OFFSET,
      Maghrib: parseInt(document.getElementById("maghrib-offset").value, 10) || config.MAGHRIB_OFFSET,
      Isha: parseInt(document.getElementById("isha-offset").value, 10) || config.ISHA_OFFSET,
    };

    // Use custom or stored angles
    let fajrAngle = document.getElementById("fajr-angle").value || config.FAJR_ANGLE;
    let ishaAngle = document.getElementById("isha-angle").value || config.ISHA_ANGLE;

    if (fajrAngle === "custom") {
      fajrAngle = parseFloat(document.getElementById("fajr-angle-custom").value) || config.FAJR_ANGLE;
    }
    if (ishaAngle === "custom") {
      ishaAngle = parseFloat(document.getElementById("isha-angle-custom").value) || config.ISHA_ANGLE;
    }

    // Update the config object with any newly entered values
    const finalConfig = {
      method,
      fajrAngle: isNaN(fajrAngle) ? undefined : fajrAngle,
      ishaAngle: isNaN(ishaAngle) ? undefined : ishaAngle,
    };

    // Get the formatted prayer times using the PrayerTimesHelper class
    const timings = await prayerTimesHelper.getFormattedPrayerTimes(
      zipcode,
      method,
      timeFormat,
      offsets,
      finalConfig
    );
    console.log("Received Prayer Times:", timings);

    prayerTimings = timings;
    document.getElementById("fajr-time").textContent = timings.Fajr;
    document.getElementById("dhuhr-time").textContent = timings.Dhuhr;
    document.getElementById("asr-time").textContent = timings.Asr;
    document.getElementById("maghrib-time").textContent = timings.Maghrib;
    document.getElementById("isha-time").textContent = timings.Isha;

    // Start the timer to check for prayer times
    prayerTimesHelper.startPrayerTimer(prayerTimings, (prayer) => audioHelper.playAudio(prayer, selectedReciter));
  } catch (error) {
    console.error("Error occurred while fetching prayer times:", error.message);
  }
}

// Initialize the fields with config values on page load
async function initializeConfigFields() {
  const config = await configHelper.getConfigObject();

  document.getElementById("zipcode").value = config.ZIPCODE || "";
  document.getElementById("method").value = config.METHOD || "ISNA";
  document.getElementById("time-format").value = config.TIME_FORMAT || "24-hour";
  document.getElementById("fajr-angle").value = config.FAJR_ANGLE || 18;
  document.getElementById("isha-angle").value = config.ISHA_ANGLE || 18;
}

// Event listener for dropdown changes
document.getElementById("reciter-dropdown").addEventListener("change", (event) => {
  selectedReciter = event.target.value;
});

// Populate reciter dropdown on page load
populateReciterDropdown();
// Call initializeConfigFields on page load
initializeConfigFields();
// Event listener for "Get Prayer Times" button
document.getElementById("get-prayer-times-button").addEventListener("click", getPrayerTimes);
