/**
 * @file Sample data helper.
 * @author Vadim Savin
 */

const TemperatureUnit = {
  FAHRENHEIT: 'f',
  CELSIUS: 'c',
};

export const Environment = {
  MERCURY: 'Mercury',
  VENUS: 'Venus',
  EARTH: 'Earth',
  MARS: 'Mars',
  JUPITER: 'Jupiter',
  SATURN: 'Saturn',
  URANUS: 'Uranus',
  NEPTUNE: 'Neptune',

  /*
   Pluto is still a planet in my ❤️
   */
  PLUTO: 'PLUTO',
};

const getEmoji = (temperature) => {
  if (temperature < 0) {
    return '🥶';
  }
  if (temperature < 32) {
    return '❄️';
  }
  if (temperature < 60) {
    return '☁️️';
  }
  if (temperature < 90) {
    return '🌤';
  }
  if (temperature < 120) {
    return '🥵';
  }
  return '☄️';
};

const getWeatherColor = (temperature) => {
  if (temperature < 0) {
    return '#034B84';
  }
  if (temperature < 32) {
    return '#002761';
  }
  if (temperature < 60) {
    return '#33003B';
  }
  if (temperature < 90) {
    return '#D4473E';
  }
  if (temperature < 120) {
    return '#B6003B';
  }
  return '#CC003B';
};

/*
 Generate Sample data for Magic Weather.
 */
export const generateSampleData = (environment, temperature) => {
  temperature = temperature || Math.floor(Math.random() * 140 - 20);

  return {
    temperature,
    environment,
    emoji: getEmoji(temperature),
    unit: TemperatureUnit.FAHRENHEIT,
    weatherColor: getWeatherColor(temperature),
  };
};

export const testCold = generateSampleData(Environment.EARTH, 14);
export const testHot = generateSampleData(Environment.EARTH, 85);
