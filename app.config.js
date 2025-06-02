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
      openaiApiKey: process.env.OPENAI_API_KEY,
    },
  },
};
