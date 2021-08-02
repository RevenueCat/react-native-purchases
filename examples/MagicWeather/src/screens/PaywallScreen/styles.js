import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  page: {
    padding: 16,
  },
  text: {
    color: 'lightgrey',
  },
  headerFooterContainer: {
    marginVertical: 10,
  },
  overlay: {
    flex: 1,
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    opacity: 0.5,
    backgroundColor: 'black',
  },
});

export default styles;
