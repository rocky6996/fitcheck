// File: App.js

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LogBox } from 'react-native';

import WeatherScreen from './screens/WeatherScreen';
import PedometerScreen from './screens/PedometerScreen';
import ProfileScreen from './screens/ProfileScreen';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingScreen from './components/LoadingScreen';

LogBox.ignoreLogs(['Require cycle:']); // Ignore require cycle warnings

const Tab = createBottomTabNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function prepare() {
      try {
        // Add any initialization logic here
        
        // Simulate a minimum loading time
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.warn('Error during initialization:', error);
      } finally {
        setIsLoading(false);
      }
    }

    prepare();
  }, []);

  if (isLoading) {
    return <LoadingScreen message="Starting up..." />;
  }

  return (
    <ErrorBoundary>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === 'Weather') {
                iconName = focused ? 'cloud' : 'cloud-outline';
              } else if (route.name === 'Activity') {
                iconName = focused ? 'footsteps' : 'footsteps-outline';
              } else if (route.name === 'Profile') {
                iconName = focused ? 'person' : 'person-outline';
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#76C7C0',
            tabBarInactiveTintColor: '#666',
            tabBarStyle: {
              backgroundColor: '#161b22',
              borderTopColor: '#2d2d2d',
              paddingBottom: 5,
              height: 60,
            }
          })}
        >
          <Tab.Screen name="Weather" component={WeatherScreen} />
          <Tab.Screen name="Activity" component={PedometerScreen} />
          <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </ErrorBoundary>
  );
}
