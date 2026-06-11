import { Stack } from "expo-router";
import { AuthProvider } from "@/src/components/AuthProvider";
import { useFonts } from "expo-font"
import "../global.css";
import { useEffect, useState } from "react";
import SplashScreen from "@/src/components/SplashScreen";

export default function RootLayout() {

  const [isAppReady, setIsAppReady] = useState(false)
  const [loaded] = useFonts({
    Monserrat: require("../assets/fonts/Montserrat.ttf")
  })


  if (!loaded || !isAppReady) {
    return (
      <SplashScreen />
    )
  }

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}
