import React, { useEffect } from 'react';
import { createContext, useReducer, useContext } from 'react';
import { useConfigContext } from './config-context';

const HANDLERS = {
  SET_URI: 'SET_URI',
  SET_FULL_SCREEN: 'SET_FULL_SCREEN',
  SET_CURRENT_URI: 'SET_CURRENT_URI',
};

type State = {
  uri: string;
  fullScreen: boolean;
  currentUri: string;
};

const initialState: State = {
  uri: '',
  fullScreen: false,
  currentUri: '',
};

type Action = {
  type: string;
  payload?: any;
};

const handlers: Record<string, (state: State, action: Action) => State> = {
  [HANDLERS.SET_URI]: (state, action) => ({
    ...state,
    uri: action.payload,
  }),
  [HANDLERS.SET_FULL_SCREEN]: (state, action) => ({
    ...state,
    fullScreen: action.payload as boolean,
  }),
  [HANDLERS.SET_CURRENT_URI]: (state, action) => ({
    ...state,
    currentUri: action.payload,
  }),
};

const reducer = (state: State, action: Action) =>
  handlers[action.type] ? handlers[action.type](state, action) : state;

type WebInfo = State & {
  setUri: (uri: string) => void;
  setFullScreen: (fullScreen: boolean) => void;
  setCurrentUri: (currentUri: string) => void;
};

export const WebInfoContext = createContext<WebInfo>(initialState as WebInfo);

export const WebInfoProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { getUrls, language } = useConfigContext();
  const [state, dispatch] = useReducer(reducer, {
    uri: getUrls()?.mainurl ?? '',
    fullScreen: false,
    currentUri: '',
  });

  useEffect(() => {
    const mainUrl = getUrls()?.mainurl;
    if (mainUrl) {
      setUri(mainUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getUrls, language]);

  const setUri = (uri: string) => {
    let add = '';
    if (state.uri.split('?')[0] === uri) {
      add = '?r=' + (Math.random() * 10 + 10);
    }
    dispatch({ type: HANDLERS.SET_URI, payload: uri + add });
  };

  const setFullScreen = (fullScreen: boolean) => {
    dispatch({ type: HANDLERS.SET_FULL_SCREEN, payload: fullScreen });
  };

  const setCurrentUri = (currentUri: string) => {
    dispatch({ type: HANDLERS.SET_CURRENT_URI, payload: currentUri });
  };

  return (
    <WebInfoContext.Provider
      value={{
        ...state,
        setUri,
        setFullScreen,
        setCurrentUri,
      }}
    >
      {children}
    </WebInfoContext.Provider>
  );
};

export const useWebInfoContext = () => useContext(WebInfoContext);
