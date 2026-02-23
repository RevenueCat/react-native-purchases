import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable, Text } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useCustomVariables } from '@/components/CustomVariablesContext';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

function CustomVariablesButton() {
  const colorScheme = useColorScheme();
  const { customVariables, setShowEditor } = useCustomVariables();
  const count = Object.keys(customVariables).length;

  return (
    <Pressable onPress={() => setShowEditor(true)} style={{ marginRight: 15 }}>
      {({ pressed }) => (
        <Text style={{
          fontSize: 18,
          fontWeight: 'bold',
          color: count > 0 ? '#007AFF' : Colors[colorScheme ?? 'light'].text,
          opacity: pressed ? 0.5 : 1,
        }}>
          {'{}'}{count > 0 ? ` ${count}` : ''}
        </Text>
      )}
    </Pressable>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Purchases Tester',
          tabBarIcon: ({ color }) => <TabBarIcon name="credit-card" color={color} />,
          headerRight: () => (
            <>
              <CustomVariablesButton />
              <Link href="/modal" asChild>
                <Pressable>
                  {({ pressed }) => (
                    <FontAwesome
                      name="info-circle"
                      size={25}
                      color={Colors[colorScheme ?? 'light'].text}
                      style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                    />
                  )}
                </Pressable>
              </Link>
            </>
          ),
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'Tab Two',
          tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
        }}
      />
    </Tabs>
  );
}
