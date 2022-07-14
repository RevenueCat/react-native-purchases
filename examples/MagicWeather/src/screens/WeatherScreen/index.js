/**
 * @file Magic Weather screen.
 * @author Vadim Savin
 */

import React, { useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { testCold, generateSampleData, Environment } from '../../helpers/SampleData';
import styles from './styles.js';
import Purchases from 'react-native-purchases';
import { ENTITLEMENT_ID } from '../../constants';

/*
 The app's weather tab that displays our pretend weather data.
 */

const WeatherScreen = () => {
  const [weatherData, setWeatherData] = useState(testCold);

  const navigation = useNavigation();

  const changeEnvironment = () => {
    // we'll change the environment in a future update
    console.log('Change environment');
  };

  const performMagic = async () => {
    /*
     We should check if we can magically change the weather (subscription active) and if not, display the paywall.
     */

    try {
      // access latest customerInfo
      const customerInfo = await Purchases.getCustomerInfo();

      if (typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined') {
        setWeatherData(generateSampleData(Environment.EARTH));
      } else {
        navigation.navigate('Paywall');
      }
    } catch (e) {
      Alert.alert('Error fetching customer info', e.message);
    }
  };

  return (
    <View style={[styles.page, { backgroundColor: weatherData.weatherColor }]}>
      {/* Sample weather details */}
      <Text style={styles.emoji}>{weatherData.emoji}</Text>
      <Text style={styles.temperature}>
        {weatherData.temperature}°{weatherData.unit.toUpperCase()}️
      </Text>

      {/* Environment button */}
      <Pressable onPress={changeEnvironment}>
        <Text style={styles.environment}>
          <Ionicons name="navigate" color="white" size={24} /> {weatherData.environment}
        </Text>
      </Pressable>

      {/* The magic button that is disabled behind our paywall */}
      <Pressable onPress={performMagic} style={styles.changeWeatherButton}>
        <Text style={styles.changeWeatherTitle}>✨ Change the Weather</Text>
      </Pressable>

    </View>
  );
};

export default WeatherScreen;
