export interface NotificationPayload {
  id: string;
  title: string;
  message: string;
  date: Date;
}

export interface WebViewMessage {
  type:
    | 'navigationStateChange'
    | 'SHOW-MENU'
    | 'SET-NOTI'
    | 'OPEN-BROWSER'
    | 'SET-LOCALE';
  payload?: any;
}

export interface ConfigState {
  config: any;
  language: number; // 0: Korean, 1: English
  localNoti: boolean;
  navigationUrls: string[];
}

export interface WebInfoState {
  uri: string;
  fullScreen: boolean;
  currentUri: string;
}
