# Vibration-Based Navigation System for the Visually Impaired

## Project Overview
This project introduces a web-based navigation system designed to assist visually impaired users in navigating through urban environments using vibration feedback. By leveraging Google Maps API for routing and the Web Speech API for voice recognition, the system provides an intuitive and accessible way for users to set their destination and receive turn-by-turn navigation instructions through unique vibration patterns.

## Key Features

- **Voice Recognition**: Allows users to set their navigation destination using voice commands, making the application more accessible and easier to use for visually impaired individuals.
- **Vibration Feedback**: Uses distinct vibration patterns to convey different types of navigation instructions (e.g., turn left, turn right, destination reached), which is particularly useful for users with visual impairments.
- **User Location Detection**: Automatically detects and sets the user's current location as the starting point for navigation, simplifying the process of initiating a route.
- **Google Maps Integration**: Incorporates Google Maps API to provide accurate and reliable routing information.

## Getting Started

### Accessing the Application
You can access the live application by visiting the following URL:

[https://users.iee.ihu.gr/~iee2019149/VibNav/index.html](https://users.iee.ihu.gr/~iee2019149/VibNav/index.html)

Simply open the link in a modern web browser (Google Chrome) to start using the application.

### API Key Restrictions
The Google Maps API key used in this project is restricted to the application's live version hosted at the above URL. If you wish to run this application locally or host it on a different domain, you will need to obtain your own Google Maps API key and set up the appropriate API restrictions as described in the [Google Cloud Console](https://console.cloud.google.com/).

## Vibration Pattern Guide
Users need to interact with the device (e.g., touching the screen or pressing a button) to receive vibration feedback due to the "Require user gesture for `navigator.vibrate`" policy in browsers like Google Chrome.
- **Turn Left**: Short vibrations followed by a long vibration.
- **Turn Right**: A long vibration followed by short vibrations.
- **North**: A sequence of medium vibrations.
- **East**: One medium followed by one short vibration.
- **West**: Three short vibrations.
- **South**: Long vibrations with very short pauses.

- **Destination Reached**: A single, prolonged vibration.
  
## Contributing
Contributions to improve the application are welcome. Please follow these steps to contribute:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a pull request.

## Acknowledgments
- [International Hellenic University](https://ihu.gr) for the support and resources provided during the development of this project.
- Special thanks to all individuals involved in the project's development and testing, especially those who provided feedback and insights to enhance the application's accessibility and user experience.
