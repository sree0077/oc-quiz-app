# 🚀 Quick Start - OC Quiz App with Expo Go

## ✅ Migration Complete!

Your app has been successfully migrated to Expo managed workflow. You can now develop and debug using the **Expo Go** app on your phone!

## 📱 Start Developing in 3 Steps

### Step 1: Configure Firebase (One-time setup)

```bash
# Copy the environment template
cp .env.example .env

# Edit .env and add your Firebase credentials
nano .env  # or use your preferred editor
```

Your `.env` should look like:
```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

### Step 2: Start the Development Server

```bash
npm start
```

This will:
- Start Expo Metro bundler
- Show a QR code in your terminal
- Open Expo DevTools in your browser

### Step 3: Run on Your Phone

#### For Android:
1. Install **Expo Go** from [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
2. Open Expo Go app
3. Tap "Scan QR Code"
4. Scan the QR code from your terminal

#### For iOS:
1. Install **Expo Go** from [App Store](https://apps.apple.com/app/expo-go/id982107779)
2. Open Camera app
3. Point at the QR code from your terminal
4. Tap the notification to open in Expo Go

## 🎉 That's It!

Your app should now be running on your phone. Any changes you make to the code will automatically reload in the app!

## 🔧 Useful Commands

```bash
# Start development server
npm start

# Clear cache and restart
npm start -- --clear

# Use tunnel mode (if WiFi doesn't work)
npm start -- --tunnel

# Run on Android emulator
npm run android

# Run on iOS simulator (macOS only)
npm run ios
```

## 💡 Development Tips

### Hot Reload
- Save any file and the app reloads automatically
- Shake your device to open the developer menu
- Press `r` in terminal to reload manually

### Debugging
- Shake device → "Debug Remote JS" for Chrome DevTools
- Console logs appear in your terminal
- Use React DevTools for component inspection

### Testing Features
- **Camera/OCR**: Only works on physical devices
- **File Upload**: Works on all platforms
- **Firebase**: Works everywhere once configured

## 📚 Documentation

- **Setup Guide**: See `SETUP_GUIDE.md` for detailed instructions
- **Migration Summary**: See `MIGRATION_SUMMARY.md` for what changed
- **README**: See `README.md` for full project documentation

## ⚠️ Important Notes

### Firebase Services
The Firebase service files in `src/services/firebase/` still use old imports. They'll need to be updated to use Firebase Web SDK when you start using those features.

### Assets
The app uses Expo's default icon and splash screen. You can add custom assets later in the `assets/` folder.

### Network Issues
If you can't connect:
1. Make sure phone and computer are on the same WiFi
2. Try tunnel mode: `npm start -- --tunnel`
3. Check firewall settings

## 🐛 Troubleshooting

### "Unable to resolve module"
```bash
npm start -- --clear
```

### "Network response timed out"
```bash
npm start -- --tunnel
```

### "Expo Go shows error"
- Ensure same WiFi network
- Restart Expo Go app
- Restart development server

## ✨ Ready to Code!

You're all set! Run `npm start` and start building your quiz app with Expo Go.

Happy coding! 🎉

