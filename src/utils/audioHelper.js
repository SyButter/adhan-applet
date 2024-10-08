const path = require("path");

class AudioHelper {
  constructor() {
    this.audioFolderPath = path.join(__dirname, "../../assets/adhans"); // Default path to the adhans folder
  }

  /**
   * Set the path for the audio folder.
   * @param {string} folderPath - Path to the folder containing Adhan audio files.
   */
  setAudioFolderPath(folderPath) {
    this.audioFolderPath = folderPath;
  }

  /**
   * Play the appropriate Adhan audio file based on prayer type.
   * @param {string} prayer - Name of the prayer (e.g., "Fajr" or "Normal").
   * @param {string} selectedReciter - Selected reciter's folder.
   */
  playAudio(prayer, selectedReciter) {
    const audio = new Audio();
    const audioFile = prayer === "Fajr" ? "fajr.mp3" : "normal.mp3";
    const filePath = path.join(this.audioFolderPath, selectedReciter, audioFile);
    audio.src = filePath;
    audio.play();
  }
}

// Export the entire class as a module
module.exports = AudioHelper;
