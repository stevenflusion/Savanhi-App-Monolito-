require("dotenv").config();

module.exports = {
  expo: {
    name: "Tenderos Mobile",
    slug: "tenderos-mobile",
    version: "1.0.0",
    extra: {
      MAPBOX_ACCESS_TOKEN: process.env.MAPBOX_ACCESS_TOKEN ?? "",
    },
    orientation: "portrait",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    scheme: "tenderosmobile",
    plugins: [
      [
        "@rnmapbox/maps",
        {
          RNMapboxMapsVersion: "11",
        },
      ],
      "expo-router",
      "expo-font",
    ],
    updates: {
      enabled: false,
      checkAutomatically: "ON_ERROR_RECOVERY",
      fallbackToCacheTimeout: 0,
    },
    experiments: {
      typedRoutes: true,
    },
    android: {
      package: "com.anonymous.tenderosmobile",
    },
    ios: {
      bundleIdentifier: "com.anonymous.tenderosmobile",
    },
  },
};
