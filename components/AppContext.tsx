'use client';

import React, { createContext, useContext, useReducer, ReactNode, useCallback } from 'react';
import { AppState, AppAction, PhotoItem, RouteTemplate, GRID_SIZE } from '@/lib/types';

const defaultColor = '#FF6B6B';

const initialState: AppState = {
  photos: Array(9).fill(null),
  selectedTemplate: null,
  customTemplates: [],
  routeColor: defaultColor,
  routeWidth: 5,
  routeOpacity: 0.85,
  isGenerating: false,
};

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_PHOTO': {
      const newPhotos = [...state.photos];
      newPhotos[action.position] = action.photo;
      return { ...state, photos: newPhotos };
    }
    case 'REMOVE_PHOTO': {
      const newPhotos = [...state.photos];
      newPhotos[action.position] = null;
      return { ...state, photos: newPhotos };
    }
    case 'SWAP_PHOTOS': {
      const newPhotos = [...state.photos];
      [newPhotos[action.from], newPhotos[action.to]] = [newPhotos[action.to], newPhotos[action.from]];
      return { ...state, photos: newPhotos };
    }
    case 'SET_TEMPLATE':
      return { ...state, selectedTemplate: action.template };
    case 'ADD_CUSTOM_TEMPLATE':
      return { ...state, customTemplates: [...state.customTemplates, action.template], selectedTemplate: action.template };
    case 'REMOVE_CUSTOM_TEMPLATE': {
      const filtered = state.customTemplates.filter((t) => t.id !== action.id);
      const sel = state.selectedTemplate?.id === action.id ? (filtered.length > 0 ? filtered[0] : null) : state.selectedTemplate;
      return { ...state, customTemplates: filtered, selectedTemplate: sel };
    }
    case 'SET_ROUTE_COLOR':
      return { ...state, routeColor: action.color };
    case 'SET_ROUTE_WIDTH':
      return { ...state, routeWidth: action.width };
    case 'SET_ROUTE_OPACITY':
      return { ...state, routeOpacity: action.opacity };
    case 'SET_GENERATING':
      return { ...state, isGenerating: action.isGenerating };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  photoCount: number;
  allPhotosReady: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const photoCount = state.photos.filter(Boolean).length;
  const allPhotosReady = photoCount === 9 && state.selectedTemplate !== null;

  return (
    <AppContext.Provider value={{ state, dispatch, photoCount, allPhotosReady }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
