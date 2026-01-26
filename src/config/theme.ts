import { MD3LightTheme as DefaultTheme, configureFonts } from 'react-native-paper';

// Claude-inspired colors
const colors = {
  primary: '#d97757', // Burnt orange-ish/terracotta used in some Claude branding
  onPrimary: '#FFFFFF',
  secondary: '#383838', // Soft black
  background: '#faf9f6', // Warm off-white (Cultured/Alabaster)
  surface: '#ffffff',
  error: '#BA1A1A',
  onBackground: '#383838',
  onSurface: '#383838',
  outline: '#79747E',
};

const fontConfig = {
  // Use default fonts for stability
};

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    ...colors,
  },
  roundness: 12,
};
