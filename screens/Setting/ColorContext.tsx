// ColorContext.tsx
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Colors {
  primary: string;
  secondary: string;
}

interface DarkMode {
  background: string;
  text: string;
}

interface ColorContextType {
  colors: Colors;
  darkMode: DarkMode;
  setPrimaryColor: (newColor: string) => void;
  setSecondaryColor: (newColor: string) => void;
  setDarkModeBackground: (newColor: string) => void;
  setDarkModeText: (newColor: string) => void;
}

const defaultColors: Colors = {
  primary: '#3498db',
  secondary: '#2ecc71',
};

const defaultDarkMode: DarkMode = {
  background: '#e6e1d1',
  text: '#000000',
};

const ColorContext = createContext<ColorContextType | undefined>(undefined);

export const ColorProvider = ({ children }: { children: ReactNode }) => {
  const [colors, setColors] = useState<Colors>(defaultColors);
  const [darkMode, setDarkMode] = useState<DarkMode>(defaultDarkMode);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const primary = await AsyncStorage.getItem('primary');
        const secondary = await AsyncStorage.getItem('secondary');
        const background = await AsyncStorage.getItem('darkModeBackground');
        const text = await AsyncStorage.getItem('darkModeText');

        setColors({
          primary: primary ?? defaultColors.primary,
          secondary: secondary ?? defaultColors.secondary,
        });

        setDarkMode({
          background: background ?? defaultDarkMode.background,
          text: text ?? defaultDarkMode.text,
        });
      } catch (error) {
        console.error('Failed to load settings from AsyncStorage', error);
      }
    };
    loadSettings();
  }, []);

  const setPrimaryColor = async (newColor: string) => {
    try {
      await AsyncStorage.setItem('primary', newColor);
      setColors((prevColors) => ({
        ...prevColors,
        primary: newColor,
      }));
    } catch (error) {
      console.error('Failed to save primary color to AsyncStorage', error);
    }
  };

  const setSecondaryColor = async (newColor: string) => {
    try {
      await AsyncStorage.setItem('secondary', newColor);
      setColors((prevColors) => ({
        ...prevColors,
        secondary: newColor,
      }));
    } catch (error) {
      console.error('Failed to save secondary color to AsyncStorage', error);
    }
  };

  const setDarkModeBackground = async (newColor: string) => {
    try {
      await AsyncStorage.setItem('darkModeBackground', newColor);
      setDarkMode((prevDarkMode) => ({
        ...prevDarkMode,
        background: newColor,
      }));
    } catch (error) {
      console.error('Failed to save dark mode background color to AsyncStorage', error);
    }
  };

  const setDarkModeText = async (newColor: string) => {
    try {
      await AsyncStorage.setItem('darkModeText', newColor);
      setDarkMode((prevDarkMode) => ({
        ...prevDarkMode,
        text: newColor,
      }));
    } catch (error) {
      console.error('Failed to save dark mode text color to AsyncStorage', error);
    }
  };

  return (
    <ColorContext.Provider value={{ colors, darkMode, setPrimaryColor, setSecondaryColor, setDarkModeBackground, setDarkModeText }}>
      {children}
    </ColorContext.Provider>
  );
};

export const useColorContext = (): ColorContextType => {
  const context = useContext(ColorContext);
  if (!context) {
    throw new Error('useColorContext must be used within a ColorProvider');
  }
  return context;
};
