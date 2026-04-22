import { useEffect, useRef, useState } from 'react';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import {
  Platform,
  View,
  BackHandler,
  Linking,
  ToastAndroid,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import {
  preventScreenCaptureAsync,
  allowScreenCaptureAsync,
} from 'expo-screen-capture';
import { useWebInfoContext } from '@/contexts/web-info-context';
import { useConfigContext } from '@/contexts/config-context';
import Notification from '@/services/notification';
import { Alert } from 'react-native';
import Toast from 'react-native-toast-message';
import { LoadingOverlay } from '@/components/loading-overlay';

const SCREEN_CAPTURE_BLOCKED_URLS = [
  'https://2026app.jeonjufest.kr/KOR/member/mypage.asp',
  'https://2026app.jeonjufest.kr/ENG/member/mypage.asp',
];
const SCREEN_CAPTURE_TAG = 'webview-url-guard';

export default function HomeScreen() {
  const webviewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);

  const { getUrls, localNoti, hasNavigationUrls, setLanguage, language } =
    useConfigContext();
  const { currentUri, setFullScreen, setCurrentUri } = useWebInfoContext();
  const [backPressCount, setBackPressCount] = useState(0);

  useEffect(() => {
    const backAction = () => {
      if (webviewRef.current && !canGoBack) {
        if (backPressCount === 0) {
          const message =
            language === 0
              ? '한번 더 누르면 앱이 종료됩니다'
              : 'Press once more to close the app';

          setBackPressCount((prev) => prev + 1);
          setTimeout(() => setBackPressCount(0), 2000);

          if (Platform.OS === 'android') {
            ToastAndroid.show(message, ToastAndroid.SHORT);
          }
        } else if (backPressCount === 1) {
          BackHandler.exitApp();
        }
        return true;
      }

      if (webviewRef.current && canGoBack) {
        webviewRef.current.goBack();
        return true;
      }

      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  }, [backPressCount, canGoBack, currentUri, getUrls, language]);

  useEffect(() => {
    if (!currentUri) return;
    if (hasNavigationUrls(currentUri)) {
      setFullScreen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUri, getUrls, hasNavigationUrls]);

  useEffect(() => {
    if (!currentUri) {
      allowScreenCaptureAsync(SCREEN_CAPTURE_TAG);
      return;
    }
    const base = currentUri.split('?')[0].split('#')[0];
    if (SCREEN_CAPTURE_BLOCKED_URLS.includes(base)) {
      preventScreenCaptureAsync(SCREEN_CAPTURE_TAG);
    } else {
      allowScreenCaptureAsync(SCREEN_CAPTURE_TAG);
    }
  }, [currentUri]);

  const handleLoadStart = () => setLoading(true);
  const handleLoadEnd = () => setLoading(false);

  const handleMessage = async (event: WebViewMessageEvent) => {
    const { nativeEvent: state } = event;
    if (state.data === 'navigationStateChange') {
      setCanGoBack(state.canGoBack);
      return;
    }

    const req = JSON.parse(state.data);

    if (req.type === 'SHOW-MENU') {
      setFullScreen(!req.payload);
      return;
    }

    if (req.type === 'SET-NOTI') {
      if (!localNoti) {
        const message =
          language === 0
            ? "설정에서 '알림'을 'ON' 해 주세요"
            : "Please turn 'Notifications' to 'ON' in Settings";
        Alert.alert(message);
        return;
      }

      const { id, title, message, date } = req.payload;

      if (await Notification.hasNotification(id)) {
        await Notification.cancelNotification(id);
        Toast.show({
          type: 'success',
          text1:
            language === 0
              ? '알림이 취소 되었습니다.'
              : 'Notification has been canceled.',
          visibilityTime: 2000,
        });
        return;
      }

      Notification.scheduleNotification({
        id,
        title,
        message,
        date: new Date(date),
      });
      Toast.show({
        type: 'success',
        text1:
          language === 0
            ? '알림이 설정 되었습니다.'
            : 'Notification has been set.',
        visibilityTime: 2000,
      });
      return;
    }

    if (req.type === 'OPEN-BROWSER') {
      Linking.openURL(req.payload);
      return;
    }

    if (req.type === 'SET-LOCALE') {
      setLanguage(req.payload);
      return;
    }
  };

  const handleYoutube = async (uri: string) => {
    const canOpen = await Linking.canOpenURL(uri);
    if (canOpen) {
      Linking.openURL(uri);
    } else if (Platform.OS === 'ios') {
      Linking.openURL('https://apps.apple.com/kr/app/youtube/id544007664');
    } else {
      Linking.openURL(
        'https://play.google.com/store/apps/details?id=com.google.android.youtube',
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        ref={webviewRef}
        source={{ uri: 'https://2026app.jeonjufest.kr' }}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        allowsBackForwardNavigationGestures
        onMessage={handleMessage}
        thirdPartyCookiesEnabled
        onNavigationStateChange={(navState) => {
          setCurrentUri(navState.url);
          setCanGoBack(navState.canGoBack);
        }}
        originWhitelist={['http://*', 'https://*', 'youtube://*']}
        onShouldStartLoadWithRequest={(request) => {
          if (request.url.startsWith('youtube://')) {
            handleYoutube(request.url);
            return false;
          }
          return true;
        }}
        sharedCookiesEnabled
        domStorageEnabled
        mixedContentMode="compatibility"
        onError={(e) => {
          const { nativeEvent } = e;
          Alert.alert(
            'WebView Error',
            `URL: ${nativeEvent.url}\nCode: ${nativeEvent.code}\nDesc: ${nativeEvent.description}`,
          );
        }}
        onContentProcessDidTerminate={() => webviewRef.current?.reload()}
        style={styles.webview}
        bounces={false}
      />
      <LoadingOverlay visible={loading} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: '#ebebeb',
  },
});
