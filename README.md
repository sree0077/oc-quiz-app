# OC Quiz App - Expo Edition

A comprehensive quiz application built with Expo, featuring OCR question scanning, bulk Excel uploads, Firebase integration, and real-time leaderboards.

## 🚀 Quick Start with Expo Go

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Expo Go app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Firebase:**
   - Copy `.env.example` to `.env`
   - Fill in your Firebase credentials in `.env`

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Run on your device:**
   - Scan the QR code with Expo Go app (Android)
   - Scan the QR code with Camera app (iOS)

## 📱 Development Workflow

### Running the App
```bash
# Start Expo development server
npm start

# Run on Android device/emulator
npm run android

# Run on iOS simulator (macOS only)
npm run ios

# Run in web browser
npm run web
```

### Testing Features
- **Camera/OCR**: Works on physical devices (not in simulator)
- **File Upload**: Works on all platforms
- **Firebase**: Works on all platforms

## 🏗️ Project Structure

```
oc-quiz-app/
├── src/
│   ├── components/     # Reusable UI components
│   ├── screens/        # App screens
│   ├── services/       # Business logic & API calls
│   ├── store/          # State management (Zustand)
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   ├── hooks/          # Custom React hooks
│   └── config/         # Configuration files
├── assets/             # Images, fonts, etc.
├── App.tsx             # Root component
└── app.json            # Expo configuration
```

## 🔥 Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Enable Storage
5. Copy your config to `.env` file

## 📦 Key Features

- ✅ **Expo Managed Workflow** - Easy development with Expo Go
- ✅ **Firebase Integration** - Authentication, Firestore, Storage
- ✅ **OCR Scanning** - Camera-based question scanning
- ✅ **Excel Upload** - Bulk question import
- ✅ **Real-time Leaderboards** - Live score tracking
- ✅ **Performance Analytics** - Student progress tracking
- ✅ **TypeScript** - Type-safe development
- ✅ **Zustand** - Lightweight state management

## 🛠️ Tech Stack

- **Framework**: Expo SDK 50
- **Language**: TypeScript
- **UI Library**: React Native Paper
- **Navigation**: React Navigation
- **State Management**: Zustand
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Forms**: React Hook Form + Zod
- **Charts**: React Native Chart Kit

## 📝 Environment Variables

Create a `.env` file with:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 🚢 Building for Production

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

## 📱 Testing on Device

### Android
1. Install Expo Go from Play Store
2. Run `npm start`
3. Scan QR code with Expo Go

### iOS
1. Install Expo Go from App Store
2. Run `npm start`
3. Scan QR code with Camera app

## 🐛 Troubleshooting

### Metro bundler issues
```bash
npm start -- --clear
```

### Package installation issues
```bash
rm -rf node_modules package-lock.json
npm install
```

### Expo Go connection issues
- Ensure phone and computer are on same WiFi
- Try tunnel mode: `npm start -- --tunnel`

## 📚 Documentation

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [Firebase Web SDK](https://firebase.google.com/docs/web/setup)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly with Expo Go
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

