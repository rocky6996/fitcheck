# FitCheck - Fitness & Weather Tracking App

FitCheck is a React Native mobile application that helps users track their fitness activities and check local weather conditions.

## Features

### ⛏️ Pedometer
- Step counting with daily goals
- Calorie tracking
- Distance measurement
- Achievement system
- Streak tracking
- Daily activity statistics

### 🌞 Weather
- Real-time weather updates
- Hourly forecasts
- Detailed weather metrics
  - UV Index
  - Air Quality
  - Temperature
  - Humidity
  - Wind Speed
  - Visibility
- Sunrise/Sunset times

### 💪 Profile
- Personalized fitness goals
- User metrics tracking
- Activity statistics
- Customizable user settings

## Tech Stack
- React Native
- Expo
- @react-navigation
- expo-sensors
- expo-location
- AsyncStorage
- Axios

## Installation

1. Clone the repository:

```bash
git clone https://github.com/rocky6996/fitcheck.git
```

2. Install dependencies:

```bash
cd fitcheck
npm install
```

3. Start the development server:

```bash
npx expo start
```

## Building the App

To create an APK:

```bash
eas build -p android --profile preview
```

## Environment Variables

Create a `.env` file in the root directory:

```
WEATHER_API_KEY=your_weather_api_key
```

## Project Structure

```
fitcheck/
├── assets/                # Images and assets
├── components/           # Reusable components
├── screens/              # Main app screens
│   ├── PedometerScreen.js
│   ├── WeatherScreen.js
│   ├── ProfileScreen.js
├── App.js                # App entry point
├── app.json              # Expo configuration
├── package.json          # Dependencies
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Weather data provided by WeatherAPI
- Icons by Ionicons
- Built with Expo



![photo_2025-01-04_23-05-54](https://github.com/user-attachments/assets/9b844663-9987-4075-8dac-4c3cd089b05b)



![photo_2025-01-04_23-05-54 (2)](https://github.com/user-attachments/assets/fe21e4ae-d27b-4f59-aaf8-9676986b1552)



![photo_2025-01-04_23-05-54 (3)](https://github.com/user-attachments/assets/7b5bbf4e-69d7-441f-824c-304806bc98af)



![photo_2025-01-04_23-05-54 (4)](https://github.com/user-attachments/assets/0cc2b3a9-8441-4c94-b86f-c20bb49ac32c)

