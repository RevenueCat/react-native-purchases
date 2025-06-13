import React, {useState, useContext} from 'react';
import {View, Text, Pressable, Alert, StyleSheet} from 'react-native';
import {testCold, generateSampleData, Environment} from '../helpers/SampleData';
import Purchases from 'react-native-purchases';
import {ENTITLEMENT_ID} from '../constants';
import {NavigationContext} from '../navigation/Navigation';

/*
 The app's weather tab that displays our pretend weather data.
 */

const WeatherScreen = () => {
  const [weatherData, setWeatherData] = useState(testCold);

  const navigation = useContext(NavigationContext);

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
        navigation.openModal('paywall');
      }
    } catch (e: any) {
      Alert.alert('Error fetching customer info', e.message);
    }
  };

  return (
    <View style={[styles.page, {backgroundColor: weatherData.weatherColor}]}>
      {/* Sample weather details */}
      <Text style={styles.emoji}>{weatherData.emoji}</Text>
      <Text style={styles.temperature}>
        {weatherData.temperature}°{weatherData.unit.toUpperCase()}️
      </Text>

      <Pressable onPress={changeEnvironment}>
        <Text style={styles.environment}>📍 {weatherData.environment}</Text>
      </Pressable>

      {/* The magic button that is disabled behind our paywall */}
      <Pressable onPress={performMagic} style={styles.changeWeatherButton}>
        <Text style={styles.changeWeatherTitle}>✨ Change the Weather</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
    padding: 36,
  },
  emoji: {
    fontSize: 76,
    paddingTop: 32,
  },
  temperature: {
    color: 'white',
    fontFamily: 'ArialRoundedMTBold',
    fontSize: 96,
    paddingTop: 8,
  },
  environment: {
    color: 'white',
    fontFamily: 'ArialRoundedMTBold',
    fontSize: 20,
    paddingTop: 16,
  },
  changeWeatherButton: {
    marginTop: 'auto',
  },
  changeWeatherTitle: {
    color: 'white',
    fontFamily: 'ArialRoundedMTBold',
    fontSize: 20,
    paddingVertical: 16,
  },
});

export default WeatherScreen;
