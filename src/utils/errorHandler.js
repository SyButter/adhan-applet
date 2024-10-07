class ErrorHandler {
    /**
     * Display an error message on the screen.
     * @param {string} message - The error message to display.
     */
    showError(message) {
      const errorDiv = document.createElement("div");
      errorDiv.setAttribute("id", "error-message");
      errorDiv.style.position = "fixed";
      errorDiv.style.top = "20%";
      errorDiv.style.left = "50%";
      errorDiv.style.transform = "translate(-50%, -50%)";
      errorDiv.style.padding = "20px";
      errorDiv.style.backgroundColor = "red";
      errorDiv.style.color = "white";
      errorDiv.style.fontSize = "20px";
      errorDiv.style.textAlign = "center";
      errorDiv.style.border = "2px solid black";
      errorDiv.style.zIndex = "1000";
      errorDiv.textContent = message;
  
      document.body.appendChild(errorDiv);
  
      setTimeout(() => {
        errorDiv.remove();
      }, 3000); // Remove error after 3 seconds
    }
  }
  
  module.exports = ErrorHandler;