import { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { usePreventScreenCapture } from 'expo-screen-capture';
import Toast from 'react-native-toast-message';
import { ConfigProvider } from '@/contexts/config-context';
import { WebInfoProvider } from '@/contexts/web-info-context';
import { AnimatedSplash } from '@/components/animated-splash';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  usePreventScreenCapture();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  return (
    <ConfigProvider>
      <WebInfoProvider>
        <StatusBar style="dark" translucent backgroundColor="transparent" />
        <View style={styles.container}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
          </Stack>
          {showSplash && (
            <AnimatedSplash onComplete={handleSplashComplete} />
          )}
        </View>
        <Toast />
      </WebInfoProvider>
    </ConfigProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
