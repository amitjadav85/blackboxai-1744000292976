
Built by https://www.blackbox.ai

---

```markdown
# Smart Traffic Violation Detection

## Project Overview

The **Smart Traffic Violation Detection** system is a real-time monitoring application designed to detect traffic violations using video analysis. It leverages machine learning algorithms to identify vehicles, monitor their speeds, and detect instances of red line crossings. The application provides an interactive dashboard displaying real-time traffic data, violation alerts, and historical records of yellow line and speeding violations.

## Installation

To set up the project on your local machine, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/smart-traffic-violation-detection.git
   cd smart-traffic-violation-detection
   ```

2. **Open `index.html` in your web browser:**
   You can simply double-click the `index.html` file to open it in a browser of your choice.

3. **Ensure you have network access:**
   The application relies on external libraries loaded via CDN. Ensure your internet connection is active.

## Usage

1. **Start the system:**
   Click the **Start** button to begin the traffic violation detection process. This will activate your webcam and start monitoring.

2. **Monitor alerts:**
   Watch the **Violation Alerts** section for notifications of detected violations.

3. **Stop the system:**
   Click the **Stop** button to halt the monitoring.

4. **View violation history:**
   Navigate to the **history.html** file to review previously recorded violations, search through them, and export data if needed.

## Features

- Real-time video feed with webcam integration.
- Detection of vehicles with unique tracking.
- Speed monitoring with customizable speed limits.
- Detection of red line violations with alerts.
- Historical record maintenance of all violations with the ability to search and export data in CSV format.

## Dependencies

This project relies on the following libraries:

- **Tailwind CSS**: Framework for building responsive UI.
- **Font Awesome**: Icon set for user-friendly visuals.
- **TensorFlow.js**: For machine learning model support.
- **COCO-SSD**: Object detection model for identifying vehicles.

These libraries are included via CDN in the HTML files.

## Project Structure

The project consists of the following files:

- `index.html`: The main interface for the Smart Traffic Violation Detection system.
- `style.css`: Custom styles for the application, complementing Tailwind CSS for enhanced visuals.
- `script.js`: JavaScript file containing the core logic for video detection, interaction with the model, and alert handling.
- `history.html`: A separate page for displaying recorded violations and allowing searches and data exports.

### Directory Structure
```
/smart-traffic-violation-detection
│
├── index.html        # Main application interface
├── style.css         # Custom styles for UI
├── script.js         # JavaScript logic for detection
└── history.html      # Violation history display
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

---

Feel free to contribute to this project or raise issues if you encounter any bugs or have suggestions for improvements!
```