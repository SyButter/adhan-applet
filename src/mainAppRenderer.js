const { ipcRenderer } = require("electron");
const PrayerTimesHelper = require("../src/utils/prayerTimesHelper");
const AudioHelper = require("../src/utils/audioHelper");
const ErrorHandler = require("../src/utils/errorHandler");
const ConfigHelper = require("../src/utils/configHelper.js");
const methods = require("../assets/methods.json");

let config = {}; // Global config object

// Create instances of the helper classes
const prayerTimesHelper = new PrayerTimesHelper();
const audioHelper = new AudioHelper();
const generalHelpers = new ErrorHandler();
const configHelper = new ConfigHelper();

let selectedReciter = ""; // Variable to store the selected reciter
let prayerTimings = {}; // Store fetched prayer timings

// Function to start the prayer timer and play audio
function startPrayerTimer() {
  prayerTimesHelper.startPrayerTimer(prayerTimings, (prayer) => {
    audioHelper.playAudio(prayer, selectedReciter);
  });
}

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

// Function to fetch prayer times
async function getPrayerTimes() {
  try {
    // Ensure that global config is initialized properly
    if (!config || Object.keys(config).length === 0) {
      console.error("Config is not initialized properly.");
      return;
    }

    // Retrieve user inputs or use config values
    const zipcode = config.ZIPCODE || document.getElementById("zipcode").value.trim();
    if (!zipcode) {
      console.error("PLEASE ENTER A ZIPCODE");
      return;
    }

    const method = config.METHOD || document.getElementById("method-dropdown").value;
    const timeFormat = config.TIME_FORMAT || document.getElementById("time-format").value;

    // Get offsets from the input fields, or use 0 if they are not provided
    const offsets = {
      Fajr: parseInt(document.getElementById("fajr-offset").value, 10) || 0,
      Dhuhr: parseInt(document.getElementById("dhuhr-offset").value, 10) || 0,
      Asr: parseInt(document.getElementById("asr-offset").value, 10) || 0,
      Maghrib: parseInt(document.getElementById("maghrib-offset").value, 10) || 0,
      Isha: parseInt(document.getElementById("isha-offset").value, 10) || 0,
    };

    const fajrAngle = parseFloat(document.getElementById("fajr-angle").value) || 18;
    const ishaAngle = parseFloat(document.getElementById("isha-angle").value) || 18;

    // Construct the config object to pass to fetchPrayerTimes
    const currentConfig = {
      zipcode,
      method,
      timeFormat,
      fajrAngle,
      ishaAngle,
      offsets,
    };

    const prayerTimes = await prayerTimesHelper.getFormattedPrayerTimes(zipcode, method, timeFormat, offsets, currentConfig);
    console.log("Received Prayer Times:", prayerTimes);

    // Update UI with the fetched prayer times
    document.getElementById("fajr-time").textContent = prayerTimes.Fajr;
    document.getElementById("dhuhr-time").textContent = prayerTimes.Dhuhr;
    document.getElementById("asr-time").textContent = prayerTimes.Asr;
    document.getElementById("maghrib-time").textContent = prayerTimes.Maghrib;
    document.getElementById("isha-time").textContent = prayerTimes.Isha;

    // Start the prayer timer to play audio at the correct times
    startPrayerTimer();

  } catch (error) {
    console.error("Error occurred while fetching prayer times:", error);
  }
}

// Function to initialize config fields and update the global config object
async function initializeConfigFields() {
  try {
    // Do not create a new config object, use the existing global config
    const configFromFile = await configHelper.getConfigObject();
    Object.assign(config, configFromFile); // Merge configFromFile into the global config object
    console.log("Configuration values from file:", config);

    // Set default method if not present
    if (!config.METHOD) {
      config.METHOD = "ISNA"; // Default to ISNA if method is not set
    }

    // Use null checks before setting the values in the form fields
    document.getElementById("zipcode").value = config.ZIPCODE || "";
    document.getElementById("method-dropdown").value = config.METHOD || "ISNA";
    document.getElementById("time-format").value = config.TIME_FORMAT || "24-hour";
    document.getElementById("fajr-offset").value = config.FAJR_OFFSET || 0;
    document.getElementById("dhuhr-offset").value = config.DHUHR_OFFSET || 0;
    document.getElementById("asr-offset").value = config.ASR_OFFSET || 0;
    document.getElementById("maghrib-offset").value = config.MAGHRIB_OFFSET || 0;
    document.getElementById("isha-offset").value = config.ISHA_OFFSET || 0;
    document.getElementById("fajr-angle").value = config.FAJR_ANGLE || 18;
    document.getElementById("isha-angle").value = config.ISHA_ANGLE || 18;

    console.log("Configuration fields initialized with config values:", config);

    // Save the default method back to the config if it was set
    await configHelper.setConfig("METHOD", config.METHOD);

  } catch (error) {
    console.error("Failed to initialize configuration fields:", error);
  }
}

// Function to populate the dropdown with methods from the methods object
function populateMethodDropdown() {
  const dropdown = document.getElementById("method-dropdown");

  // Check if the dropdown element exists
  if (!dropdown) {
    console.error("Dropdown element with ID 'method-dropdown' not found in the DOM.");
    return;
  }

  // Clear existing options and set a default option
  dropdown.innerHTML = "<option value=\"\">Select a Calculation Method</option>";

  // Iterate over the methods and add them to the dropdown
  for (const key in methods) {
    if (Object.hasOwn(methods, key)) {
      const method = methods[key];
      const option = document.createElement("option");
      option.value = key; // Use the key as the value
      option.text = method.name; // Display the name as the text
      dropdown.appendChild(option);
    }
  }
}

// Initialize the config fields on page load
initializeConfigFields();

// Event listener for dropdown changes
document.getElementById("reciter-dropdown").addEventListener("change", (event) => {
  selectedReciter = event.target.value;
});

// Populate reciter dropdown on page load
populateReciterDropdown();

// Call the function to populate the dropdown
document.addEventListener("DOMContentLoaded", populateMethodDropdown);

// Handle dropdown changes and save to config
document.getElementById("method-dropdown").addEventListener("change", async (event) => {
  const selectedMethod = event.target.value;
  console.log("Selected Method:", selectedMethod);

  // Save the selected method to the configuration
  await configHelper.setConfig("METHOD", selectedMethod);

  console.log("Method saved to configuration successfully.");
});

// Event listener for "Get Prayer Times" button
document.getElementById("get-prayer-times-button").addEventListener("click", getPrayerTimes);
