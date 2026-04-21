import React, { useEffect } from 'react';
import { createContext, useReducer, useContext } from 'react';
import { Alert } from 'react-native';
import InitConfig from '@/constants/constants.json';
import Notification from '@/services/notification';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HANDLERS = {
  SET_CONFIG: 'SET_CONFIG',
  SET_LANGUAGE: 'SET_LANGUAGE',
  SET_LOCAL_NOTI: 'SET_LOCAL_NOTI',
  SET_NAV_URLS: 'SET_NAV_URLS',
};

type State = {
  config: any;
  language: number;
  localNoti: boolean;
  navigationUrls: string[];
};

const initialState: State = {
  config: InitConfig.languageselect,
  language: 0,
  localNoti: true,
  navigationUrls: [],
};

type Action = {
  type: string;
  payload?: any;
};

const handlers: Record<string, (state: State, action: Action) => State> = {
  [HANDLERS.SET_CONFIG]: (state, action) => ({
    ...state,
    config: action.payload,
  }),
  [HANDLERS.SET_LANGUAGE]: (state, action) => ({
    ...state,
    language: action.payload,
  }),
  [HANDLERS.SET_LOCAL_NOTI]: (state, action) => ({
    ...state,
    localNoti: action.payload,
  }),
  [HANDLERS.SET_NAV_URLS]: (state, action) => ({
    ...state,
    navigationUrls: action.payload,
  }),
};

const reducer = (state: State, action: Action) =>
  handlers[action.type] ? handlers[action.type](state, action) : state;

type Config = State & {
  setLanguage: (language: number) => void;
  getUrls: () => any;
  setLocalNoti: (localNoti: boolean) => void;
  hasNavigationUrls: (url: string) => boolean;
};

export const ConfigContext = createContext<Config>(initialState as Config);

export const ConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    fetch('https://2026app.jeonjufest.kr')
      .then((res) => {
        if (res.ok) return res.json();
        Alert.alert('설정파일 로딩에 오류가 발생하였습니다.');
      })
      .then((json) => {
        if (!json) return;
        dispatch({
          type: HANDLERS.SET_CONFIG,
          payload: json.languageselect,
        });

        const navigations = json.navion.list.map(
          (element: any) => element.url,
        );
        dispatch({
          type: HANDLERS.SET_NAV_URLS,
          payload: navigations,
        });
      })
      .catch(() => {});

    AsyncStorage.getItem('CONFIG').then((data) => {
      const config = data
        ? JSON.parse(data)
        : { language: 0, localNoti: true, config: undefined };
      dispatch({
        type: HANDLERS.SET_CONFIG,
        payload: state.config || config.config,
      });
      dispatch({
        type: HANDLERS.SET_LANGUAGE,
        payload: config.language,
      });
      dispatch({
        type: HANDLERS.SET_LOCAL_NOTI,
        payload: config.localNoti,
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('CONFIG', JSON.stringify(state));
  }, [state]);

  const setLanguage = (language: number) => {
    dispatch({ type: HANDLERS.SET_LANGUAGE, payload: language });
  };

  const getUrls = () => state.config[state.language];

  const setLocalNoti = (localNoti: boolean) => {
    dispatch({ type: HANDLERS.SET_LOCAL_NOTI, payload: localNoti });
    if (!localNoti) {
      Notification.cancelAllNotifications();
    }
  };

  const hasNavigationUrls = (url: string) =>
    state.navigationUrls.indexOf(url.split('?')[0]) > -1;

  return (
    <ConfigContext.Provider
      value={{
        ...state,
        setLanguage,
        getUrls,
        setLocalNoti,
        hasNavigationUrls,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfigContext = () => useContext(ConfigContext);
