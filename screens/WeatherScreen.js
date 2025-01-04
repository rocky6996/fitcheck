import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, StatusBar, Image } from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';

const WEATHER_API_KEY = '4fec04343067403da30194806242912';
const REVERSE_GEOCODE_API_URL = 'https://api.bigdatacloud.net/data/reverse-geocode-client';

const getUVDescription = (uvIndex) => {
  if (uvIndex <= 2) return 'Very weak';
  if (uvIndex <= 5) return 'Moderate';
  if (uvIndex <= 7) return 'High';
  if (uvIndex <= 10) return 'Very high';
  return 'Extreme';
};

const getAQIDescription = (aqi) => {
  switch(aqi) {
    case 1: return 'Good - Ideal air quality';
    case 2: return 'Moderate - Acceptable';
    case 3: return 'Unhealthy for sensitive groups';
    case 4: return 'Everyone may experience health effects. Refrain from...';
    case 5: return 'Very Unhealthy - Avoid outdoor activities';
    case 6: return 'Hazardous - Serious health effects';
    default: return 'Unknown air quality';
  }
};

const WeatherScreen = () => {
  const [cityName, setCityName] = useState('Fetching location...');
  const [weatherData, setWeatherData] = useState([]);
  const [currentWeather, setCurrentWeather] = useState(null);
  const [hourlyForecast, setHourlyForecast] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocationAndWeather = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setCityName('Permission Denied');
          setLoading(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        const locationResponse = await axios.get(
          `${REVERSE_GEOCODE_API_URL}?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        );
        const city = locationResponse.data.city || locationResponse.data.locality || 'Unknown City';
        setCityName(city);

        // Fetch weather data with hourly forecast and air quality
        const weatherResponse = await axios.get(
          `https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${latitude},${longitude}&days=7&aqi=yes`
        );

        // Set current weather with safe air quality access
        setCurrentWeather({
          temp: Math.round(weatherResponse.data.current.temp_c),
          condition: weatherResponse.data.current.condition.text,
          minTemp: Math.round(weatherResponse.data.forecast.forecastday[0].day.mintemp_c),
          maxTemp: Math.round(weatherResponse.data.forecast.forecastday[0].day.maxtemp_c),
          airQuality: weatherResponse.data.current.air_quality ? {
            index: weatherResponse.data.current.air_quality['us-epa-index'] || 0,
            value: Math.round(weatherResponse.data.current.air_quality.pm2_5) || 0,
          } : null,
          uv: weatherResponse.data.current.uv,
          feelsLike: Math.round(weatherResponse.data.current.feelslike_c),
          humidity: weatherResponse.data.current.humidity,
          wind: {
            speed: Math.round(weatherResponse.data.current.wind_mph),
            direction: weatherResponse.data.current.wind_dir
          },
          pressure: Math.round(weatherResponse.data.current.pressure_mb),
          visibility: Math.round(weatherResponse.data.current.vis_km),
          sunrise: weatherResponse.data.forecast.forecastday[0].astro.sunrise,
          sunset: weatherResponse.data.forecast.forecastday[0].astro.sunset
        });

        // Set hourly forecast for next 6 hours
        const hours = weatherResponse.data.forecast.forecastday[0].hour;
        const currentHour = new Date().getHours();
        const nextHours = hours.slice(currentHour, currentHour + 6).map(hour => ({
          time: new Date(hour.time).getHours() + ':00',
          temp: Math.round(hour.temp_c),
          condition: hour.condition.code,
          icon: hour.condition.icon
        }));
        setHourlyForecast(nextHours);

        // Set daily forecast
        const dailyData = weatherResponse.data.forecast.forecastday.map((day) => ({
          day: new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' }),
          temp: `${day.day.maxtemp_c.toFixed(1)}°C / ${day.day.mintemp_c.toFixed(1)}°C`,
          rain: day.day.daily_chance_of_rain ? `${day.day.daily_chance_of_rain}%` : '0%',
          wind: `${day.day.maxwind_kph.toFixed(1)} km/h`,
          icon: day.day.condition.icon,
        }));
        setWeatherData(dailyData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setCityName('Error fetching location');
        setLoading(false);
      }
    };

    fetchLocationAndWeather();
  }, []);

  const renderLocation = () => (
    <View style={styles.locationWrapper}>
      <Icon name="location" size={16} color="#fff" style={styles.locationIcon} />
      <Text style={styles.locationText}>{cityName}</Text>
    </View>
  );

  const renderCurrentWeather = () => (
    <View style={styles.currentWeather}>
      <Text style={styles.currentTemp}>{currentWeather?.temp}°</Text>
      <Text style={styles.currentCondition}>
        {currentWeather?.condition} {currentWeather?.minTemp}° / {currentWeather?.maxTemp}°
        {currentWeather?.airQuality && ` Air quality: ${currentWeather.airQuality.value} – Poor`}
      </Text>
      <View style={styles.pollenContainer}>
        <Icon name="flower" size={20} color="#fff" />
        <Text style={styles.pollenText}>Very low pollen count</Text>
      </View>
    </View>
  );

  const renderHourlyForecast = () => (
    <View style={styles.hourlyContainer}>
      {hourlyForecast.map((hour, index) => (
        <View key={index} style={styles.hourlyItem}>
          <Text style={styles.hourlyTime}>
            {index === 0 ? 'Now' : hour.time}
          </Text>
          <Image 
            source={{ uri: `https:${hour.icon}` }} 
            style={styles.hourlyIcon} 
          />
          <Text style={styles.hourlyTemp}>{hour.temp}°</Text>
        </View>
      ))}
    </View>
  );

  const renderAirQuality = () => (
    <View style={styles.metricCard}>
      <Text style={styles.metricTitle}>Air quality</Text>
      <Text style={styles.metricValue}>Poor {currentWeather?.airQuality?.value}</Text>
      <Text style={styles.metricDescription}>
        {getAQIDescription(currentWeather?.airQuality?.index)}
      </Text>
      <View style={styles.aqiBar}>
        <View style={[styles.aqiProgress, { width: '70%' }]} />
      </View>
    </View>
  );

  const renderWeatherMetrics = () => (
    <View style={styles.metricsCard}>
      <View style={styles.metricsGrid}>
        <View style={styles.metricItem}>
          <Icon name="sunny" size={20} color="#fff" style={styles.metricIcon} />
          <View style={styles.metricTextContainer}>
            <Text style={styles.metricLabel}>UV</Text>
            <Text style={styles.metricValue}>{currentWeather?.uv}</Text>
            <Text style={styles.metricSubtext}>{getUVDescription(currentWeather?.uv)}</Text>
          </View>
        </View>

        <View style={styles.metricItem}>
          <Icon name="thermometer" size={20} color="#fff" style={styles.metricIcon} />
          <View style={styles.metricTextContainer}>
            <Text style={styles.metricLabel}>Feels like</Text>
            <Text style={styles.metricValue}>{currentWeather?.feelsLike}°</Text>
          </View>
        </View>

        <View style={styles.metricItem}>
          <Icon name="water" size={20} color="#fff" style={styles.metricIcon} />
          <View style={styles.metricTextContainer}>
            <Text style={styles.metricLabel}>Humidity</Text>
            <Text style={styles.metricValue}>{currentWeather?.humidity}%</Text>
          </View>
        </View>

        <View style={styles.metricItem}>
          <Icon name="navigate" size={20} color="#fff" style={styles.metricIcon} />
          <View style={styles.metricTextContainer}>
            <Text style={styles.metricLabel}>{currentWeather?.wind?.direction} wind</Text>
            <Text style={styles.metricValue}>{currentWeather?.wind?.speed} mph</Text>
          </View>
        </View>

        <View style={styles.metricItem}>
          <Icon name="speedometer" size={20} color="#fff" style={styles.metricIcon} />
          <View style={styles.metricTextContainer}>
            <Text style={styles.metricLabel}>Air pressure</Text>
            <Text style={styles.metricValue}>{currentWeather?.pressure} hPa</Text>
          </View>
        </View>

        <View style={styles.metricItem}>
          <Icon name="eye" size={20} color="#fff" style={styles.metricIcon} />
          <View style={styles.metricTextContainer}>
            <Text style={styles.metricLabel}>Visibility</Text>
            <Text style={styles.metricValue}>{currentWeather?.visibility} km</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderSunriseSunset = () => (
    <View style={styles.sunCard}>
      <View style={styles.sunRow}>
        <View style={styles.sunInfo}>
          <Icon name="sunny-outline" size={24} color="#fff" />
          <Text style={styles.sunLabel}>Sunset</Text>
          <Text style={styles.sunTime}>{currentWeather?.sunset}</Text>
        </View>
        <View style={styles.sunInfo}>
          <Icon name="sunny" size={24} color="#fff" />
          <Text style={styles.sunLabel}>Sunrise</Text>
          <Text style={styles.sunTime}>{currentWeather?.sunrise}</Text>
        </View>
      </View>
      <View style={styles.sunProgress}>
        <View style={styles.sunTrack} />
        <View style={styles.moonIcon} />
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#00acc1" />
        <Text style={styles.loadingText}>Loading weather data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0d1117" />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {renderLocation()}
        {currentWeather && renderCurrentWeather()}
        {currentWeather?.airQuality && renderAirQuality()}
        {currentWeather && renderWeatherMetrics()}
        {currentWeather && renderSunriseSunset()}
        {hourlyForecast.length > 0 && renderHourlyForecast()}
        <View style={styles.divider} />
        {weatherData.map((item, index) => (
          <View key={index} style={styles.card}>
            <View style={styles.cardRow}>
              <View>
                <Text style={styles.day}>{item.day}</Text>
                <Text style={styles.details}>🌡️ {item.temp}</Text>
                <Text style={styles.details}>🌧️ Rain Chance: {item.rain}</Text>
                <Text style={styles.details}>💨 Wind Speed: {item.wind}</Text>
              </View>
              <Image source={{ uri: `https:${item.icon}` }} style={styles.weatherIcon} />
            </View>
          </View>
        ))}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
  },
  header: {
    padding: 16,
    backgroundColor: '#161b22',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationContainer: {
    flex: 1,
  },
  locationText: {
    fontSize: 16,
    color: '#9da5b4',
  },
  subText: {
    fontSize: 14,
    color: '#6e7681',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 12,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#21262d',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  day: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  details: {
    fontSize: 14,
    color: '#c9d1d9',
    marginTop: 4,
  },
  weatherIcon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0d1117',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#ffffff',
  },
  currentWeather: {
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  currentTemp: {
    fontSize: 72,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  currentCondition: {
    fontSize: 15,
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 8,
  },
  pollenContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#21262d',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 16,
  },
  pollenText: {
    color: '#ffffff',
    fontSize: 16,
    marginLeft: 8,
    opacity: 0.9,
  },
  hourlyContainer: {
    backgroundColor: '#21262d',
    borderRadius: 12,
    padding: 12,
    marginVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  hourlyItem: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  hourlyTime: {
    color: '#ffffff',
    fontSize: 13,
    marginBottom: 6,
  },
  hourlyIcon: {
    width: 24,
    height: 24,
    marginVertical: 6,
  },
  hourlyTemp: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#2d2d2d',
    marginVertical: 24,
  },
  metricCard: {
    backgroundColor: '#21262d',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  metricTitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  metricValue: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 4,
  },
  metricDescription: {
    fontSize: 13,
    color: '#fff',
    opacity: 0.8,
    marginTop: 2,
  },
  aqiBar: {
    height: 3,
    backgroundColor: '#2d333b',
    borderRadius: 1.5,
    marginTop: 16,
    overflow: 'hidden',
  },
  aqiProgress: {
    height: '100%',
    backgroundColor: '#ff5722',
    borderRadius: 1.5,
  },
  metricsCard: {
    backgroundColor: '#21262d',
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    backgroundColor: '#282c34',
    borderRadius: 10,
    padding: 10,
  },
  metricIcon: {
    marginRight: 8,
    opacity: 0.9,
  },
  metricTextContainer: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.7,
  },
  metricValue: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 2,
  },
  metricSubtext: {
    fontSize: 11,
    color: '#fff',
    opacity: 0.6,
    marginTop: 1,
  },
  sunCard: {
    backgroundColor: '#21262d',
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
  },
  sunRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sunInfo: {
    alignItems: 'center',
  },
  sunLabel: {
    fontSize: 13,
    color: '#fff',
    opacity: 0.8,
    marginTop: 6,
  },
  sunTime: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 2,
  },
  sunProgress: {
    height: 4,
    backgroundColor: '#2d333b',
    borderRadius: 2,
    position: 'relative',
  },
  sunTrack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1a237e',
    borderRadius: 2,
  },
  moonIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    position: 'absolute',
    top: -6,
    left: '50%',
    transform: [{translateX: -8}],
  },
  bottomSpacing: {
    height: 32,
  },
  locationWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#21262d',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  locationIcon: {
    marginRight: 6,
    opacity: 0.9,
  },
  locationText: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
});

export default WeatherScreen;
