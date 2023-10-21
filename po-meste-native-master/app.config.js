import 'dotenv/config'

export default {
  name: 'Po Meste',
  owner: 'bratislava',
  slug: 'hybaj',
  version: '1.2.8',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'myapp',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/images/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#f5f5f5',
  },
  updates: {
    fallbackToCacheTimeout: 5000,
    url: 'https://u.expo.dev/b82083fa-1b6a-451e-83a2-709930c3c20b',
  },
  runtimeVersion: {
    policy: 'sdkVersion',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    bundleIdentifier: 'com.bratislava.hybaj',
    supportsTablet: false,
    buildNumber: '40',
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        'Allow the app to use your location to show it on map and suggest navigation.',
    },
    config: {
      usesNonExemptEncryption: false,
      googleMapsApiKey: process.env.GOOGLE_IOS_API_KEY,
    },
  },
  locales: {
    sk: './languages/slovak.json',
  },
  android: {
    softwareKeyboardLayoutMode: 'pan',
    package: 'com.bratislava.hybaj',
    versionCode: 40,
    permissions: ['ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION'],
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    config: {
      googleMaps: {
        apiKey: process.env.GOOGLE_ANDROID_API_KEY,
      },
    },
  },
  web: {
    favicon: './assets/images/favicon.png',
  },
  extra: {
    apiHost: 'https://live.planner.bratislava.sk',
    googleIOsApiKey: process.env.GOOGLE_IOS_API_KEY,
    googleAndroidApiKey: process.env.GOOGLE_ANDROID_API_KEY,
    googlePlacesApiKey: process.env.GOOGLE_PLACES_API_KEY,
    contactEmailAddress: 'pomeste@bratislava.sk',
    generalTermsAndConditionsLink:
      'https://pomeste.bratislava.sk/terms-conditions/',
    privacyPolicyLink: 'https://pomeste.bratislava.sk/privacy-policy/',
    googlePlacesApiKeyUnlocked: process.env.GOOGLE_PLACES_API_KEY_UNLOCKED,
    eas: {
      projectId: 'b82083fa-1b6a-451e-83a2-709930c3c20b',
    },
  },
  packagerOpts: {
    config: 'metro.config.js',
    sourceExts: [
      'expo.ts',
      'expo.tsx',
      'expo.js',
      'expo.jsx',
      'ts',
      'tsx',
      'js',
      'jsx',
      'json',
      'wasm',
      'svg',
    ],
  },
  plugins: ['sentry-expo'],
  hooks: {
    postPublish: [
      {
        file: 'sentry-expo/upload-sourcemaps',
        config: {
          organization: 'bratislava-city-hall', // Sentry Organization settings tab
          project: 'hybaj-react-native', //Sentry Settings > General Settings tab
          authToken: process.env.SENTRY_AUTH_TOKEN,
        },
      },
    ],
  },
}
