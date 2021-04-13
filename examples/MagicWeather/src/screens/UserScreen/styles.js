/**
 * @file User Screen styles.
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
  headline: {
    color: 'white',
    fontFamily: 'ArialRoundedMTBold',
    fontSize: 18,
    paddingVertical: 8,
  },
  userIdentifier: {
    color: 'white',
  },
});

export default styles;
