import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import type { NotificationPayload } from '@/types';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

class NotificationService {
  constructor() {
    if (Platform.OS !== 'web') {
      this.bootstrap();
    }
  }

  public async bootstrap(): Promise<void> {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('jjfesta', {
        name: 'jun ju festa',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [300, 500],
        enableVibrate: true,
      });
    }

    const lastResponse = await Notifications.getLastNotificationResponseAsync();
    if (lastResponse) {
      this.handleNotificationOpen(lastResponse.notification);
    }

    Notifications.addNotificationResponseReceivedListener((response) => {
      this.handleNotificationOpen(response.notification);
    });
  }

  public handleNotificationOpen(
    notification: Notifications.Notification,
  ): void {
    const data = notification.request.content.data;
    console.log('Notification received:', data);
  }

  public async checkPermissions(): Promise<boolean> {
    if (Platform.OS === 'web' || !Device.isDevice) {
      return false;
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  }

  public async scheduleNotification(payload: NotificationPayload): Promise<void> {
    const hasPermissions = await this.checkPermissions();
    if (!hasPermissions) return;

    const triggerDate = payload.date instanceof Date ? payload.date : new Date(payload.date);

    await Notifications.scheduleNotificationAsync({
      identifier: payload.id,
      content: {
        title: payload.title,
        body: payload.message,
        data: {
          id: payload.id,
          action: 'reminder',
          details: {
            name: payload.title,
            date: triggerDate.toString(),
          },
        },
        ...(Platform.OS === 'android' && {
          channelId: 'jjfesta',
        }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });
  }

  public async cancelNotification(id: string): Promise<void> {
    if (Platform.OS === 'web') return;
    await Notifications.cancelScheduledNotificationAsync(id);
  }

  public async cancelAllNotifications(): Promise<void> {
    if (Platform.OS === 'web') return;
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  public async hasNotification(id: string): Promise<boolean> {
    if (Platform.OS === 'web') return false;
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    return scheduled.some(
      (notification) => notification.identifier === id,
    );
  }
}

export default new NotificationService();
