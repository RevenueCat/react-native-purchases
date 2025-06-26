import { StyleSheet } from 'react-native';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';

import Purchases from 'react-native-purchases';
import { useEffect, useState } from 'react';

export default function TabOneScreen() {

  const [appUserID, setAppUserID] = useState<string | null>(null);

  const updateAppUserID = async () => {
    console.log('updateAppUserID');
    const appUserID = await Purchases.getAppUserID();
    setAppUserID(appUserID);
  }

  useEffect(() => {
    updateAppUserID();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tab One</Text>
      <Text>{appUserID ? `App User ID: ${appUserID}` : 'No app user id'}</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <EditScreenInfo path="app/(tabs)/index.tsx" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
