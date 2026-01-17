# OC Quiz App - Setup Guide

## ✅ Project Successfully Migrated to Expo!

Your project has been successfully converted from bare React Native to Expo managed workflow. You can now develop and debug using the Expo Go app on your phone.

## 🎯 What Changed

### ✅ Removed (Bare React Native)
- ❌ `android/` directory - No longer needed with Expo
- ❌ `ios/` directory - Managed by Expo
- ❌ `index.js` - Expo uses App.tsx directly
- ❌ `@react-native-firebase/*` packages - Replaced with Firebase Web SDK

### ✅ Added (Expo Managed)
- ✅ Expo SDK 50 packages
- ✅ Firebase Web SDK (compatible with Expo)
- ✅ Expo Camera for OCR functionality
- ✅ Expo Document Picker for file uploads
- ✅ Expo File System for file operations
- ✅ Updated configuration files for Expo

## 🚀 Next Steps

### 1. Generate App Icons and Splash Screen

You need to create placeholder assets. Run:

```bash
# Create a simple icon (you can replace this with your actual icon later)
npx expo install expo-asset

# Or use Expo's asset generator
# Place your icon.png (1024x1024) in assets/ folder
# Place your splash.png in assets/ folder
```

For now, you can use placeholder images or skip this and Expo will use defaults.

### 2. Configure Firebase

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Firebase credentials in `.env`:
   ```env
   EXPO_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

### 3. Start Development Server

```bash
npm start
```

This will:
- Start the Expo development server
- Show a QR code in your terminal
- Open Expo DevTools in your browser

### 4. Run on Your Device

#### Android:
1. Install **Expo Go** from Google Play Store
2. Open Expo Go app
3. Scan the QR code from your terminal

#### iOS:
1. Install **Expo Go** from App Store
2. Open Camera app
3. Scan the QR code from your terminal
4. Tap the notification to open in Expo Go

## 📱 Development Workflow

### Hot Reload
- Changes to your code will automatically reload in Expo Go
- Shake your device to open the developer menu
- Press `r` in terminal to reload manually

### Debugging
- Shake device → "Debug Remote JS" for Chrome DevTools
- Or use React Native Debugger
- Console logs appear in terminal

### Testing Features

#### Camera/OCR (Physical Device Only)
```bash
# Camera requires physical device
# Won't work in simulator/emulator
```

#### File Upload (All Platforms)
```bash
# Works on physical devices and simulators
```

#### Firebase (All Platforms)
```bash
# Works everywhere once configured
```

## 🔧 Common Commands

```bash
# Start development server
npm start

# Start with cache cleared
npm start -- --clear

# Start in tunnel mode (if local network doesn't work)
npm start -- --tunnel

# Run on Android emulator
npm run android

# Run on iOS simulator (macOS only)
npm run ios

# Run tests
npm test

# Lint code
npm run lint
```

## 📦 Building for Production

When you're ready to build standalone apps:

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo account
eas login

# Configure EAS Build
eas build:configure

# Build for Android
eas build --platform android --profile preview

# Build for iOS
eas build --platform ios --profile preview
```

## 🐛 Troubleshooting

### "Unable to resolve module"
```bash
npm start -- --clear
```

### "Network response timed out"
```bash
# Use tunnel mode
npm start -- --tunnel
```

### "Expo Go app shows error"
```bash
# Make sure you're on the same WiFi network
# Or use tunnel mode
```

### Firebase not working
```bash
# Check .env file has correct values
# Make sure values start with EXPO_PUBLIC_
# Restart the dev server after changing .env
```

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Go App](https://expo.dev/client)
- [Firebase Web SDK](https://firebase.google.com/docs/web/setup)
- [React Native Paper](https://callstack.github.io/react-native-paper/)

## ✨ Ready to Code!

Your project is now ready for development with Expo Go. Simply run:

```bash
npm start
```

And scan the QR code with your phone to start developing!

