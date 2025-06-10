# Motiva - Habit Tracking App

Motiva is a React Native habit tracking application built with Expo Router that helps users create, track, and maintain healthy habits through AI-powered activity verification.

## Features

- 📱 Cross-platform mobile app (iOS, Android, Web)
- 🎯 Create and manage up to 6 habits at a time
- 📸 AI-powered habit verification through photo capture
- 📊 Visual progress tracking with charts and statistics
- 🗃️ Local SQLite database for offline functionality
- 🎨 Beautiful, modern UI with dark theme
- 📈 Progress bars and leveling system

## Prerequisites

Before you can run this project, you need to have the following installed on your machine:

### 1. Node.js

- Download and install Node.js (version 18 or higher) from [nodejs.org](https://nodejs.org/)
- Verify installation by running:
  ```bash
  node --version
  npm --version
  ```

### 2. Git

- Download and install Git from [git-scm.com](https://git-scm.com/)
- Verify installation:
  ```bash
  git --version
  ```

## Installing Expo CLI

Expo CLI is the command-line tool for developing Expo applications. Follow these steps to install it:

### 1. Install Expo CLI Globally

```bash
npm install -g @expo/cli
```

### 2. Verify Expo Installation

```bash
expo --version
```

## Setting Up the Development Environment

### For Android Development

1. Install Android Studio from [developer.android.com](https://developer.android.com/studio)
2. During installation, make sure to install:
   - Android SDK
   - Android SDK Platform
   - Android Virtual Device (AVD)
3. Set up environment variables (add to your shell profile):
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/tools/bin
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

### Install Expo Go App (Recommended for Testing)

- **Android**: Download from [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Motiva
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables (Optional)

Create a `.env` file in the root directory for OpenAI API integration:

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

_Note: The app works without this, but AI verification features will be disabled._

### 4. Start the Development Server

```bash
npm start
# or
expo start
```

This will start the Expo development server and display a QR code in your terminal.

## Running the App

### Option 1: Using Expo Go (Easiest)

1. Install the Expo Go app on your phone
2. Scan the QR code from your terminal with:
   - **iOS**: Camera app
   - **Android**: Expo Go app
3. The app will load on your device

### Option 2: Using iOS Simulator (macOS only)

```bash
npm run ios
# or
expo start --ios
```

### Option 3: Using Android Emulator

1. Start Android Studio and launch an AVD
2. Run:

```bash
npm run android
# or
expo start --android
```

### Option 4: Web Browser

```bash
npm run web
# or
expo start --web
```

## Available Scripts

- `npm start` - Start the Expo development server
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator
- `npm run web` - Run in web browser
- `npm test` - Run Jest tests
- `npm run db:smoke` - Test database functionality

## Project Structure

```
Motiva/
├── app/                    # App screens and navigation
│   ├── _layout.tsx        # Root layout and navigation setup
│   ├── index.tsx          # Main screen (habit dashboard)
│   ├── habit/             # Habit-related screens
│   │   ├── [id].tsx       # Individual habit statistics
│   │   ├── NewHabit.tsx   # Create new habit screen
│   │   ├── HowItWorks.tsx # Tutorial screen
│   │   └── ActivityCaptureScreen.tsx # Photo capture
│   └── +html.tsx          # Web-specific HTML configuration
├── components/            # Reusable React components
├── constants/            # App constants and themes
├── db/                   # Database schema and operations
├── assets/               # Images, fonts, and static assets
├── utils/                # Utility functions
└── scripts/              # Development scripts
```

## Database

The app uses SQLite with Drizzle ORM for local data storage. The database includes:

- **Habits**: Store habit information (name, color, icon, frequency)
- **Completions**: Track when habits are completed with optional photo verification

The database is automatically initialized on first app launch with default habits.

## Troubleshooting

### Common Issues

1. **Metro bundler issues**:

   ```bash
   npx expo start --clear
   ```

2. **Node modules issues**:

   ```bash
   rm -rf node_modules
   npm install
   ```

3. **iOS Simulator not opening**:

   - Make sure Xcode is installed
   - Try opening Simulator manually first

4. **Android emulator not connecting**:

   - Ensure Android Studio and AVD are properly set up
   - Check that your emulator is running

5. **Expo Go connection issues**:
   - Make sure your phone and computer are on the same WiFi network
   - Try restarting the Expo development server

### Reset Database

If you encounter database issues, you can reset it by:

```bash
node scripts/resetDatabase.js
```

## Development Tips

1. **Hot Reloading**: Changes to your code will automatically reload the app
2. **Developer Menu**: Shake your device or press `Cmd+D` (iOS) / `Cmd+M` (Android) to open the developer menu
3. **Remote Debugging**: Use React Native Debugger or Chrome DevTools for debugging
4. **Console Logs**: Check the terminal running `expo start` for console output

## Building for Production

### Using EAS Build (Recommended)

1. Install EAS CLI:

   ```bash
   npm install -g eas-cli
   ```

2. Configure your project:

   ```bash
   eas build:configure
   ```

3. Build for iOS:

   ```bash
   eas build --platform ios
   ```

4. Build for Android:
   ```bash
   eas build --platform android
   ```

### Local Builds

- **iOS**: Use Xcode to build and deploy
- **Android**: Use `eas build --platform android --local`

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Technologies Used

- **React Native** - Mobile app framework
- **Expo** - Development platform and toolchain
- **Expo Router** - File-based navigation
- **TypeScript** - Type safety
- **SQLite** - Local database
- **Drizzle ORM** - Database toolkit
- **React Native Chart Kit** - Data visualization
- **OpenAI API** - AI-powered habit verification

## License

This project is for educational purposes as part of a multimedia course project.

## Support

If you encounter any issues:

1. Check the [Expo documentation](https://docs.expo.dev/)
2. Visit [React Native documentation](https://reactnative.dev/docs/getting-started)
3. Search for solutions in the [Expo community forums](https://forums.expo.dev/)

---

**Happy habit tracking! 🎯**
