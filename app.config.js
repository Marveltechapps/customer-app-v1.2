/**
 * Expo App Configuration
 * 
 * This file replaces app.json and provides dynamic configuration
 * including environment variables and native module plugins.
 */

const path = require('path');

// Backend port (must match selorg-dashboard-backend-v1.1 .env PORT). Do not use 3000 — that is the dashboard/frontend dev server.
const DEFAULT_BACKEND_PORT = 5000;
const DEFAULT_DEV_API_BASE_URL = `http://localhost:${DEFAULT_BACKEND_PORT}/api/v1/customer`;
const HOSTED_API_BASE_URL = 'https://api.selorg.com/api/v1/customer';

// Load .env from project root so ENV and API_BASE_URL are set regardless of cwd
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('dotenv').config({ path: path.resolve(__dirname, '.env') });
} catch (e) {
  // ignore
}

// Validate required environment variables
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
if (!GOOGLE_MAPS_API_KEY) {
  console.warn('⚠️  GOOGLE_MAPS_API_KEY not set. Maps features will be disabled.');
  // Continue with build but maps features will not work
}

// Root assets (splash.png and app_logo.png are placeholders; replace with your brand assets)
const appIcon = "./assets/app_logo.png";
const splashImage = "./assets/splash.png";

module.exports = {
  expo: {
    name: "Selorg",
    slug: "frontend",
    version: "0.0.1",
    jsEngine: "hermes",
    orientation: "portrait",
    icon: appIcon,
    userInterfaceStyle: "light",
    splash: {
      image: splashImage,
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.selorg.mobile",
      config: {
        ...(GOOGLE_MAPS_API_KEY && { googleMapsApiKey: GOOGLE_MAPS_API_KEY })
      },
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "This app needs access to your location to show the route to your delivery address.",
        NSLocationAlwaysUsageDescription: "This app needs access to your location to show the route to your delivery address."
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: appIcon,
        backgroundColor: "#ffffff"
      },
      package: "com.selorg.mobile",
      config: {
        ...(GOOGLE_MAPS_API_KEY && {
          googleMaps: {
            apiKey: GOOGLE_MAPS_API_KEY
          }
        })
      },
      permissions: [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION"
      ]
    },
    web: {
      favicon: appIcon
    },
    plugins: [
      [
        "expo-build-properties",
        {
          ios: {
            newArchEnabled: true
          },
          android: {
            newArchEnabled: true
          }
        }
      ],
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "This app needs access to your location to show the route to your delivery address."
        }
      ],
      [
        "expo-av",
        {
          microphonePermission: false
        }
      ],
      "expo-secure-store"
    ],
    extra: {
      env: process.env.ENV || "development",
      apiBaseUrl: process.env.API_BASE_URL || (process.env.ENV === "production" ? HOSTED_API_BASE_URL : DEFAULT_DEV_API_BASE_URL),
      apiVersion: process.env.API_VERSION || "/api/v1",
      enableLogging: process.env.ENABLE_LOGGING !== "false",
      enableAnalytics: process.env.ENABLE_ANALYTICS !== "false",
      ...(GOOGLE_MAPS_API_KEY && { googleMapsApiKey: GOOGLE_MAPS_API_KEY })
    }
  }
};

