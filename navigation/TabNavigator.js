import React, { useRef, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import WeatherScreen from '../screens/WeatherScreen';
import PedometerScreen from '../screens/PedometerScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');

const TabNavigator = () => {
  const tabOffsetValue = useRef(new Animated.Value(0)).current;

  function getWidth() {
    let tabWidth = width / 3;
    return tabWidth;
  }

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Weather') {
              iconName = focused ? 'partly-sunny' : 'partly-sunny-outline';
            } else if (route.name === 'Pedometer') {
              iconName = focused ? 'footsteps' : 'footsteps-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            }

            return (
              <Animated.View
                style={[
                  styles.iconContainer,
                  {
                    transform: [
                      {
                        scale: focused ? 1.2 : 1,
                      },
                    ],
                  },
                ]}
              >
                <Icon name={iconName} size={size} color={color} />
              </Animated.View>
            );
          },
          tabBarActiveTintColor: '#5ee6eb',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            backgroundColor: '#0d1117',
            borderTopWidth: 0,
            elevation: 0,
            height: 60,
            paddingBottom: 8,
            position: 'absolute',
            bottom: 0,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
          headerShown: false,
          tabBarShowLabel: true,
          cardStyle: { backgroundColor: '#0d1117' },
        })}
        screenListeners={({ navigation, route }) => ({
          tabPress: (e) => {
            Animated.spring(tabOffsetValue, {
              toValue: getWidth() * ['Weather', 'Pedometer', 'Profile'].indexOf(route.name),
              useNativeDriver: true,
            }).start();
          },
        })}
      >
        <Tab.Screen 
          name="Weather" 
          component={WeatherScreen}
          listeners={({ navigation, route }) => ({
            focus: () => {
              Animated.spring(tabOffsetValue, {
                toValue: 0,
                useNativeDriver: true,
              }).start();
            },
          })}
        />
        <Tab.Screen 
          name="Pedometer" 
          component={PedometerScreen}
          listeners={({ navigation, route }) => ({
            focus: () => {
              Animated.spring(tabOffsetValue, {
                toValue: getWidth(),
                useNativeDriver: true,
              }).start();
            },
          })}
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen}
          listeners={({ navigation, route }) => ({
            focus: () => {
              Animated.spring(tabOffsetValue, {
                toValue: getWidth() * 2,
                useNativeDriver: true,
              }).start();
            },
          })}
        />
      </Tab.Navigator>

      <Animated.View
        style={[
          styles.indicator,
          {
            transform: [{ translateX: tabOffsetValue }],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  indicator: {
    width: width / 3,
    height: 2,
    backgroundColor: '#5ee6eb',
    position: 'absolute',
    bottom: 58,
    left: 0,
    borderRadius: 1,
  },
});

export default TabNavigator; 