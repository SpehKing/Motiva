const path = require("path");
require("dotenv").config();

module.exports = {
  expo: {
    name: "Motiva",
    slug: "Motiva",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    assetBundlePatterns: ["**/*"],
    plugins: ["expo-sqlite"],
    ios: {
      supportsTablet: true,
    },
    android: {
      package: "com.gasperazinovic.motiva", // ✅ Required field added
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
    },
    web: {
      bundler: "metro",
      favicon: "./assets/images/favicon.png",
    },
    extra: {
      eas: {
        projectId: "e17a8abc-60f3-4235-b22c-5845cb153e11",
      },
    },
  },
};
