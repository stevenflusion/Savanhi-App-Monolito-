import { Stack } from "expo-router";
import { AuthProvider } from "./components/AuthProvider";
import "../global.css";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}
