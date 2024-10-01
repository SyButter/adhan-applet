
# Adhan Applet

## Overview
The Adhan Applet is a cross-platform desktop application built using Electron.js that provides accurate prayer times based on user location and preferences. The app integrates with the Aladhan API and allows users to customize their prayer time calculations, select different Adhan audio files, and receive notifications at the specified prayer times.

## Features
- Fetch prayer times based on location and calculation method (e.g., ISNA, Umm al-Qura, Egypt).
- Schedule Adhan playback at the correct prayer times using a variety of Adhan MP3 files.
- Customizable settings for prayer time adjustments, custom angles, and preferred Adhan.
- Easy-to-use UI for configuring and viewing prayer times.

## Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/adhan-applet.git
   cd adhan-applet
   ```

2. **Install Dependencies**:
   Make sure you have Node.js installed. Then, run:
   ```bash
   npm install
   ```

3. **Run the Application**:
   ```bash
   npm start
   ```

## Usage
- Enter your location (latitude and longitude) and select a calculation method.
- View the daily prayer times and configure custom settings.
- Select a preferred Adhan file for each prayer.
- The app will play the Adhan at the scheduled prayer times.

## Folder Structure

The project follows a clean and organized structure to separate concerns and maintain readability:

\`\`\`plaintext
adhan-applet/
├── assets/                               # Contains Adhan MP3 files used for playback
│   └── fajr.mp3
│   └── dhuhr.mp3
│   └── asr.mp3
│   └── maghrib.mp3
│   └── isha.mp3
├── src/                                  # Source files for the core logic of the project
│   ├── api/                              # API-related code to interact with external services
│   │   └── prayerTimesService.js         # Methods for fetching prayer times using Aladhan API
│   ├── components/                       # UI components and interaction logic
│   │   └── settingsPageHandler.js        # Handles UI interactions for the settings page
│   ├── utils/                            # Utility functions and configuration management
│   │   └── timeScheduler.js              # Functions to manage the scheduling of Adhan playback
│   │   └── userConfigManager.js          # Functions to handle saving/loading user configuration
│   ├── mainAppRenderer.js                # Main app logic for handling UI updates and interactions
│   └── electronMainProcess.js            # Main Electron process file to manage window creation and IPC
├── ui/                                   # UI-specific files such as HTML, CSS
│   ├── index.html                        # Main HTML file that renders the app interface
│   └── styles.css                        # Stylesheet for the app's UI design
├── package.json                          # Project configuration and dependencies
├── .gitignore                            # Git ignore file to exclude node_modules, etc.
├── .eslintrc                             # ESLint configuration for code quality and style
└── README.md                             # Documentation file for the project
\`\`\`

### Folder Structure Explanation
- **`assets/`**: This folder stores all the Adhan MP3 files that are used for audio playback. You can add, update, or remove Adhan files as needed.

- **`src/`**: This folder contains the core source files for the app, divided into subfolders:
  - **`api/`**: Handles all API-related logic, including fetching prayer times from external services.
  - **`components/`**: Contains scripts that manage specific UI components, such as the settings page.
  - **`utils/`**: Includes utility scripts for scheduling, configuration management, and helper functions.
  - **`mainAppRenderer.js`**: Handles the main rendering logic and UI interactions of the app.
  - **`electronMainProcess.js`**: Contains the main process logic for Electron, including window management and inter-process communication.

- **`ui/`**: This folder stores the HTML and CSS files for the app's user interface. All front-end layout and style changes should be made here.

- **Root Files**:
  - **`package.json`**: Lists all project dependencies and scripts for running and building the app.
  - **`.gitignore`**: Specifies files and directories to be ignored by Git (e.g., `node_modules`).
  - **`.eslintrc`**: Configuration file for ESLint to enforce code quality and consistency.
  - **`README.md`**: The documentation file you’re currently reading.

## Contributing
Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Submit a pull request with a description of the changes made.

## License
This project is licensed under the MIT License. See the `LICENSE` file for more information.
