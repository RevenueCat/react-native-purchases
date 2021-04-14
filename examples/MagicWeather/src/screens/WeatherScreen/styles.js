/**
 * @file Magic Weather styles.
 * @author Vadim Savin
 */

import { StyleSheet } from 'react-native';

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

export default styles;
