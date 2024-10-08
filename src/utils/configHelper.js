// configHelper.js
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
const { ipcMain, ipcRenderer } = require("electron") || {}; // Conditional require to work in both main and renderer

class ConfigHelper {
  constructor(configFilePath = "../config.env") {
    this.configFilePath = path.resolve(__dirname, configFilePath);
  }

  // Load the config.env file
  loadConfig() {
    if (fs.existsSync(this.configFilePath)) {
      dotenv.config({ path: this.configFilePath });
      console.log("Configuration loaded from config.env");
    } else {
      console.error("config.env file not found. Using default configurations.");
    }
  }

  // Get a configuration variable by key
  getConfig(key) {
    return process.env[key] || null;
  }

  // Set a configuration variable and update the config.env file
  setConfig(key, value) {
    process.env[key] = value;

    if (fs.existsSync(this.configFilePath)) {
      let configContent = fs.readFileSync(this.configFilePath, "utf8");

      const regex = new RegExp(`^${key}=.*$`, "m");
      const newLine = `${key}=${value}`;

      // Update or add the key-value pair in config.env
      if (configContent.match(regex)) {
        configContent = configContent.replace(regex, newLine);
      } else {
        configContent += `\n${newLine}`;
      }

      // Write the updated content back to config.env
      fs.writeFileSync(this.configFilePath, configContent);
      console.log(`Updated config file: ${key}=${value}`);
    }
  }

  // List all configuration variables
  listConfig() {
    return Object.keys(process.env).reduce((acc, key) => {
      if (process.env[key]) {
        acc[key] = process.env[key];
      }
      return acc;
    }, {});
  }

  // Delete a configuration variable
  deleteConfig(key) {
    delete process.env[key];

    if (fs.existsSync(this.configFilePath)) {
      let configContent = fs.readFileSync(this.configFilePath, "utf8");

      const regex = new RegExp(`^${key}=.*$`, "m");
      configContent = configContent.replace(regex, "");

      // Write the updated content back to config.env
      fs.writeFileSync(this.configFilePath, configContent.trim());
      console.log(`Deleted config key: ${key}`);
    }
  }

  // IPC handlers setup (only for main process)
  setupIPCHandlers() {
    if (!ipcMain) return;

    ipcMain.handle("getConfig", (event, key) => this.getConfig(key));
    ipcMain.handle("setConfig", (event, key, value) => {
      this.setConfig(key, value);
      return true;
    });
    ipcMain.handle("listConfig", () => this.listConfig());
    ipcMain.handle("deleteConfig", (event, key) => {
      this.deleteConfig(key);
      return true;
    });
  }

  // Renderer-specific methods (use ipcRenderer)
  async getConfigValue(key) {
    if (ipcRenderer) {
      return await ipcRenderer.invoke("getConfig", key);
    }
    return this.getConfig(key); // Fallback for direct calls
  }

  async setConfigValue(key, value) {
    if (ipcRenderer) {
      await ipcRenderer.invoke("setConfig", key, value);
    } else {
      this.setConfig(key, value); // Fallback for direct calls
    }
  }

  async listAllConfigValues() {
    if (ipcRenderer) {
      return await ipcRenderer.invoke("listConfig");
    }
    return this.listConfig(); // Fallback for direct calls
  }

  async deleteConfigValue(key) {
    if (ipcRenderer) {
      await ipcRenderer.invoke("deleteConfig", key);
    } else {
      this.deleteConfig(key); // Fallback for direct calls
    }
  }
}

// Export the class for use in both main and renderer processes
module.exports = ConfigHelper;
