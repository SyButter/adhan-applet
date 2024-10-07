const path = require('path');

let audioFolderPath = path.join(__dirname, '../../assets/adhans'); // Default path to the adhans folder

/**
 * Set the path for the audio folder.
 * @param {string} folderPath - Path to the folder containing Adhan audio files.
 */
function setAudioFolderPath(folderPath) {
  audioFolderPath = folderPath;
}

/**
 * Play the appropriate Adhan audio file based on prayer type.
 * @param {string} prayer - Name of the prayer (e.g., "Fajr" or "Normal").
 * @param {string} selectedReciter - Selected reciter's folder.
 */
function playAudio(prayer, selectedReciter) {
  const audio = new Audio();
  const audioFile = prayer === 'Fajr' ? 'fajr.mp3' : 'normal.mp3';

  const filePath = path.join(audioFolderPath, selectedReciter, audioFile);
  audio.src = filePath;
  audio.play();
}

module.exports = { setAudioFolderPath, playAudio };
